/**
 * Firebase Modular SDK v10+ Integration for EmilCafe
 *
 * Provides Firebase Authentication and Firestore Database operations.
 * If credentials are not yet configured or in demo mode, gracefully
 * provides an operational fallback with local persistence.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';

// ============================================================================
// ⚠️ FIREBASE CONFIGURATION PLACEHOLDER ⚠️
// Paste your Firebase Project credentials from Firebase Console below:
// (Project Settings -> General -> Your apps -> Web app -> SDK setup and configuration)
// ============================================================================
export const defaultFirebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
// ============================================================================

const CONFIG_STORAGE_KEY = 'emilcafe_custom_firebase_config_v1';

export function getActiveFirebaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.apiKey !== "YOUR_FIREBASE_API_KEY") {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Check Vite environment variables if available
  if (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_FIREBASE_API_KEY"
  ) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "emilcafe.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "emilcafe",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "emilcafe.appspot.com",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
    };
  }

  return defaultFirebaseConfig;
}

export function saveCustomFirebaseConfig(config: typeof defaultFirebaseConfig) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  } catch (err) {
    console.error('Failed to save firebase config to storage', err);
  }
}

export function isFirebaseConfigured(): boolean {
  const cfg = getActiveFirebaseConfig();
  return (
    Boolean(cfg.apiKey) &&
    cfg.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    !cfg.apiKey.includes("YOUR_")
  );
}

// Initialize Firebase App instance
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  const config = getActiveFirebaseConfig();
  if (isFirebaseConfigured()) {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('Firebase initialization with configured keys failed:', error);
}

export { app, auth, db };

/**
 * Maps Firebase auth error codes to friendly Azerbaijani messages
 */
export function translateFirebaseError(error: any): string {
  if (!error) return 'Bilinməyən xəta baş verdi.';
  const msg = error.message || '';
  if (msg.includes('No account found with this email address')) {
    return 'No account found with this email address.';
  }
  if (msg.includes('Incorrect password')) {
    return 'Incorrect password.';
  }
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Daxil edilən e-poçt ünvanının formatı düzgün deyil.';
    case 'auth/user-disabled':
      return 'Bu istifadəçi hesabı inzibatçı tərəfindən deaktiv edilib.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'Bu e-poçt ünvanı artıq başqa bir hesab üçün istifadə olunub.';
    case 'auth/weak-password':
      return 'Şifrə çox zəifdir. Ən azı 6 simvoldan ibarət olmalıdır.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantısı xətası baş verdi. Bağlantınızı yoxlayın.';
    case 'auth/too-many-requests':
      return 'Çox sayda uğursuz cəhd edildi. Zəhmət olmasa bir az sonra yenidən cəhd edin.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Firebase API açarı düzgün deyil. Tənzimləmələri yoxlayın.';
    default:
      return msg || 'Gözlənilməz xəta baş verdi.';
  }
}

// ----------------------------------------------------------------------------
// Firestore Database & Auth Service Operations
// ----------------------------------------------------------------------------

export interface FirestoreUserData {
  uid: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
  phone?: string;
  favoriteIds?: string[];
}

export interface FirestoreReservationData {
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
  status: 'confirmed' | 'cancelled' | 'completed';
}

/**
 * Register a user via Backend API and optionally Firebase Auth/Firestore
 */
export async function registerWithFirebase(
  fullName: string,
  email: string,
  pass: string
): Promise<FirestoreUserData> {
  // 1. Register with backend API
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password: pass }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Qeydiyyat zamanı xəta baş verdi.');
  }

  // 2. If live Firebase is configured, also save to Firebase Auth / Firestore
  const currentAuth = auth;
  const currentDb = db;
  if (currentAuth && currentDb && isFirebaseConfigured()) {
    try {
      const cred = await createUserWithEmailAndPassword(currentAuth, email.trim(), pass);
      const userData: FirestoreUserData = {
        uid: cred.user.uid,
        email: cred.user.email || email.trim(),
        fullName: fullName.trim(),
        role: 'user',
        createdAt: new Date().toISOString(),
        favoriteIds: [],
      };
      await setDoc(doc(currentDb, 'users', cred.user.uid), userData);
    } catch (e) {
      console.warn('Firebase registration sync:', e);
    }
  }

  const userDoc: FirestoreUserData = {
    uid: data.user.id || data.user.uid,
    email: data.user.email,
    fullName: data.user.fullName,
    role: data.user.role || 'user',
    createdAt: data.user.createdAt || new Date().toISOString(),
    favoriteIds: [],
  };
  saveLocalUser(userDoc);
  return userDoc;
}

/**
 * Login user: verifies strictly against backend API or Firebase Auth.
 * Never creates an account automatically.
 */
