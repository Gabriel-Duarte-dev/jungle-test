const MAX_SEEN_EVENTS = 500

export class VersionRegistry {
  private readonly versions = new Map<string, number>()
  private readonly seenEvents = new Set<string>()

  shouldApply(event: { eventId: string; resource: string; resourceId: string; version: number }) {
    if (this.seenEvents.has(event.eventId)) return false

    const key = `${event.resource}:${event.resourceId}`
    const current = this.versions.get(key)

    if (current !== undefined && event.version <= current) {
      this.remember(event.eventId)
      return false
    }

    this.versions.set(key, event.version)
    this.remember(event.eventId)

    return true
  }

  observe(resource: string, resourceId: string, version: number) {
    const key = `${resource}:${resourceId}`
    const current = this.versions.get(key)

    if (current === undefined || version > current) {
      this.versions.set(key, version)
    }
  }

  reset() {
    this.versions.clear()
    this.seenEvents.clear()
  }

  private remember(eventId: string) {
    this.seenEvents.add(eventId)

    if (this.seenEvents.size > MAX_SEEN_EVENTS) {
      const oldest = this.seenEvents.values().next().value
      if (oldest !== undefined) this.seenEvents.delete(oldest)
    }
  }
}
