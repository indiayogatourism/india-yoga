import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { LiveCatalogList } from '@/components/admin/LiveCatalogList'

export const dynamic = 'force-dynamic'

async function createProgramme(formData: FormData) {
  'use server'
  const title = formData.get('title') as string
  const slug = (formData.get('slug') as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  const shortDescription = formData.get('shortDescription') as string
  const durationDays = parseInt(formData.get('durationDays') as string, 10) || 14
  const durationNights = parseInt(formData.get('durationNights') as string, 10) || 14
  const priceShared = parseFloat(formData.get('priceShared') as string) || 1499
  const inclusionsRaw = formData.get('inclusions') as string
  const inclusions = inclusionsRaw ? inclusionsRaw.split('\n').map((s) => s.trim()).filter(Boolean) : []
  const featuredImage = (formData.get('featuredImage') as string) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh'

  await prisma.package.create({
    data: {
      title,
      slug,
      shortDescription,
      description: shortDescription,
      category: 'PROGRAMME',
      location: 'Rishikesh, Himalayas',
      locationTag: 'Himalayan Retreat',
      durationDays,
      durationNights,
      priceShared,
      pricePrivate: priceShared * 1.5,
      inclusions,
      highlights: inclusions,
      itinerary: [],
      featuredImage,
      status: 'PUBLISHED',
    },
  })

  revalidatePath('/admin/packages')
  revalidatePath('/packages')
}

export default async function AdminPackagesPage() {
  const programmes = await prisma.package.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2E26]">Programmes &amp; Retreats CMS</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage Ayurvedic clinical programs, retreat offerings, and search engine SEO metadata.
          </p>
        </div>
      </div>

      {/* Quick Add Programme Form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#1C2E26]">Add New Programme / Retreat</h2>
        <form action={createProgramme} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Programme Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Panchakarma Clinical Detoxification"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              placeholder="e.g. panchakarma-clinical-detoxification"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Duration (Days)</label>
            <input
              type="number"
              name="durationDays"
              defaultValue={14}
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Starting Price (USD)</label>
            <input
              type="number"
              name="priceShared"
              defaultValue={1499}
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-gray-700">Image URL</label>
            <input
              type="url"
              name="featuredImage"
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-gray-700">Description</label>
            <textarea
              name="shortDescription"
              required
              rows={2}
              placeholder="The ultimate Ayurvedic body purification and cellular recovery program..."
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-gray-700">Inclusions (One per line)</label>
            <textarea
              name="inclusions"
              rows={4}
              placeholder="Personal Ayurveda Physician consultation&#10;Dual therapist Abhyanga massage daily&#10;Tailored Sattvic herbal diet plan"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-[#1C2E26] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition-colors"
            >
              Publish Programme
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Live Catalog Component */}
      <LiveCatalogList initialPackages={programmes} />
    </div>
  )
}

