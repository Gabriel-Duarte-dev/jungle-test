import { env } from '@/lib/env'
import { readJson, readString, writeJson, writeString } from '@/lib/storage'

import { type EndpointKey, type Scenario } from './scenarios.types'

const SCENARIO_STORAGE_KEY = 'kurio.mock.scenario'
const OVERRIDES_STORAGE_KEY = 'kurio.mock.scenario.overrides'

const base: Omit<Scenario, 'id' | 'label' | 'description'> = {
  latency: [0, 0],
  outOfOrder: false,
  offline: false,
  forcedErrors: {},
  sessionExpired: false,
  orderTimeout: false,
  paymentOutcome: 'confirmed',
  paymentDelayMs: 1_200,
  liveChanges: [],
  duplicateEvents: false,
  emptyCatalog: false,
  favoritesFail: false,
  registerConflict: false,
}

function scenario(
  id: string,
  label: string,
  description: string,
  overrides: Partial<Scenario> = {},
): Scenario {
  return { ...base, id, label, description, ...overrides }
}

export const SCENARIOS: Scenario[] = [
  scenario(
    'default',
    'Padrão',
    'Caminho feliz, sem latência artificial. Base das auditorias e das baselines visuais.',
  ),
  scenario('slow-network', 'Rede lenta', 'Latência de 1,2s a 2,5s em todas as respostas.', {
    latency: [1_200, 2_500],
    paymentDelayMs: 2_500,
  }),
  scenario(
    'flaky-latency',
    'Latência variável',
    'Latência irregular com respostas chegando fora de ordem.',
    { latency: [150, 1_800], outOfOrder: true },
  ),
  scenario(
    'offline',
    'Sem conexão',
    'Toda requisição falha como se a rede estivesse indisponível.',
    {
      offline: true,
    },
  ),
  scenario(
    'server-error',
    'Erro 5xx no catálogo',
    'A listagem responde 500; o restante funciona.',
    {
      forcedErrors: { 'nfts.list': 500 },
    },
  ),
  scenario('detail-not-found', 'NFT inexistente', 'O detalhe responde 404 para qualquer NFT.', {
    forcedErrors: { 'nfts.detail': 404 },
  }),
  scenario('empty-catalog', 'Catálogo vazio', 'A listagem responde com zero resultados.', {
    emptyCatalog: true,
  }),
  scenario(
    'session-expired',
    'Sessão expirada',
    'A sessão restaurada já está expirada; rotas privadas exigem novo login.',
    { sessionExpired: true },
  ),
  scenario(
    'unauthorized',
    'Acesso não autorizado',
    'Perfil e carteiras respondem 403 mesmo com sessão válida.',
    { forcedErrors: { 'profile.get': 403, 'wallets.list': 403 } },
  ),
  scenario(
    'register-conflict',
    'Conflito de cadastro',
    'O cadastro sempre responde 409 de e-mail já utilizado.',
    { registerConflict: true },
  ),
  scenario(
    'favorites-fail',
    'Falha ao favoritar',
    'A mutation de favoritos falha, exercitando o rollback otimista.',
    { favoritesFail: true },
  ),
  scenario(
    'price-changed',
    'Preço alterado na compra',
    'O preço do Emerald Ape #042 sobe por evento de socket logo após a conexão.',
    {
      liveChanges: [{ nftId: 'emerald-ape-042', priceEth: '1.47', delayMs: 2_000 }],
    },
  ),
  scenario(
    'edition-sold-out',
    'Edição esgotada na compra',
    'A edição do Emerald Ape #042 esgota por evento de socket.',
    {
      liveChanges: [
        {
          nftId: 'emerald-ape-042',
          editionId: 'emerald-ape-042-ed-1',
          soldOut: true,
          delayMs: 2_000,
        },
      ],
    },
  ),
  scenario(
    'order-timeout',
    'Timeout após criar o pedido',
    'O pedido é criado, mas a resposta nunca chega. A retomada ocorre por idempotência.',
    { orderTimeout: true },
  ),
  scenario('payment-refused', 'Pagamento recusado', 'O pedido pendente termina como recusado.', {
    paymentOutcome: 'refused',
  }),
  scenario(
    'duplicate-events',
    'Eventos duplicados e antigos',
    'Cada evento é reenviado e seguido de uma versão antiga, que deve ser ignorada.',
    {
      duplicateEvents: true,
      liveChanges: [{ nftId: 'emerald-ape-042', priceEth: '1.33', delayMs: 2_000 }],
    },
  ),
]

const DEFAULT_SCENARIO = SCENARIOS[0]

export function findScenario(id: string | null | undefined): Scenario {
  return SCENARIOS.find((candidate) => candidate.id === id) ?? DEFAULT_SCENARIO
}

export function resolveScenarioId(): string {
  const fromUrl =
    typeof window === 'undefined'
      ? null
      : new URL(window.location.href).searchParams.get('scenario')

  if (fromUrl) {
    writeString(SCENARIO_STORAGE_KEY, fromUrl)
    return findScenario(fromUrl).id
  }

  const stored = readString(SCENARIO_STORAGE_KEY)
  return findScenario(stored ?? env.defaultScenario).id
}

let active: Scenario = DEFAULT_SCENARIO

export function activateScenario(id: string): Scenario {
  const overrides = readJson<Partial<Scenario>>(OVERRIDES_STORAGE_KEY, {})
  active = { ...findScenario(id), ...overrides }
  return active
}

export function getScenario(): Scenario {
  return active
}

export function setScenarioOverrides(overrides: Partial<Scenario>): void {
  writeJson(OVERRIDES_STORAGE_KEY, overrides)
  active = { ...active, ...overrides }
}

export function persistScenarioId(id: string): void {
  writeString(SCENARIO_STORAGE_KEY, id)
}

export function forcedStatusFor(endpoint: EndpointKey): number | undefined {
  return active.forcedErrors[endpoint]
}

const latencyCounters = new Map<string, number>()

function pseudoRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), 1 | t)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function seedFor(key: string): number {
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (Math.imul(hash, 31) + key.charCodeAt(index)) | 0
  }
  return hash
}

export function nextLatency(endpoint: EndpointKey): number {
  const [min, max] = active.latency
  if (max <= 0) return 0

  const counter = (latencyCounters.get(endpoint) ?? 0) + 1
  latencyCounters.set(endpoint, counter)

  const random = pseudoRandom(seedFor(`${active.id}:${endpoint}`) + counter * 7919)
  const jitter = active.outOfOrder && counter % 2 === 1 ? (max - min) * 1.5 : 0

  return Math.round(min + random * (max - min) + jitter)
}

export function resetLatencyCounters(): void {
  latencyCounters.clear()
}

export { type Scenario, type EndpointKey } from './scenarios.types'
