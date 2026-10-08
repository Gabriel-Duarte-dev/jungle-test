const DECIMALS = 18n
const SCALE = 10n ** DECIMALS

export type EthAmount = string

const AMOUNT_PATTERN = /^-?\d+(\.\d+)?$/

export function isEthAmount(value: unknown): value is EthAmount {
  return typeof value === 'string' && AMOUNT_PATTERN.test(value.trim())
}

export function toWei(value: EthAmount): bigint {
  const trimmed = value.trim()

  if (!AMOUNT_PATTERN.test(trimmed)) {
    throw new TypeError(`Invalid ETH amount: ${JSON.stringify(value)}`)
  }

  const negative = trimmed.startsWith('-')
  const unsigned = negative ? trimmed.slice(1) : trimmed
  const [whole, fraction = ''] = unsigned.split('.')

  const paddedFraction = fraction.padEnd(Number(DECIMALS), '0').slice(0, Number(DECIMALS))
  const wei = BigInt(whole) * SCALE + BigInt(paddedFraction || '0')

  return negative ? -wei : wei
}

export function fromWei(wei: bigint): EthAmount {
  const negative = wei < 0n
  const absolute = negative ? -wei : wei

  const whole = absolute / SCALE
  const fraction = (absolute % SCALE).toString().padStart(Number(DECIMALS), '0').replace(/0+$/, '')

  const value = fraction ? `${whole}.${fraction}` : `${whole}`

  return negative ? `-${value}` : value
}

export function addEth(...values: EthAmount[]): EthAmount {
  return fromWei(values.reduce((total, value) => total + toWei(value), 0n))
}

export function subEth(minuend: EthAmount, subtrahend: EthAmount): EthAmount {
  return fromWei(toWei(minuend) - toWei(subtrahend))
}

export function multiplyEth(value: EthAmount, quantity: number): EthAmount {
  if (!Number.isInteger(quantity)) {
    throw new TypeError(`Quantity must be an integer, received ${quantity}`)
  }

  return fromWei(toWei(value) * BigInt(quantity))
}

export function percentageOfEth(value: EthAmount, basisPoints: number): EthAmount {
  if (!Number.isInteger(basisPoints)) {
    throw new TypeError(`Basis points must be an integer, received ${basisPoints}`)
  }

  const scaled = toWei(value) * BigInt(basisPoints)
  const quotient = scaled / 10_000n
  const remainder = scaled % 10_000n
  const roundsUp = remainder * 2n >= 10_000n

  return fromWei(roundsUp ? quotient + 1n : quotient)
}

export function compareEth(left: EthAmount, right: EthAmount): -1 | 0 | 1 {
  const a = toWei(left)
  const b = toWei(right)

  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function isZeroEth(value: EthAmount): boolean {
  return toWei(value) === 0n
}

export interface FormatEthOptions {
  decimals?: number
  separator?: '.' | ','
  withSymbol?: boolean
}

export function formatEth(value: EthAmount, options: FormatEthOptions = {}): string {
  const { decimals = 2, separator = '.', withSymbol = false } = options

  const wei = toWei(value)
  const negative = wei < 0n
  const absolute = negative ? -wei : wei

  const divisor = 10n ** (DECIMALS - BigInt(decimals))
  const quotient = absolute / divisor
  const remainder = absolute % divisor
  const rounded = remainder * 2n >= divisor ? quotient + 1n : quotient

  const digits = rounded.toString().padStart(decimals + 1, '0')
  const whole = digits.slice(0, digits.length - decimals)
  const fraction = decimals > 0 ? digits.slice(digits.length - decimals) : ''

  const body = fraction ? `${whole}${separator}${fraction}` : whole

  return `${negative ? '-' : ''}${body}${withSymbol ? ' ETH' : ''}`
}
