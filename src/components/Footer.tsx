import React, { useState } from 'react';
import { Coffee, Instagram, Facebook, Send, CheckCircle2, AlertCircle, Music2 } from 'lucide-react';
import { validateEmail } from '../utils/cafeLogic';

interface FooterProps {
  onOpenReservation: () => void;
  onExploreMenu: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenReservation, onExploreMenu }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      setNewsletterStatus('error');
      setNewsletterMsg('Zəhmət olmasa e-poçt ünvanınızı daxil edin.');
      return;
    }

    if (!validateEmail(newsletterEmail)) {
      setNewsletterStatus('error');
      setNewsletterMsg('Düzgün bir e-poçt formatı daxil edin.');
      return;
    }

    setNewsletterStatus('success');
    setNewsletterMsg('Təşəkkür edirik! E-poçtunuz demo bülletenimiz üçün qeydə alındı (faktiki göndəriş aktiv deyil).');
    setNewsletterEmail('');
  };

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070707] border-t border-[#1F1F1F] text-[#A3A3A3] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1A1A1A]">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#2E2E2E] flex items-center justify-center text-[#C5A059]">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="font-serif text-2xl font-semibold text-white tracking-wider">
                EmilCafe
              </span>
            </div>

            <p className="text-xs text-[#8E8E8E] leading-relaxed max-w-sm">
              Bakının qəlbində lüks və səmimi atmosfer. Tək mənşəli specialty qəhvələr, hər gün təzə bişirilən qurme desertlər və unudulmaz anlar üçün yaradılmış butik məkan.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EmilCafe Instagram"
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#C5A059]/40 text-[#9E9E9E] hover:text-[#E0C078] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EmilCafe Facebook"
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#C5A059]/40 text-[#9E9E9E] hover:text-[#E0C078] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EmilCafe Lounge Musiqi Pleylist"
                className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#C5A059]/40 text-[#9E9E9E] hover:text-[#E0C078] flex items-center justify-center transition-colors"
              >
                <Music2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nav Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Naviqasiya
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => scrollToSection('#hero')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Ana səhifə
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#menu')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Menyu
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#about')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Haqqımızda
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#gallery')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Qalereya
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#reservation')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Rezervasiya
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#contact')}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Əlaqə
                </button>
              </li>
            </ul>
          </div>

          {/* Menu Highlights (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Populyar Dadlar
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={onExploreMenu}
                  className="hover:text-[#C5A059] transition-colors text-left"
                >
                  Espresso & Macchiato
                </button>
              </li>
              <li>
                <button
                  onClick={onExploreMenu}
                  className="hover:text-[#C5A059] transition-colors text-left"
                >
                  Bask San Sebastian
                </button>
              </li>
              <li>
                <button
                  onClick={onExploreMenu}
                  className="hover:text-[#C5A059] transition-colors text-left"
                >
                  Cold Brew Reserva
                </button>
              </li>
              <li>
                <button
                  onClick={onExploreMenu}
                  className="hover:text-[#C5A059] transition-colors text-left"
                >
                  Dəstgah Çayı
                </button>
              </li>
              <li>
                <button
                  onClick={onExploreMenu}
                  className="hover:text-[#C5A059] transition-colors text-left"
                >
                  Truffle Kruasan Sandviç
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Xüsusi Bülleten
            </h4>
            <p className="text-xs text-[#8E8E8E] leading-relaxed">
              Mövsümi menyu yenilikləri, qəhvə dequstasiyaları və xüsusi tədbirlərdən ilk siz xəbərdar olun.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                  }}
                  placeholder="e-poçt ünvanınız..."
                  className="flex-1 px-3.5 py-2 text-xs text-white bg-[#141414] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                  aria-label="Xüsusi bülleten üçün e-poçt"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abunə ol</span>
                </button>
              </div>

              {newsletterStatus === 'error' && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{newsletterMsg}</span>
                </p>
              )}

              {newsletterStatus === 'success' && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{newsletterMsg}</span>
                </p>
              )}

              <span className="block text-[10px] text-[#6E6E6E] leading-normal">
                * Bu forma nümayiş xarakterlidir. Real e-poçt serveri qoşulmadıqda faktiki abunəlik icra edilmir.
              </span>
            </form>
          </div>
        </div>

        {/* Bottom Bar with Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <p>© 2026 EmilCafe Specialty Coffee Lounge. Bütün hüquqlar qorunur.</p>
          <div className="flex items-center gap-6">
            <span>Baku, Azerbaijan</span>
            <span>·</span>
            <span>Premium Boutique Experience</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
