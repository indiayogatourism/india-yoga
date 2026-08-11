import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function createPage(formData: FormData) {
  'use server'
  const title = formData.get('title') as string
  const slug = (formData.get('slug') as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  const content = formData.get('content') as string
  const metaTitle = formData.get('metaTitle') as string
  const metaDescription = formData.get('metaDescription') as string

  await (prisma as any).page.create({
    data: {
      title,
      slug,
      content,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || title,
      published: true,
    },
  })

  revalidatePath('/admin/pages')
  revalidatePath(`/${slug}`)
}

export default async function AdminPagesPage() {
  const pages = await (prisma as any).page.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1C2E26]">Custom Pages CMS</h1>
        <p className="text-xs text-gray-500 mt-1">Manage static dynamic pages, policies, and landing content.</p>
      </div>

      {/* Quick Add Form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#1C2E26]">Create New Custom Page</h2>
        <form action={createPage} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Page Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Himalayan Sanctuaries Guide"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Page Slug (URL)</label>
            <input
              type="text"
              name="slug"
              placeholder="e.g. himalayan-sanctuaries-guide"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-gray-700">SEO Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              placeholder="Title for Google search..."
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-gray-700">Page Content</label>
            <textarea
              name="content"
              required
              rows={6}
              placeholder="Write page content..."
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-[#1C2E26] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition-colors"
            >
              Save Page
            </button>
          </div>
        </form>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1C2E26]">Active Site Pages ({pages.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {pages.length === 0 ? (
            <p className="p-8 text-center text-xs text-gray-400 italic">No custom pages created yet.</p>
          ) : (
            pages.map((p: any) => (
              <div key={p.id} className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-bold text-[#1C2E26]">{p.title}</h3>
                  <p className="text-xs text-gray-400">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    Active
                  </span>
                  <Link
                    href={`/${p.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-[#1C2E26] hover:underline"
                  >
                    View Page
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
