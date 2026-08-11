import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function createBlog(formData: FormData) {
  'use server'
  const title = formData.get('title') as string
  const slug = (formData.get('slug') as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const category = (formData.get('category') as string) || 'Ayurveda & Wellness'
  const coverImage = (formData.get('coverImage') as string) || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'

  await (prisma as any).blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      coverImage,
      published: true,
    },
  })

  revalidatePath('/admin/blogs')
  revalidatePath('/blog')
}

export default async function AdminBlogsPage() {
  const blogs = await (prisma as any).blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2E26]">Blog Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage articles and stories published on the platform.</p>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#1C2E26]">Create New Blog Post</h2>
        <form action={createBlog} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. 10 Benefits of Daily Panchakarma Therapy"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              placeholder="e.g. benefits-panchakarma-therapy"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              defaultValue="Ayurveda & Wellness"
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Cover Image URL</label>
            <input
              type="url"
              name="coverImage"
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-gray-700">Short Excerpt</label>
            <textarea
              name="excerpt"
              required
              rows={2}
              placeholder="Brief summary for list previews..."
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-gray-700">Full Content</label>
            <textarea
              name="content"
              required
              rows={5}
              placeholder="Write main article content..."
              className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
            />
          </div>
          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-[#1C2E26] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition-colors"
            >
              Publish Article
            </button>
          </div>
        </form>
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1C2E26]">Published Articles ({blogs.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {blogs.length === 0 ? (
            <p className="p-8 text-center text-xs text-gray-400 italic">No blog posts created yet.</p>
          ) : (
            blogs.map((b: any) => (
              <div key={b.id} className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                <div className="space-y-1 max-w-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2C799] bg-[#1C2E26] px-2 py-0.5 rounded">
                    {b.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#1C2E26]">{b.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{b.excerpt}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    Published
                  </span>
                  <Link
                    href={`/blog/${b.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-[#1C2E26] hover:underline"
                  >
                    View
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
