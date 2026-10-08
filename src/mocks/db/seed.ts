import { type Network, type Rarity } from '@/services/shared.types'

import {
  type DbCollection,
  type DbCoupon,
  type DbEdition,
  type DbNft,
  type DbUser,
  type DbWallet,
  type MockDatabase,
  SCHEMA_VERSION,
} from './schema'
import { hashPassword } from '../support/hash'

function createRandom(seed: number) {
  let state = seed

  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const COLLECTIONS: DbCollection[] = [
  { id: 'arte-digital', name: 'Arte digital' },
  { id: 'fotografia', name: 'Fotografia' },
  { id: 'musica', name: 'Música' },
  { id: 'arte-3d', name: 'Arte 3D' },
  { id: 'colecionaveis', name: 'Colecionáveis' },
  { id: 'generativa', name: 'Generativa' },
  { id: 'jogos', name: 'Jogos' },
  { id: 'assinaturas', name: 'Assinaturas' },
  { id: 'utilidade', name: 'Utilidade' },
]

const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']
const RARITIES: Rarity[] = ['comum', 'raro', 'epico', 'lendario']

const ARTWORK_SLUGS = ['ape-emerald', 'ape-sage', 'ape-violet', 'ape-amber'] as const

const CREATORS = [
  { name: 'Marina Okada', handle: '@marinaokada', verified: true },
  { name: 'Estúdio Cinzel', handle: '@cinzel', verified: true },
  { name: 'Rafael Prado', handle: '@rafaprado', verified: false },
  { name: 'Lia Antunes', handle: '@liaantunes', verified: true },
  { name: 'Coletivo Vértice', handle: '@vertice', verified: false },
  { name: 'Noah Ferraz', handle: '@noahferraz', verified: true },
]

const FIRST_NAMES = [
  'Emerald',
  'Sage',
  'Neon',
  'Cosmic',
  'Violet',
  'Ivory',
  'Golden',
  'Amber',
  'Obsidian',
  'Crimson',
  'Lunar',
  'Solar',
  'Velvet',
  'Quartz',
  'Cobalt',
  'Ember',
]

const SECOND_NAMES = [
  'Ape',
  'Nomad',
  'Vessel',
  'Bloom',
  'Baron',
  'Beat',
  'Signal',
  'Relic',
  'Drift',
  'Oracle',
  'Cipher',
  'Mirage',
  'Totem',
  'Sentinel',
]

const TRAIT_POOL: Array<{ trait: string; values: string[] }> = [
  { trait: 'Fundo', values: ['Âmbar', 'Carvão', 'Sépia', 'Esmeralda', 'Violeta'] },
  { trait: 'Olhos', values: ['Lentes escuras', 'Hipnótico', 'Sereno', 'Fosforescente'] },
  { trait: 'Vestuário', values: ['Jaqueta varsity', 'Casaco de lã', 'Moletom', 'Terno cru'] },
  { trait: 'Chapéu', values: ['Bucket', 'Boina', 'Nenhum', 'Capuz'] },
  { trait: 'Aura', values: ['Nenhuma', 'Dourada', 'Fumaça', 'Prismática'] },
]

const DESCRIPTION_PARTS = [
  'Peça central de uma série construída à mão, com camadas pintadas digitalmente e textura de filme granulado.',
  'A composição nasceu de um estudo sobre retratos clássicos recontados pela estética das comunidades da internet.',
  'Cada traço foi revisado para manter a procedência verificável e a fidelidade da paleta original do artista.',
  'A edição acompanha os direitos de exibição e o histórico completo de transferências registrado na rede.',
]

const DESIGN_NFTS: Array<{
  id: string
  name: string
  priceEth: string
  compareAtPriceEth?: string
  artworkSlug: string
  collectionId: string
  network: Network
  rarity: Rarity
}> = [
  {
    id: 'emerald-ape-042',
    name: 'Emerald Ape #042',
    priceEth: '1.19',
    artworkSlug: 'ape-emerald',
    collectionId: 'arte-digital',
    network: 'ethereum',
    rarity: 'lendario',
  },
  {
    id: 'sage-nomad-009',
    name: 'Sage Nomad #009',
    priceEth: '1.69',
    artworkSlug: 'ape-sage',
    collectionId: 'colecionaveis',
    network: 'ethereum',
    rarity: 'epico',
  },
  {
    id: 'neon-vessel-552',
    name: 'Neon Vessel #552',
    priceEth: '1.99',
    compareAtPriceEth: '2.29',
    artworkSlug: 'ape-violet',
    collectionId: 'generativa',
    network: 'polygon',
    rarity: 'epico',
  },
  {
    id: 'cosmic-bloom-118',
    name: 'Cosmic Bloom #118',
    priceEth: '1.29',
    artworkSlug: 'ape-sage',
    collectionId: 'arte-3d',
    network: 'ethereum',
    rarity: 'raro',
  },
  {
    id: 'violet-nomad-314',
    name: 'Violet Nomad #314',
    priceEth: '1.39',
    artworkSlug: 'ape-sage',
    collectionId: 'arte-digital',
    network: 'solana',
    rarity: 'raro',
  },
  {
    id: 'ivory-baron-088',
    name: 'Ivory Baron #088',
    priceEth: '1.79',
    artworkSlug: 'ape-violet',
    collectionId: 'fotografia',
    network: 'ethereum',
    rarity: 'epico',
  },
  {
    id: 'golden-beat-207',
    name: 'Golden Beat #207',
    priceEth: '0.99',
    artworkSlug: 'ape-amber',
    collectionId: 'musica',
    network: 'polygon',
    rarity: 'raro',
  },
  {
    id: 'amber-relic-310',
    name: 'Amber Relic #310',
    priceEth: '1.49',
    artworkSlug: 'ape-amber',
    collectionId: 'colecionaveis',
    network: 'ethereum',
    rarity: 'raro',
  },
  {
    id: 'golden-signal-160',
    name: 'Golden Signal #160',
    priceEth: '0.39',
    artworkSlug: 'ape-amber',
    collectionId: 'jogos',
    network: 'solana',
    rarity: 'comum',
  },
]

const TOTAL_NFTS = 120

const EPOCH = Date.parse('2026-09-20T12:00:00.000Z')

function isoFromEpoch(offsetMinutes: number): string {
  return new Date(EPOCH - offsetMinutes * 60_000).toISOString()
}

function buildEditions(
  nftId: string,
  basePriceEth: string,
  runLength: number,
  availability: number[],
): DbEdition[] {
  return availability.slice(0, runLength).map((available, index) => ({
    id: `${nftId}-ed-${index + 1}`,
    number: index + 1,
    totalInRun: runLength,
    priceEth: basePriceEth,
    available,
    status: available > 0 ? 'available' : 'sold_out',
  }))
}

function buildAttributes(random: () => number): DbNft['attributes'] {
  return TRAIT_POOL.map(({ trait, values }) => {
    const value = values[Math.floor(random() * values.length)]
    return {
      trait,
      value,
      rarityPct: Number((2 + random() * 38).toFixed(1)),
    }
  })
}

function buildGallery(primarySlug: string, random: () => number): string[] {
  const others = ARTWORK_SLUGS.filter((slug) => slug !== primarySlug)
  const shuffled = [...others].sort(() => random() - 0.5)
  return [primarySlug, ...shuffled]
}

function buildNfts(): DbNft[] {
  const random = createRandom(20260920)
  const nfts: DbNft[] = []

  const makeNft = (
    index: number,
    overrides: Partial<DbNft> & Pick<DbNft, 'id' | 'name' | 'priceEth' | 'artworkSlug'>,
  ): DbNft => {
    const collectionId =
      overrides.collectionId ?? COLLECTIONS[Math.floor(random() * COLLECTIONS.length)].id
    const network = overrides.network ?? NETWORKS[Math.floor(random() * NETWORKS.length)]
    const rarity = overrides.rarity ?? RARITIES[Math.floor(random() * RARITIES.length)]
    const creator = CREATORS[Math.floor(random() * CREATORS.length)]
    const runLength = 2 + Math.floor(random() * 4)
    const availability: number[] = Array.from({ length: runLength }, () => Math.floor(random() * 5))

    if (!availability.some((value) => value > 0)) availability[0] = 2

    const editions = buildEditions(overrides.id, overrides.priceEth, runLength, availability)

    return {
      id: overrides.id,
      name: overrides.name,
      collectionId,
      network,
      rarity,
      priceEth: overrides.priceEth,
      compareAtPriceEth: overrides.compareAtPriceEth ?? null,
      artworkSlug: overrides.artworkSlug,
      gallerySlugs: buildGallery(overrides.artworkSlug, random),
      description: [
        DESCRIPTION_PARTS[index % DESCRIPTION_PARTS.length],
        DESCRIPTION_PARTS[(index + 2) % DESCRIPTION_PARTS.length],
      ].join(' '),
      creator,
      attributes: buildAttributes(random),
      editions,
      mintedAt: isoFromEpoch(1_440 * (30 + index)),
      listedAt: isoFromEpoch(index * 37),
      tokenStandard: network === 'solana' ? 'SPL' : 'ERC-721',
      contractAddress: `0x${(0x4b55 + index).toString(16).padStart(4, '0')}${'a3f1c8d2e7b94056'}`,
      royaltiesPct: 2 + Math.floor(random() * 8),
      stats: {
        views: 400 + Math.floor(random() * 9_000),
        favorites: 10 + Math.floor(random() * 700),
        owners: 1 + Math.floor(random() * runLength),
      },
      popularity: Math.floor(random() * 1_000),
      isNewRelease: index < 18,
      isTrending: random() > 0.72,
      version: 1,
    }
  }

  DESIGN_NFTS.forEach((design, index) => {
    nfts.push(makeNft(index, design))
  })

  for (let index = DESIGN_NFTS.length; index < TOTAL_NFTS; index += 1) {
    const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)]
    const second = SECOND_NAMES[Math.floor(random() * SECOND_NAMES.length)]
    const token = String(100 + Math.floor(random() * 880)).padStart(3, '0')
    const name = `${first} ${second} #${token}`
    const id = `${first.toLowerCase()}-${second.toLowerCase()}-${token}`

    if (nfts.some((nft) => nft.id === id)) continue

    const priceEth = (0.05 + random() * 11.9).toFixed(2)
    const hasDiscount = random() > 0.8

    nfts.push(
      makeNft(index, {
        id,
        name,
        priceEth,
        artworkSlug: ARTWORK_SLUGS[index % ARTWORK_SLUGS.length],
        compareAtPriceEth: hasDiscount
          ? (Number(priceEth) * (1.1 + random() * 0.25)).toFixed(2)
          : null,
      }),
    )
  }

  nfts[nfts.length - 1].priceEth = '12.30'
  nfts[nfts.length - 1].editions.forEach((edition) => {
    edition.priceEth = '12.30'
  })
  nfts[nfts.length - 2].priceEth = '0.02'
  nfts[nfts.length - 2].editions.forEach((edition) => {
    edition.priceEth = '0.02'
  })

  return nfts
}

