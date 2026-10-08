export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'https://api.kurio.test',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'ws://api.kurio.test',
  mocksEnabled: import.meta.env.VITE_ENABLE_MOCKS !== 'false',
  defaultScenario: import.meta.env.VITE_DEFAULT_SCENARIO ?? 'default',
  isDev: import.meta.env.DEV,
} as const
