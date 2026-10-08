import { env } from '@/lib/env'

export function api(path: string): string {
  return `${env.apiUrl}${path}`
}
