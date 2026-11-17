export const RETREATS_PATH = '/yoga-retreats-india'
export const TARGET_RETREAT_SLUG = '5-days-yoga-spiritual-retreat-rishikesh-4n-5d'
export const TARGET_RETREAT_PATH = `/packages/${TARGET_RETREAT_SLUG}`
export const TARGET_RETREAT_NAME = '5 Days Yoga & Spiritual Retreat in Rishikesh, India'
export const TARGET_RETREAT_TITLE = '5 Day Yoga & Spiritual Retreat in Rishikesh | IYT'
export const TARGET_RETREAT_DESCRIPTION = 'Explore the 4-night, 5-day yoga and spiritual retreat in Rishikesh. Review the itinerary, accommodation options, current dates and USD pricing before booking.'

export function retreatEnquiryUrl(slug = TARGET_RETREAT_SLUG) {
  return `/contact?retreat=${encodeURIComponent(slug)}`
}

interface RoomPrices {
  enableDormitory?: boolean
  enableShared: boolean
  enablePrivate: boolean
  priceDormitory?: number | null
  priceShared: number
  pricePrivate: number
}

export function getRetreatRooms(pkg: RoomPrices) {
  const rooms: { type: 'dormitory' | 'shared' | 'private'; label: string; price: number }[] = []
  const add = (enabled: boolean | undefined, type: 'dormitory' | 'shared' | 'private', label: string, price?: number | null) => {
    if (enabled && typeof price === 'number' && Number.isFinite(price) && price >= 0) rooms.push({ type, label, price })
  }
  add(pkg.enableDormitory, 'dormitory', 'Dormitory', pkg.priceDormitory)
  add(pkg.enableShared, 'shared', 'Shared room', pkg.priceShared)
  add(pkg.enablePrivate, 'private', 'Private room', pkg.pricePrivate)
  return rooms
}

export function usdPrice(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)
}

export const retreatFaqs = [
  { question: 'Can a beginner join a yoga retreat?', answer: 'Check the difficulty level and daily schedule of the specific retreat. Ask about suitable adaptations, the language of instruction and the balance of yoga, meditation and other activities before choosing.' },
  { question: 'How long should my first retreat be?', answer: 'Compare the actual schedules rather than duration alone. A shorter stay may fit a first visit, while a longer stay gives more time for practice. Include arrival and onward travel time in your plans.' },
  { question: 'What does the retreat price include?', answer: 'Each package has its own inclusions, exclusions and enabled room options. Read those sections and the listed currency; ask the team to clarify anything that is not specified before payment.' },
  { question: 'How do I enquire about the five-day Rishikesh retreat?', answer: 'Open its package page to review the saved dates, price and itinerary. Use the enquiry link or WhatsApp to ask about your travel dates and group, or continue to the existing booking checkout.' },
  { question: 'Who operates the retreat?', answer: 'India Yoga Tourism offers its own services and third-party retreat bookings. Ask who operates your selected program, where it takes place and who teaches it before you confirm.' },
]