export const COUPONS: DbCoupon[] = [
  { code: 'KURIO10', label: '10% de desconto', basisPoints: 1_000, expiresAt: null, active: true },
  {
    code: 'GENESIS25',
    label: '25% nos lançamentos gênesis',
    basisPoints: 2_500,
    expiresAt: null,
    active: true,
  },
  {
    code: 'CUNHAGEM5',
    label: '5% da Diário da Cunhagem',
    basisPoints: 500,
    expiresAt: null,
    active: true,
  },
  {
    code: 'EXPIRADO20',
    label: '20% — campanha encerrada',
    basisPoints: 2_000,
    expiresAt: '2026-01-31T23:59:59.000Z',
    active: true,
  },
]

export const SEED_CREDENTIALS = [
  { email: 'ana@kurio.test', password: 'Colecionador1!' },
  { email: 'bruno@kurio.test', password: 'Mercado2024!' },
] as const

async function buildUsers(): Promise<DbUser[]> {
  const base = [
    {
      id: 'user-ana',
      name: 'Ana Duarte',
      email: 'ana@kurio.test',
      handle: '@anaduarte',
      bio: 'Coleciono retratos generativos e séries de edição limitada desde 2021.',
      password: SEED_CREDENTIALS[0].password,
      salt: 'kurio-ana',
    },
    {
      id: 'user-bruno',
      name: 'Bruno Lima',
      email: 'bruno@kurio.test',
      handle: '@brunolima',
      bio: 'Curador independente. Foco em fotografia digital e arte sonora.',
      password: SEED_CREDENTIALS[1].password,
      salt: 'kurio-bruno',
    },
  ]

  return Promise.all(
    base.map(async (user, index) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      handle: user.handle,
      passwordHash: await hashPassword(user.password, user.salt),
      passwordSalt: user.salt,
      avatarUrl: null,
      bio: user.bio,
      createdAt: isoFromEpoch(1_440 * (120 + index * 45)),
    })),
  )
}

