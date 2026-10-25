import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, ExternalLink, Info } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      aria-label="Əlaqə və yerləşmə"
      className="py-24 bg-[#0B0B0B] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#C5A059] tracking-[0.25em] uppercase block mb-3">
            BİZİMLƏ ƏLAQƏ
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4">
            Sizi EmilCafe-də <span className="italic text-[#E0C078]">gözləyirik</span>.
          </h2>
          <p className="text-[#9E9E9E] text-sm sm:text-base">
            Günün istənilən saatında isti bir fincan qəhvə və səmimi söhbət üçün qapımız açıqdır.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address */}
            <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Məkanımız</h3>
                  <p className="text-xs text-[#D1D1D1] leading-relaxed">
                    Nizami küçəsi 142 (Torqovaya), Fəvvarələr Meydanı yaxınlığı, Bakı, Azərbaycan
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-[#808080]">
                    (Nümayiş ünvanı · Fictional demo location)
                  </span>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">İş saatları</h3>
                  <p className="text-xs text-[#D1D1D1]">
                    Bazar ertəsi — Bazar: <strong className="text-[#E0C078] font-mono">09:00 — 23:00</strong>
                  </p>
                  <p className="text-[11px] text-[#8E8E8E] mt-1">
                    Mətbəx və isti qəlyanaltılar 22:30-a qədər fəaliyyət göstərir.
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">Telefon</h3>
                  <a
                    href="tel:+994125980000"
                    className="text-xs font-mono text-[#E0C078] hover:underline"
                    aria-label="Kafeyə zəng et"
                  >
                    +994 12 598 00 00
                  </a>
                  <span className="block text-[10px] text-[#808080] mt-1">
                    * Placeholder nömrə (istehsalatda faktiki nömrə ilə əvəzlənməlidir)
                  </span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">E-poçt</h3>
                  <a
                    href="mailto:hello@emilcafe.example"
                    className="text-xs font-mono text-[#E0C078] hover:underline"
                    aria-label="E-poçt göndər"
                  >
                    hello@emilcafe.example
                  </a>
                  <span className="block text-[10px] text-[#808080] mt-1">
                    * Nümayiş e-poçtu (demo placeholder)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Visualizer & Directions (7 cols) */}
          <div className="lg:col-span-7 bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="relative h-72 sm:h-80 w-full bg-[#1A1A1A] overflow-hidden">
              {/* Stylized dark cartographic preview representation */}
              <iframe
                title="EmilCafe Bakı Məkanı Xəritəsi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.467885382596!2d49.8372!3d40.3705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307db495c03f53%3A0xe54c30c8df6d45e0!2sFountain%20Square!5e0!3m2!1sen!2saz!4v1680000000000!5m2!1sen!2saz"
                className="w-full h-full border-0 filter grayscale-[40%] invert-[90%] contrast-[1.2]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen={false}
              />
              <div className="absolute top-4 left-4 bg-[#0B0B0B]/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#333333] shadow-lg flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                <span className="text-xs font-semibold text-white">EmilCafe Baku Lounge</span>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141414]">
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">Xəritədə marşrut qurun</h4>
                <p className="text-xs text-[#9E9E9E]">
                  Sahil və 28 May metro stansiyalarından 5 dəqiqəlik piyada məsafəsində.
                </p>
              </div>

              <a
                href="https://maps.google.com/?q=Fountain+Square+Baku"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps-də aç</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