export async function loginWithFirebase(
  email: string,
  pass: string
): Promise<FirestoreUserData> {
  const currentAuth = auth;
  const currentDb = db;

  // 1. If live Firebase is configured, authenticate via Firebase SDK
  if (currentAuth && currentDb && isFirebaseConfigured()) {
    const cred = await signInWithEmailAndPassword(currentAuth, email.trim(), pass);
    let userData: FirestoreUserData | null = null;
    try {
      const snap = await getDoc(doc(currentDb, 'users', cred.user.uid));
      if (snap.exists()) {
        userData = snap.data() as FirestoreUserData;
      }
    } catch (e) {
      console.warn('Could not read user from Firestore:', e);
    }

    if (!userData) {
      userData = {
        uid: cred.user.uid,
        email: cred.user.email || email.trim(),
        fullName: email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        favoriteIds: [],
      };
    }
    return userData;
  }

  // 2. Strict backend verification
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password: pass }),
  });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('No account found with this email address.');
    }
    if (res.status === 401) {
      throw new Error('Incorrect password.');
    }
    throw new Error(data.error || 'Giriş zamanı xəta baş verdi.');
  }

  const userDoc: FirestoreUserData = {
    uid: data.user.id || data.user.uid,
    email: data.user.email,
    fullName: data.user.fullName,
    role: data.user.role || 'user',
    createdAt: data.user.createdAt || new Date().toISOString(),
    favoriteIds: [],
  };
  return userDoc;
}

/**
 * Send password reset email via Backend / Firebase.
 * Checks account existence and never shows simulated fake success.
 */
export async function sendFirebasePasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  emailSent?: boolean;
  resetToken?: string;
}> {
  const currentAuth = auth;
  if (currentAuth && isFirebaseConfigured()) {
    await sendPasswordResetEmail(currentAuth, email.trim());
    return {
      success: true,
      message: 'Şifrə sıfırlama linki e-poçt ünvanınıza göndərildi.',
      emailSent: true,
    };
  }

  // Call backend forgot-password API
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('No account found with this email address.');
    }
    throw new Error(data.error || 'Şifrə sıfırlama tələbi uğursuz oldu.');
  }

  return data;
}

/**
 * Sign out current Firebase user
 */
export async function logoutFromFirebase(): Promise<void> {
  const currentAuth = auth;
  if (currentAuth && isFirebaseConfigured()) {
    try {
      await signOut(currentAuth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
  }
}

// ----------------------------------------------------------------------------
// Firestore Admin Collection Management
// ----------------------------------------------------------------------------

export async function fetchAllUsers(): Promise<FirestoreUserData[]> {
  const token = localStorage.getItem('emilcafe_admin_token');
  if (token) {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) {
          return data.users.map((u: any) => ({
            uid: u.id || u.uid,
            email: u.email,
            fullName: u.fullName,
            role: u.role || 'user',
            createdAt: u.createdAt || new Date().toISOString(),
            phone: u.phone,
            favoriteIds: u.favoriteIds || [],
          }));
        }
      }
    } catch (e) {
      console.warn('Backend admin users fetch error:', e);
    }
  }

  const currentDb = db;
  if (currentDb && isFirebaseConfigured()) {
    try {
      const q = collection(currentDb, 'users');
      const snap = await getDocs(q);
      const list: FirestoreUserData[] = [];
      snap.forEach((d) => {
        list.push(d.data() as FirestoreUserData);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn('Error reading users collection from Firestore:', err);
    }
  }
  return getLocalUsers();
}

export async function deleteUserRecord(uid: string): Promise<void> {
  const token = localStorage.getItem('emilcafe_admin_token');
  if (token) {
    try {
      await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.warn('Backend admin delete user error:', e);
    }
  }

  const currentDb = db;
  if (currentDb && isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(currentDb, 'users', uid));
    } catch (err) {
      console.warn('Error deleting user from Firestore:', err);
    }
  }
  deleteLocalUser(uid);
}

export async function fetchAllReservations(): Promise<FirestoreReservationData[]> {
  const token = localStorage.getItem('emilcafe_admin_token');
  if (token) {
    try {
      const res = await fetch('/api/admin/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reservations)) {
          return data.reservations;
        }
      }
    } catch (e) {
      console.warn('Backend admin reservations fetch error:', e);
    }
  }

  const currentDb = db;
  if (currentDb && isFirebaseConfigured()) {
    try {
      const q = collection(currentDb, 'reservations');
      const snap = await getDocs(q);
      const list: FirestoreReservationData[] = [];
      snap.forEach((d) => {
        list.push(d.data() as FirestoreReservationData);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn('Error reading reservations from Firestore:', err);
    }
  }
  return getLocalReservations();
}

export async function saveReservationToFirestore(res: FirestoreReservationData): Promise<void> {
  try {
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(res),
    });
  } catch (e) {
    console.warn('Backend save reservation error:', e);
  }

  const currentDb = db;
  if (currentDb && isFirebaseConfigured()) {
    try {
      await setDoc(doc(currentDb, 'reservations', res.id), res);
    } catch (err) {
      console.warn('Error saving reservation to Firestore:', err);
    }
  }
  saveLocalReservation(res);
}

