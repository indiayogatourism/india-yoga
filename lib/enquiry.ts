interface EnquiryInput {
  name: string; email: string; phone: string; category: string; message: string
  packageSlug: string; destination: string; preferredStartDate: string; preferredEndDate: string; guests: number
}

export function parseEnquiryInput(input: unknown): { data?: EnquiryInput; error?: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Please provide your enquiry details.' }
  const body = input as Record<string, unknown>
  const text = (key: string) => typeof body[key] === 'string' ? body[key].trim() : ''
  const limits: Record<string, number> = { name: 120, email: 254, phone: 40, category: 80, message: 5000, packageSlug: 160, destination: 160, preferredStartDate: 10, preferredEndDate: 10 }
  for (const [key, limit] of Object.entries(limits)) {
    if (body[key] != null && typeof body[key] !== 'string') return { error: 'Please check the enquiry fields and try again.' }
    if (text(key).length > limit) return { error: `${key === 'message' ? 'Your message is' : 'An enquiry field is'} too long. Please shorten it.` }
  }
  if (!text('name') || !text('message')) return { error: 'Your name and message are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email'))) return { error: 'Please enter a valid email address.' }
  const guests = body.guests === undefined ? 1 : body.guests
  if (typeof guests !== 'number' || !Number.isInteger(guests) || guests < 1 || guests > 50) return { error: 'Please enter a guest count between 1 and 50.' }
  const start = text('preferredStartDate'), end = text('preferredEndDate')
  for (const value of [start, end]) {
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) return { error: 'Please enter valid travel dates.' }
  }
  if (start && end && end < start) return { error: 'Departure cannot be before arrival.' }
  if (text('packageSlug') && !/^[a-z0-9-]+$/.test(text('packageSlug'))) return { error: 'Please select a retreat from the list.' }
  return { data: { name: text('name'), email: text('email'), phone: text('phone'), category: text('category') || 'Retreat', message: text('message'), packageSlug: text('packageSlug'), destination: text('destination'), preferredStartDate: start, preferredEndDate: end, guests } }
}
