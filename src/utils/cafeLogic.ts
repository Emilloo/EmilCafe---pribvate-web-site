/**
 * Pure business logic and validation functions for EmilCafe
 */

export interface MenuItem {
  id: string;
  name: string;
  category: 'coffee_hot' | 'drinks_cold' | 'tea' | 'desserts' | 'snacks';
  categoryLabel: string;
  price: number;
  description: string;
  image: string;
  tags?: string[];
  isPopular?: boolean;
  calories?: string;
  volumeOrWeight?: string;
}

export interface ReservationData {
  id: string;
  referenceCode: string;
  fullName: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  favoriteIds: string[];
  role?: 'admin' | 'user';
}

/**
 * Validates Azerbaijani phone number formats:
 * Accepts formats like:
 * +994501234567, +994 50 123 45 67, 0501234567, 055 123 45 67, etc.
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Matches +994 followed by 9 digits OR 0 followed by 9 digits OR just 9 digits
  const azPhoneRegex = /^(?:\+994|0)?(50|51|55|70|77|99|10|60)\d{7}$/;
  return azPhoneRegex.test(cleaned);
}

/**
 * Validates email format if provided
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Generates an ISO date string for today in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates that the selected date is not in the past
 */
export function isDateValid(dateString: string): boolean {
  if (!dateString) return false;
  const today = getTodayDateString();
  return dateString >= today;
}

/**
 * Generates a unique, elegant reservation reference code like "EC-74928"
 */
export function generateReservationReference(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `EC-${num}`;
}

/**
 * Formats price in Azerbaijani Manat (AZN / ₼)
 */
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ₼`;
}

/**
 * Filters menu items by category and search keyword
 */
export function filterMenuItems(
  items: MenuItem[],
  selectedCategory: string,
  searchQuery: string
): MenuItem[] {
  return items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!searchQuery || searchQuery.trim() === '') return true;

    const query = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.categoryLabel.toLowerCase().includes(query)
    );
  });
}

/**
 * LocalStorage helpers for persistent demo data
 */
const STORAGE_KEYS = {
  RESERVATIONS: 'emilcafe_reservations_v1',
  USER: 'emilcafe_user_v1',
  FAVORITES: 'emilcafe_favorites_v1',
};

export function getStoredReservations(): ReservationData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReservation(reservation: ReservationData): void {
  try {
    const existing = getStoredReservations();
    const updated = [reservation, ...existing.filter((r) => r.id !== reservation.id)];
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving reservation to localStorage:', e);
  }
}

export function cancelStoredReservation(reservationId: string): ReservationData[] {
  try {
    const existing = getStoredReservations();
    const updated = existing.map((r) =>
      r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
    );
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getStoredUser(): UserAccount | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {
    console.error('Error saving user to localStorage:', e);
  }
}

export function getStoredFavorites(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleStoredFavorite(itemId: string): string[] {
  try {
    const existing = getStoredFavorites();
    const index = existing.indexOf(itemId);
    let updated: string[];
    if (index >= 0) {
      updated = existing.filter((id) => id !== itemId);
    } else {
      updated = [...existing, itemId];
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