function emptyWalletProfile() {
  return {
    displayName: '',
    profileName: '',
    referral: '',
    email: '',
    ens: '',
    ensTld: '.eth' as const,
    optionalEns: '',
  }
}

function buildWallets(): DbWallet[] {
  return [
    {
      id: 'wallet-ana-primary',
      userId: 'user-ana',
      label: 'Carteira principal',
      address: '0x6f1b2c48d93a7e5048c1b7d2a9f03e61c4857b92',
      network: 'ethereum',
      kind: 'primary',
      provider: 'metamask',
      createdAt: isoFromEpoch(1_440 * 100),
      ...emptyWalletProfile(),
    },
    {
      id: 'wallet-ana-secondary',
      userId: 'user-ana',
      label: 'Carteira de reserva',
      address: '0xb47d0e91a6c3528f7d14b905e2cf63a8107d94e5',
      network: 'polygon',
      kind: 'secondary',
      provider: 'walletconnect',
      createdAt: isoFromEpoch(1_440 * 60),
      ...emptyWalletProfile(),
      ens: 'nova.kurio',
      ensTld: '.eth',
    },
    {
      id: 'wallet-bruno-primary',
      userId: 'user-bruno',
      label: 'Carteira principal',
      address: '0x2c9a7f3b18d6045e9b2c71fa83d05e461b7c8a30',
      network: 'ethereum',
      kind: 'primary',
      provider: 'coinbase',
      createdAt: isoFromEpoch(1_440 * 80),
      ...emptyWalletProfile(),
    },
  ]
}

