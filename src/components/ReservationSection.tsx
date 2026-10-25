import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ReservationData,
  validatePhone,
  validateEmail,
  isDateValid,
  getTodayDateString,
  generateReservationReference,
  saveReservation,
} from '../utils/cafeLogic';
import { TIME_SLOTS } from '../data/cafeData';

interface ReservationSectionProps {
  onReservationCreated: (reservation: ReservationData) => void;
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  onReservationCreated,
  defaultEmail = '',
  defaultName = '',
  defaultPhone = '',
}) => {
  const today = getTodayDateString();

  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState<number>(2);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<ReservationData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Zəhmət olmasa ad və soyadınızı qeyd edin (ən azı 2 hərf).';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Əlaqə üçün telefon nömrəsi tələb olunur.';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Düzgün Azərbaycan mobil nömrəsi daxil edin (məs: +994 50 123 45 67).';
    }

    if (email.trim() && !validateEmail(email)) {
      newErrors.email = 'Düzgün e-mail ünvanı daxil edin.';
    }

    if (!date) {
      newErrors.date = 'Zəhmət olmasa rezervasiya tarixini seçin.';
    } else if (!isDateValid(date)) {
      newErrors.date = 'Keçmiş tarix seçilə bilməz. Zəhmət olmasa bugünkü və ya sonrakı tarixi seçin.';
    }

    if (!time) {
      newErrors.time = 'Zəhmət olmasa uyğun saatı seçin.';
    }

    if (!guests || guests < 1 || guests > 10) {
      newErrors.guests = 'Qonaq sayı 1 ilə 10 nəfər arasında olmalıdır.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Simulate persistent save and verification
    setTimeout(() => {
      const reference = generateReservationReference();
      const newReservation: ReservationData = {
        id: `res_${Date.now()}`,
        referenceCode: reference,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        date,
        time,
        guests,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
      };

      saveReservation(newReservation);
      onReservationCreated(newReservation);
      setConfirmedReservation(newReservation);
      setIsSubmitting(false);
    }, 700);
  };

  const handleResetForNewBooking = () => {
    setConfirmedReservation(null);
    setNotes('');
    setErrors({});
  };

  return (
    <section
      id="reservation"
      aria-label="Masa rezervasiyası"
      className="py-24 bg-[#0B0B0B] relative"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#C5A059] tracking-[0.25em] uppercase block mb-3">
            ONLAYN REZERVASİYA
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4">
            Masanız sizi <span className="italic text-[#E0C078]">gözləyir</span>.
          </h2>
          <p className="text-[#9E9E9E] text-sm sm:text-base">
            Xüsusi anlarınız üçün əvvəlcədən yerinizi ayırın.
          </p>
        </div>

        {/* Confirmation Screen or Reservation Form */}
        {confirmedReservation ? (
          <div className="bg-[#141414] border border-[#C5A059]/40 rounded-2xl p-8 sm:p-10 shadow-2xl max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/50 flex items-center justify-center text-[#E0C078] mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-semibold text-[#C5A059] tracking-widest uppercase block mb-1">
              Rezervasiya Qeydə Alındı (Demo)
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mb-2">
              Təşəkkür edirik, {confirmedReservation.fullName}!
            </h3>

            <p className="text-xs text-[#9E9E9E] mb-6">
              Rezervasiya sorğunuz qeydə alınmışdır. Məlumatlarınız profildə və yerli yaddaşda saxlanıldı.
            </p>

            {/* Reference Badge */}
            <div className="bg-[#0B0B0B] border border-[#2B2B2B] rounded-xl p-4 mb-6 inline-block w-full max-w-md">
              <span className="text-[11px] text-[#808080] uppercase tracking-wider block mb-1">
                Rezervasiya Kodu
              </span>
              <span className="font-mono text-2xl font-bold text-[#E0C078] tracking-widest">
                {confirmedReservation.referenceCode}
              </span>
            </div>

            {/* Summary Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-left bg-[#181818] rounded-xl p-5 border border-[#262626] text-xs mb-6">
              <div>
                <span className="text-[#757575] block">Tarix:</span>
                <strong className="text-white font-medium">{confirmedReservation.date}</strong>
              </div>
              <div>
                <span className="text-[#757575] block">Saat:</span>
                <strong className="text-white font-medium">{confirmedReservation.time}</strong>
              </div>
              <div>
                <span className="text-[#757575] block">Qonaq sayı:</span>
                <strong className="text-white font-medium">{confirmedReservation.guests} nəfər</strong>
              </div>
              <div>
                <span className="text-[#757575] block">Əlaqə nömrəsi:</span>
                <strong className="text-white font-medium">{confirmedReservation.phone}</strong>
              </div>
              {confirmedReservation.notes && (
                <div className="col-span-2 pt-2 border-t border-[#262626]">
                  <span className="text-[#757575] block">Qeyd:</span>
                  <span className="text-[#CCCCCC]">{confirmedReservation.notes}</span>
                </div>
              )}
            </div>

            {/* Important Transparent Demo Notice */}
            <div className="p-3.5 rounded-lg bg-[#1F1911] border border-[#C5A059]/30 text-[11px] text-[#E0C078] flex items-start gap-2.5 text-left mb-6">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Demo Qeydi:</strong> Bu sistem veb tətbiqin nümayiş versiyasıdır. Real kafedə masa təyin edilməsi üçün EmilCafe administratoru ilə əlaqə saxlayın və ya real verilənlər bazası (Firebase) konfiqurasiya edildikdə avtomatik təsdiq olunacaqdır.
              </span>
            </div>

            <button
              onClick={handleResetForNewBooking}
              className="px-6 py-2.5 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
            >
              Yeni masa rezerv et
            </button>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

            <form onSubmit={handleSubmit} noValidate className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="res-fullname"
                    className="block text-xs font-medium text-[#CFCFCF] mb-2"
                  >
                    Ad və soyad <span className="text-[#C5A059]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="res-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      placeholder="Məsələn: Rəşad Əliyev"
                      className={`w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border rounded-lg placeholder-[#666666] focus:outline-none transition-colors ${
                        errors.fullName
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-[#2B2B2B] focus:border-[#C5A059]'
                      }`}
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="res-phone"
                    className="block text-xs font-medium text-[#CFCFCF] mb-2"
                  >
                    Telefon nömrəsi <span className="text-[#C5A059]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="res-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="+994 50 123 45 67"
                      className={`w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border rounded-lg placeholder-[#666666] focus:outline-none transition-colors ${
                        errors.phone
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-[#2B2B2B] focus:border-[#C5A059]'
                      }`}
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <label
                    htmlFor="res-email"
                    className="block text-xs font-medium text-[#CFCFCF] mb-2"
                  >
                    E-mail <span className="text-[#757575] text-[10px]">(İstəyə bağlı)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="res-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="nümunə@domain.az"
                      className={`w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border rounded-lg placeholder-[#666666] focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-[#2B2B2B] focus:border-[#C5A059]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Date Picker (No past dates) */}
                <div>
                  <label
                    htmlFor="res-date"
                    className="block text-xs font-medium text-[#CFCFCF] mb-2"
                  >
                    Tarix <span className="text-[#C5A059]">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-[#757575] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="res-date"
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (errors.date) setErrors({ ...errors, date: '' });
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border rounded-lg focus:outline-none transition-colors ${
                        errors.date
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-[#2B2B2B] focus:border-[#C5A059]'
                      }`}
                      required
                    />
                  </div>
                  {errors.date && (
                    <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.date}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Guests Count Selection (1 - 10) */}
              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-2">
                  Qonaqların sayı <span className="text-[#C5A059]">*</span>
                </label>
                <div
                  className="grid grid-cols-5 sm:grid-cols-10 gap-2"
                  role="radiogroup"
                  aria-label="Qonaqların sayı"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = guests === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setGuests(num)}
                        className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                          isSelected
                            ? 'bg-[#C5A059] text-[#0B0B0B] font-bold border-[#C5A059] shadow-sm'
                            : 'bg-[#0E0E0E] text-[#B0B0B0] border-[#2A2A2A] hover:border-[#404040] hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots (10:00 - 21:00) */}
              <div>
                <label className="block text-xs font-medium text-[#CFCFCF] mb-2">
                  Saat seçimi <span className="text-[#C5A059]">*</span>
                </label>
                <div
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
                  role="radiogroup"
                  aria-label="Rezervasiya saatı"
                >
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setTime(slot)}
                        className={`py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] ${
                          isSelected
                            ? 'bg-[#C5A059] text-[#0B0B0B] font-bold border-[#C5A059]'
                            : 'bg-[#0E0E0E] text-[#B0B0B0] border-[#2A2A2A] hover:border-[#404040] hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label
                  htmlFor="res-notes"
                  className="block text-xs font-medium text-[#CFCFCF] mb-2"
                >
                  Əlavə qeydlər <span className="text-[#757575] text-[10px]">(İstəyə bağlı)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#757575] absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    id="res-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pəncərə kənarı masa, ad günü təbriki və ya xüsusi istəkləriniz..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg placeholder-[#666666] focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Form Disclaimer Notice */}
              <div className="p-3 bg-[#111111] rounded-lg border border-[#222222] text-[11px] text-[#8E8E8E] flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>
                  Demo rejimində göndərilən rezervasiyalar dərhal brauzerinizin yerli yaddaşında saxlanılır və profilinizdə əks olunur.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 text-sm font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-60 rounded-lg shadow-lg hover:shadow-[#C5A059]/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0B0B] border-t-transparent rounded-full animate-spin" />
                      <span>Rezervasiya qeydə alınır...</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4" />
                      <span>Rezervasiyanı təsdiq et</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
