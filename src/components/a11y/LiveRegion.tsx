import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface LiveRegionValue {
  announce: (message: string) => void
}

const LiveRegionContext = createContext<LiveRegionValue | null>(null)

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')

  const announce = useCallback((next: string) => {
    setMessage('')
    window.requestAnimationFrame(() => setMessage(next))
  }, [])

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </div>
    </LiveRegionContext.Provider>
  )
}

export function useLiveRegion() {
  const value = useContext(LiveRegionContext)

  if (!value) {
    throw new Error('useLiveRegion must be used within LiveRegionProvider')
  }

  return value
}
