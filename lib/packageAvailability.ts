interface PackageSchedule {
  startDate?: string | null
  endDate?: string | null
  upcomingDates?: readonly string[] | null
  durationDays?: number
}

const DAY_MS = 86_400_000
const indiaDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
})
const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

function calendarDay(year: number, month: number, day: number): number | null {
  const date = new Date(Date.UTC(year, month - 1, day))
  // Reject rollover dates such as 31 February instead of guessing availability.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date.getTime() / DAY_MS
}

function parseDate(value: string): number | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (iso) return calendarDay(Number(iso[1]), Number(iso[2]), Number(iso[3]))

  // Batch dates use the admin editor's format: 01 Oct 2026 - 14 Oct 2026.
  const named = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(value.trim())
  if (!named) return null
  const monthName = named[2].toLowerCase()
  const month = months.findIndex((name) => monthName === name || monthName === name.slice(0, 3)) + 1
  if (!month) return null
  return calendarDay(Number(named[3]), month, Number(named[1]))
}

function lastDayFromStart(start: number, durationDays?: number): number {
  const days = durationDays && Number.isInteger(durationDays) && durationDays > 0 ? durationDays : 1
  return start + days - 1
}

function batchEndDate(batch: string, durationDays?: number): number | null {
  // Require complete dates with years; never rely on Date.parse's locale guesses.
  const dates = batch.trim().split(/\s+(?:to|[-–—])\s+|\s*[–—]\s*/i)
  if (dates.length > 2) return null
  const start = parseDate(dates[0])
  if (start === null) return null
  if (dates.length === 1) return lastDayFromStart(start, durationDays)
  const end = parseDate(dates[1])
  return end !== null && end >= start ? end : null
}

function isAvailableOn(schedule: PackageSchedule, today: number): boolean {
  const startText = schedule.startDate?.trim() || ''
  const endText = schedule.endDate?.trim() || ''
  const batches = (schedule.upcomingDates || []).map((date) => date.trim()).filter(Boolean)

  // Undated listings remain available for year-round / flexible-date enquiries.
  if (!startText && !endText && batches.length === 0) return true

  const start = startText ? parseDate(startText) : null
  const end = endText ? parseDate(endText) : null
  const validPrimary = (!startText || start !== null) && (!endText || end !== null)
  if (validPrimary && (start === null || end === null || end >= start)) {
    const lastDay = end ?? (start !== null ? lastDayFromStart(start, schedule.durationDays) : null)
    if (lastDay !== null && lastDay >= today) return true
  }

  return batches.some((batch) => {
    const end = batchEndDate(batch, schedule.durationDays)
    return end !== null && end >= today
  })
}

/** Keep ongoing/upcoming schedules through their final calendar day in India. */
export function filterAvailablePackages<T extends PackageSchedule>(packages: readonly T[], now = new Date()): T[] {
  const parts = indiaDateFormatter.formatToParts(now)
  const part = (name: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === name)?.value)
  const today = calendarDay(part('year'), part('month'), part('day'))!
  return packages.filter((pkg) => isAvailableOn(pkg, today))
}

/** Only current dates become booking choices; flexible dates are chosen in checkout. */
export function getPackageDateOptions(schedule: PackageSchedule, now = new Date()) {
  const parts = indiaDateFormatter.formatToParts(now)
  const part = (name: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === name)?.value)
  const today = calendarDay(part('year'), part('month'), part('day'))!
  const batches = (schedule.upcomingDates || []).map((date) => date.trim()).filter(Boolean)
  const currentBatches = batches.filter((batch) => {
    const end = batchEndDate(batch, schedule.durationDays)
    return end !== null && end >= today
  })
  const primary = { ...schedule, upcomingDates: [] }
  const hasPrimary = Boolean(schedule.startDate?.trim() || schedule.endDate?.trim())
  const primaryCurrent = hasPrimary && Boolean(schedule.startDate?.trim()) && isAvailableOn(primary, today)
  const primaryLabel = [schedule.startDate?.trim(), schedule.endDate?.trim()].filter(Boolean).join(' to ')
  const dates = [...new Set(currentBatches.length ? currentBatches : primaryCurrent ? [primaryLabel] : [])]
  const flexible = !hasPrimary && batches.length === 0
  const arrivals: Record<string, string> = {}
  for (const label of dates) {
    const first = parseDate(label.split(/\s+(?:to|[-–—])\s+|\s*[–—]\s*/i)[0])
    if (first !== null) arrivals[label] = new Date(first * DAY_MS).toISOString().slice(0, 10)
  }
  return { dates, arrivals, flexible, canBook: flexible || dates.length > 0 }
}
