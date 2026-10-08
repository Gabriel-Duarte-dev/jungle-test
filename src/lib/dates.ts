const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(value: string) {
  return DATE_FORMAT.format(new Date(value))
}

export function formatDateTime(value: string) {
  return DATE_TIME_FORMAT.format(new Date(value))
}

export function formatReceiptDate(value: string) {
  const [day, month = '', year = ''] = formatDate(value)
    .replace(/\./g, '')
    .split(/\s+/)
    .filter((part) => part && part !== 'de')
  const abbreviated = month.slice(0, 3)
  const titled = abbreviated.charAt(0).toUpperCase() + abbreviated.slice(1)
  return `${Number(day)} ${titled}, ${year}`
}
