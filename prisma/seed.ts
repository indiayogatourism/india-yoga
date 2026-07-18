import { PrismaClient, PackageCategory, PackageStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  await prisma.review.deleteMany({})
  await prisma.booking.deleteMany({})
  await prisma.package.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.enquiry.deleteMany({})
  await prisma.seoMeta.deleteMany({})
  await prisma.setting.deleteMany({})

  console.log('Seeding settings...')
  await prisma.setting.createMany({
    data: [
      { key: 'siteName', value: 'Indian Yoga Tourism' },
      { key: 'siteTagline', value: 'Ancient Wisdom. Modern Journey.' },
      { key: 'contactPhone', value: '+91 99998 76349' },
      { key: 'contactEmail', value: 'info@indianyogatourism.com' },
      { key: 'contactWhatsapp', value: '+91 99998 76349' },
      { key: 'contactAddress', value: 'Cloud 9 Tower, Vaishali Sec-1, Ghaziabad, UP 201010' },
      { key: 'instagramUrl', value: 'https://instagram.com/indianyogatourism' },
      { key: 'facebookUrl', value: 'https://facebook.com/indianyogatourism' },
      { key: 'youtubeUrl', value: 'https://youtube.com/indianyogatourism' },
      { key: 'twitterUrl', value: 'https://twitter.com/indianyogatourism' },
    ]
  })

  console.log('Seeding SEO Meta...')
  await prisma.seoMeta.createMany({
    data: [
      {
        pageKey: 'home',
        title: 'Indian Yoga Tourism - Find Your Inner Peace in the Himalayas',
        description: 'Elevating the spiritual journey with authentic, high-end experiences across India\'s most sacred destinations. Yoga, Meditation, and Ayurveda in Rishikesh and beyond.',
        keywords: 'yoga, tourism, india, himalayas, rishikesh, meditation, ayurveda, retreat',
        ogImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh'
      },
      {
        pageKey: 'packages',
        title: 'Our Packages - Premium Yoga & Meditation Retreats | Indian Yoga Tourism',
        description: 'Discover transformative journeys curated to restore balance, deepen your practice, and reconnect you with nature in the heart of the Himalayas.',
        keywords: 'yoga packages, retreats booking, rishikesh retreat, himalayan yoga',
        ogImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIFA6hknquQPohifChXu_cQ63MM264jx5ZJaji4EqSJimKAiI2UTy-fXnigoCyl0LO2AtqvL-iFAD6lDgujcAgTGaN3KJ97hMds5bufumdDA3qCkl2omLQTke0vGWvWv0rPXOALro0Ddz1v58CFzvNxWEj76buYsv2fwXpcDbCj12thTTljBR9GM99ax6Gboe__vJCELNZfpSg6q-TFoQDu3g8jxZzg32SlECMJ7rzsOP-qrRypCs-dPLzfmENOPsrysiiZ8k4tKU7'
      },
      {
        pageKey: 'programmes',
        title: 'Wellness Programmes - Ayurvedic Healing & Detox | Indian Yoga Tourism',
        description: 'Immerse in holistic clinical wellness programmes focusing on chronic pain management, ayurvedic detox, and mental balance under expert care.',
        keywords: 'ayurveda, detox, clinical wellness, pain management, hormonal balance',
        ogImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACbK16cIbE1HnZhwzRdYZd3DaCUYzNasG8Bm0wMbeeSmdF8pAzvVRmWV0GDQTmSLhYIrG4uXxtx4DtfFOIhV0YdbQQfixpRRRf2iCVSm_WFuDTLhQ7cDrDKK0G2eFjJ_KXV8fWuYL3wuNcy865XWfB5tKvzSqUDWJ69b6UmBiU_Zu9CAjm-22SDFPU8RV1YBE7chA3Q3G2cebkitsQWte5moyWhsg_YGsZQTY3VOjSqCu-YgmtAGDo6R5Sia3MMNn9FVkTjrfu3pqQ'
      },
      {
        pageKey: 'online-classes',
        title: 'Online Yoga & Meditation Classes | Indian Yoga Tourism',
        description: 'Access live and recorded traditional yoga sessions, pranayama, and meditation directly from authentic Himalayan teachers from your home.',
        keywords: 'online yoga, live yoga classes, learn pranayama, virtual meditation',
        ogImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALRKKBd3hI3Mx8pTO4xnsPUXk0DZDRUoXUV1ZFdomGpPfqlktRRKHv1CmsMxM_fuxFCLI76rfJDl-JMjZMg_xTSLsls_ZOYAh-S3MM6NvbvRL_i8yrzUwnyi4of_DUqysdrI0nnWHxG7kmLyNhe-YkAKQCPbIcGjkXPywGJqOV_X2pBLzPk8XveeiG_YZq0i4ocWI45E0kNwWXYTr1F6IrdgP-5zenHyhwo-wAY2VaxJsP4ozkUJpTN8lmOa1P2lBfHtE_appZi1ZT'
      },
      {
        pageKey: 'about',
        title: 'About Us - Our Mission & Lineage | Indian Yoga Tourism',
        description: 'Learn about the legacy of Indian Yoga Tourism, our dedication to preserving ancient yogic traditions, and our curated luxury sanctuaries.',
        keywords: 'about indian yoga, yoga lineage, authentic gurus, spiritual travel'
      },
      {
        pageKey: 'gallery',
        title: 'Photo & Video Gallery - Himalayan Serenity | Indian Yoga Tourism',
        description: 'Explore the visual beauty of our retreat centers, sacred locations, and the peaceful environment of the Himalayas.',
        keywords: 'yoga gallery, retreats photos, rishikesh gallery, yoga videos'
      },
      {
        pageKey: 'contact',
        title: 'Contact Us - Plan Your Spiritual Journey | Indian Yoga Tourism',
        description: 'Connect with our journey planners to customize your yoga retreat, enquire about wellness programmes, or ask general questions.',
        keywords: 'contact yoga retreat, enquire rishikesh, booking help'
      }
    ]
  })

  console.log('Seeding Packages (Retreats & Programmes)...')

  const retreatsData = [
    {
      title: "3-Day Rishikesh Spiritual Retreat",
      slug: "3-day-rishikesh-spiritual-retreat",
      shortDescription: "A gentle introduction to spiritual life. Morning hatha flows, ganga aarti, and traditional sattvic guidance.",
      description: "Step away from the fast pace of modern life and experience a profound, grounding weekend in Rishikesh. This short retreat is perfect for busy individuals seeking a spiritual reset. Nestled close to the banks of the sacred Ganges river, you will engage in daily mindful movements, yogic breathwork, and deep meditation under the guidance of traditional teachers. Enjoy nutrient-rich organic vegetarian meals and sleep in clean, beautiful surroundings designed to foster peace and clarity.",
      category: PackageCategory.RETREAT,
      location: "Rishikesh, Uttarakhand",
      locationTag: "Rishikesh",
      durationDays: 3,
      durationNights: 2,
      maxGroupSize: 12,
      difficultyLevel: "Beginner",
      priceShared: 399,
      pricePrivate: 499,
      highlights: ["Ganga Aarti Ceremony", "Introduction to Pranayama", "Daily Sattvic Meals", "Himalayan Sunrise Walk"],
      inclusions: ["Shared/Private Luxury Accommodation", "All organic vegetarian meals", "Ganga Aarti guided tour", "Daily Hatha Yoga & Meditation"],
      exclusions: ["Airport transfers (available on request)", "Personal spa treatments", "Airfare/train tickets"],
      itinerary: [
        { day: 1, title: "Arrival & Grounding Ceremony", activities: ["Welcome drink and room allocation", "Orientation session with master teacher", "Evening meditation & soft stretching", "Welcome dinner"] },
        { day: 2, title: "Deep Practice & Sacred Waters", activities: ["Sunrise meditation on Ganges beach", "Morning Hatha Yoga flow", "Ayurvedic breakfast", "Afternoon lecture on Yogic Philosophy", "Ganga Aarti evening tour", "Sattvic dinner"] },
        { day: 3, title: "Gratitude & Departure", activities: ["Pranayama & Meditation session", "Closing circle and reflection", "Farewell lunch", "Check-out"] }
      ],
      featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGhb-UANOYh1QNZEkGZqKHsOehwvG2xg-wHpSZhbDbT9JXEhuNwdnSM0-DnoEU-RBPKjpsVk8xlkrGyDUrUqrQ2-sU6pLXWHofqkdUJxcJVGd1VxIUV2-FZ_wqIUL04b7h1WvDd18dgAsWc_c48NvJWzmRhRZUZLGuzQLq-S3xL5904yF5OqXhg3IUIKMZwHMGjPK1QeIvd9JvNT6pjuWGtrLdhGf_XR_bylxmku8OoomMj7vVMDvd0kCFba6QpGZG0A_-_8nrGPnA",
      gallery: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAdNs6cEK1gKXHrTKYM33up1K0D_St99ssbXKhaA9df5rvoNe0cpa7fIbz8tReil8ne-yOqtEa2w5xin9Ce9Tgu3UEk9VknxRuiirbAByT2EnWdAp3yEWUBYWob2xJZoOXZd94tXrdueqYlkpmhVMOWk3y9w8hGk5jnGMU7g5y01ngGZGRns74Uxfbr1VSdwnGSQNd9ZF8viQ8tflHgqixaVM-e4yfZkvENQ3bQmzTtZJXT4BvlLvB_UpaB__4KqlvWAZJsouHGvl6y",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDMG5pMrGSsfyvxIic-jtTdb42azn--6JNlZyQdO7lk5cPHYfA6uFtdvYSyMr3WhRqBHNA5b1Qaz7w1owiasPXLQZ9IC-WnD2pjyoMoJwWWvIG6374En2mMMXlzOJulnxmEUzfvyQ1Mnb7bkkMZYagbegmmhZzGIf2VNTP04MpTp6h8lXa3eAmYT7LONcEak8iBo63yiVvEdjo8mZ9IqXkDpCtLalXt0b-afWvoUmlAcJyRQGzJOoTnoiKQF25VyYK3SbuQDF7a74WH"
      ],
      isBestseller: true,
      status: PackageStatus.PUBLISHED,
      avgRating: 4.8,
      totalReviews: 24
    },
    {
      title: "4-Day Yoga & River Retreat",
      slug: "4-day-yoga-river-retreat",
      shortDescription: "A rejuvenating escape pairing classical yoga with outdoor mindfulness near the pristine Ganges riversides.",
      description: "Immerse yourself in a luxurious riverside sanctuary. This 4-day experience focuses on expanding your breath capacity and releasing stress through restorative flows, mindful river walks, and personalized wellness consultations. The proximity to flowing water acts as a natural sound therapy, helping to quiet the mind instantly.",
      category: PackageCategory.RETREAT,
      location: "Rishikesh, Uttarakhand",
      locationTag: "Rishikesh",
      durationDays: 4,
      durationNights: 3,
      maxGroupSize: 10,
      difficultyLevel: "Beginner",
      priceShared: 429,
      pricePrivate: 549,
      highlights: ["Riverside Meditation", "Restorative Yoga Flows", "Dosha Consultation", "Sound Healing Workshop"],
      inclusions: ["Luxury private/shared rooms", "All meals (sattvic & organic)", "1x Sound healing session", "1x Ayurvedic consultation"],
      exclusions: ["Off-site excursions", "Alcohol (not allowed on site)", "Gratuities"],
      itinerary: [
        { day: 1, title: "Arrival & Cleansing", activities: ["Check-in and orientation", "Evening pranayama by the river", "Nourishing dinner"] },
        { day: 2, title: "Restorative Alignment", activities: ["Morning gentle Vinyasa Flow", "Ayurvedic breakfast", "Afternoon Dosha consultation", "Evening yin yoga & chanting"] },
        { day: 3, title: "River Soundscapes", activities: ["Silent beach meditation", "Dynamic breathwork session", "Afternoon sound healing", "Ganga bonfire & group sharing"] },
        { day: 4, title: "Departure", activities: ["Sunrise meditation", "Closing session", "Brunch & Departure"] }
      ],
      featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6P5RumoAovjaxcJxXzx8MtypuRV478k897UkJqQx406a4AZq7-3gEtK2C1RWtcaZW16EuLRW_twBg15rgGUXPviSzeyZdRbUJpWs7ug29FehnvTo6oumLOySd768TTviKJc0MPnaHHR8Y6H2OoPe2Mg19zbsM_xvlxoQyKcZOLsQ9xrhaVpPwlEHUnekmX4rsKtDycSuW919JHTGvrAoRE3saDMZU4slyLM1CPS_vVpnw-jF9QrlYt27zhV7-IJWHbvPH_D4nfTpN",
      gallery: [],
      isBestseller: false,
      status: PackageStatus.PUBLISHED,
      avgRating: 4.9,
      totalReviews: 18
    },
    {
      title: "7-Day Immersive Ashram Experience",
      slug: "7-day-immersive-ashram-experience",
      shortDescription: "Experience authentic monastic lifestyle combined with modern comfort in the scenic hills of Auli.",
      description: "Live like a yogi without sacrificing comfort. Our Auli sanctuary is perched high in the pine-scented hills, offering a perfect setting for deep reflection. Your days will start at 5:30 AM with silent meditation, followed by intense physical practice, deep breathing, and philosophy studies. A perfect immersion into traditional ashram life.",
      category: PackageCategory.RETREAT,
      location: "Auli, Uttarakhand",
      locationTag: "Auli",
      durationDays: 7,
      durationNights: 6,
      maxGroupSize: 12,
      difficultyLevel: "Intermediate",
      priceShared: 649,
      pricePrivate: 849,
      highlights: ["Silent Meditation (Mauna)", "Intense Pranayama", "Vedic Philosophy", "Stunning Mountain Views"],
      inclusions: ["Sanctuary accommodation with heating", "Simple organic sattvic meals", "Lineage-based teachings", "Himalayan nature walks"],
      exclusions: ["Warm mountain gear rentals", "Travel insurance", "Private transfers"],
      itinerary: [
        { day: 1, title: "Vessel Alignment", activities: ["Check-in", "Orientation and ashram rules", "Evening introductory chant & dinner"] },
        { day: 2, title: "Purification Basics", activities: ["Shatkarma (cleansing techniques) intro", "Morning Hatha Yoga", "Philosophy of Patanjali Yoga Sutras", "Pranayama"] },
        { day: 3, title: "Monastic Daily Cycle", activities: ["5:30 AM Silent meditation", "Classical Hatha sequence", "Organic meals", "Seva (mindful work)", "Sunset chanting"] },
        { day: 4, title: "Silent Integration", activities: ["Day of silence (Mauna)", "Slow walking meditation in pine forests", "Restorative evening class"] },
        { day: 5, title: "Vedic Philosophy", activities: ["Philosophy lecture", "Advanced breathing structures", "Sound resonance practice"] },
        { day: 6, title: "Celebration & Fire Puja", activities: ["Havan fire ceremony for release", "Group singing (Kirtan)", "Festive organic meal"] },
        { day: 7, title: "Monk to World", activities: ["Final class: bringing peace home", "Closing ceremony", "Departure after lunch"] }
      ],
      featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIFA6hknquQPohifChXu_cQ63MM264jx5ZJaji4EqSJimKAiI2UTy-fXnigoCyl0LO2AtqvL-iFAD6lDgujcAgTGaN3KJ97hMds5bufumdDA3qCkl2omLQTke0vGWvWv0rPXOALro0Ddz1v58CFzvNxWEj76buYsv2fwXpcDbCj12thTTljBR9GM99ax6Gboe__vJCELNZfpSg6q-TFoQDu3g8jxZzg32SlECMJ7rzsOP-qrRypCs-dPLzfmENOPsrysiiZ8k4tKU7",
      gallery: [],
      isLimitedSpots: true,
      spotsLeft: 3,
      status: PackageStatus.PUBLISHED,
      avgRating: 4.7,
      totalReviews: 32
    },
    {
      title: "10-Day Himalayan Wellness Retreat",
      slug: "10-day-himalayan-wellness-retreat",
      shortDescription: "A deep dive into holistic physical restoration, breath mastery, and mental quietude in Chopta.",
      description: "Located in Chopta, known as the Switzerland of India, this retreat places you in a stunning high-altitude environment. Perfect for deepening your practice, this 10-day experience integrates core yoga, advanced pranayama, and custom herbal steam baths to completely detoxify your cellular structure.",
      category: PackageCategory.RETREAT,
      location: "Chopta, Uttarakhand",
      locationTag: "Chopta",
      durationDays: 10,
      durationNights: 9,
      maxGroupSize: 12,
      difficultyLevel: "Intermediate",
      priceShared: 649,
      pricePrivate: 849,
      originalPrice: 799,
      highlights: ["High Altitude Pranayama", "Steam & Herb Detoxification", "Sattvic Nutrition Course", "Guided Alpine Forest Walks"],
      inclusions: ["Sanctuary cottage stay", "Personalized nutrition plan", "All meals and teas", "Local herbal bath treatments"],
      exclusions: ["Airport pickup (available from Dehradun)", "Personal medical treatments"],
      itinerary: [
        { day: 1, title: "Mountain Arrival", activities: ["Acclimatization, orientation", "Sunset restorative stretch", "Dinner"] },
        { day: 2, title: "High Altitude Breathing", activities: ["Deep lung cleansing techniques", "Pranayama sessions", "Organic breakfast & dinner"] },
        { day: 3, title: "Spinal Flow", activities: ["Hatha alignment flow", "Spinal decompression exercises", "Evening fire ceremony"] },
        { day: 4, title: "Herbal Rejuvenation", activities: ["Ayurvedic herbal steam bath", "Gentle massage", "Restorative Yoga Nidra"] },
        { day: 5, title: "Alpine Silence", activities: ["Silent walk through rhododendron forests", "Nature meditation", "Sattvic dining"] },
        { day: 6, title: "Advanced Asana", activities: ["Core strengthening sequences", "Philosophy discussion", "Yin class"] },
        { day: 7, title: "Energy Cleanse", activities: ["Chakra cleansing meditation", "Pranayama in high cliffs", "Group kirtan"] },
        { day: 8, title: "Self Mastery", activities: ["Design your home practice blueprint", "Advanced breathing patterns"] },
        { day: 9, title: "Celebration", activities: ["Gala sattvic dinner", "Gratitude fireplace session"] },
        { day: 10, title: "Departure", activities: ["Final blessings", "Breakfast and departure"] }
      ],
      featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdoxOmcOBTxXsR59_WIChZtoMICzaLlgummzBmBu3Gis_pc7ku4raqnutDCACNvxk2dIaGMz-VGzjIbaYedKd_tDkdeHAdbD_EACUq6fuWEeQadbvZTfn7N5TFZI4I9gHRJhsnrQvllX2i0NHQq_8Vgq0RVZFGgXTf2CvhevLlBV3-oaxDgblKgeEpoWWWNM8hR_UJRWCJXU9FlyYF4E0_7sklLZNMGapBYj0is7mYv2mKAEYcsbZzU5T9_gxDq1Sge5hgY8X2CPI7",
      gallery: [],
      isBestseller: false,
      status: PackageStatus.PUBLISHED,
      avgRating: 4.95,
      totalReviews: 12
    },
    {
      title: "22-Day Uttarakhand Grand Circuit",
      slug: "22-day-uttarakhand-grand-circuit",
      shortDescription: "The ultimate spiritual pilgrimage crossing Rishikesh, Haridwar, Almora, and Mukteshwar.",
      description: "This 22-day grand journey is the absolute pinnacle of spiritual travel in India. You will transition across four sacred locations, studying different lineages of yoga, receiving private energy alignments, and witnessing ancient rituals that have remained unchanged for millennia. Designed for dedicated practitioners seeking absolute transformation.",
      category: PackageCategory.RETREAT,
      location: "Multiple Locations, Uttarakhand",
      locationTag: "Multiple",
      durationDays: 22,
      durationNights: 21,
      maxGroupSize: 8,
      difficultyLevel: "Advanced",
      priceShared: 999,
      pricePrivate: 1299,
      highlights: ["Four Sacred Cities Tour", "Studying under 3 lineage gurus", "Full Ayurvedic body detox", "Ganga source tour option"],
      inclusions: ["All transfers between locations", "Premium luxury accommodation", "Fully organic customized meals", "All temple entry & pujas"],
      exclusions: ["International flights", "Personal shopping", "Tips for staff"],
      itinerary: [
        { day: 1, title: "Rishikesh Arrival", activities: ["Arrive at flagship sanctuary", "Grounding massage & welcome circle"] },
        { day: 2, title: "Foundational Rest", activities: ["Pranayama basics", "Gentle Hatha flow", "Evening Ganga Aarti"] },
        { day: 7, title: "Transition to Haridwar", activities: ["Travel to Haridwar", "Ashram entry rituals", "Evening sacred fire puja"] },
        { day: 14, title: "Journey to Almora", activities: ["Mountain ride to scenic Almora", "Altitude adjustment, quiet forest yoga"] },
        { day: 21, title: "Final Integration", activities: ["Deep meditation at Mukteshwar cliffs", "Closing gala and Vedic ceremony"] },
        { day: 22, title: "Blessings & Departure", activities: ["Final master blessings", "Departure to Dehradun airport"] }
      ],
      featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnFD_N4exiTaPH8FA7d0rFovec6M9H0yvK6dxlWE4e9WRcUkKu6Imoh0HTwEWfspvn51d4wTWmQmjOBvMlx-CUkUCvQbpMdIamtyVqWulspFGLxE7Jbbh4PhgMmiijQE-07uLICYJC1CWmXcgqDxFQ0mmRzOLkLAa0-A-FbDWGiYPer4_y8jeMvBkLA2x_kFjQ_K0Sj3_HH6ENySlwXA425nkFkNA3ipVGTLnkrCanL1oTQmHm4bkd5JbQpyJzqm1oA-qHzID9okD8",
      gallery: [],
      isRecommended: true,
      status: PackageStatus.PUBLISHED,
      avgRating: 5.0,
      totalReviews: 45
    }
  ]

  const programmesData = [
    { title: "Chronic Pain Management", priceShared: 449, pricePrivate: 549, durationDays: 10, durationNights: 9, location: "Rishikesh, Uttarakhand" },
    { title: "Mind Body Balance", priceShared: 399, pricePrivate: 499, durationDays: 7, durationNights: 6, location: "Haridwar, Uttarakhand" },
    { title: "Natural Weight Balance", priceShared: 499, pricePrivate: 599, durationDays: 14, durationNights: 13, location: "Manali, Himachal Pradesh" },
    { title: "Swapna Sleep Disorder", priceShared: 399, pricePrivate: 499, durationDays: 7, durationNights: 6, location: "Almora, Uttarakhand" },
    { title: "Women's Hormonal Re-Balance", priceShared: 549, pricePrivate: 679, durationDays: 10, durationNights: 9, location: "Mukteshwar, Uttarakhand" },
    { title: "IND Ayurveda Wellness Retreat", priceShared: 699, pricePrivate: 849, durationDays: 10, durationNights: 9, location: "Rishikesh, Uttarakhand", isBestseller: true },
    { title: "Gut Cleanse Ayurvedic Program", priceShared: 449, pricePrivate: 549, durationDays: 7, durationNights: 6, location: "Haridwar, Uttarakhand", isNew: true },
    { title: "Detox & Rejuvenation", priceShared: 549, pricePrivate: 679, durationDays: 10, durationNights: 9, location: "Manali, Himachal Pradesh" },
    { title: "Heart Harmony Program", priceShared: 449, pricePrivate: 549, durationDays: 7, durationNights: 6, location: "Almora, Uttarakhand" },
    { title: "Spinal Rejuvenation Program", priceShared: 499, pricePrivate: 599, durationDays: 12, durationNights: 11, location: "Mukteshwar, Uttarakhand" }
  ]

  // Create Retreats
  for (const retreat of retreatsData) {
    await prisma.package.create({
      data: retreat
    })
  }

  // Create Programmes
  for (const prog of programmesData) {
    const slug = prog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await prisma.package.create({
      data: {
        title: prog.title,
        slug,
        shortDescription: `A specialized ${prog.durationDays}-day clinical wellness programme focused on ${prog.title.toLowerCase()} through customized therapies.`,
        description: `This clinical wellness programme is designed specifically for individuals looking to address ${prog.title.toLowerCase()}. Under the guidance of our resident Ayurvedic doctors and yoga specialists, you will undergo daily targeted therapies, specialized diets, and corrective gentle movements. Ideal for deep physical rehabilitation.`,
        category: PackageCategory.PROGRAMME,
        location: prog.location,
        locationTag: prog.location.split(',')[0],
        durationDays: prog.durationDays,
        durationNights: prog.durationNights,
        priceShared: prog.priceShared,
        pricePrivate: prog.pricePrivate,
        highlights: ["Personalized Ayurvedic therapies", "Daily Doctor consultation", "Targeted corrective exercises", "Custom diet plan"],
        inclusions: ["Accommodation", "Specialized custom meals", "All prescribed therapies", "Consultation fees"],
        exclusions: ["Medicines to take home", "Additional diagnostics", "Personal tips"],
        itinerary: [
          { day: 1, title: "Diagnostic Assessment", activities: ["Doctor consultation & pulse reading", "Custom plan setup", "Targeted evening therapy"] },
          { day: 2, title: "Core Therapy Phase", activities: ["Morning target exercises", "Specific Ayurvedic therapy", "Progress review"] }
        ],
        featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuACbK16cIbE1HnZhwzRdYZd3DaCUYzNasG8Bm0wMbeeSmdF8pAzvVRmWV0GDQTmSLhYIrG4uXxtx4DtfFOIhV0YdbQQfixpRRRf2iCVSm_WFuDTLhQ7cDrDKK0G2eFjJ_KXV8fWuYL3wuNcy865XWfB5tKvzSqUDWJ69b6UmBiU_Zu9CAjm-22SDFPU8RV1YBE7chA3Q3G2cebkitsQWte5moyWhsg_YGsZQTY3VOjSqCu-YgmtAGDo6R5Sia3MMNn9FVkTjrfu3pqQ",
        gallery: [],
        isBestseller: prog.isBestseller || false,
        isNew: prog.isNew || false,
        status: PackageStatus.PUBLISHED,
        avgRating: 4.8,
        totalReviews: 15
      }
    })
  }

  console.log('Seeding Testimonials...')
  // Create a placeholder user to associate reviews with
  const seedUser = await prisma.user.create({
    data: {
      clerkId: "user_seed_test_123",
      email: "guest@indianyogatourism.com",
      name: "John Doe",
      role: "guest"
    }
  })

  // We can add some reviews for packages
  const packages = await prisma.package.findMany()
  for (const pkg of packages) {
    await prisma.review.create({
      data: {
        userId: seedUser.id,
        packageId: pkg.id,
        rating: 5,
        title: "Life changing experience",
        content: `My time at the ${pkg.title} was absolutely transformative. The instructors are master teachers with decades of experience, and the location is stunning. Highly recommended!`,
        country: "United States",
        isVerified: true,
        isPublished: true
      }
    })
  }

  console.log('Seeding Completed successfully! 🙏')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
