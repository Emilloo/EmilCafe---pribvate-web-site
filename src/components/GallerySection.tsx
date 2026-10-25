import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { GALLERY_PHOTOS, GalleryPhoto } from '../data/cafeData';

export const GallerySection: React.FC = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const activePhoto: GalleryPhoto | null =
    selectedPhotoIndex !== null ? GALLERY_PHOTOS[selectedPhotoIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev !== null ? (prev + 1) % GALLERY_PHOTOS.length : 0
    );
  }, [selectedPhotoIndex]);

  const handlePrev = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev !== null ? (prev - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length : 0
    );
  }, [selectedPhotoIndex]);

  const handleClose = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handleClose, handleNext, handlePrev]);

  return (
    <section
      id="gallery"
      aria-label="EmilCafe foto qalereyası"
      className="py-24 bg-[#0E0E0E] relative border-y border-[#212121]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#C5A059] tracking-[0.25em] uppercase block mb-3">
            ATMOSFER VƏ ESTETİKA
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4">
            EmilCafe <span className="italic text-[#E0C078]">Qalereyası</span>
          </h2>
          <p className="text-[#9E9E9E] text-sm sm:text-base">
            Hər kadrda xüsusi qəhvə qoxusu, zövqlü dizayn və unikal detallar.
          </p>
        </div>

        {/* Sophisticated Varied Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GALLERY_PHOTOS.map((photo, idx) => {
            const isTall = idx === 0 || idx === 3;
            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`group relative rounded-xl overflow-hidden bg-[#161616] border border-[#262626] cursor-pointer transition-all duration-300 hover:border-[#C5A059]/50 hover:shadow-xl hover:shadow-black/70 ${
                  isTall ? 'sm:row-span-2 min-h-[340px] sm:min-h-[460px]' : 'min-h-[220px]'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPhotoIndex(idx);
                  }
                }}
                aria-label={`${photo.title} fotosunu böyüt`}
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-[0.82] contrast-[1.05] group-hover:scale-105 group-hover:brightness-95 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Ambient Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Floating Category & Expand Indicator */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0B0B0B]/70 backdrop-blur-sm border border-[#333333] flex items-center justify-center text-[#C0C0C0] group-hover:text-[#E0C078] group-hover:border-[#C5A059]/60 transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-semibold tracking-wider text-[#C5A059] uppercase block mb-1">
                    {photo.category}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-[#E0C078] transition-colors leading-snug">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-[#9E9E9E] line-clamp-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {photo.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Qalereya şəklinə baxış"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-[#1A1A1A]/90 hover:bg-[#2A2A2A] text-white flex items-center justify-center border border-[#3A3A3A] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            aria-label="Qalereyanı bağla"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1A1A1A]/80 hover:bg-[#2A2A2A] text-white flex items-center justify-center border border-[#3A3A3A] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            aria-label="Əvvəlki şəkil"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1A1A1A]/80 hover:bg-[#2A2A2A] text-white flex items-center justify-center border border-[#3A3A3A] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            aria-label="Növbəti şəkil"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Content Container */}
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <div className="relative overflow-hidden rounded-xl border border-[#333333] shadow-2xl max-h-[70vh]">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="w-auto h-auto max-h-[70vh] object-contain"
              />
            </div>

            {/* Caption & Counter */}
            <div className="mt-4 text-center max-w-xl">
              <div className="flex items-center justify-center gap-2 text-xs text-[#C5A059] mb-1">
                <span>{activePhoto.category}</span>
                <span>·</span>
                <span className="font-mono">{selectedPhotoIndex + 1} / {GALLERY_PHOTOS.length}</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mb-1">
                {activePhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#A0A0A0]">
                {activePhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
