import { httpClient } from '../http/axios'

export interface ScenarioOption {
  id: string
  label: string
  description: string
}

export interface ScenarioSnapshot {
  active: { id: string; label: string; description: string }
  available: ScenarioOption[]
}

export async function fetchScenario(): Promise<ScenarioSnapshot> {
  const { data } = await httpClient.get<ScenarioSnapshot>('/__mock/scenario')
  return data
}

export async function selectScenario(id: string): Promise<void> {
  await httpClient.post('/__mock/scenario', { id })
}

export async function resetScenario(scenarioId?: string): Promise<void> {
  await httpClient.post('/__mock/reset', scenarioId ? { scenarioId } : {})
}

export async function triggerNftEvent(payload: {
  nftId: string
  editionId?: string
  priceEth?: string
  soldOut?: boolean
  replayOnly?: boolean
}): Promise<void> {
  await httpClient.post('/__mock/events/nft', payload)
}

export async function triggerOrderEvent(payload: {
  orderId: string
  replayOnly?: boolean
}): Promise<void> {
  await httpClient.post('/__mock/events/order', payload)
}
