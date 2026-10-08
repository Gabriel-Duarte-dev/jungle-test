import { httpClient } from '../http/axios'
import { type Network } from '../shared.types'
import { type Quote } from './quote.types'

export async function createQuote(
  input: { couponCode?: string | null; network?: Network },
  signal?: AbortSignal,
): Promise<Quote> {
  const { data } = await httpClient.post<Quote>('/cart/quote', input, { signal })
  return data
}
