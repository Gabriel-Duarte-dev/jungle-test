import { setupWorker } from 'msw/browser'

import { initDatabase } from './db'
import { resumePendingOrders } from './db/operations/orders'
import { handlers } from './handlers'
import { activateScenario, resolveScenarioId } from './scenarios'

export async function startMockServiceWorker(): Promise<void> {
  const scenarioId = resolveScenarioId()

  activateScenario(scenarioId)
  await initDatabase(scenarioId)

  const worker = setupWorker(...handlers)

  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })

  resumePendingOrders()

  window.__MSW_READY__ = true
}
