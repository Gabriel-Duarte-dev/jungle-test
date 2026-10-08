# Arquitetura — KURIO

## Contratos REST

Base: `VITE_API_URL` (`https://api.kurio.test`). Axios anexa `Authorization: Bearer <token>` quando há sessão e sempre envia `X-Guest-Id`.

| Recurso | Métodos |
| --- | --- |
| Sessão | `POST /auth/register`, `POST /auth/login`, `GET /auth/session`, `POST /auth/logout` |
| NFTs | `GET /nfts` (q, collections, networks, minPrice, maxPrice, tab, sort, page, perPage), `GET /nfts/featured`, `GET /nfts/:id`, `GET /nfts/:id/related` |
| Favoritos | `GET /favorites`, `PUT /favorites/:id`, `DELETE /favorites/:id` |
| Carrinho | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `POST /cart/acknowledge` |
| Cotação | `POST /cart/quote` `{ couponCode, network }` |
| Pedidos | `POST /orders` (header `Idempotency-Key`), `GET /orders`, `GET /orders/:id` |
| Perfil | `GET/PATCH /profile`, `PUT/DELETE /profile/avatar`, `POST /profile/password` |
| Carteiras | `GET/POST /wallets`, `PATCH /wallets/:id` |
| Controle | `GET/POST /__mock/scenario`, `POST /__mock/reset`, `POST /__mock/events/nft`, `POST /__mock/events/order` |

Erros: `{ error: { code, message, fields?, details? } }` com os códigos em `src/services/http/errors.ts` (validação, sessão, 404, conflito de disponibilidade, cupom, quote_stale, idempotency_conflict, 5xx, rede, timeout).

ETH viaja como **string decimal**. Aritmética em BigInt wei (`src/lib/eth.ts`). Quantidades são inteiras. A cotação da API é a referência do total.

### Idempotência

`POST /orders` exige `Idempotency-Key`. A mesma chave + o mesmo fingerprint do body devolve o pedido original. A mesma chave com body diferente responde `409 idempotency_conflict`. O cliente persiste a tentativa em `kurio.checkout.attempt` (chave + `quoteSignature`).

## Eventos Socket.IO

Cliente: `socket.io-client` com `transports: ['websocket']` (obrigatório — o MSW intercepta a classe WebSocket, não o long-polling HTTP do Engine.IO).

`engine.io-client` guarda `globalThis.WebSocket` no momento do import. Por isso `src/main.tsx` sobe o MSW e só depois importa `src/app.tsx`. Além disso o chunk `vendor-socket` **não** pode agrupar `socket.io-client` com o worker MSW: os parsers do `@mswjs/socket.io-binding` cairiam no mesmo arquivo e o construtor nativo seria capturado ao ligar o mock. Sem o patch, o preview não tem `/socket.io` e o cliente nunca emite `connect`.

```
identify { userId, guestId }
subscribe / unsubscribe { nftIds?, orderIds? }
nft.updated  { eventId, resource, resourceId, version, emittedAt, data }
order.updated { eventId, resource, resourceId, version, emittedAt, data }
```

`VersionRegistry` descarta `eventId` repetido e `version` ≤ à já aplicada. No `reconnect`, o cliente se identifica de novo e invalida carrinho, cotação, pedidos e catálogo.

O mock (`src/mocks/socket`) usa `ws.link(/.*/)` + `toSocketIo` e intercepta o Socket.IO same-origin (`/socket.io`). **Limitações da binding 0.2.0:** sem rooms, sem namespaces customizados, sem broadcast nativo — o emissor mantém um `Set` de conexões e filtra `order.updated` pela inscrição. Pedidos de uma sessão anterior não atualizam outro usuário porque o servidor só emite `order.updated` para quem se inscreveu naquele `orderId` após `identify`.

REST e eventos leem/escrevem o mesmo banco em memória.

## Sessão

TTL de 30 min no mock. Token em `localStorage` (`kurio.session.token`). 401 `session_expired` / `unauthenticated` disparam o interceptor, que esquece o token e as queries privadas, **sem** limpar o carrinho visitante nem a rota — o login seguinte retoma o contexto. Logout faz `queryClient.clear()` e rotaciona o `X-Guest-Id`. Troca de usuário não compartilha cache: queries privadas são namespaced por `user:<id>` / `guest:<id>`.

Rotas `/pagamento`, `/pedidos/:id`, `/perfil`, `/carteiras` usam `beforeLoad` em `/_auth` e redirecionam para `/entrar?from=`.

## Carrinho

Visitante persiste por `X-Guest-Id`. No login, o mock **mescla** o carrinho visitante no da conta (soma quantidades, respeita disponibilidade) e descarta o guest. Depois de um pedido **confirmado**, só as linhas/quantidades compradas saem do carrinho. Recusa e falha preservam os itens. A cotação (`signature`) é invalidada a cada mutation e a cada `nft.updated`. Checkout recusa `quote_stale` e exige nova confirmação.

