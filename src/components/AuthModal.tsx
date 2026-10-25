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
  ExternalLink,
} from 'lucide-react';
import {
  UserAccount,
  validateEmail,
  validatePhone,
  saveStoredUser,
  ReservationData,
  cancelStoredReservation,
  formatCurrency,
} from '../utils/cafeLogic';
import { MENU_ITEMS } from '../data/cafeData';

type AuthView = 'login' | 'register' | 'forgot' | 'profile' | 'firebase_info';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
  reservations: ReservationData[];
  onReservationsUpdate: (reservations: ReservationData[]) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectMenuItem?: (itemId: string) => void;
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
}) => {
  const [activeView, setActiveView] = useState<AuthView>(
    currentUser ? 'profile' : 'login'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim() || !validateEmail(email)) {
      newErrors.email = 'Düzgün e-poçt ünvanı daxil edin.';
    }
    if (!password) {
      newErrors.password = 'Şifrənizi daxil edin.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Simulate authentication
    const user: UserAccount = {
      id: `usr_${Date.now()}`,
      fullName: email.split('@')[0].toUpperCase(),
      email: email.trim(),
      createdAt: new Date().toLocaleDateString('az-AZ'),
      favoriteIds: favorites,
    };

    saveStoredUser(user);
    onUserChange(user);
    setSuccessNotice('Uğurla daxil oldunuz!');
    setActiveView('profile');
    setErrors({});
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Ad və soyad ən azı 3 simvol olmalıdır.';
    }
    if (!email.trim() || !validateEmail(email)) {
      newErrors.email = 'Düzgün e-poçt ünvanı daxil edin.';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Daxil edilən şifrələr eyni deyil.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      createdAt: new Date().toLocaleDateString('az-AZ'),
      favoriteIds: favorites,
    };

    saveStoredUser(newUser);
    onUserChange(newUser);
    setSuccessNotice('Qeydiyyat uğurla tamamlandı!');
    setActiveView('profile');
    setErrors({});
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !validateEmail(email)) {
      setErrors({ email: 'Zəhmət olmasa düzgün e-poçt ünvanı qeyd edin.' });
      return;
    }
    setSuccessNotice(`Şifrə yeniləmə təlimatı ${email} ünvanına göndərildi (Demo rejim).`);
    setErrors({});
  };

  const handleLogout = () => {
    saveStoredUser(null);
    onUserChange(null);
    setActiveView('login');
    setSuccessNotice(null);
  };

  const handleCancelReservation = (reservationId: string) => {
    const updated = cancelStoredReservation(reservationId);
    onReservationsUpdate(updated);
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
        <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-normal text-white">
              EmilCafe <span className="text-[#E0C078]">Hesabı</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('firebase_info')}
              className="text-[11px] text-[#A0A0A0] hover:text-[#C5A059] px-2 py-1 rounded bg-[#1A1A1A] border border-[#2D2D2D] transition-colors"
            >
              İnteqrasiya haqqında
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#252525] text-[#A6A6A6] hover:text-white flex items-center justify-center transition-colors"
              aria-label="Pəncərəni bağla"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body with internal scrolling */}
        <div className="p-6 overflow-y-auto flex-1">
          {successNotice && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
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
                <div className="flex-1">
                  <h3 className="font-medium text-white text-base">
                    {currentUser.fullName}
                  </h3>
                  <p className="text-xs text-[#8E8E8E]">{currentUser.email}</p>
                  <span className="text-[10px] text-[#C5A059] block mt-0.5">
                    Qeydiyyat tarixi: {currentUser.createdAt}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-900/40"
                  aria-label="Hesabdan çıxış"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıxış</span>
                </button>
              </div>

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
                Rezervasiyalarınıza və sevimli menyu seçimlərinizə baxın.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                  E-poçt ünvanı
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nümunə@domain.az"
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
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
                    onClick={() => setActiveView('forgot')}
                    className="text-[11px] text-[#C5A059] hover:underline"
                  >
                    Şifrəni unutmusunuz?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  className="w-full py-3 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                >
                  Daxil ol
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
                EmilCafe imtiyazlarına qoşulun və sifarişlərinizi asanlıqla izləyin.
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
                  E-poçt ünvanı
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nümunə@domain.az"
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
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

                {/* Password Strength Indicator */}
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
                  className="w-full py-3 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                >
                  Qeydiyyatı tamamla
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

          {/* VIEW: FORGOT PASSWORD */}
          {activeView === 'forgot' && (
            <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
              <h3 className="font-serif text-2xl font-normal text-white mb-1">
                Şifrəni bərpa et
              </h3>
              <p className="text-xs text-[#9E9E9E] mb-5">
                Qeydiyyatdan keçdiyiniz e-poçt ünvanınızı daxil edin.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-1.5">
                  E-poçt ünvanı
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nümunə@domain.az"
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                >
                  Bərpa linki göndər
                </button>
              </div>

              <div className="text-center pt-3 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="text-xs text-[#C5A059] hover:underline"
                >
                  Giriş səhifəsinə qayıt
                </button>
              </div>
            </form>
          )}

          {/* VIEW: FIREBASE & AUTH ARCHITECTURE INFO */}
          {activeView === 'firebase_info' && (
            <div className="space-y-4 text-xs text-[#CFCFCF]">
              <div className="flex items-center gap-2 text-[#E0C078] mb-1">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-serif text-lg font-normal text-white">
                  İstehsalat & Təhlükəsizlik Memarlığı
                </h3>
              </div>

              <p className="leading-relaxed text-[#A0A0A0]">
                Tələblərə uyğun olaraq, hazırkı nümayiş mühitində istifadəçi sessiyaları və rezervasiya tarixçəsi müştəri brauzerində təcrid olunmuş lokal saxlancla idarə olunur.
              </p>

              <div className="p-3.5 rounded-lg bg-[#0E0E0E] border border-[#262626] space-y-2">
                <h4 className="font-semibold text-white">İstehsalatda Firebase Aktivləşdirilməsi:</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-[#9E9E9E]">
                  <li>
                    <strong className="text-white">Firebase Authentication:</strong> Google Sign-In və ya E-mail/Password provayderi GCP konsolunda təsdiqlənir.
                  </li>
                  <li>
                    <strong className="text-white">Cloud Firestore:</strong> <code className="text-[#E0C078]">reservations</code> və <code className="text-[#E0C078]">users</code> kolleksiyaları üçün təhlükəsizlik qaydaları (<code className="text-xs">firestore.rules</code>) tətbiq edilir.
                  </li>
                  <li>
                    <strong className="text-white">Şifrə Təhlükəsizliyi:</strong> Heç vaxt şifrələr açıq şəkildə saxlanılmır və Firebase Auth SDK tərəfindən bcrypt/scrypt ilə qorunur.
                  </li>
                </ol>
              </div>

              <button
                onClick={() => setActiveView(currentUser ? 'profile' : 'login')}
                className="w-full py-2.5 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer mt-2"
              >
                Geri qayıt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
