'use client'

import { useState, useEffect } from 'react'

interface GalleryItem {
  id: string
  title: string
  category: string
  url: string
  description?: string
  createdAt: string
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'retreats',
    url: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Initial seed items to offer if DB is empty
  const defaultSeeds = [
    { title: 'Himalayan Sunrise Yoga', category: 'retreats', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsp1ohJUUm13w0goBUZadNiTv4u_MRoXwO2fX6rZiVHoSkkd7vLLPNgriZMi67_cHAerB5rJLczMvqs_yyz26gTCkhc1u6oDVIGQ9_yfcEaFhCleqCq4VoXqeHjrnDYbM2NyMxpz6nNIAkgZuXL96ueCVzSUMhp7RrRAY2WaZp1IzbGH4Fvn79EkCVmwVkT-SrjOYRCvFPWGa8MeOOZEBbu7wrY12x58cNSTI2cTlO6AXCjH-csyKrFZ3Eb7nJ2UNMsWsPXWE20USb', description: 'Early morning prana practice by Ganges' },
    { title: 'Ayurvedic Massage Treatment', category: 'activities', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh', description: 'Traditional Abhyanga detox therapy' },
    { title: 'Sattvic Organic Meal', category: 'food', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWCF3FNkFJLbVzL3jqGHa73fPpDI6Eih62gOI6ascq2xyzfCWb_p_tKmSBHMk1_W6r9aRBFx_DeSTW8t9NmWEihpsnAxgC7sKy77fHdsQFJABetSWSc8tuLwzW4Z9rrHY543Dv8KNCdiwnLZU84GDjA0h2USiT4sfOempqu1qZxhRQoBhJAZQRqnUhIHSmEFeQ72J-oJOOZ2v_GjbWy2G16WBKPTkNmy9iwXeV8c2gWGlZ1K_loofjKke13dNcEj1u2Q0R8eeeqQ3_', description: 'Fresh organic sattvic dish prepared daily' },
    { title: 'Holy Ganges Aarti', category: 'activities', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsp1ohJUUm13w0goBUZadNiTv4u_MRoXwO2fX6rZiVHoSkkd7vLLPNgriZMi67_cHAerB5rJLczMvqs_yyz26gTCkhc1u6oDVIGQ9_yfcEaFhCleqCq4VoXqeHjrnDYbM2NyMxpz6nNIAkgZuXL96ueCVzSUMhp7RrRAY2WaZp1IzbGH4Fvn79EkCVmwVkT-SrjOYRCvFPWGa8MeOOZEBbu7wrY12x58cNSTI2cTlO6AXCjH-csyKrFZ3Eb7nJ2UNMsWsPXWE20USb', description: 'Sacred evening river prayer ceremony' },
    { title: 'Meditation in Forest Garden', category: 'retreats', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk30QEObl2k8oh7fcQBueTF65N9BWmaV3ZkFEx-IwV9X8AbWEGvDjdZsVeKDa6UjgtvTWYRkKdjnkPVJtV_3Nw8OPt-i6-1QwTChz_JIbN5Ajhbnk2Iiaa-OsDxXuHkjd2sEGQZieRNh469JeWf3tdoxY0lRn-r-qpLXngXofLaYSYrEE-fV_ga7ucnNT3Gme80JOeBQYFv0cPjN8Ysq3Nqh-SRqn8Y7DrMXS4hhXKsWN1m3KaUNhvQIohglA5nqLCXdQLDykF_B0o', description: 'Silent dhyana meditation in nature' },
    { title: 'Ayurvedic Herbal Remedies', category: 'food', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGhb-UANOYh1QNZEkGZqKHsOehwvG2xg-wHpSZhbDbT9JXEhuNwdnSM0-DnoEU-RBPKjpsVk8xlkrGyDUrUqrQ2-sU6pLXWHofqkdUJxcJVGd1VxIUV2-FZ_wqIUL04b7h1WvDd18dgAsWc_c48NvJWzmRhRZUZLGuzQLq-S3xL5904yF5OqXhg3IUIKMZwHMGjPK1QeIvd9JvNT6pjuWGtrLdhGf_XR_bylxmku8OoomMj7vVMDvd0kCFba6QpGZG0A_-_8nrGPnA', description: 'Handcrafted herbal wellness infusions' }
  ]

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gallery')
      const data = await res.json()
      if (data.success) {
        setImages(data.images || [])
      }
    } catch (err) {
      console.error('Error loading gallery:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  const handleSeedDefaults = async () => {
    setSubmitting(true)
    try {
      for (const item of defaultSeeds) {
        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
      }
      await fetchGallery()
    } catch (err) {
      console.error('Error seeding defaults:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingImage(null)
    setFormData({
      title: '',
      category: 'retreats',
      url: '',
      description: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (img: GalleryItem) => {
    setEditingImage(img)
    setFormData({
      title: img.title,
      category: img.category || 'retreats',
      url: img.url,
      description: img.description || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.url) return

    setSubmitting(true)
    try {
      if (editingImage) {
        // Edit existing
        const res = await fetch(`/api/gallery/${editingImage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchGallery()
        }
      } else {
        // Create new
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchGallery()
        }
      }
    } catch (err) {
      console.error('Error saving image:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setDeleteConfirmId(null)
        setImages((prev) => prev.filter((img) => img.id !== id))
      }
    } catch (err) {
      console.error('Error deleting photo:', err)
    }
  }

  const filteredImages =
    filterCategory === 'all'
      ? images
      : images.filter((img) => img.category?.toLowerCase() === filterCategory.toLowerCase())

  const counts = {
    all: images.length,
    retreats: images.filter((i) => i.category?.toLowerCase() === 'retreats').length,
    activities: images.filter((i) => i.category?.toLowerCase() === 'activities').length,
    food: images.filter((i) => i.category?.toLowerCase() === 'food').length,
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1C2E26]">Photo Gallery Manager</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage photos, categories, and titles displayed on the public Sanctuary Photo Gallery.
          </p>
        </div>
        <div className="flex gap-3">
          {images.length === 0 && !loading && (
            <button
              onClick={handleSeedDefaults}
              disabled={submitting}
              className="px-4 py-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">auto_fix_high</span>
              Seed Default Photos
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_a_photo</span>
            Add New Photo
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1C2E26]/10 text-[#1C2E26] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">collections</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Total Photos</p>
            <p className="text-2xl font-bold text-[#1C2E26]">{counts.all}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">landscape</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Retreats</p>
            <p className="text-2xl font-bold text-[#1C2E26]">{counts.retreats}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">fitness_center</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Activities</p>
            <p className="text-2xl font-bold text-[#1C2E26]">{counts.activities}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">restaurant</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Food &amp; Dining</p>
            <p className="text-2xl font-bold text-[#1C2E26]">{counts.food}</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-black/5 pb-2">
        {['all', 'retreats', 'activities', 'food'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#1C2E26] text-[#E2C799] shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat} ({cat === 'all' ? counts.all : (counts as any)[cat] || 0})
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
          <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">sync</span>
          <p className="text-sm font-bold text-[#1C2E26]">Loading Photo Gallery...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5 space-y-4 max-w-md mx-auto">
          <span className="material-symbols-outlined text-5xl text-gray-300">photo_library</span>
          <h3 className="text-lg font-bold text-[#1C2E26]">No Gallery Photos Found</h3>
          <p className="text-xs text-gray-500">
            Click "Add New Photo" or "Seed Default Photos" to populate your gallery.
          </p>
          <button
            onClick={handleSeedDefaults}
            disabled={submitting}
            className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors cursor-pointer"
          >
            Seed Default Photos Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuDGhb-UANOYh1QNZEkGZqKHsOehwvG2xg-wHpSZhbDbT9JXEhuNwdnSM0-DnoEU-RBPKjpsVk8xlkrGyDUrUqrQ2-sU6pLXWHofqkdUJxcJVGd1VxIUV2-FZ_wqIUL04b7h1WvDd18dgAsWc_c48NvJWzmRhRZUZLGuzQLq-S3xL5904yF5OqXhg3IUIKMZwHMGjPK1QeIvd9JvNT6pjuWGtrLdhGf_XR_bylxmku8OoomMj7vVMDvd0kCFba6QpGZG0A_-_8nrGPnA'
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-[#1C2E26]/90 backdrop-blur-md text-[#E2C799] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                    {img.category}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-[#1C2E26] text-base leading-snug">{img.title}</h3>
                  {img.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{img.description}</p>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-black/5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">
                  Added {new Date(img.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(img)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-[#1C2E26] hover:text-white flex items-center justify-center transition-colors cursor-pointer text-gray-700"
                    title="Edit Photo"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  {deleteConfirmId === img.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(img.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-red-600"
                      title="Delete Photo"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-black/10">
            <div className="bg-[#1C2E26] text-white p-6 flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#E2C799] flex items-center gap-2">
                <span className="material-symbols-outlined">
                  {editingImage ? 'edit' : 'add_a_photo'}
                </span>
                {editingImage ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Himalayan Sunrise Yoga Practice"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none bg-white"
                >
                  <option value="retreats">Retreats (Locations & Sanctuaries)</option>
                  <option value="activities">Activities (Therapies & Ceremonies)</option>
                  <option value="food">Food (Sattvic Dining & Herbs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
                {formData.url && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative">
                    <img
                      src={formData.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                      }}
                    />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                      Live Preview
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the photo..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
                  {editingImage ? 'Save Changes' : 'Publish Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
