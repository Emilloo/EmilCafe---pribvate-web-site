import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Coffee,
  Database,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  ExternalLink,
  LogOut,
  RefreshCw,
  Edit2,
  Key,
  Check,
  AlertTriangle,
  Flame,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';
import {
  FirestoreUserData,
  FirestoreReservationData,
  fetchAllUsers,
  deleteUserRecord,
  fetchAllReservations,
  updateReservationStatus,
  deleteReservationFromFirestore,
  isFirebaseConfigured,
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
} from '../utils/firebase';
import { MenuItem, formatCurrency } from '../utils/cafeLogic';
import { MENU_ITEMS, MENU_CATEGORIES } from '../data/cafeData';

interface AdminPanelProps {
  onReturnToSite: () => void;
  onLogout: () => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onReturnToSite,
  onLogout,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reservations' | 'menu' | 'firebase'>('overview');

  // Data states
  const [users, setUsers] = useState<FirestoreUserData[]>([]);
  const [reservations, setReservations] = useState<FirestoreReservationData[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>(MENU_ITEMS);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [resSearch, setResSearch] = useState('');
  const [resFilter, setResFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Menu Add Modal state
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState<'coffee_hot' | 'drinks_cold' | 'tea' | 'desserts' | 'snacks'>('coffee_hot');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuDesc, setNewMenuDesc] = useState('');
  const [newMenuImage, setNewMenuImage] = useState('');

  // Firebase Config Form state
  const currentConfig = getActiveFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedReservations] = await Promise.all([
        fetchAllUsers(),
        fetchAllReservations(),
      ]);
      setUsers(fetchedUsers);
      setReservations(fetchedReservations);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (uid: string, userName: string) => {
    if (window.confirm(`"${userName}" istifadəçisini silmək istədiyinizə əminsiniz?`)) {
      try {
        await deleteUserRecord(uid);
        setUsers((prev) => prev.filter((u) => u.uid !== uid));
        onNotify('success', `İstifadəçi "${userName}" uğurla silindi.`);
      } catch {
        onNotify('error', 'İstifadəçi silinərkən xəta baş verdi.');
      }
    }
  };

