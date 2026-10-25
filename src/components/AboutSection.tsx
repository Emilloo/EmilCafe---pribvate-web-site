import React from 'react';
import { Award, Compass, Heart } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      aria-label="EmilCafe hekayəsi və fəlsəfəsi"
      className="py-24 bg-[#0E0E0E] relative border-y border-[#212121]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Showcase Side */}
          <div className="relative group">
            {/* Primary Large Interior Photography */}
            <div className="relative rounded-2xl overflow-hidden border border-[#2B2B2B] bg-[#181818] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85"
                alt="EmilCafe lüks daxili interyeri və rahat oturacaqlar"
                referrerPolicy="no-referrer"
                className="w-full h-[440px] sm:h-[500px] object-cover filter brightness-90 contrast-[1.05] group-hover:scale-[1.02] transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-transparent opacity-80" />
            </div>

            {/* Floating Editorial Quote Accent */}
            <div className="absolute -bottom-6 -right-2 sm:bottom-6 sm:right-6 max-w-xs bg-[#141414]/95 backdrop-blur-md p-5 rounded-xl border border-[#333333] shadow-xl">
              <p className="font-serif italic text-sm text-[#E0C078] leading-relaxed mb-2">
                "Qəhvə bir fincan içkidən daha artığıdır — o, bir söhbətin və səmimi anın başlanğıcıdır."
              </p>
              <span className="text-[11px] text-[#8E8E8E] font-medium tracking-wide block">
                EmilCafe Fəlsəfəsi · Bakı
              </span>
            </div>
          </div>

          {/* Text and Story Side */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-[#C5A059] tracking-[0.25em] uppercase block mb-3">
              HAQQIMIZDA
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-6 leading-tight">
              Bizim <span className="italic text-[#E0C078]">hekayəmiz</span>
            </h2>

            <div className="w-12 h-0.5 bg-[#C5A059] mb-8" />

            {/* Required Azerbaijani Text */}
            <p className="text-base sm:text-lg text-[#D1D1D1] leading-relaxed mb-6 font-normal">
              EmilCafe qəhvənin yalnız bir içki deyil, həm də insanları bir araya gətirən xüsusi bir təcrübə olduğuna inanır. Keyfiyyət, səmimiyyət və detallara diqqət bizim üçün hər zaman ön plandadır.
            </p>

            <p className="text-sm text-[#9E9E9E] leading-relaxed mb-10">
              Bakının zəngin memarlıq ənənələrini müasir qəhvə mədəniyyəti ilə birləşdirərək, qonaqlarımıza həm dincəlmək, həm də yaradıcı düşüncələrə dalmaq üçün isti, zövqlü bir məkan yaratdıq. Hər fincan qəhvə təzə çəkilən ən yaxşı dənələrdən ustalıqla hazırlanır.
            </p>

            {/* Small Illustrative Demo Statistics (Clearly labeled demo indicators) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#242424]">
              <div className="p-4 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="w-8 h-8 rounded bg-[#1F1F1F] text-[#C5A059] flex items-center justify-center mb-3">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-white text-sm mb-1">Keyfiyyətə sevgi</h3>
                <p className="text-xs text-[#888888] leading-normal">
                  Yalnız seçilmiş specialty dərəcəli dənələr.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="w-8 h-8 rounded bg-[#1F1F1F] text-[#C5A059] flex items-center justify-center mb-3">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-white text-sm mb-1">Hər fincanda diqqət</h3>
                <p className="text-xs text-[#888888] leading-normal">
                  Hər reseptdə qramlıq və saniyəlik dəqiqlik.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="w-8 h-8 rounded bg-[#1F1F1F] text-[#C5A059] flex items-center justify-center mb-3">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-white text-sm mb-1">Hər qonağa xüsusi münasibət</h3>
                <p className="text-xs text-[#888888] leading-normal">
                  İsti təbəssüm və fərdi xidmət mədəniyyəti.
                </p>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-[#6E6E6E] italic">
              * Təqdim olunan göstəricilər EmilCafe brendinin keyfiyyət və xidmət prinsiplərini əks etdirən illüstrativ dəyərlərdir.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
