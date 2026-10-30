import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Calendar,
  Heart,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Sparkles,
  ExternalLink,
  Shield,
  ArrowRight,
} from 'lucide-react';
import {
  UserAccount,
  validateEmail,
  saveStoredUser,
  ReservationData,
  cancelStoredReservation,
} from '../utils/cafeLogic';
import {
  registerWithFirebase,
  loginWithFirebase,
  sendFirebasePasswordReset,
  translateFirebaseError,
  isFirebaseConfigured,
} from '../utils/firebase';
import { MENU_ITEMS } from '../data/cafeData';

type AuthView = 'login' | 'register' | 'forgot' | 'profile';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
  reservations: ReservationData[];
  onReservationsUpdate: (reservations: ReservationData[]) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenAdminPanel: () => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  reservations,
  onReservationsUpdate,
  favorites,
  onToggleFavorite,
  onOpenAdminPanel,
  onNotify,
}) => {
  const [activeView, setActiveView] = useState<AuthView>(
    currentUser ? 'profile' : 'login'
  );

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Zəif', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Orta', color: 'bg-amber-500' };
    return { score: 3, label: 'Güclü', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  // Handle Login: checks dedicated Admin via backend or standard user login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      newErrors.identifier = 'E-poçt ünvanı və ya istifadəçi adınızı daxil edin.';
    }
    if (!password) {
      newErrors.password = 'Şifrənizi daxil edin.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      // 1. If username is "Emil" (case-insensitive), authenticate strictly via backend admin endpoint
      if (trimmedId.toLowerCase() === 'emil') {
        const adminRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedId, password }),
        });
        const adminData = await adminRes.json();
        if (adminRes.ok && adminData.token) {
          localStorage.setItem('emilcafe_admin_token', adminData.token);
          const adminUser: UserAccount = {
            id: 'admin_emil',
            fullName: 'Emil (İnzibatçı)',
            email: 'admin@emilcafe.az',
            createdAt: new Date().toLocaleDateString('az-AZ'),
            favoriteIds: favorites,
            role: 'admin',
          };
          saveStoredUser(adminUser);
          onUserChange(adminUser);
          setIsLoading(false);
          onClose();
          onNotify('success', 'İnzibatçı girişi uğurla təsdiqləndi! Admin Panel açılır...');
          onOpenAdminPanel();
          return;
        } else {
          setIsLoading(false);
          setErrors({ password: 'Incorrect password.' });
          onNotify('error', 'Incorrect password.');
          return;
        }
      }

      // 2. Standard user login via backend / Firebase
      const userDoc = await loginWithFirebase(trimmedId, password);
      const standardUser: UserAccount = {
        id: userDoc.uid,
        fullName: userDoc.fullName,
        email: userDoc.email,
        phone: userDoc.phone,
        createdAt: new Date(userDoc.createdAt).toLocaleDateString('az-AZ'),
        favoriteIds: userDoc.favoriteIds || favorites,
        role: userDoc.role || 'user',
      };

      saveStoredUser(standardUser);
      onUserChange(standardUser);
      setIsLoading(false);
      onNotify('success', `Xoş gəlmisiniz, ${standardUser.fullName}!`);

      if (standardUser.role === 'admin') {
        onClose();
        onOpenAdminPanel();
      } else {
        setActiveView('profile');
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = translateFirebaseError(err);
      if (msg.includes('No account found')) {
        setErrors({ identifier: 'No account found with this email address.' });
      } else if (msg.includes('Incorrect password')) {
        setErrors({ password: 'Incorrect password.' });
      } else {
        setErrors({ form: msg });
      }
      onNotify('error', msg);
    }
  };

  // Handle Registration: creates account in Backend + Firestore users collection
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Ad və soyad ən azı 3 simvol olmalıdır.';
    }
    if (!identifier.trim() || !validateEmail(identifier)) {
      newErrors.identifier = 'Düzgün bir e-poçt (Gmail) ünvanı daxil edin.';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Daxil edilən şifrələr bir-biri ilə eyni deyil.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const userDoc = await registerWithFirebase(fullName, identifier, password);
      const newUser: UserAccount = {
        id: userDoc.uid,
        fullName: userDoc.fullName,
        email: userDoc.email,
        createdAt: new Date(userDoc.createdAt).toLocaleDateString('az-AZ'),
        favoriteIds: favorites,
        role: 'user',
      };

      saveStoredUser(newUser);
      onUserChange(newUser);
      setIsLoading(false);
      onNotify('success', 'Hesabınız uğurla yaradıldı!');
      setActiveView('profile');
    } catch (err: any) {
      setIsLoading(false);
      const msg = translateFirebaseError(err);
      setErrors({ form: msg });
      onNotify('error', msg);
    }
  };

  // Handle Forgot Password: sends email link via Backend / Firebase
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !validateEmail(identifier)) {
      setErrors({ identifier: 'Zəhmət olmasa bərpa linki üçün düzgün Gmail / e-poçt ünvanınızı daxil edin.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendFirebasePasswordReset(identifier.trim());
      setIsLoading(false);
      setResetSentEmail(identifier.trim());
      const successNotice = result?.emailSent
        ? `Şifrə yeniləmə linki ${identifier.trim()} ünvanına göndərildi!`
        : `Şifrə bərpa sorğusu qəbul edildi. E-poçtunuza təlimat göndərildi.`;
      onNotify('success', successNotice);
    } catch (err: any) {
      setIsLoading(false);
      const msg = translateFirebaseError(err);
      if (msg.includes('No account found')) {
        setErrors({ identifier: 'No account found with this email address.' });
      } else {
        setErrors({ identifier: msg });
      }
      onNotify('error', msg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('emilcafe_admin_token');
    saveStoredUser(null);
    onUserChange(null);
    setActiveView('login');
    setIdentifier('');
    setPassword('');
    onNotify('info', 'Hesabdan uğurla çıxış edildi.');
  };

  const handleCancelReservation = (reservationId: string) => {
    const updated = cancelStoredReservation(reservationId);
    onReservationsUpdate(updated);
    onNotify('info', 'Rezervasiya ləğv edildi.');
  };

  const favoriteProducts = MENU_ITEMS.filter((item) => favorites.includes(item.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#2B2B2B] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between bg-[#101010]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-normal text-white">
              EmilCafe <span className="text-[#E0C078]">Hesabı</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#252525] text-[#A6A6A6] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Pəncərəni bağla"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with internal scrolling */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Global Form Error Display */}
          {errors.form && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* VIEW: USER PROFILE */}
          {activeView === 'profile' && currentUser && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0E0E0E] border border-[#242424]">
                <div className="w-12 h-12 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center text-[#E0C078] font-serif text-xl font-semibold">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white text-base truncate">
                      {currentUser.fullName}
                    </h3>
                    {currentUser.role === 'admin' && (
                      <span className="text-[10px] bg-[#C5A059] text-[#0B0B0B] font-bold px-1.5 py-0.2 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8E8E8E] truncate">{currentUser.email}</p>
                  <span className="text-[10px] text-[#C5A059] block mt-0.5">
                    Qeydiyyat: {currentUser.createdAt}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-900/40 cursor-pointer"
                  aria-label="Hesabdan çıxış"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıxış</span>
                </button>
              </div>

              {/* Admin Panel Direct Link (If Admin) */}
              {currentUser.role === 'admin' && (
                <div className="p-3.5 rounded-xl bg-[#1A1610] border border-[#C5A059]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-[#E0C078]" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">İnzibatçı İdarəetmə Paneli</h4>
                      <p className="text-[11px] text-[#A0A0A0]">Firestore istifadəçiləri və rezervasiyaları idarə edin</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPanel();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Aç</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* User's Reservation History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C5A059]" />
                    <span>Rezervasiya Tarixçəsi</span>
                  </h4>
                  <span className="text-xs text-[#888888] font-mono">
                    {reservations.length} rezervasiya
                  </span>
                </div>

                {reservations.length === 0 ? (
                  <div className="text-center py-6 bg-[#0E0E0E] rounded-xl border border-[#222222] text-xs text-[#808080]">
                    Hələ heç bir masa rezervasiyası etməmisiniz.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {reservations.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-lg bg-[#0E0E0E] border border-[#242424] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#E0C078]">
                              {res.referenceCode}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                res.status === 'confirmed'
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {res.status === 'confirmed' ? 'Qeydə alındı' : 'Ləğv edildi'}
                            </span>
                          </div>
                          <p className="text-[#A0A0A0] text-[11px] mt-1">
                            {res.date} · saat {res.time} · {res.guests} nəfər
                          </p>
                        </div>

                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition-colors"
                            title="Rezervasiyanı ləğv et"
                            aria-label={`${res.referenceCode} rezervasiyasını ləğv et`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User's Favorites List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#C5A059]" />
                    <span>Sevimli Məhsullarınız</span>
                  </h4>
                  <span className="text-xs text-[#888888] font-mono">
                    {favoriteProducts.length} məhsul
                  </span>
                </div>

                {favoriteProducts.length === 0 ? (
                  <div className="text-center py-6 bg-[#0E0E0E] rounded-xl border border-[#222222] text-xs text-[#808080]">
                    Bəyəndiyiniz qəhvə və desertləri ürək ikonu ilə yadda saxlayın.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {favoriteProducts.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-[#0E0E0E] border border-[#242424] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded object-cover shrink-0"
                          />
                          <div className="truncate">
                            <span className="text-xs font-medium text-white truncate block">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#E0C078]">
                              {item.price.toFixed(2)} <span className="font-sans">₼</span>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className="text-[#C5A059] hover:text-rose-400 p-1"
                          aria-label={`${item.name} bəyənilənlərdən çıxar`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {activeView === 'login' && (
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <h3 id="auth-modal-title" className="font-serif text-2xl font-normal text-white mb-1">
                Hesabınıza daxil olun
              </h3>
              <p className="text-xs text-[#9E9E9E] mb-5">
                Şəxsi kabinetinizə daxil olun, rezervasiyalarınızı və sevimli içkilərinizi idarə edin.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                  E-poçt ünvanı və ya istifadəçi adı
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) setErrors({ ...errors, identifier: '' });
                    }}
                    placeholder="ad@example.com və ya istifadəçi adınız..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                </div>
                {errors.identifier && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.identifier}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#CFCFCF]">
                    Şifrə
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('forgot');
                      setResetSentEmail(null);
                      setErrors({});
                    }}
                    className="text-[11px] text-[#C5A059] hover:underline cursor-pointer"
                  >
                    Şifrəni unutmusunuz?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-white"
                    aria-label="Şifrəni göstər və ya gizlət"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#0B0B0B] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Daxil ol</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 border-t border-[#222222]">
                <p className="text-xs text-[#8E8E8E]">
                  Hesabınız yoxdur?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('register');
                      setErrors({});
                    }}
                    className="text-[#C5A059] font-medium hover:underline cursor-pointer"
                  >
                    Qeydiyyatdan keçin
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: REGISTER */}
          {activeView === 'register' && (
            <form onSubmit={handleRegister} noValidate className="space-y-4">
              <h3 className="font-serif text-2xl font-normal text-white mb-1">
                Yeni hesab yaradın
              </h3>
              <p className="text-xs text-[#9E9E9E] mb-5">
                EmilCafe imtiyazlarına qoşulun. Məlumatlarınız Firebase Authentication və Firestore-da saxlanılır.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                  Ad və soyad
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Leyla Məmmədova"
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                  Gmail / E-poçt ünvanı
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ad@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                </div>
                {errors.identifier && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.identifier}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                  Şifrə
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ən azı 6 simvol"
                    className="w-full pl-10 pr-10 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#222222] rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          strength.score >= 1 ? strength.color : 'bg-transparent'
                        }`}
                        style={{ width: '33%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all ${
                          strength.score >= 2 ? strength.color : 'bg-transparent'
                        }`}
                        style={{ width: '33%' }}
                      />
                      <div
                        className={`h-full rounded-full transition-all ${
                          strength.score >= 3 ? strength.color : 'bg-transparent'
                        }`}
                        style={{ width: '33%' }}
                      />
                    </div>
                    <span className="text-[10px] text-[#A0A0A0]">
                      Güc: {strength.label}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                  Şifrəni təkrar edin
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrəni təkrar daxil edin"
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#0B0B0B] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Qeydiyyatı tamamla</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 border-t border-[#222222]">
                <p className="text-xs text-[#8E8E8E]">
                  Artıq hesabınız var?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('login');
                      setErrors({});
                    }}
                    className="text-[#C5A059] font-medium hover:underline cursor-pointer"
                  >
                    Daxil olun
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD (Gmail Reset Link via sendPasswordResetEmail) */}
          {activeView === 'forgot' && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-normal text-white mb-1">
                Şifrəni unutmusunuz?
              </h3>
              <p className="text-xs text-[#9E9E9E] mb-4">
                Gmail və ya qeydiyyatdan keçdiyiniz e-poçt ünvanınızı daxil edin. Firebase vasitəsilə Gmail qutunuza avtomatik şifrə sıfırlama linki göndəriləcəkdir.
              </p>

              {resetSentEmail ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Şifrə sıfırlama linki göndərildi!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-300/90">
                    <strong>{resetSentEmail}</strong> Gmail ünvanınıza Firebase tərəfindən şifrə sıfırlama təlimatı göndərildi. Zəhmət olmasa gələnlər qutusunu (və ya Spam qovluğunu) yoxlayın.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('login');
                      setResetSentEmail(null);
                    }}
                    className="w-full py-2 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                  >
                    Giriş pəncərəsinə qayıt
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                      Gmail / E-poçt ünvanınız
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (errors.identifier) setErrors({ ...errors, identifier: '' });
                        }}
                        placeholder="ad@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    {errors.identifier && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.identifier}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-[#0B0B0B] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Gmail-ə sıfırlama linki göndər</span>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-3 border-t border-[#222222]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('login');
                        setErrors({});
                      }}
                      className="text-xs text-[#C5A059] hover:underline cursor-pointer"
                    >
                      Giriş səhifəsinə qayıt
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
