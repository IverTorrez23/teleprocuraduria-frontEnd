export const formatearFechaHora = (
  value: Date | string | number | Date[] | (Date | null)[] | null | undefined,
  includeTime: boolean = true
): string => {
  if (!value || (Array.isArray(value) && value.length === 0)) return ''

  if (Array.isArray(value)) {
    const firstDate = value.find((v) => v instanceof Date) || null
    if (!firstDate) return ''
    value = firstDate
  }

  const date: Date = value instanceof Date ? value : new Date(value)

  if (isNaN(date.getTime())) {
    return ''
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }

  const datePart: string = date
    .toLocaleDateString('en-GB', dateOptions)
    .split('/')
    .reverse()
    .join('-')

  if (includeTime) {
    const timePart: string = date.toLocaleTimeString('en-GB', timeOptions)
    return `${datePart} ${timePart}`
  }

  return datePart
}
