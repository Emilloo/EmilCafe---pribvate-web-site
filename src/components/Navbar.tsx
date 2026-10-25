import React, { useState, useEffect } from 'react';
import { Coffee, User, Menu, X, Calendar } from 'lucide-react';
import { UserAccount } from '../utils/cafeLogic';

interface NavbarProps {
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenReservation: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenReservation,
  favoritesCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Ana səhifə', href: '#hero' },
    { name: 'Menyu', href: '#menu' },
    { name: 'Haqqımızda', href: '#about' },
    { name: 'Qalereya', href: '#gallery' },
    { name: 'Rezervasiya', href: '#reservation' },
    { name: 'Əlaqə', href: '#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#262626] shadow-xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('#hero');
            }}
            className="flex items-center gap-2.5 text-inherit no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            aria-label="EmilCafe ana səhifə"
          >
            <div className="w-9 h-9 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-[#C5A059] group-hover:border-[#C5A059]/50 transition-colors">
              <Coffee className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold tracking-wider text-white group-hover:text-[#E0C078] transition-colors leading-none">
                EmilCafe
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[#8E8E8E] uppercase mt-0.5">
                Boutique Lounge
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Əsas naviqasiya"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#C0C0C0]"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="whitespace-nowrap transition-colors hover:text-[#C5A059] relative py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-3">
            {/* User Profile / Login Button */}
            <button
              onClick={onOpenAuth}
              aria-label={
                currentUser
                  ? `İstifadəçi profili: ${currentUser.fullName}`
                  : 'Giriş və qeydiyyat'
              }
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#CFCFCF] bg-[#141414] hover:bg-[#1C1C1C] border border-[#2B2B2B] hover:border-[#C5A059]/40 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            >
              <div className="relative">
                <User className="w-4 h-4 text-[#C5A059]" />
                {currentUser && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#C5A059] ring-2 ring-[#0B0B0B]" />
                )}
              </div>
              <span className="hidden sm:inline whitespace-nowrap">
                {currentUser ? currentUser.fullName.split(' ')[0] : 'Hesab'}
              </span>
              {favoritesCount > 0 && !currentUser && (
                <span className="text-[10px] bg-[#262626] text-[#C5A059] px-1.5 py-0.2 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenReservation}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Masa rezerv et</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#C0C0C0] hover:text-white bg-[#141414] border border-[#2B2B2B] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              aria-expanded={mobileMenuOpen}
              aria-label="Menyu pəncərəsini aç/bağla"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-[#262626] px-5 py-6 shadow-2xl transition-all animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3.5 text-base">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="py-2 text-[#D1D1D1] hover:text-[#C5A059] border-b border-[#1E1E1E] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="mt-5 pt-3 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Masa rezerv et</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#D1D1D1] bg-[#181818] border border-[#2F2F2F] rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-[#C5A059]" />
              <span>{currentUser ? `Profil (${currentUser.fullName})` : 'Giriş / Qeydiyyat'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
