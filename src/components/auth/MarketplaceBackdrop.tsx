import { Component, type ReactNode } from 'react'

import { HomePage } from '@/pages/HomePage'

export class MarketplaceBackdrop extends Component<object, { error: boolean }> {
  override state = { error: false }

  static getDerivedStateFromError() {
    return { error: true }
  }

  override render(): ReactNode {
    if (this.state.error) return null
    return <HomePage />
  }
}
