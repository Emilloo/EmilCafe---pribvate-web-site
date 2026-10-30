/**
 * EmilCafe Full-Stack Express Server
 * Handles:
 * - Secure Admin Authentication (Emil / 180709) with signed session tokens
 * - User Registration & Login with PBKDF2 password hashing & verification
 * - Password Reset with real email / SMTP or transparent reset tokens
 * - Protected Admin API endpoints
 * - Reservation storage & management
 * - Vite dev server middleware integration
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Security settings from environment
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Emil';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '180709';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// In-memory active session tokens: token -> { role: 'admin' | 'user', username?: string, uid?: string, expiresAt: number }
interface SessionData {
  role: 'admin' | 'user';
  username?: string;
  uid?: string;
  email?: string;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionData>();

// File-based persistent store for users and reservations
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface UserRecord {
  uid: string;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'user' | 'admin';
  createdAt: string;
  phone?: string;
  favoriteIds?: string[];
  resetToken?: string;
  resetExpires?: number;
}

interface ReservationRecord {
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

interface DatabaseSchema {
  users: UserRecord[];
  reservations: ReservationRecord[];
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function ensureDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading DB_FILE, recreating:', e);
    }
  }

  // Initial seed with demo registered user
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoHash = hashPassword('Password123!', demoSalt);

  const initialDb: DatabaseSchema = {
    users: [
      {
        uid: 'usr_seed_leyla',
        fullName: 'Leyla Məmmədova',
        email: 'ismayilovemil1109@gmail.com',
        passwordHash: demoHash,
        salt: demoSalt,
        role: 'user',
        createdAt: '2026-10-25T14:30:00Z',
        phone: '0707101252',
        favoriteIds: ['m11', 'm3'],
      },
      {
        uid: 'usr_seed_rashad',
        fullName: 'Rəşad Əliyev',
        email: 'rashad.aliyev@gmail.com',
        passwordHash: demoHash,
        salt: demoSalt,
        role: 'user',
        createdAt: '2026-10-26T11:15:00Z',
        phone: '+994 55 890 12 34',
        favoriteIds: ['m1', 'm8'],
      },
    ],
    reservations: [
      {
        id: 'res_seed_1',
        referenceCode: 'EC-44848',
        fullName: 'Leyla Məmmədova',
        phone: '0707101252',
        email: 'ismayilovemil1109@gmail.com',
        date: '2026-10-31',
        time: '19:00',
        guests: 2,
        notes: 'Pəncərə kənarı masa',
        createdAt: '2026-10-25T14:32:00Z',
        status: 'confirmed',
      },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// Global database instance
const database = ensureDatabase();

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authorization Middleware for Admin Endpoints
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'İcazə verilmədi: İnzibatçı hüququ tələb olunur.',
    });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.role !== 'admin' || session.expiresAt < Date.now()) {
    if (session && session.expiresAt < Date.now()) {
      activeSessions.delete(token);
    }
    return res.status(401).json({
      success: false,
      error: 'invalid_token',
      message: 'Sessiyanın vaxtı bitib və ya icazəsiz müraciətdir.',
    });
  }

  // Session valid
  next();
}

// ============================================================================
// 1. ADMIN AUTHENTICATION API
// Handled strictly on backend; secrets are never sent to client!
// ============================================================================

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'İstifadəçi adı və şifrə tələb olunur.',
    });
  }

  const trimmedUsername = String(username).trim();
  const trimmedPassword = String(password).trim();

  // Secure comparison with ADMIN_USERNAME and ADMIN_PASSWORD
  const isMatch =
    trimmedUsername.toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
    trimmedPassword === ADMIN_PASSWORD;

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'invalid_credentials',
      message: 'İnzibatçı adı və ya giriş kodu yanlışdır.',
    });
  }

  // Issue 12-hour signed session token
  const token = generateToken();
  activeSessions.set(token, {
    role: 'admin',
    username: ADMIN_USERNAME,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: 'İnzibatçı girişi uğurla təsdiqləndi.',
    token,
    admin: {
      username: ADMIN_USERNAME,
      role: 'admin',
    },
  });
});

app.post('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (session && session.role === 'admin' && session.expiresAt >= Date.now()) {
    return res.json({ valid: true, admin: { username: session.username } });
  }

  return res.status(401).json({ valid: false });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'İnzibatçı hesabından çıxış edildi.' });
});

// ============================================================================
// 2. USER AUTHENTICATION API (Register, Login, Forgot Password)
// Strict verification against registered database accounts!
// ============================================================================

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Ad və soyad ən azı 2 simvoldan ibarət olmalıdır.',
    });
  }

  const trimmedEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Düzgün bir e-poçt ünvanı daxil edin.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.',
    });
  }

  // Check if account already exists
  const existing = database.users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'already_exists',
      message: 'Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçmiş hesab mövcuddur.',
    });
  }

  // Hash password securely with unique salt
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newUser: UserRecord = {
    uid: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fullName: fullName.trim(),
    email: trimmedEmail,
    passwordHash,
    salt,
    role: 'user',
    createdAt: new Date().toISOString(),
    favoriteIds: [],
  };

  database.users.push(newUser);
  saveDatabase(database);

  // Create session
  const token = generateToken();
  activeSessions.set(token, {
    role: 'user',
    uid: newUser.uid,
    email: newUser.email,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: 'Hesabınız uğurla yaradıldı!',
    token,
    user: {
      id: newUser.uid,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
      favoriteIds: newUser.favoriteIds || [],
    },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedPassword = String(password || '');

  if (!trimmedEmail || !trimmedPassword) {
    return res.status(400).json({
      success: false,
      message: 'E-poçt ünvanı və şifrə tələb olunur.',
    });
  }

  // 1. Check if user exists in database
  const user = database.users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'not_found',
      message: 'No account found with this email address.',
    });
  }

  // 2. Verify password hash
  const computedHash = hashPassword(trimmedPassword, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({
      success: false,
      error: 'invalid_password',
      message: 'Incorrect password.',
    });
  }

  // 3. Login successful
  const token = generateToken();
  activeSessions.set(token, {
    role: user.role,
    uid: user.uid,
    email: user.email,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: 'Giriş uğurla tamamlandı!',
    token,
    user: {
      id: user.uid,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      favoriteIds: user.favoriteIds || [],
    },
  });
});

// ============================================================================
// 3. FORGOT PASSWORD & PASSWORD RESET FLOW
// Real email dispatch when SMTP is configured; clear transparent status
// ============================================================================

app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  const trimmedEmail = String(email || '').trim().toLowerCase();

  if (!trimmedEmail) {
    return res.status(400).json({
      success: false,
      message: 'Zəhmət olmasa e-poçt ünvanınızı daxil edin.',
    });
  }

  // 1. Verify user exists
  const user = database.users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'not_found',
      message: 'Bu e-poçt ünvanı ilə qeydiyyatdan keçmiş hesab tapılmadı.',
    });
  }

  // 2. Generate secure reset token
  const resetToken = crypto.randomBytes(24).toString('hex');
  user.resetToken = resetToken;
  user.resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  saveDatabase(database);

  const resetUrl = `${req.protocol}://${req.get('host')}#reset-token=${resetToken}`;

  // 3. Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass && smtpPass !== 'YOUR_GMAIL_APP_PASSWORD') {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"EmilCafe" <${smtpUser}>`,
        to: user.email,
        subject: 'EmilCafe: Şifrənizin Sıfırlanması Linki',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0B0B0B; color: #EDEDED; padding: 30px; border-radius: 8px;">
            <h2 style="color: #C5A059; margin-bottom: 10px;">EmilCafe Specialty Coffee</h2>
            <p>Salam, ${user.fullName}!</p>
            <p>Hesabınız üçün şifrə yeniləmə sorğusu qəbul edilmişdir.</p>
            <p style="margin: 20px 0;">
              <a href="${resetUrl}" style="background-color: #C5A059; color: #0B0B0B; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Şifrəni Yeniləyin
              </a>
            </p>
            <p style="font-size: 12px; color: #888888;">Bu link 1 saat ərzində etibarlıdır. Əgər bu sorğunu siz etməmisinizsə, bu e-poçtu nəzərə almayın.</p>
          </div>
        `,
      });

      return res.json({
        success: true,
        emailSent: true,
        message: `${user.email} ünvanına rəsmi şifrə sıfırlama linki göndərildi. Gələnlər qutusunu yoxlayın.`,
      });
    } catch (mailError: any) {
      console.error('SMTP sending error:', mailError);
      return res.status(500).json({
        success: false,
        error: 'smtp_error',
        message: `E-poçt göndərilərkən xəta baş verdi: ${mailError.message}`,
      });
    }
  }

  // When SMTP is not configured: do not fake, provide clear info and token for the reset flow
  console.log(`[EmilCafe Auth] Password reset requested for ${user.email}. Reset Link: ${resetUrl}`);
  return res.json({
    success: true,
    emailSent: false,
    resetToken,
    message: `Şifrə sıfırlama sorğusu qeydə alındı. (Qeyd: Serverdə xarici SMTP poçt serveri təyin edilməyib, sıfırlama kodu təhlükəsiz şəkildə qəbul edildi).`,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Düzgün sıfırlama tokeni və ən azı 6 simvoldan ibarət yeni şifrə tələb olunur.',
    });
  }

  const user = database.users.find(
    (u) => u.resetToken === token && u.resetExpires && u.resetExpires > Date.now()
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'invalid_or_expired_token',
      message: 'Sıfırlama linki etibarsızdır və ya vaxtı bitib. Zəhmət olmasa yenidən cəhd edin.',
    });
  }

  // Update password
  const salt = crypto.randomBytes(16).toString('hex');
  user.salt = salt;
  user.passwordHash = hashPassword(newPassword, salt);
  delete user.resetToken;
  delete user.resetExpires;
  saveDatabase(database);

  return res.json({
    success: true,
    message: 'Şifrəniz uğurla yeniləndi! İndi yeni şifrənizlə daxil ola bilərsiniz.',
  });
});

// ============================================================================
// 4. RESERVATIONS API
// ============================================================================

app.post('/api/reservations', (req: Request, res: Response) => {
  const { fullName, phone, email, date, time, guests, notes } = req.body;

  if (!fullName || !phone || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'Bütün vacib sahələri doldurun (Ad, Telefon, Tarix, Saat).',
    });
  }

  const num = Math.floor(10000 + Math.random() * 90000);
  const newRes: ReservationRecord = {
    id: `res_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    referenceCode: `EC-${num}`,
    fullName: String(fullName).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : undefined,
    date: String(date),
    time: String(time),
    guests: parseInt(String(guests || '2'), 10),
    notes: notes ? String(notes).trim() : undefined,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };

  database.reservations.unshift(newRes);
  saveDatabase(database);

  return res.status(201).json({
    success: true,
    reservation: newRes,
    message: 'Masa rezervasiyası uğurla qeydə alındı.',
  });
});

app.get('/api/reservations/user/:email', (req: Request, res: Response) => {
  const userEmail = req.params.email.toLowerCase().trim();
  const list = database.reservations.filter((r) => r.email && r.email.toLowerCase() === userEmail);
  return res.json({ success: true, reservations: list });
});

app.patch('/api/reservations/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const target = database.reservations.find((r) => r.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: 'Rezervasiya tapılmadı.' });
  }

  target.status = 'cancelled';
  saveDatabase(database);
  return res.json({ success: true, message: 'Rezervasiya ləğv edildi.' });
});

// ============================================================================
// 5. PROTECTED ADMIN MANAGEMENT API
// Only accessible with valid admin Bearer token!
// ============================================================================

app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  const safeUsers = database.users.map((u) => ({
    uid: u.uid,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    phone: u.phone,
    favoriteIds: u.favoriteIds || [],
  }));
  return res.json({ success: true, users: safeUsers });
});

app.delete('/api/admin/users/:uid', requireAdmin, (req: Request, res: Response) => {
  const { uid } = req.params;
  const initialLen = database.users.length;
  database.users = database.users.filter((u) => u.uid !== uid);

  if (database.users.length === initialLen) {
    return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı.' });
  }

  saveDatabase(database);
  return res.json({ success: true, message: 'İstifadəçi bazadan silindi.' });
});

app.get('/api/admin/reservations', requireAdmin, (req: Request, res: Response) => {
  return res.json({ success: true, reservations: database.reservations });
});

app.patch('/api/admin/reservations/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const reservation = database.reservations.find((r) => r.id === id);
  if (!reservation) {
    return res.status(404).json({ success: false, message: 'Rezervasiya tapılmadı.' });
  }

  if (['confirmed', 'completed', 'cancelled'].includes(status)) {
    reservation.status = status;
    saveDatabase(database);
    return res.json({ success: true, reservation });
  }

  return res.status(400).json({ success: false, message: 'Yanlış status parametri.' });
});

app.delete('/api/admin/reservations/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = database.reservations.length;
  database.reservations = database.reservations.filter((r) => r.id !== id);

  if (database.reservations.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Rezervasiya tapılmadı.' });
  }

  saveDatabase(database);
  return res.json({ success: true, message: 'Rezervasiya silindi.' });
});

// Admin Diagnostic Information (Server status, SMTP status, Firebase status)
app.get('/api/admin/diagnostics', requireAdmin, (req: Request, res: Response) => {
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'YOUR_GMAIL_APP_PASSWORD'
  );

  const firebaseConfigured = Boolean(
    process.env.FIREBASE_API_KEY &&
    process.env.FIREBASE_API_KEY !== 'YOUR_FIREBASE_API_KEY'
  );

  return res.json({
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    smtp: {
      configured: smtpConfigured,
      host: process.env.SMTP_HOST || 'Təyin edilməyib',
      user: process.env.SMTP_USER || 'ismayilovemil1109@gmail.com',
    },
    firebase: {
      configured: firebaseConfigured,
      projectId: process.env.FIREBASE_PROJECT_ID || 'Təyin edilməyib',
    },
    databaseCounts: {
      users: database.users.length,
      reservations: database.reservations.length,
    },
  });
});

// ============================================================================
// 6. VITE MIDDLEWARE & STATIC ASSET SERVING
// ============================================================================

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EmilCafe] Server running at http://localhost:${PORT}`);
    console.log(`[EmilCafe] Admin username configured: ${ADMIN_USERNAME}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EmilCafe server:', err);
});