  // Handle reservation status update
  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await updateReservationStatus(id, status);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      onNotify('success', `Rezervasiya statusu yeniləndi: ${status}`);
    } catch {
      onNotify('error', 'Status yenilənərkən xəta baş verdi.');
    }
  };

  // Handle reservation delete
  const handleDeleteReservation = async (id: string, refCode: string) => {
    if (window.confirm(`"${refCode}" nömrəli rezervasiyanı silmək istəyirsiniz?`)) {
      try {
        await deleteReservationFromFirestore(id);
        setReservations((prev) => prev.filter((r) => r.id !== id));
        onNotify('success', `Rezervasiya (${refCode}) silindi.`);
      } catch {
        onNotify('error', 'Rezervasiya silinərkən xəta baş verdi.');
      }
    }
  };

  // Handle add menu item
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim() || !newMenuPrice.trim()) {
      onNotify('error', 'Məhsulun adını və qiymətini daxil edin.');
      return;
    }
    const catObj = MENU_CATEGORIES.find((c) => c.id === newMenuCategory);
    const newItem: MenuItem = {
      id: `menu_${Date.now()}`,
      name: newMenuName.trim(),
      category: newMenuCategory,
      categoryLabel: catObj ? catObj.label : 'Xüsusi',
      price: parseFloat(newMenuPrice) || 5.0,
      description: newMenuDesc.trim() || 'EmilCafe xüsusi resepti ilə hazırlanır.',
      image: newMenuImage.trim() || 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
      tags: ['Yeni', 'Özəl'],
    };

    setMenuList((prev) => [newItem, ...prev]);
    setShowAddMenuModal(false);
    setNewMenuName('');
    setNewMenuPrice('');
    setNewMenuDesc('');
    setNewMenuImage('');
    onNotify('success', `Yeni məhsul "${newItem.name}" menyuya əlavə edildi.`);
  };

  // Handle menu item delete
  const handleDeleteMenuItem = (id: string, name: string) => {
    if (window.confirm(`"${name}" məhsulunu menyudan çıxarmaq istəyirsiniz?`)) {
      setMenuList((prev) => prev.filter((m) => m.id !== id));
      onNotify('info', `Məhsul "${name}" menyudan silindi.`);
    }
  };

  // Handle save custom Firebase config
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      onNotify('error', 'Firebase API açarı boş ola bilməz.');
      return;
    }
    saveCustomFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    });
    onNotify('success', 'Firebase konfiqurasiyası yeniləndi! Səhifə yenidən yüklənir...');
  };

  // Filtered queries
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const filteredReservations = reservations.filter((r) => {
    const matchesFilter = resFilter === 'all' || r.status === resFilter;
    if (!matchesFilter) return false;
    const q = resSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      r.referenceCode.toLowerCase().includes(q) ||
      r.fullName.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  });

  const isConfigured = isFirebaseConfigured();

  return (
    <div className="min-h-screen bg-[#090909] text-[#EDEDED] font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#0E0E0E]/95 backdrop-blur-md border-b border-[#242424] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToSite}
            className="flex items-center gap-1.5 text-xs text-[#A0A0A0] hover:text-white px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#2B2B2B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
            aria-label="Veb-sayta qayıt"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Veb-sayta qayıt</span>
          </button>

          <div className="flex items-center gap-2 border-l border-[#262626] pl-3">
            <div className="w-7 h-7 rounded-md bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#E0C078]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold text-white tracking-wide">
                EmilCafe <span className="text-[#E0C078]">Admin Panel</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Firebase vs Demo indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isConfigured
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                : 'bg-amber-950/40 text-[#E0C078] border-amber-800/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isConfigured ? 'Firebase Aktivdir' : 'Firestore Demo Rejimi'}</span>
          </div>

          {/* Admin identifier */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#C5A059] bg-[#141414] px-3 py-1.5 rounded-lg border border-[#262626]">
            <span>İnzibatçı: <strong>Emil</strong></span>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('emilcafe_admin_token');
              onLogout();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-[#161212] hover:bg-[#201515] border border-rose-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çıxış</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#222222] pb-3 mb-8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#C5A059] text-[#0B0B0B] font-semibold'
                : 'text-[#9E9E9E] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>İcmal & Statistika</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#C5A059] text-[#0B0B0B] font-semibold'
                : 'text-[#9E9E9E] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>İstifadəçilər ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reservations'
                ? 'bg-[#C5A059] text-[#0B0B0B] font-semibold'
                : 'text-[#9E9E9E] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Rezervasiyalar ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-[#C5A059] text-[#0B0B0B] font-semibold'
                : 'text-[#9E9E9E] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Menyu İdarəetməsi ({menuList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'firebase'
                ? 'bg-[#C5A059] text-[#0B0B0B] font-semibold'
                : 'text-[#9E9E9E] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Firebase Tənzimləmələri</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#121212] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#8E8E8E] uppercase tracking-wider">İstifadəçilər</span>
                  <div className="w-8 h-8 rounded-lg bg-[#1B1B1B] text-[#C5A059] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-3xl font-semibold text-white mb-1">
                  {users.length}
                </div>
                <p className="text-[11px] text-[#A0A0A0]">Firestore `users` kolleksiyasında</p>
              </div>

              <div className="bg-[#121212] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#8E8E8E] uppercase tracking-wider">Masa Rezervasiyaları</span>
                  <div className="w-8 h-8 rounded-lg bg-[#1B1B1B] text-[#E0C078] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-3xl font-semibold text-white mb-1">
                  {reservations.length}
                </div>
                <p className="text-[11px] text-[#A0A0A0]">
                  {reservations.filter((r) => r.status === 'confirmed').length} aktiv təsdiqlənmiş
                </p>
              </div>

              <div className="bg-[#121212] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#8E8E8E] uppercase tracking-wider">Menyu Çeşidləri</span>
                  <div className="w-8 h-8 rounded-lg bg-[#1B1B1B] text-[#C5A059] flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-3xl font-semibold text-white mb-1">
                  {menuList.length}
                </div>
                <p className="text-[11px] text-[#A0A0A0]">İsti qəhvə, soyuq içkilər, desertlər</p>
              </div>

              <div className="bg-[#121212] border border-[#242424] rounded-xl p-5 hover:border-[#C5A059]/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#8E8E8E] uppercase tracking-wider">Verilənlər Bazası</span>
                  <div className="w-8 h-8 rounded-lg bg-[#1B1B1B] text-[#E0C078] flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif text-xl font-semibold text-white mb-1 truncate">
                  {isConfigured ? 'Firebase v10+' : 'Lokal Fallback'}
                </div>
                <p className="text-[11px] text-[#A0A0A0]">
                  {isConfigured ? 'Cloud Firestore qoşulub' : 'Açarları daxil edin'}
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Reservations */}
              <div className="bg-[#121212] border border-[#242424] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C5A059]" />
                    <span>Son Rezervasiyalar</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="text-xs text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    <span>Hamısına bax</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {reservations.length === 0 ? (
                  <p className="text-xs text-[#808080] py-6 text-center">Hələ heç bir rezervasiya yoxdur.</p>
                ) : (
                  <div className="space-y-3">
                    {reservations.slice(0, 4).map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#E0C078]">{res.referenceCode}</span>
                            <span className="text-white font-medium">{res.fullName}</span>
                          </div>
                          <span className="text-[11px] text-[#8E8E8E] mt-0.5 block">
                            {res.date} saat {res.time} · {res.guests} nəfər
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                              : res.status === 'completed'
                              ? 'bg-blue-950/60 text-blue-400 border border-blue-900/40'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {res.status === 'confirmed' ? 'Təsdiqləndi' : res.status === 'completed' ? 'Tamamlandı' : 'Ləğv'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Users */}
              <div className="bg-[#121212] border border-[#242424] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C5A059]" />
                    <span>Qeydiyyatdan Keçmiş İstifadəçilər</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    <span>Hamısına bax</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {users.length === 0 ? (
                  <p className="text-xs text-[#808080] py-6 text-center">İstifadəçi tapılmadı.</p>
                ) : (
                  <div className="space-y-3">
                    {users.slice(0, 4).map((u) => (
                      <div
                        key={u.uid}
                        className="p-3 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#202020] border border-[#333333] flex items-center justify-center text-[#E0C078] font-serif font-bold">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{u.fullName}</div>
                            <span className="text-[11px] text-[#8E8E8E]">{u.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-[#141414] text-[#C5A059] px-2 py-0.5 rounded border border-[#2A2A2A]">
                          {u.role === 'admin' ? 'İnzibatçı' : 'İstifadəçi'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT (`users` collection) */}
        {activeTab === 'users' && (
          <div className="bg-[#121212] border border-[#242424] rounded-xl p-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-2xl font-normal text-white">İstifadəçilər Kolleksiyası</h3>
                <p className="text-xs text-[#8E8E8E]">Firestore `users` sənədlərinin siyahısı və idarə edilməsi</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#757575] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Ad və ya e-poçt ilə axtarış..."
                    className="w-full pl-9 pr-4 py-2 text-xs text-white bg-[#181818] border border-[#2B2B2B] rounded-lg focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <button
                  onClick={loadAllData}
                  className="p-2 text-[#A0A0A0] hover:text-white bg-[#181818] border border-[#2B2B2B] rounded-lg transition-colors"
                  title="Məlumatları yenilə"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#CCCCCC]">
                <thead className="bg-[#181818] text-[#8E8E8E] uppercase tracking-wider text-[10px] border-b border-[#282828]">
                  <tr>
                    <th className="px-4 py-3">İstifadəçi</th>
                    <th className="px-4 py-3">E-poçt</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Qeydiyyat Tarixi</th>
                    <th className="px-4 py-3 text-right">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#707070]">
                        İstifadəçi tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-[#161616] transition-colors">
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#202020] text-[#E0C078] flex items-center justify-center font-serif text-xs">
                            {u.fullName.charAt(0)}
                          </div>
                          <span>{u.fullName}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#B0B0B0]">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-[#C5A059]/20 text-[#E0C078] border border-[#C5A059]/40'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {u.role === 'admin' ? 'İnzibatçı' : 'İstifadəçi'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#8E8E8E]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('az-AZ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.uid, u.fullName)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                            title="İstifadəçini sil"
                            aria-label={`${u.fullName} istifadəçisini sil`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RESERVATIONS MANAGEMENT (`reservations` collection) */}
        {activeTab === 'reservations' && (
          <div className="bg-[#121212] border border-[#242424] rounded-xl p-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-2xl font-normal text-white">Masa Rezervasiyaları</h3>
                <p className="text-xs text-[#8E8E8E]">Firestore `reservations` kolleksiyası və status idarəetməsi</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* Status Segmented filter */}
                <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-lg border border-[#2B2B2B]">
                  {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setResFilter(st)}
                      className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                        resFilter === st
                          ? 'bg-[#C5A059] text-[#0B0B0B] font-semibold'
                          : 'text-[#8E8E8E] hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'Hamısı' : st === 'confirmed' ? 'Aktiv' : st === 'completed' ? 'Tamamlanmış' : 'Ləğv'}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#757575] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                    placeholder="Kod və ya ad..."
                    className="pl-8 pr-3 py-1.5 text-xs text-white bg-[#181818] border border-[#2B2B2B] rounded-lg focus:outline-none focus:border-[#C5A059] w-40"
                  />
                </div>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#CCCCCC]">
                <thead className="bg-[#181818] text-[#8E8E8E] uppercase tracking-wider text-[10px] border-b border-[#282828]">
                  <tr>
                    <th className="px-4 py-3">Kod</th>
                    <th className="px-4 py-3">Qonaq</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3">Tarix & Saat</th>
                    <th className="px-4 py-3">Say</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-[#707070]">
                        Rezervasiya tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-[#161616] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#E0C078]">
                          {res.referenceCode}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          <div>{res.fullName}</div>
                          {res.notes && (
                            <div className="text-[10px] text-[#888888] italic truncate max-w-xs">
                              "{res.notes}"
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[#A0A0A0]">{res.phone}</td>
                        <td className="px-4 py-3 text-white">
                          {res.date} <span className="text-[#E0C078] font-mono">({res.time})</span>
                        </td>
                        <td className="px-4 py-3 font-mono">{res.guests} nəfər</td>
                        <td className="px-4 py-3">
                          <select
                            value={res.status}
                            onChange={(e) =>
                              handleStatusChange(res.id, e.target.value as 'confirmed' | 'cancelled' | 'completed')
                            }
                            className={`px-2 py-1 rounded text-[11px] font-medium border bg-[#181818] focus:outline-none ${
                              res.status === 'confirmed'
                                ? 'text-emerald-400 border-emerald-900/60'
                                : res.status === 'completed'
                                ? 'text-blue-400 border-blue-900/60'
                                : 'text-zinc-400 border-zinc-800'
                            }`}
                          >
                            <option value="confirmed">Təsdiqləndi</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="cancelled">Ləğv edildi</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteReservation(res.id, res.referenceCode)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                            title="Rezervasiyanı sil"
                            aria-label={`${res.referenceCode} rezervasiyasını sil`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="bg-[#121212] border border-[#242424] rounded-xl p-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-2xl font-normal text-white">Menyu İdarəetməsi</h3>
                <p className="text-xs text-[#8E8E8E]">Kafenin menyusuna yeni məhsul əlavə et və ya qiymətləri redaktə et</p>
              </div>

              <button
                onClick={() => setShowAddMenuModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Məhsul Əlavə Et</span>
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#161616] border border-[#242424] flex items-start gap-3.5 justify-between"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#C5A059] block uppercase tracking-wide">
                      {item.categoryLabel}
                    </span>
                    <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                    <span className="text-xs font-mono font-semibold text-[#E0C078]">
                      {item.price.toFixed(2)} ₼
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteMenuItem(item.id, item.name)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                    title="Məhsulu sil"
                    aria-label={`${item.name} sil`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FIREBASE SETTINGS & INTEGRATION */}
        {activeTab === 'firebase' && (
          <div className="bg-[#121212] border border-[#242424] rounded-xl p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-2">
                <Database className="w-6 h-6 text-[#C5A059]" />
                <h3 className="font-serif text-2xl font-normal text-white">
                  Firebase & Firestore Konfiqurasiyası
                </h3>
              </div>
              <p className="text-xs text-[#9E9E9E] mb-6">
                Firebase konsolunuzdakı (<a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[#C5A059] hover:underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a>) veb tətbiq açarlarınızı buraya yapışdıraraq birbaşa canlı rejimə keçə bilərsiniz.
              </p>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
                  isConfigured
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                    : 'bg-[#181510] border-[#C5A059]/40 text-[#E0C078]'
                }`}
              >
                {isConfigured ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <h4 className="font-semibold mb-1">
                    {isConfigured
                      ? 'Canlı Firebase Qoşulub'
                      : 'Firebase Açarları Gözlənilir (Lokal Yaddaş Rejimi Aktivdir)'}
                  </h4>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {isConfigured
                      ? `Tətbiq hazırda "${currentConfig.projectId}" layihəsinə qoşuludur. Qeydiyyatlar və rezervasiyalar birbaşa Firestore kolleksiyalarına yazılır.`
                      : 'Koddakı "/src/utils/firebase.ts" faylında "firebaseConfig" yerinə və ya aşağıdakı xanalara öz açarlarınızı daxil edin. İndi qeydiyyatlar və rezervasiyalar brauzerdə təcrid olunmuş rejimdə etibarlı şəkildə saxlanılır.'}
                  </p>
                </div>
              </div>

              {/* Configuration Form */}
              <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#CFCFCF] mb-1">
                    apiKey
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2 text-xs font-mono text-white bg-[#181818] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CFCFCF] mb-1">
                      authDomain
                    </label>
                    <input
                      type="text"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      placeholder="your-app.firebaseapp.com"
                      className="w-full px-3.5 py-2 text-xs font-mono text-white bg-[#181818] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#CFCFCF] mb-1">
                      projectId
                    </label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="your-project-id"
                      className="w-full px-3.5 py-2 text-xs font-mono text-white bg-[#181818] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#CFCFCF] mb-1">
                      storageBucket
                    </label>
                    <input
                      type="text"
                      value={storageBucket}
                      onChange={(e) => setStorageBucket(e.target.value)}
                      placeholder="your-project-id.appspot.com"
                      className="w-full px-3.5 py-2 text-xs font-mono text-white bg-[#181818] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#CFCFCF] mb-1">
                      appId
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="1:123456789:web:abcdef"
                      className="w-full px-3.5 py-2 text-xs font-mono text-white bg-[#181818] border border-[#2B2B2B] focus:border-[#C5A059] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                  >
                    Açarları Yadda Saxla və Yenilə
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Add Menu Item Modal */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#2E2E2E] rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-serif text-xl font-normal text-white mb-4">Yeni Menyu Məhsulu</h3>
            <form onSubmit={handleAddMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs text-[#CCCCCC] mb-1">Məhsulun adı</label>
                <input
                  type="text"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="Məsələn: Raf Qəhvəsi"
                  className="w-full px-3 py-2 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] rounded-lg focus:border-[#C5A059] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#CCCCCC] mb-1">Kateqoriya</label>
                  <select
                    value={newMenuCategory}
                    onChange={(e) => setNewMenuCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] rounded-lg focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="coffee_hot">İsti qəhvələr</option>
                    <option value="drinks_cold">Soyuq içkilər</option>
                    <option value="tea">Çaylar</option>
                    <option value="desserts">Desertlər</option>
                    <option value="snacks">Qəlyanaltılar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#CCCCCC] mb-1">Qiymət (AZN)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMenuPrice}
                    onChange={(e) => setNewMenuPrice(e.target.value)}
                    placeholder="7.50"
                    className="w-full px-3 py-2 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] rounded-lg focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#CCCCCC] mb-1">Təsvir</label>
                <textarea
                  rows={2}
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="Qaymaqlı vanil ətiri və tək mənşəli espresso ilə..."
                  className="w-full px-3 py-2 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] rounded-lg focus:border-[#C5A059] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#CCCCCC] mb-1">Şəkil URL (İstəyə bağlı)</label>
                <input
                  type="url"
                  value={newMenuImage}
                  onChange={(e) => setNewMenuImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs text-white bg-[#0E0E0E] border border-[#2B2B2B] rounded-lg focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 text-xs text-[#A0A0A0] hover:text-white"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0B0B0B] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg"
                >
                  Əlavə et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
