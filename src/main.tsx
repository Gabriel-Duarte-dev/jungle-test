import { env } from './lib/env'
import './styles/globals.css'

async function bootstrap() {
  if (env.mocksEnabled) {
    const { startMockServiceWorker } = await import('./mocks/browser')
    await startMockServiceWorker()
  }

  await import('./app')
}

void bootstrap()