export async function updateReservationStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> {
  const token = localStorage.getItem('emilcafe_admin_token');
  if (token) {
    try {
      await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.warn('Backend update reservation status error:', e);
    }
  }

  const currentDb = db;
  if (currentDb && isFirebaseConfigured()) {
    try {
      await updateDoc(doc(currentDb, 'reservations', id), { status });
    } catch (err) {
      console.warn('Error updating reservation in Firestore:', err);
    }
  }
  updateLocalReservationStatus(id, status);
}

export async function deleteReservationFromFirestore(id: string): Promise<void> {
  const token = localStorage.getItem('emilcafe_admin_token');
  if (token) {
    try {
      await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.warn('Backend delete reservation error:', e);
    }
  }

  const currentDb = db;
  if (currentDb && isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(currentDb, 'reservations', id));
    } catch (err) {
      console.warn('Error deleting reservation from Firestore:', err);
    }
  }
  deleteLocalReservation(id);
}

// ----------------------------------------------------------------------------
// Local Storage sync helpers for seamless fallback
// ----------------------------------------------------------------------------
const USERS_STORAGE_KEY = 'emilcafe_firestore_users_v1';
const RESERVATIONS_STORAGE_KEY = 'emilcafe_reservations_v1';

function getLocalUsers(): FirestoreUserData[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // Seed initial demo users if empty
    const seed: FirestoreUserData[] = [
      {
        uid: 'usr_demo_1',
        email: 'leyla.mammadova@gmail.com',
        fullName: 'Leyla Məmmədova',
        role: 'user',
        createdAt: '2026-10-25T14:30:00Z',
        phone: '+994 50 234 56 78',
        favoriteIds: ['m11', 'm3'],
      },
      {
        uid: 'usr_demo_2',
        email: 'rashad.aliyev@gmail.com',
        fullName: 'Rəşad Əliyev',
        role: 'user',
        createdAt: '2026-10-26T11:15:00Z',
        phone: '+994 55 890 12 34',
        favoriteIds: ['m1', 'm8'],
      },
      {
        uid: 'usr_demo_3',
        email: 'gunel.huseyn@gmail.com',
        fullName: 'Günel Hüseynli',
        role: 'user',
        createdAt: '2026-10-28T09:45:00Z',
        phone: '+994 70 345 67 89',
        favoriteIds: ['m9', 'm12'],
      },
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    return [];
  }
}

function saveLocalUser(user: FirestoreUserData): void {
  try {
    const list = getLocalUsers();
    const filtered = list.filter((u) => u.uid !== user.uid && u.email.toLowerCase() !== user.email.toLowerCase());
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([user, ...filtered]));
  } catch (e) {
    console.error('Error saving user locally:', e);
  }
}

function deleteLocalUser(uid: string): void {
  try {
    const list = getLocalUsers().filter((u) => u.uid !== uid);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error deleting user locally:', e);
  }
}

function getLocalReservations(): FirestoreReservationData[] {
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // Seed with initial booking
    const seed: FirestoreReservationData[] = [
      {
        id: 'res_seed_1',
        referenceCode: 'EC-44848',
        fullName: 'Leyla Məmmədova',
        phone: '+994 50 234 56 78',
        email: 'leyla.mammadova@gmail.com',
        date: '2026-10-30',
        time: '19:00',
        guests: 2,
        notes: 'Pəncərə kənarı masa xahiş olunur.',
        createdAt: '2026-10-25T14:32:00Z',
        status: 'confirmed',
      },
      {
        id: 'res_seed_2',
        referenceCode: 'EC-78210',
        fullName: 'Rəşad Əliyev',
        phone: '+994 55 890 12 34',
        email: 'rashad.aliyev@gmail.com',
        date: '2026-10-31',
        time: '20:00',
        guests: 4,
        notes: 'İş görüşməsi üçün sakit künc.',
        createdAt: '2026-10-26T11:20:00Z',
        status: 'confirmed',
      },
    ];
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch {
    return [];
  }
}

function saveLocalReservation(res: FirestoreReservationData): void {
  try {
    const list = getLocalReservations();
    const filtered = list.filter((r) => r.id !== res.id);
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify([res, ...filtered]));
  } catch (e) {
    console.error('Error saving local reservation:', e);
  }
}

function updateLocalReservationStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed'): void {
  try {
    const list = getLocalReservations().map((r) => (r.id === id ? { ...r, status } : r));
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error updating local reservation:', e);
  }
}

function deleteLocalReservation(id: string): void {
  try {
    const list = getLocalReservations().filter((r) => r.id !== id);
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error deleting local reservation:', e);
  }
}
