/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SignatureExperience } from './components/SignatureExperience';
import { MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { ReservationSection } from './components/ReservationSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  UserAccount,
  ReservationData,
  getStoredUser,
  getStoredReservations,
  getStoredFavorites,
  toggleStoredFavorite,
  saveStoredUser,
} from './utils/cafeLogic';
import { logoutFromFirebase } from './utils/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [view, setView] = useState<'site' | 'admin'>('site');

  // Initialize from persistent client storage on mount
  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    setReservations(getStoredReservations());
    setFavorites(getStoredFavorites());

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random()}`,
      type,
      text,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleFavorite = (itemId: string) => {
    const updated = toggleStoredFavorite(itemId);
    setFavorites(updated);
    const isNowFav = updated.includes(itemId);
    addToast(
      'info',
      isNowFav ? 'Məhsul sevimli siyahınıza əlavə edildi.' : 'Məhsul bəyənilənlərdən çıxarıldı.'
    );
  };

  const handleReservationCreated = (newReservation: ReservationData) => {
    setReservations((prev) => [newReservation, ...prev]);
    addToast(
      'success',
      `Masa rezervasiyanız qeydə alındı! Kod: ${newReservation.referenceCode}`
    );
  };

  const handleAdminLogout = async () => {
    localStorage.removeItem('emilcafe_admin_token');
    await logoutFromFirebase();
    saveStoredUser(null);
    setCurrentUser(null);
    setView('site');
    addToast('info', 'İnzibatçı hesabından çıxış edildi.');
  };

  const scrollToMenu = () => {
    if (view !== 'site') setView('site');
    setTimeout(() => {
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const scrollToReservation = () => {
    if (view !== 'site') setView('site');
    setTimeout(() => {
      const el = document.getElementById('reservation');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin Panel View, render dedicated dashboard
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-[#090909] text-[#EDEDED] font-sans selection:bg-[#C5A059]/30 selection:text-[#F3E5AB]">
        <AdminPanel
          onReturnToSite={() => setView('site')}
          onLogout={handleAdminLogout}
          onNotify={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#EDEDED] font-sans selection:bg-[#C5A059]/30 selection:text-[#F3E5AB]">
      {/* Sticky Header Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenReservation={scrollToReservation}
        onOpenAdminPanel={() => setView('admin')}
        favoritesCount={favorites.length}
      />

      <main id="main-content">
        {/* Hero Section */}
        <Hero
          onExploreMenu={scrollToMenu}
          onOpenReservation={scrollToReservation}
        />

        {/* Signature Experience Section */}
        <SignatureExperience />

        {/* Interactive Menu Section */}
        <MenuSection
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onOpenReservation={scrollToReservation}
        />

        {/* About Section */}
        <AboutSection />

        {/* Reservation Section */}
        <ReservationSection
          onReservationCreated={handleReservationCreated}
          defaultEmail={currentUser?.email || ''}
          defaultName={currentUser?.fullName || ''}
        />

        {/* Photo Gallery Section */}
        <GallerySection />

        {/* Contact Section with Map */}
        <ContactSection />
      </main>

      {/* Dark Luxury Footer */}
      <Footer
        onOpenReservation={scrollToReservation}
        onExploreMenu={scrollToMenu}
      />

      {/* Floating Scroll to Top Action */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Səhifənin əvvəlinə qayıt"
          className="fixed bottom-6 left-6 z-30 w-11 h-11 rounded-full bg-[#181818]/90 hover:bg-[#252525] text-[#C5A059] border border-[#2F2F2F] hover:border-[#C5A059]/50 shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* User Authentication & Profile Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
        }}
        reservations={reservations}
        onReservationsUpdate={setReservations}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onOpenAdminPanel={() => setView('admin')}
        onNotify={addToast}
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