export async function createSeedDatabase(scenarioId: string): Promise<MockDatabase> {
  const nfts = buildNfts()
  const users = await buildUsers()

  return {
    schemaVersion: SCHEMA_VERSION,
    scenarioId,
    collections: COLLECTIONS,
    nfts,
    users,
    sessions: [],
    carts: [
      {
        id: 'cart-ana',
        ownerKey: 'user:user-ana',
        items: [
          {
            id: 'cart-ana-item-1',
            nftId: 'emerald-ape-042',
            editionId: 'emerald-ape-042-ed-1',
            quantity: 1,
            addedAt: isoFromEpoch(240),
            knownUnitPriceEth: '1.19',
          },
          {
            id: 'cart-ana-item-2',
            nftId: 'golden-beat-207',
            editionId: 'golden-beat-207-ed-1',
            quantity: 2,
            addedAt: isoFromEpoch(180),
            knownUnitPriceEth: '0.99',
          },
        ],
        version: 1,
        updatedAt: isoFromEpoch(180),
      },
    ],
    quotes: [],
    orders: [],
    wallets: buildWallets(),
    coupons: COUPONS,
    favorites: [
      { userId: 'user-ana', nftId: 'neon-vessel-552', createdAt: isoFromEpoch(600) },
      { userId: 'user-ana', nftId: 'ivory-baron-088', createdAt: isoFromEpoch(540) },
      { userId: 'user-bruno', nftId: 'cosmic-bloom-118', createdAt: isoFromEpoch(480) },
    ],
    idempotency: [],
    sequence: 1,
  }
}
