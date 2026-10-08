# KURIO — Marketplace de NFTs

Frontend do desafio: descoberta, compra e conta do colecionador, com APIs, autenticação, carteiras, pagamentos e tempo real **simulados** via MSW + Socket.IO. Não há backend de produção nem integração com blockchain.

## Stack

Vite + React + TypeScript, TanStack Router, TanStack Query, Axios, Socket.IO client, Tailwind CSS, shadcn/ui (Radix), MSW 2.15.0, `@mswjs/socket.io-binding`, Playwright, Lighthouse.

## Setup

```bash
npm install
npx playwright install chromium
```

Node `>= 20.19`. O `.env` versionado já habilita os mocks. Para um checkout limpo, copie `.env.example` para `.env`.

### Variáveis de ambiente

| Variável | Padrão | Função |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | `true` | Liga a camada MSW (REST + WebSocket). Sem isso a entrega não tem backend. |
| `VITE_API_URL` | `https://api.kurio.test` | Base do Axios; interceptada pelos handlers REST. |
| `VITE_SOCKET_URL` | `ws://api.kurio.test` | Reservado para um backend real. No mock o cliente fala same-origin (`/socket.io`) e o MSW intercepta a classe WebSocket. |
| `VITE_DEFAULT_SCENARIO` | `default` | Cenário aplicado num boot frio. |

## Credenciais fictícias

Senhas são hasheadas com SHA-256 (`salt:senha`) no mock. Nada é persistido em claro.

| E-mail | Senha | Notas |
| --- | --- | --- |
| `ana@kurio.test` | `Colecionador1!` | Carrinho pré-preenchido (Emerald Ape #042 × 1, Golden Beat #207 × 2) e 3 favoritos. |
| `bruno@kurio.test` | `Mercado2024!` | Conta vazia, útil para cadastro de carteira e troca de usuário. |

Cupons: `KURIO10` (10%), `GENESIS25` (25%), `CUNHAGEM5` (5%), `EXPIRADO20` (expirado).

## Cenários

O painel **Simulação** no canto inferior direito troca o cenário (recarrega a página). Também vale `?scenario=<id>` — o valor é persistido em `localStorage`.

**Restaurar** (`POST /__mock/reset`) devolve o banco ao seed daquele cenário.

| Id | O que simula |
| --- | --- |
| `default` | Caminho feliz, sem latência. Base das auditorias e das screenshots. |
| `slow-network` | 1,2–2,5 s de latência. Skeletons. |
| `flaky-latency` | Latência irregular / respostas fora de ordem. |
| `offline` | Rede indisponível. |
| `server-error` | `GET /nfts` responde 500. |
| `detail-not-found` | Qualquer detalhe responde 404. |
| `empty-catalog` | Listagem vazia. |
| `session-expired` | Sessão restaurada já expirada. |
| `unauthorized` | Perfil/carteiras 403. |
| `register-conflict` | Cadastro 409. |
| `favorites-fail` | Mutation de favorito falha (rollback otimista). |
| `price-changed` | Socket sobe o preço do Emerald Ape #042 ~2 s após conectar. |
| `edition-sold-out` | Socket esgota a edição 1 do Emerald Ape #042. |
| `order-timeout` | O pedido é criado, mas a resposta do POST nunca chega. Retry com a mesma `Idempotency-Key` recupera. |
| `payment-refused` | Pedido pendente termina recusado. |
| `duplicate-events` | Cada evento é reenviado e seguido de uma versão antiga. |

### Reproduzir fluxos de falha

1. **Cupom inválido/expirado** — no carrinho, aplique `FOO` ou `EXPIRADO20`.
2. **Preço mudou no checkout** — cenário `price-changed`, entre como Ana, abra o carrinho/pagamento e aguarde o aviso.
3. **Edição esgotada** — cenário `edition-sold-out`.
4. **Timeout + idempotência** — cenário `order-timeout`, confirme o pedido; o cliente tenta de novo com a mesma chave.
5. **Pagamento recusado** — cenário `payment-refused`.
6. **Sessão expirada** — cenário `session-expired` ou remova `kurio.session.token` e navegue a `/perfil`.
7. **Favorito com rollback** — cenário `favorites-fail`.

Eventos também podem ser disparados em momento determinado:

```http
POST https://api.kurio.test/__mock/events/nft
{ "nftId": "emerald-ape-042", "priceEth": "1.47" }

POST https://api.kurio.test/__mock/events/order
{ "orderId": "<id>" }
```

O evento **ainda atravessa** `socket.io-client`. Os endpoints só controlam o *quando*.

## Comandos

```bash
npm run dev:mock          # desenvolvimento com mocks
npm run build             # build otimizado
npm run preview           # preview na porta 4173
npm run typecheck
npm run lint
npm run test:e2e          # Playwright (sobe o preview sozinho)
npm run test:e2e:update-snapshots
npm run lighthouse        # requer `npm run preview` em outro terminal
```

O HTML do Playwright fica em `playwright-report/`. Traces de falha em `test-results/`. Relatórios Lighthouse em `reports/lighthouse/` (`summary.json` + HTML/JSON brutos). Medianas da última bateria: home móvel 93/97/100/100, detalhe móvel 82/97/100/100, home desktop 98/97/100/100, detalhe desktop 97/97/100/100 (Performance / Acessibilidade / Best Practices / SEO). O 82 no detalhe móvel é o custo do worker MSW no LCP; ver `ARCHITECTURE.md`.

## Rotas

`/`, `/nfts/:id`, `/carrinho`, `/pagamento`, `/pedidos/:id`, `/entrar`, `/cadastro`, `/perfil`, `/carteiras`. Refresh e acesso direto funcionam (rewrite SPA no `vercel.json`).

## Deploy (Vercel)

SPA estático. `vercel.json` define `buildCommand` (`npm run build`), `outputDirectory` (`dist`) e rewrite de todas as rotas para `index.html`, exceto `assets/`, `fonts/`, `mockServiceWorker.js`, `favicon.svg` e `robots.txt`.

```bash
npx vercel login
npx vercel --yes --prod
```

Produção: [https://jungle-test-three.vercel.app](https://jungle-test-three.vercel.app). Refresh e acesso direto em `/`, `/nfts/emerald-ape-042`, `/carrinho`, `/pagamento` e `/entrar` devolvem o `index.html`; `/robots.txt` continua texto puro. O MSW sobe no cliente (`VITE_ENABLE_MOCKS=true`); o worker precisa de HTTPS e do header `Service-Worker-Allowed`.

O projeto Hobby nasce com **Vercel Authentication**. Quem não estiver logado na conta vê a tela de login da Vercel. Para abrir o site ao público:

```bash
npx vercel project protection disable --sso
```
