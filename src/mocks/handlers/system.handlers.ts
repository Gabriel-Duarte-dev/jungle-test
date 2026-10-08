import { http } from 'msw'

import { getDb, resetDatabase } from '../db'
import { applyLiveChange } from '../db/operations/catalog'
import { clearSettlementTimers, resumePendingOrders, settleOrder } from '../db/operations/orders'
import {
  SCENARIOS,
  activateScenario,
  getScenario,
  persistScenarioId,
  resetLatencyCounters,
  setScenarioOverrides,
} from '../scenarios'
import { type Scenario } from '../scenarios/scenarios.types'
import { emitNftUpdated, emitOrderUpdated } from '../socket/emitter'
import { jsonOk, noContent, notFound } from '../support/response'
import { api } from './paths'

export const systemHandlers = [
  http.get(api('/__mock/scenario'), () =>
    jsonOk({
      active: getScenario(),
      available: SCENARIOS.map(({ id, label, description }) => ({ id, label, description })),
    }),
  ),

  http.post(api('/__mock/scenario'), async ({ request }) => {
    const payload = (await request.json()) as { id?: string; overrides?: Partial<Scenario> }
    const id = payload.id ?? getScenario().id

    clearSettlementTimers()
    resetLatencyCounters()

    persistScenarioId(id)
    const scenario = activateScenario(id)

    if (payload.overrides) setScenarioOverrides(payload.overrides)

    await resetDatabase(id)
    resumePendingOrders()

    return jsonOk({ active: getScenario(), scenarioId: scenario.id })
  }),

  http.post(api('/__mock/reset'), async ({ request }) => {
    const payload = (await request.json().catch(() => ({}))) as { scenarioId?: string }
    const id = payload.scenarioId ?? getScenario().id

    clearSettlementTimers()
    resetLatencyCounters()
    activateScenario(id)

    await resetDatabase(id)
    resumePendingOrders()

    return jsonOk({ ok: true, scenarioId: id })
  }),

  http.post(api('/__mock/events/nft'), async ({ request }) => {
    const payload = (await request.json()) as {
      nftId: string
      editionId?: string
      priceEth?: string
      soldOut?: boolean

      replayOnly?: boolean
    }

    const nft = getDb().nfts.find((candidate) => candidate.id === payload.nftId)
    if (!nft) return notFound('NFT não encontrado.')

    if (payload.replayOnly) {
      emitNftUpdated(payload.nftId)
      return noContent()
    }

    applyLiveChange({ ...payload, delayMs: 0 })

    return jsonOk({
      nftId: payload.nftId,
      version: getDb().nfts.find((c) => c.id === payload.nftId)!.version,
    })
  }),

  http.post(api('/__mock/events/order'), async ({ request }) => {
    const payload = (await request.json()) as { orderId: string; replayOnly?: boolean }
    const order = getDb().orders.find((candidate) => candidate.id === payload.orderId)

    if (!order) return notFound('Pedido não encontrado.')

    if (payload.replayOnly) {
      emitOrderUpdated(order)
      return noContent()
    }

    const settled = settleOrder(payload.orderId)

    return jsonOk({ orderId: payload.orderId, status: settled?.status ?? order.status })
  }),
]
