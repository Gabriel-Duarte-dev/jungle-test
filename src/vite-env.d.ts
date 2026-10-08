/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_ENABLE_MOCKS: string
  readonly VITE_DEFAULT_SCENARIO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __MSW_READY__?: boolean
  __KURIO_SOCKET_CONNECTED__?: boolean
}
