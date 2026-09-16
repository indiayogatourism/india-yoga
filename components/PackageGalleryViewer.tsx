'use client'

import React, { useState } from 'react'

interface PackageGalleryViewerProps {
  featuredImage: string | null
  gallery?: string[]
  title: string
}

export default function PackageGalleryViewer({
  featuredImage,
  gallery = [],
  title,
}: PackageGalleryViewerProps) {
  const defaultMain = featuredImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6P5RumoAovjaxcJxXzx8MtypuRV478k897UkJqQx406a4AZq7-3gEtK2C1RWtcaZW16EuLRW_twBg15rgGUXPviSzeyZdRbUJpWs7ug29FehnvTo6oumLOySd768TTviKJc0MPnaHHR8Y6H2OoPe2Mg19zbsM_xvlxoQyKcZOLsQ9xrhaVpPwlEHUnekmX4rsKtDycSuW919JHTGvrAoRE3saDMZU4slyLM1CPS_vVpnw-jF9QrlYt27zhV7-IJWHbvPH_D4nfTpN'

  // Combine featured image and gallery into unique list
  const allImages = Array.from(new Set([defaultMain, ...gallery].filter(Boolean)))
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || defaultMain)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  return (
    <div className="mb-12 space-y-4">
      {/* Featured Main Display Image */}
      <div 
        onClick={() => openLightbox(allImages.indexOf(selectedImage))}
        className="w-full h-[320px] md:h-[500px] rounded-2xl overflow-hidden bg-surface-variant relative group cursor-pointer border border-outline-variant/20 shadow-sm"
      >
        <img
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={selectedImage}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 bg-white/90 text-primary font-bold text-xs rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">zoom_in</span>
            View Full Screen ({allImages.indexOf(selectedImage) + 1} of {allImages.length})
          </span>
        </div>
      </div>

      {/* Multiple Gallery Thumbnail Bar */}
      {allImages.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Retreat Photo Gallery ({allImages.length} Photos)
            </span>
            <span className="text-[11px] text-on-surface-variant">Click photo to preview</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {allImages.map((imgUrl, idx) => {
              const isSelected = selectedImage === imgUrl
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative shrink-0 w-24 h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-secondary ring-2 ring-secondary/30 scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${title} photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-secondary/10 border border-secondary rounded-lg" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            title="Close"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Previous Photo"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
          </button>

          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={allImages[lightboxIndex]}
              alt={`${title} photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white text-xs font-semibold mt-4">
              {title} — Photo {lightboxIndex + 1} of {allImages.length}
            </p>
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Next Photo"
          >
            <span className="material-symbols-outlined text-2xl">arrow_forward_ios</span>
          </button>
        </div>
      )}
    </div>
  )
}
