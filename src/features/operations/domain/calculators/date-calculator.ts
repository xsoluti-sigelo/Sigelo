export function createUTCDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

export function formatUTCDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(dateStr: string, days: number): string {
  const date = createUTCDate(dateStr)
  date.setUTCDate(date.getUTCDate() + days)
  return formatUTCDate(date)
}

export function subtractDays(dateStr: string, days: number): string {
  return addDays(dateStr, -days)
}

export function addHours(time: string, hours: number): { time: string; dayOffset: number } {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + hours * 60

  const dayOffset = Math.floor(totalMinutes / (24 * 60))
  let remainingMinutes = totalMinutes % (24 * 60)

  if (remainingMinutes < 0) remainingMinutes += 24 * 60

  const newHours = Math.floor(remainingMinutes / 60)
  const newMinutes = remainingMinutes % 60

  return {
    time: `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`,
    dayOffset,
  }
}

export function subtractHours(time: string, hours: number): { time: string; dayOffset: number } {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m - hours * 60

  const dayOffset = Math.floor(totalMinutes / (24 * 60))
  let remainingMinutes = totalMinutes % (24 * 60)

  if (remainingMinutes < 0) remainingMinutes += 24 * 60

  const newHours = Math.floor(remainingMinutes / 60)
  const newMinutes = remainingMinutes % 60

  return {
    time: `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`,
    dayOffset,
  }
}

export function parseDateTimeField(value: string | null): { date: string; time: string } | null {
  if (!value) return null

  try {
    const dt = new Date(value)
    if (isNaN(dt.getTime())) return null

    const date = dt.toISOString().split('T')[0]
    const time = dt.toTimeString().slice(0, 5)

    return { date, time }
  } catch {
    return null
  }
}

export function compareTimeStrings(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number)
  const [h2, m2] = time2.split(':').map(Number)
  const minutes1 = h1 * 60 + m1
  const minutes2 = h2 * 60 + m2
  return minutes1 - minutes2
}

export function isTimeBefore(time1: string, time2: string): boolean {
  return compareTimeStrings(time1, time2) < 0
}

export function isTimeAfter(time1: string, time2: string): boolean {
  return compareTimeStrings(time1, time2) > 0
}
