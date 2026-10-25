import React from 'react';
import { Coffee, Sparkles, HeartHandshake } from 'lucide-react';

export const SignatureExperience: React.FC = () => {
  const experiences = [
    {
      id: 'exp1',
      title: 'Keyfiyyətli qəhvə',
      description: 'Seçilmiş qəhvə dənələri və peşəkar hazırlanma üsulları.',
      detail: 'Efiopiya, Kolumbiya və Qvatemalanın yüksək dağlıq fermalarından xüsusi partiyalarla gətirilən, tək mənşəli specialty dənələr.',
      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
      icon: Coffee,
      badge: '01',
    },
    {
      id: 'exp2',
      title: 'Təzə dadlar',
      description: 'Hər gün hazırlanan desertlər və xüsusi içkilər.',
      detail: 'Bask San Sebastian çizkeykindən xırtıldayan fransız kruasanlarına qədər gündəlik təbii inqrediyentlərlə bişirilən qurme desertlər.',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      icon: Sparkles,
      badge: '02',
    },
    {
      id: 'exp3',
      title: 'Rahat atmosfer',
      description: 'İşləmək, dostlarla görüşmək və ya özünə vaxt ayırmaq üçün ideal məkan.',
      detail: 'İncə musiqi seçimi, yumşaq işıqlandırma, sürətli Wi-Fi və rahat oturacaqlar ilə Bakının ən zövqlü guşəsi.',
      image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80',
      icon: HeartHandshake,
      badge: '03',
    },
  ];

  return (
    <section
      id="experience"
      aria-label="EmilCafe xüsusi təcrübəsi"
      className="py-24 bg-[#0E0E0E] relative border-b border-[#212121]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#C5A059] tracking-[0.25em] uppercase block mb-3">
            ÖZƏL TƏCRÜBƏ
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4 leading-tight">
            Sadəcə qəhvə deyil, bir <span className="italic text-[#E0C078]">təcrübə</span>.
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A059]/40 mx-auto mt-4 mb-4" />
          <p className="text-[#9E9E9E] text-sm sm:text-base leading-relaxed">
            Hər fincanda dəqiqlik, hər masada səmimiyyət və unudulmaz anlar yaradan incə detallar.
          </p>
        </div>

        {/* 3 Premium Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp) => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.id}
                className="group relative bg-[#141414] rounded-xl overflow-hidden border border-[#262626] hover:border-[#C5A059]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col"
              >
                {/* Photo container */}
                <div className="relative h-60 w-full overflow-hidden bg-[#1B1B1B]">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05] group-hover:scale-105 group-hover:brightness-95 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-lg bg-[#0B0B0B]/80 backdrop-blur-sm border border-[#333333] flex items-center justify-center text-[#E0C078]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="absolute top-4 right-4 font-serif text-lg font-light text-[#C5A059]/70 tracking-wider">
                    {exp.badge}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-normal text-white mb-2 group-hover:text-[#E0C078] transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-sm font-medium text-[#D1D1D1] mb-3">
                      {exp.description}
                    </p>
                    <p className="text-xs text-[#8E8E8E] leading-relaxed">
                      {exp.detail}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#222222] flex items-center justify-between text-xs text-[#C5A059] font-medium">
                    <span>EmilCafe Standartı</span>
                    <span className="text-[#6E6E6E]">· Bakı</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