## Cache / retry (TanStack Query)

Documentado em `src/services/http/queryClient.ts`:

- `staleTime` 30 s, `gcTime` 5 min.
- Retry só para falha transitória (sem status, ≥500, 429), no máximo 2 vezes. Mutations **não** retentam sozinhas.
- Listagem usa `placeholderData: keepPreviousData` e o `AbortSignal` do Query.
- Favoritar é otimista, com snapshot + rollback.
- Carrinho substitui o cache pela resposta da mutation (a API é a fonte da disponibilidade).

## Camada mock

`src/mocks/db` (localStorage `kurio.mock.db`, `SCHEMA_VERSION`). Seed determinístico (mulberry32, seed `20260920`), 120 NFTs, 2 usuários, cupons, carteiras. `POST /__mock/reset` restaura o seed. Componentes, hooks e o Axios **não** conhecem dados fictícios — só os handlers MSW.

## Organização do UI

Rotas só montam páginas. Páginas só compõem componentes. Cada componente de fluxo tem um hook de lógica. Serviços em `src/services/<domínio>/{*.types,*.api,*.queries}.ts`. Cores só via CSS variables no `@theme` (`src/styles/globals.css`).

Breakpoints efetivos: 390, 768, 1024, 1440 (`shell-padding` e grids).

## Desvios em relação ao Figma

- O 8º card da home no layout sai sem legenda; foi rotulado `Amber Relic #310` por acessibilidade.
- Divisores de 1 px exportados como SVG viraram `border` CSS.
- Filtro de raridade não existe na sidebar do arquivo (só coleções, preço e rede); raridade permanece atributo de detalhe.
- A sidebar de filtros no arquivo marca o item ativo só com `text-accent`, sem caixa de seleção. A entrega **mantém checkboxes**: o estado ligado/desligado fica óbvio quando vários filtros se combinam, o `label` continua permitindo clique no nome, e o controle nativo cobre teclado e leitor de tela. Nome e contagem `(n)` ainda ficam em `text-accent` quando ativos.
- Páginas editoriais (Criadores, Aprenda, newsletter, “Ler mais”) renderizam o layout mas **não** concluem a ação como sucesso.
- Avatares e ícones de redes sociais usam os SVG exportados / gerados localmente; artes de NFT são os quatro retratos do arquivo, redimensionados para AVIF/WebP (160/256/450/900) porque os PNG originais (~2 MB) inviabilizariam Performance ≥ 90.
- Ícones de interface vêm de `lucide-react`. Marcas (Google, Facebook, redes do rodapé) continuam SVG próprios.
- Rating 4.8 / 19 avaliações no detalhe do NFT é estático: a API não expõe nota de colecionadores.
- Compartilhar e “ampliar” a arte no detalhe só anunciam no live region; não concluem a ação.
- Campos extras do perfil no checkout (usuário, ENS, carteiras, indicação) são só UI. O `POST /orders` continua `{ fullName, email, document?, phone? }`.
- O mock de pedidos não exige mais CPF nem telefone.
- O pagamento mobile segue o frame de carteira, não o formulário longo do desktop.
- No perfil, Atividade, Lista de interesse, Ofertas, Arquivos baixados e Suporte só anunciam no live region (sem rota nem API).
- ENS e apelido da carteira no formulário de perfil são só UI; o PATCH de perfil continua `{ name, handle, email, bio }`.
- Na página de carteiras, “igual à principal” continua só UI. Nome de exibição, nome do perfil, e-mail, ENS, sufixo ENS, indicação e ENS opcional entram no POST/PATCH junto com `{ label, address, network, kind, provider }`.
- Links extras do rodapé (coleção, atividade, ajuda, categorias sem tela) só anunciam no live region.

## Lighthouse

Alvos: Performance ≥ 90, Acessibilidade ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Relatórios em `reports/lighthouse/` (3 corridas, mediana).

A home móvel, a home desktop e o detalhe desktop batem os alvos. O detalhe móvel fica em Performance 82: o worker MSW (~178 KB gzip) precisa avaliar **antes** do primeiro paint (REST + WebSocket), e no throttling 4× CPU / 4G lento isso empurra o LCP para ~4,4 s. Imagem LCP (Emerald Ape 450 AVIF), `fetchpriority`, preload no `index.html` e code-split já estão no caminho crítico; remover o mock da entrega não é opção.

## Transporte Socket.IO (limitação)

Apenas WebSocket. Sem fallback para polling. Sem rooms. Eventos `order.updated` são unicast por inscrição, não por namespace.
