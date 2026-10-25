import React, { useState, useMemo } from 'react';
import { Search, Heart, Eye, X, Flame, Scale, Check } from 'lucide-react';
import { MenuItem, formatCurrency, filterMenuItems } from '../utils/cafeLogic';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/cafeData';

interface MenuSectionProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenReservation: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  favorites,
  onToggleFavorite,
  onOpenReservation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    return filterMenuItems(MENU_ITEMS, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  return (
    <section
      id="menu"
      aria-label="EmilCafe menyusu"
      className="py-24 bg-[#0B0B0B] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#C5A059] tracking-[0.25em] uppercase block mb-3">
            SEÇİLMİŞ TƏKLİFLƏR
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4">
            İnteraktiv <span className="italic text-[#E0C078]">Menyu</span>
          </h2>
          <p className="text-[#9E9E9E] text-sm sm:text-base">
            Hər qurtumda əsl sənətkarlıq. Sevimli içkinizi və ya desertinizi seçin.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10 pb-6 border-b border-[#212121]">
          {/* Category Tabs (Segmented control) */}
          <div
            role="tablist"
            aria-label="Menyu kateqoriyaları"
            className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none"
          >
            {MENU_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                    isActive
                      ? 'bg-[#C5A059] text-[#0B0B0B] font-semibold shadow-sm'
                      : 'bg-[#141414] text-[#A6A6A6] hover:text-white hover:bg-[#1C1C1C] border border-[#262626]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Menyuda axtarış (məs. Latte, Kruasan)..."
              className="w-full pl-9 pr-9 py-2 text-xs text-white bg-[#141414] border border-[#262626] rounded-lg placeholder-[#757575] focus:outline-none focus:border-[#C5A059] transition-colors"
              aria-label="Menyuda axtarış"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-white"
                aria-label="Axtarışı təmizlə"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Count & Favorites Summary */}
        <div className="flex items-center justify-between text-xs text-[#8E8E8E] mb-6">
          <div>
            <span>Tapıldı: </span>
            <strong className="text-white font-mono">{filteredItems.length}</strong>
            <span> çeşid</span>
          </div>
          {favorites.length > 0 && (
            <div className="flex items-center gap-1.5 text-[#C5A059]">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{favorites.length} bəyənilən məhsul</span>
            </div>
          )}
        </div>

        {/* Menu Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#121212] rounded-xl border border-[#222222]">
            <p className="text-base text-[#D1D1D1] mb-2">Axtarışınıza uyğun məhsul tapılmadı.</p>
            <p className="text-xs text-[#808080] mb-4">Zəhmət olmasa başqa kateqoriya və ya açar söz seçin.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-medium text-[#C5A059] bg-[#181818] border border-[#2D2D2D] rounded-lg hover:bg-[#202020]"
            >
              Bütün menyunu göstər
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <article
                  key={item.id}
                  className="group bg-[#141414] rounded-xl border border-[#222222] hover:border-[#C5A059]/40 transition-all duration-300 hover:shadow-lg hover:shadow-black/60 flex flex-col justify-between overflow-hidden"
                >
                  {/* Photo area */}
                  <div className="relative h-48 w-full bg-[#1B1B1B] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] group-hover:scale-105 group-hover:brightness-95 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />

                    {/* Category Label (clean inline) */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-[#0B0B0B]/75 backdrop-blur-sm text-[#D9CBB8] border border-[#2E2E2E]">
                      {item.categoryLabel}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                        isFav
                          ? 'bg-[#C5A059] text-[#0B0B0B] shadow'
                          : 'bg-[#0B0B0B]/70 text-[#C0C0C0] hover:text-white hover:bg-[#0B0B0B]'
                      }`}
                      aria-label={`${item.name} üçün bəyənməni dəyiş`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-serif text-xl font-normal text-white group-hover:text-[#E0C078] transition-colors leading-snug">
                          {item.name}
                        </h3>
                        <div className="flex items-baseline gap-1 text-[#E0C078] shrink-0 font-medium">
                          <span className="font-mono text-base font-semibold tabular-nums">{item.price.toFixed(2)}</span>
                          <span className="text-xs font-sans">₼</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#9E9E9E] leading-relaxed line-clamp-2 mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-[#202020] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-[#7E7E7E]">
                        {item.volumeOrWeight && <span>{item.volumeOrWeight}</span>}
                        {item.calories && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.calories}</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#C5A059] hover:text-white hover:bg-[#202020] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] cursor-pointer"
                        aria-label={`${item.name} haqqında ətraflı məlumat`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ətraflı</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Quick Modal for Item Details */}
        {activeModalItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-item-title"
          >
            <div className="relative w-full max-w-lg bg-[#141414] border border-[#2D2D2D] rounded-xl overflow-hidden shadow-2xl">
              <div className="relative h-56 bg-[#1A1A1A]">
                <img
                  src={activeModalItem.image}
                  alt={activeModalItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0B0B0B]/80 text-[#C0C0C0] hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Pəncərəni bağla"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-[#0B0B0B]/80 backdrop-blur-sm text-xs font-medium text-[#C5A059] border border-[#2D2D2D]">
                  {activeModalItem.categoryLabel}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 id="modal-item-title" className="font-serif text-2xl font-normal text-white">
                    {activeModalItem.name}
                  </h3>
                  <div className="flex items-baseline gap-1 text-[#E0C078] font-medium">
                    <span className="font-mono text-xl font-semibold tabular-nums">{activeModalItem.price.toFixed(2)}</span>
                    <span className="text-sm font-sans">₼</span>
                  </div>
                </div>

                <p className="text-sm text-[#CCCCCC] leading-relaxed mb-5">
                  {activeModalItem.description}
                </p>

                {/* Additional Info specs */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#0E0E0E] border border-[#222222] text-xs text-[#A0A0A0] mb-6">
                  {activeModalItem.volumeOrWeight && (
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#C5A059]" />
                      <span>Həcm / Çəki: <strong className="text-white">{activeModalItem.volumeOrWeight}</strong></span>
                    </div>
                  )}
                  {activeModalItem.calories && (
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#C5A059]" />
                      <span>Enerji: <strong className="text-white">{activeModalItem.calories}</strong></span>
                    </div>
                  )}
                </div>

                {activeModalItem.tags && activeModalItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {activeModalItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-[#B0B0B0] bg-[#1E1E1E] px-2.5 py-1 rounded border border-[#2E2E2E]"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#222222]">
                  <button
                    onClick={() => {
                      onToggleFavorite(activeModalItem.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      favorites.includes(activeModalItem.id)
                        ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/40'
                        : 'bg-[#181818] text-[#C0C0C0] border-[#2A2A2A] hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(activeModalItem.id) ? 'fill-current' : ''}`} />
                    <span>{favorites.includes(activeModalItem.id) ? 'Bəyənilənlərdədir' : 'Bəyənilənlərə əlavə et'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalItem(null);
                      onOpenReservation();
                    }}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors text-center cursor-pointer"
                  >
                    Bu içki üçün masa rezerv et
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
