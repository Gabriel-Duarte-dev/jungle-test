import axios from 'axios'

export type ApiErrorCode =
  | 'validation_error'
  | 'invalid_credentials'
  | 'unauthenticated'
  | 'session_expired'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'availability_conflict'
  | 'price_changed'
  | 'coupon_invalid'
  | 'coupon_expired'
  | 'quote_stale'
  | 'idempotency_conflict'
  | 'payment_refused'
  | 'rate_limited'
  | 'server_error'
  | 'network_error'
  | 'timeout'
  | 'cancelled'
  | 'unknown'

export type FieldErrors = Record<string, string>

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    fields?: FieldErrors
    details?: unknown
  }
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number | undefined
  readonly fields: FieldErrors | undefined
  readonly details: unknown

  constructor(init: {
    code: ApiErrorCode
    message: string
    status?: number
    fields?: FieldErrors
    details?: unknown
  }) {
    super(init.message)
    this.name = 'ApiError'
    this.code = init.code
    this.status = init.status
    this.fields = init.fields
    this.details = init.details
  }

  get isTransient(): boolean {
    if (this.code === 'network_error' || this.code === 'timeout') return true
    return this.status !== undefined && (this.status >= 500 || this.status === 429)
  }

  get isSessionError(): boolean {
    return this.code === 'unauthenticated' || this.code === 'session_expired'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

const STATUS_FALLBACK: Record<number, ApiErrorCode> = {
  400: 'validation_error',
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'validation_error',
  429: 'rate_limited',
}

const DEFAULT_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  network_error: 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
  timeout: 'A operação demorou mais que o esperado. Tente novamente.',
  server_error: 'Tivemos um problema inesperado. Tente novamente em instantes.',
  rate_limited: 'Muitas tentativas em sequência. Aguarde alguns segundos.',
  unauthenticated: 'Entre na sua conta para continuar.',
  session_expired: 'Sua sessão expirou. Entre novamente para continuar.',
  forbidden: 'Você não tem permissão para acessar este recurso.',
  not_found: 'Não encontramos o que você procura.',
  cancelled: 'Requisição cancelada.',
  unknown: 'Algo deu errado. Tente novamente.',
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false
  const candidate = (value as ApiErrorBody).error
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string'
  )
}

export function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) return error

  if (axios.isCancel(error)) {
    return new ApiError({ code: 'cancelled', message: DEFAULT_MESSAGES.cancelled! })
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({ code: 'timeout', message: DEFAULT_MESSAGES.timeout! })
    }

    const { response } = error

    if (!response) {
      return new ApiError({ code: 'network_error', message: DEFAULT_MESSAGES.network_error! })
    }

    if (isApiErrorBody(response.data)) {
      const { code, message, fields, details } = response.data.error
      return new ApiError({ code, message, status: response.status, fields, details })
    }

    const code = STATUS_FALLBACK[response.status] ?? 'server_error'
    return new ApiError({
      code,
      message: DEFAULT_MESSAGES[code] ?? DEFAULT_MESSAGES.unknown!,
      status: response.status,
    })
  }

  return new ApiError({
    code: 'unknown',
    message: error instanceof Error ? error.message : DEFAULT_MESSAGES.unknown!,
  })
}

export function errorMessage(error: unknown): string {
  const normalized = normalizeError(error)
  return normalized.message || DEFAULT_MESSAGES[normalized.code] || DEFAULT_MESSAGES.unknown!
}
