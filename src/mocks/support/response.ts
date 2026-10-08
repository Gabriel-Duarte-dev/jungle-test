import { HttpResponse, delay } from 'msw'

import { type ApiErrorBody, type ApiErrorCode, type FieldErrors } from '@/services/http/errors'

import { type EndpointKey, forcedStatusFor, getScenario, nextLatency } from '../scenarios'

export function jsonOk<T>(data: T, status = 200): Response {
  return HttpResponse.json(data as never, { status })
}

export function noContent(): Response {
  return new HttpResponse(null, { status: 204 })
}

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  extra: { fields?: FieldErrors; details?: unknown } = {},
): Response {
  const error: ApiErrorBody['error'] = { code, message }

  if (extra.fields) error.fields = extra.fields
  if (extra.details !== undefined) error.details = extra.details

  return HttpResponse.json({ error }, { status })
}

export const unauthenticated = () =>
  errorResponse(401, 'unauthenticated', 'Entre na sua conta para continuar.')

export const sessionExpired = () =>
  errorResponse(401, 'session_expired', 'Sua sessão expirou. Entre novamente para continuar.')

export const forbidden = () =>
  errorResponse(403, 'forbidden', 'Você não tem permissão para acessar este recurso.')

export const notFound = (message = 'Não encontramos o que você procura.') =>
  errorResponse(404, 'not_found', message)

export const validationError = (fields: FieldErrors, message = 'Revise os campos destacados.') =>
  errorResponse(422, 'validation_error', message, { fields })

export const conflict = (
  code: ApiErrorCode,
  message: string,
  extra: { fields?: FieldErrors; details?: unknown } = {},
) => errorResponse(409, code, message, extra)

export const serverError = (message = 'Tivemos um problema inesperado. Tente novamente.') =>
  errorResponse(500, 'server_error', message)

const FORCED_ERROR_BODIES: Record<number, () => Response> = {
  400: () => errorResponse(400, 'validation_error', 'Requisição inválida.'),
  401: unauthenticated,
  403: forbidden,
  404: () => notFound(),
  409: () => conflict('conflict', 'Conflito ao processar a requisição.'),
  429: () => errorResponse(429, 'rate_limited', 'Muitas tentativas em sequência.'),
  500: () => serverError(),
  503: () =>
    errorResponse(503, 'server_error', 'Serviço temporariamente indisponível. Tente novamente.'),
}

export async function applyScenario(endpoint: EndpointKey): Promise<Response | null> {
  const scenario = getScenario()

  if (scenario.offline) {
    await delay(120)
    return HttpResponse.error()
  }

  const latency = nextLatency(endpoint)
  if (latency > 0) await delay(latency)

  const forcedStatus = forcedStatusFor(endpoint)
  if (forcedStatus !== undefined) {
    return (FORCED_ERROR_BODIES[forcedStatus] ?? serverError)()
  }

  return null
}

export async function hang(): Promise<never> {
  await delay('infinite')
  throw new Error('unreachable')
}
