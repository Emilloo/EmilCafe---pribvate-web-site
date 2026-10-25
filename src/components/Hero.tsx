import React from 'react';
import { ChevronDown, Calendar, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreMenu: () => void;
  onOpenReservation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onOpenReservation }) => {
  return (
    <section
      id="hero"
      aria-label="EmilCafe xoş gəlmisiniz"
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Photography with measured dark scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=85"
          alt="EmilCafe premium barista mühiti və qəhvə hazırlığı"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-[1.1] scale-105 animate-in fade-in duration-1000"
          loading="eager"
        />
        {/* Multilayer gradient scrim for crystal clear contrast and luxury depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.08)_0,transparent_70%)]" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Premium Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818]/80 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold tracking-[0.25em] uppercase mb-8 backdrop-blur-sm shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-[#E0C078]" />
          <span>SPECIALTY COFFEE • BAKU</span>
        </div>

        {/* Serif Headline with text-wrap: balance */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white mb-6 leading-[1.15] max-w-3xl">
          Qəhvənin ən <span className="italic text-[#E0C078]">zövqlü</span> halı.
        </h1>

        {/* Supporting text in Azerbaijani */}
        <p className="text-base sm:text-lg md:text-xl text-[#D6D6D6] font-normal leading-relaxed max-w-2xl mb-10 text-balance">
          Keyfiyyətli qəhvə, unudulmaz dadlar və hər anınıza uyğun isti atmosfer. EmilCafe-də öz xüsusi anınızı yaşayın.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={onExploreMenu}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg shadow-lg hover:shadow-[#C5A059]/20 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] cursor-pointer"
          >
            Menyunu kəşf et
          </button>
          <button
            onClick={onOpenReservation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-white bg-[#181818]/80 hover:bg-[#222222] border border-[#333333] hover:border-[#C5A059]/50 rounded-lg backdrop-blur-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>Masa rezerv et</span>
          </button>
        </div>

        {/* Highlights strip below CTAs */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-16 pt-10 border-t border-[#262626]/70 w-full max-w-2xl text-center">
          <div>
            <div className="text-[#E0C078] font-serif text-2xl sm:text-3xl font-semibold">100%</div>
            <div className="text-xs text-[#9E9E9E] mt-1 font-medium tracking-wide">Arabica dənələri</div>
          </div>
          <div>
            <div className="text-[#E0C078] font-serif text-2xl sm:text-3xl font-semibold">9 Bar</div>
            <div className="text-xs text-[#9E9E9E] mt-1 font-medium tracking-wide">Dəqiq ekstraksiya</div>
          </div>
          <div>
            <div className="text-[#E0C078] font-serif text-2xl sm:text-3xl font-semibold">09 — 23</div>
            <div className="text-xs text-[#9E9E9E] mt-1 font-medium tracking-wide">Hər gün açıqdır</div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <a
          href="#experience"
          aria-label="Aşağıya sürüşdürün"
          className="mt-10 text-[#8E8E8E] hover:text-[#C5A059] transition-colors flex flex-col items-center gap-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded"
        >
          <ChevronDown className="w-5 h-5 animate-bounce text-[#C5A059]" />
        </a>
      </div>
    </section>
  );
};
