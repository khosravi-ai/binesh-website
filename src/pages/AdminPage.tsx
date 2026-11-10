import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Download,
  Search,
  Trash2,
  Plus,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Send,
  Users,
  Briefcase,
  BookOpen,
  Settings,
  Inbox,
  LogOut,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { RoutePath } from '../data/bineshData';
import { ContactInfo } from '../data/contactInfo';
import { apiFetch, setAuthToken } from '../lib/submitRequest';
import { AuthUserInfo } from './PortalAndAuthPages';

interface AdminPageProps {
  onNavigate: (route: RoutePath) => void;
  authUser: AuthUserInfo | null;
  onAuthChange: (user: AuthUserInfo | null) => void;
  onRefreshPublicData: () => void;
}

type AdminTab = 'consultations' | 'portfolio' | 'insights' | 'portal' | 'settings';

const CONSULTATION_STATUSES: { value: string; label: string; badgeClass: string }[] = [
  { value: 'new', label: 'جدید (بررسی‌نشده)', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
  { value: 'contacted', label: 'تماس گرفته شد', badgeClass: 'bg-sky-100 text-sky-900 border-sky-300' },
  { value: 'in_progress', label: 'در حال بررسی و مذاکره', badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { value: 'converted', label: 'تبدیل به قرارداد همکاری', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { value: 'archived', label: 'بایگانی‌شده', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' }
];

// Synthesize a pleasant 2-tone notification chime using Web Audio API (100% offline, zero external files)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.18, now + startOffset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    playTone(587.33, 0, 0.22); // D5
    playTone(880, 0.18, 0.35); // A5
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigate,
  authUser,
  onAuthChange,
  onRefreshPublicData
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('consultations');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Admin Login Form (if not logged in as admin)
  const [loginId, setLoginId] = useState('09164006698');
  const [loginPass, setLoginPass] = useState('Binesh@1404');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Overview state from /api/admin/overview
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [consultations, setConsultations] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [portfolio, setPortfolio] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [insights, setInsights] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [organizations, setOrganizations] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [portalItems, setPortalItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysisRequests, setAnalysisRequests] = useState<any[]>([]);

  // Consultations Filter
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Portfolio Form State
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [pfTitle, setPfTitle] = useState('');
  const [pfClient, setPfClient] = useState('');
  const [pfIndustry, setPfIndustry] = useState('');
  const [pfService, setPfService] = useState('طراحی و توسعه داشبوردهای مدیریتی');
  const [pfImage, setPfImage] = useState('/assets/portfolio/kabinowood.png');
  const [pfIntro, setPfIntro] = useState('');
  const [pfSolution, setPfSolution] = useState('');
  const [pfFeaturesTitle, setPfFeaturesTitle] = useState('امکانات و بخش‌های کلیدی داشبورد:');
  const [pfFeatures, setPfFeatures] = useState('');
  const [pfConclusion, setPfConclusion] = useState('');
  const [pfSortOrder, setPfSortOrder] = useState(1);
  const [pfPublished, setPfPublished] = useState(true);

  // Insights Form State
  const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
  const [inTitle, setInTitle] = useState('');
  const [inSlug, setInSlug] = useState('');
  const [inCategory, setInCategory] = useState('طراحی داشبورد');
  const [inStatusNote, setInStatusNote] = useState('یادداشت تحلیلی');
  const [inExcerpt, setInExcerpt] = useState('');
  const [inContent, setInContent] = useState('');
  const [inSortOrder, setInSortOrder] = useState(1);
  const [inPublished, setInPublished] = useState(true);

  // Portal Management State
  const [newOrgName, setNewOrgName] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState('manager');
  const [newUserOrgId, setNewUserOrgId] = useState('org-1');

  const [newItemOrgId, setNewItemOrgId] = useState('org-1');
  const [newItemType, setNewItemType] = useState('dashboard');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemStatus, setNewItemStatus] = useState('منتشر شده');
  const [newItemMeta, setNewItemMeta] = useState('به‌روزرسانی روزانه');
  const [newItemLink, setNewItemLink] = useState('/demo-webapp.html');

  // Settings State
  const [contactForm, setContactForm] = useState<ContactInfo>({
    phone: '09164006698',
    email: 'ad.binesh.ai@gmail.com',
    address: null,
    workingHours: 'شنبه تا چهارشنبه، ساعت ۹ تا ۱۷',
    linkedin: null,
    telegram: null,
    otherSocial: null
  });
  const [notifForm, setNotifForm] = useState({
    adminAlertPhone: '09164006698',
    adminAlertEmail: 'ad.binesh.ai@gmail.com',
    enableSoundAlert: true,
    smsProvider: 'none' as 'none' | 'kavenegar' | 'melipayamak',
    kavenegarApiKey: '',
    kavenegarSender: '',
    melipayamakUsername: '',
    melipayamakPassword: '',
    melipayamakFrom: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: ''
  });
  const [testingNotif, setTestingNotif] = useState(false);

  const lastSeenConsultationIdRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? '' : prev));
    }, 5000);
  };

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setConsultations(data.consultations || []);
          setPortfolio(data.portfolio || []);
          setInsights(data.insights || []);
          setOrganizations(data.organizations || []);
          setUsers(data.users || []);
          setPortalItems(data.portalItems || []);
          setAnalysisRequests(data.analysisRequests || []);
          if (data.settings?.contactInfo) {
            setContactForm(data.settings.contactInfo);
          }
          if (data.settings?.notificationSettings) {
            setNotifForm(data.settings.notificationSettings);
            setSoundEnabled(Boolean(data.settings.notificationSettings.enableSoundAlert));
          }
          if (data.consultations?.length > 0 && lastSeenConsultationIdRef.current === null) {
            lastSeenConsultationIdRef.current = Number(data.consultations[0].id);
          } else if (lastSeenConsultationIdRef.current === null) {
            lastSeenConsultationIdRef.current = 0;
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser?.role === 'admin') {
      fetchAdminOverview();
    }
  }, [authUser?.id, authUser?.role]);

  // Live Polling for Instant Consultation Request Alerts
  useEffect(() => {
    if (authUser?.role !== 'admin') return;
    const interval = setInterval(async () => {
      try {
        const res = await apiFetch('/api/admin/poll');
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && typeof data.latestId === 'number') {
          if (
            lastSeenConsultationIdRef.current !== null &&
            data.latestId > lastSeenConsultationIdRef.current
          ) {
            lastSeenConsultationIdRef.current = data.latestId;
            if (soundEnabled) {
              playNotificationChime();
            }
            const reqName = data.latestRequest?.fullName || 'مشتری جدید';
            const reqCode = data.latestRequest?.trackingCode || '';
            showToast(`🔔 درخواست مشاوره جدید از «${reqName}» (${reqCode}) دریافت شد!`);
            fetchAdminOverview();
          }
        }
      } catch {
        // ignore polling error
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [authUser?.role, soundEnabled]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    setLoginLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: loginId.trim(), password: loginPass })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginErr(data.error || 'اطلاعات ورود صحیح نیست.');
      } else if (data.user.role !== 'admin') {
        setLoginErr('این حساب دسترسی مدیریت کل سایت ندارد.');
      } else {
        setAuthToken(data.token);
        onAuthChange(data.user);
      }
    } catch {
      setLoginErr('خطا در ارتباط با سرور.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
    onAuthChange(null);
  };

  // CSV Export Handler
  const handleDownloadCsv = async () => {
    try {
      const res = await apiFetch('/api/admin/consultations/export.csv');
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `binesh-consultations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('فایل اکسل (CSV) درخواست‌ها با موفقیت دانلود شد.');
    } catch {
      showToast('خطا در دریافت فایل خروجی.');
    }
  };

  const handleUpdateConsultation = async (id: number, status: string, adminNotes: string) => {
    const res = await apiFetch(`/api/admin/consultations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes })
    });
    if (res.ok) {
      showToast('وضعیت و یادداشت درخواست ذخیره شد.');
      fetchAdminOverview();
    }
  };

  const handleDeleteConsultation = async (id: number) => {
    const res = await apiFetch(`/api/admin/consultations/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      showToast('درخواست مشاوره حذف شد.');
      fetchAdminOverview();
    }
  };

  // Portfolio Save
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pfTitle.trim()) return;
    const payload = {
      id: editingPortfolioId || `proj-${Date.now()}`,
      title: pfTitle.trim(),
      clientName: pfClient.trim() || pfTitle.trim(),
      industry: pfIndustry.trim(),
      serviceType: pfService.trim(),
      image: pfImage.trim() || '/assets/portfolio/kabinowood.png',
      intro: pfIntro
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      solution: pfSolution.trim() || undefined,
      featuresTitle: pfFeaturesTitle.trim(),
      features: pfFeatures
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      conclusion: pfConclusion.trim(),
      sortOrder: Number(pfSortOrder) || 1,
      published: pfPublished
    };
    const res = await apiFetch('/api/admin/portfolio', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast('نمونه‌کار با موفقیت در دیتابیس ذخیره شد.');
      setEditingPortfolioId(null);
      setPfTitle('');
      setPfClient('');
      setPfIndustry('');
      setPfIntro('');
      setPfSolution('');
      setPfFeatures('');
      setPfConclusion('');
      fetchAdminOverview();
      onRefreshPublicData();
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    const res = await apiFetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('نمونه‌کار حذف شد.');
      fetchAdminOverview();
      onRefreshPublicData();
    }
  };

  // Insight Save
  const handleSaveInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inTitle.trim()) return;
    const payload = {
      id: editingInsightId || `I-${Date.now()}`,
      title: inTitle.trim(),
      slug: inSlug.trim() || `post-${Date.now()}`,
      category: inCategory.trim(),
      statusNote: inStatusNote.trim(),
      excerpt: inExcerpt.trim(),
      content: inContent.trim(),
      sortOrder: Number(inSortOrder) || 1,
      published: inPublished
    };
    const res = await apiFetch('/api/admin/insights', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast('مطلب بینش‌نامه با موفقیت در دیتابیس ذخیره شد.');
      setEditingInsightId(null);
      setInTitle('');
      setInSlug('');
      setInExcerpt('');
      setInContent('');
      fetchAdminOverview();
      onRefreshPublicData();
    }
  };

  const handleDeleteInsight = async (id: string) => {
    const res = await apiFetch(`/api/admin/insights/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('مطلب بینش‌نامه حذف شد.');
      fetchAdminOverview();
      onRefreshPublicData();
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        contactInfo: contactForm,
        notificationSettings: { ...notifForm, enableSoundAlert: soundEnabled }
      })
    });
    if (res.ok) {
      showToast('اطلاعات تماس و تنظیمات اطلاع‌رسانی ذخیره شد.');
      onRefreshPublicData();
    }
  };

  const handleTestNotification = async () => {
    setTestingNotif(true);
    try {
      const res = await apiFetch('/api/admin/test-notification', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        showToast(`نتیجه تست ارسال: ${data.log}`);
      }
    } catch {
      showToast('خطا در اجرای تست اطلاع‌رسانی.');
    } finally {
      setTestingNotif(false);
    }
  };

  // If not logged in as admin, render dedicated Admin Login Card
  if (!authUser || authUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F9] text-[#087A9D] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>پنل مدیریت یکپارچه بینش</span>
            </span>
            <h1 className="text-xl font-bold text-[#062B4D]">ورود مدیر سیستم</h1>
            <p className="text-xs text-[#435466]">
              برای مدیریت درخواست‌های مشاوره، نمونه‌کارها، بینش‌نامه و پورتال مشتریان وارد شوید.
            </p>
          </div>

          {loginErr && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">
                شماره همراه یا ایمیل مدیر
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num dir-ltr text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">
                رمز عبور
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none dir-ltr text-left"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-[#062B4D] hover:bg-[#087A9D] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {loginLoading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-[11px] text-[#435466] space-y-1">
            <div className="font-bold text-[#062B4D] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#08A9C5]" />
              <span>مشخصات پیش‌فرض مدیر:</span>
            </div>
            <div className="font-mono-num dir-ltr text-left">
              User: 09164006698 | Pass: Binesh@1404
            </div>
          </div>
        </div>
      </div>
    );
  }

  const newRequestsCount = consultations.filter((c) => c.status === 'new').length;
  const filteredConsultations = consultations.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = searchQuery.trim();
    const matchSearch =
      !q ||
      c.fullName?.includes(q) ||
      c.phone?.includes(q) ||
      c.businessName?.includes(q) ||
      c.trackingCode?.toUpperCase().includes(q.toUpperCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Live Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 max-w-md bg-[#062B4D] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-[#08A9C5] flex items-center gap-3 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#3CDDDD] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="bg-[#062B4D] text-white rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-xs text-[#3CDDDD]">
            <ShieldCheck className="w-4 h-4" />
            <span>پنل مدیریت یکپارچه بینش (متصل به پایگاه داده رابطه‌ای)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            مدیریت درخواست‌ها، محتوا و پورتال مشتریان
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Live Unread Badge */}
          <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#3CDDDD]" />
            <span>درخواست‌های جدید:</span>
            <strong className="px-2 py-0.5 rounded-md bg-[#08A9C5] text-[#062B4D] font-mono-num font-bold">
              {newRequestsCount}
            </strong>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playNotificationChime();
            }}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center gap-1.5 cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#3CDDDD]" />
                <span>هشدار صوتی: فعال</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-white/60" />
                <span>هشدار صوتی: غیرفعال</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => fetchAdminOverview()}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer"
            title="به‌روزرسانی اطلاعات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-100 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-[#E3EBF0]">
        <button
          type="button"
          onClick={() => setActiveTab('consultations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'consultations'
              ? 'bg-[#062B4D] text-white'
              : 'text-[#435466] hover:bg-[#F7FAFC]'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>درخواست‌های مشاوره ({consultations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'portfolio'
              ? 'bg-[#062B4D] text-white'
              : 'text-[#435466] hover:bg-[#F7FAFC]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>نمونه‌کارها ({portfolio.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'insights'
              ? 'bg-[#062B4D] text-white'
              : 'text-[#435466] hover:bg-[#F7FAFC]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>بینش‌نامه ({insights.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('portal')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'portal'
              ? 'bg-[#062B4D] text-white'
              : 'text-[#435466] hover:bg-[#F7FAFC]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>پورتال مشتریان ({analysisRequests.length} درخواست تحلیل)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#062B4D] text-white'
              : 'text-[#435466] hover:bg-[#F7FAFC]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>اطلاعات تماس و تنظیمات پیامک/ایمیل</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: CONSULTATION REQUESTS
      ===================================================================== */}
      {activeTab === 'consultations' && (
        <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E3EBF0]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#062B4D] text-white'
                    : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0]'
                }`}
              >
                همه ({consultations.length})
              </button>
              {CONSULTATION_STATUSES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setStatusFilter(st.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    statusFilter === st.value
                      ? 'bg-[#062B4D] text-white'
                      : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جست‌وجو نام، شماره، کد رهگیری..."
                  className="pr-9 pl-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:outline-none w-56"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-xl bg-[#087A9D] hover:bg-[#062B4D] text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>خروجی اکسل / CSV</span>
              </button>
            </div>
          </div>

          {filteredConsultations.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#64748B]">
              هنوز هیچ درخواست مشاوره‌ای با این مشخصات ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConsultations.map((req) => {
                const stMeta =
                  CONSULTATION_STATUSES.find((s) => s.value === req.status) ||
                  CONSULTATION_STATUSES[0];
                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono-num text-xs font-bold px-2.5 py-1 rounded-lg bg-[#062B4D] text-white dir-ltr">
                          {req.trackingCode}
                        </span>
                        <h3 className="text-base font-bold text-[#062B4D]">{req.fullName}</h3>
                        {req.businessName && (
                          <span className="text-xs text-[#435466]">({req.businessName})</span>
                        )}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${stMeta.badgeClass}`}
                        >
                          {stMeta.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#64748B]">
                        <span className="font-mono-num dir-ltr">{req.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteConsultation(req.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                          title="حذف درخواست"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-[#E3EBF0]">
                        <span className="text-[#64748B] block">شماره تماس:</span>
                        <a
                          href={`tel:${req.phone}`}
                          className="font-mono-num font-bold text-[#062B4D] hover:text-[#087A9D] dir-ltr block mt-0.5"
                        >
                          {req.phone}
                        </a>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#E3EBF0]">
                        <span className="text-[#64748B] block">ایمیل:</span>
                        <span className="font-mono-num text-[#062B4D] dir-ltr block mt-0.5">
                          {req.email || '—'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#E3EBF0]">
                        <span className="text-[#64748B] block">خدمت درخواستی:</span>
                        <strong className="text-[#087A9D] block mt-0.5">{req.service}</strong>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-3.5 rounded-xl bg-white border border-[#E3EBF0] text-xs text-[#263B50] leading-relaxed">
                        <strong className="text-[#062B4D] block mb-1">توضیحات مشتری:</strong>
                        {req.notes}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-2 border-t border-[#E3EBF0]">
                      <div className="md:col-span-4">
                        <label className="block text-[11px] text-[#64748B] mb-1">
                          تغییر وضعیت پیگیری:
                        </label>
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleUpdateConsultation(req.id, e.target.value, req.adminNotes || '')
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-white font-medium text-[#062B4D]"
                        >
                          {CONSULTATION_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-8 flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[11px] text-[#64748B] mb-1">
                            یادداشت داخلی مدیر (نتیجه تماس):
                          </label>
                          <input
                            type="text"
                            defaultValue={req.adminNotes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (req.adminNotes || '')) {
                                handleUpdateConsultation(req.id, req.status, e.target.value);
                              }
                            }}
                            placeholder="یادداشت خود را بنویسید (با خروج از کادر خودکار ذخیره می‌شود)..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {req.notifiedChannels && (
                      <div className="text-[11px] text-[#64748B] font-mono-num dir-ltr text-left">
                        Notification Log: {req.notifiedChannels}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: PORTFOLIO MANAGEMENT
      ===================================================================== */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form */}
          <form
            onSubmit={handleSavePortfolio}
            className="lg:col-span-5 bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#062B4D]">
                {editingPortfolioId ? 'ویرایش نمونه‌کار' : 'افزودن نمونه‌کار جدید'}
              </h2>
              {editingPortfolioId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPortfolioId(null);
                    setPfTitle('');
                    setPfClient('');
                    setPfIndustry('');
                    setPfIntro('');
                    setPfSolution('');
                    setPfFeatures('');
                    setPfConclusion('');
                  }}
                  className="text-xs text-[#087A9D] hover:underline cursor-pointer"
                >
                  انصراف از ویرایش
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">عنوان پروژه *</label>
              <input
                type="text"
                value={pfTitle}
                onChange={(e) => setPfTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">صنعت *</label>
                <input
                  type="text"
                  value={pfIndustry}
                  onChange={(e) => setPfIndustry(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">نوع خدمت *</label>
                <input
                  type="text"
                  value={pfService}
                  onChange={(e) => setPfService(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#263B50] mb-1">مسیر تصویر</label>
                <input
                  type="text"
                  value={pfImage}
                  onChange={(e) => setPfImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">ترتیب نمایش</label>
                <input
                  type="number"
                  value={pfSortOrder}
                  onChange={(e) => setPfSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-mono-num"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">
                معرفی پروژه (هر پاراگراف در یک خط)
              </label>
              <textarea
                rows={3}
                value={pfIntro}
                onChange={(e) => setPfIntro(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">راهکار اجراشده</label>
              <textarea
                rows={2}
                value={pfSolution}
                onChange={(e) => setPfSolution(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">
                ویژگی‌ها و بخش‌های کلیدی (هر مورد در یک خط)
              </label>
              <textarea
                rows={3}
                value={pfFeatures}
                onChange={(e) => setPfFeatures(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">جمع‌بندی نهایی</label>
              <textarea
                rows={2}
                value={pfConclusion}
                onChange={(e) => setPfConclusion(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#087A9D] hover:bg-[#062B4D] text-white text-xs font-bold cursor-pointer"
            >
              {editingPortfolioId ? 'ذخیره تغییرات نمونه‌کار' : 'افزودن نمونه‌کار به سایت'}
            </button>
          </form>

          {/* List */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#062B4D]">
              لیست نمونه‌کارهای موجود در دیتابیس
            </h2>
            <div className="space-y-3">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-num text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EAF7F9] text-[#087A9D]">
                      #{item.sortOrder}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#062B4D]">{item.title}</h3>
                      <span className="text-xs text-[#64748B]">
                        {item.industry} · {item.serviceType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPortfolioId(item.id);
                        setPfTitle(item.title);
                        setPfClient(item.clientName || '');
                        setPfIndustry(item.industry || '');
                        setPfService(item.serviceType || '');
                        setPfImage(item.image || '');
                        setPfIntro(Array.isArray(item.intro) ? item.intro.join('\n') : '');
                        setPfSolution(item.solution || '');
                        setPfFeaturesTitle(item.featuresTitle || '');
                        setPfFeatures(Array.isArray(item.features) ? item.features.join('\n') : '');
                        setPfConclusion(item.conclusion || '');
                        setPfSortOrder(item.sortOrder || 1);
                        setPfPublished(Boolean(item.published));
                      }}
                      className="p-2 rounded-lg bg-white border border-[#E3EBF0] text-[#087A9D] hover:text-[#062B4D] cursor-pointer"
                      title="ویرایش"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="p-2 rounded-lg bg-white border border-[#E3EBF0] text-red-600 hover:bg-red-50 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: INSIGHTS MANAGEMENT
      ===================================================================== */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveInsight}
            className="lg:col-span-5 bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#062B4D]">
                {editingInsightId ? 'ویرایش مطلب بینش‌نامه' : 'انتشار مطلب جدید در بینش‌نامه'}
              </h2>
              {editingInsightId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingInsightId(null);
                    setInTitle('');
                    setInSlug('');
                    setInExcerpt('');
                    setInContent('');
                  }}
                  className="text-xs text-[#087A9D] hover:underline cursor-pointer"
                >
                  انصراف
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">عنوان مطلب *</label>
              <input
                type="text"
                value={inTitle}
                onChange={(e) => setInTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">دسته‌بندی *</label>
                <select
                  value={inCategory}
                  onChange={(e) => setInCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                >
                  <option value="طراحی داشبورد">طراحی داشبورد</option>
                  <option value="شاخص‌های KPI">شاخص‌های KPI</option>
                  <option value="هوش تجاری">هوش تجاری</option>
                  <option value="تحلیل مالی و فروش">تحلیل مالی و فروش</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">برچسب وضعیت</label>
                <input
                  type="text"
                  value={inStatusNote}
                  onChange={(e) => setInStatusNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">خلاصه مطلب (کارت) *</label>
              <textarea
                rows={3}
                value={inExcerpt}
                onChange={(e) => setInExcerpt(e.target.value)}
                required
                className="w-full p-3 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">
                متن کامل مقاله / یادداشت تحلیلی
              </label>
              <textarea
                rows={5}
                value={inContent}
                onChange={(e) => setInContent(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#087A9D] hover:bg-[#062B4D] text-white text-xs font-bold cursor-pointer"
            >
              {editingInsightId ? 'به‌روزرسانی مطلب' : 'انتشار در بینش‌نامه'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#062B4D]">مطالب منتشرشده در بینش‌نامه</h2>
            <div className="space-y-3">
              {insights.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[11px] font-bold text-[#087A9D] block">
                      {post.category} · {post.statusNote}
                    </span>
                    <h3 className="text-sm font-bold text-[#062B4D] mt-0.5">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInsightId(post.id);
                        setInTitle(post.title);
                        setInSlug(post.slug || '');
                        setInCategory(post.category || 'طراحی داشبورد');
                        setInStatusNote(post.statusNote || 'یادداشت تحلیلی');
                        setInExcerpt(post.excerpt || '');
                        setInContent(post.content || '');
                        setInSortOrder(post.sortOrder || 1);
                        setInPublished(Boolean(post.published));
                      }}
                      className="p-2 rounded-lg bg-white border border-[#E3EBF0] text-[#087A9D] cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteInsight(post.id)}
                      className="p-2 rounded-lg bg-white border border-[#E3EBF0] text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: CLIENT PORTAL & ANALYSIS REQUESTS MANAGEMENT
      ===================================================================== */}
      {activeTab === 'portal' && (
        <div className="space-y-6">
          {/* Client Analysis Requests */}
          <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#062B4D]">
              درخواست‌های تحلیل ثبت‌شده توسط مشتریان در پورتال
            </h2>
            {analysisRequests.length === 0 ? (
              <p className="text-xs text-[#64748B]">هنوز درخواست تحلیلی ثبت نشده است.</p>
            ) : (
              <div className="space-y-4">
                {analysisRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#062B4D]">{req.title}</h3>
                        <span className="text-[11px] text-[#64748B]">
                          ثبت‌کننده: {req.userName} · اولویت: {req.priority}
                        </span>
                      </div>
                      <select
                        value={req.status}
                        onChange={async (e) => {
                          await apiFetch(`/api/admin/analysis-requests/${req.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                              status: e.target.value,
                              adminResponse: req.adminResponse || ''
                            })
                          });
                          showToast('وضعیت درخواست تحلیل مشتری به‌روز شد.');
                          fetchAdminOverview();
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl border border-[#E3EBF0] bg-white font-bold text-[#087A9D]"
                      >
                        <option value="در انتظار بررسی">در انتظار بررسی</option>
                        <option value="در حال بررسی">در حال بررسی</option>
                        <option value="نیازمند اطلاعات تکمیلی">نیازمند اطلاعات تکمیلی</option>
                        <option value="تکمیل شده">تکمیل شده</option>
                      </select>
                    </div>
                    {req.description && (
                      <p className="text-xs text-[#435466]">{req.description}</p>
                    )}
                    <div>
                      <label className="block text-[11px] text-[#64748B] mb-1">
                        پاسخ مشاور / نتیجه بررسی (قابل مشاهده در پورتال مشتری):
                      </label>
                      <input
                        type="text"
                        defaultValue={req.adminResponse || ''}
                        onBlur={async (e) => {
                          await apiFetch(`/api/admin/analysis-requests/${req.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                              status: req.status,
                              adminResponse: e.target.value
                            })
                          });
                          showToast('پاسخ برای مشتری ذخیره شد.');
                          fetchAdminOverview();
                        }}
                        placeholder="پاسخ تیم بینش را وارد کنید..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Portal Item / User / Organization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Dashboard/Report/Session to Organization */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newItemTitle.trim()) return;
                await apiFetch('/api/admin/portal-items', {
                  method: 'POST',
                  body: JSON.stringify({
                    organizationId: newItemOrgId,
                    itemType: newItemType,
                    title: newItemTitle.trim(),
                    description: newItemDesc.trim(),
                    status: newItemStatus,
                    metaText: newItemMeta,
                    linkUrl: newItemLink
                  })
                });
                setNewItemTitle('');
                setNewItemDesc('');
                showToast('آیتم جدید به پورتال سازمان اضافه شد.');
                fetchAdminOverview();
              }}
              className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-3"
            >
              <h3 className="text-sm font-bold text-[#062B4D] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#08A9C5]" />
                <span>افزودن داشبورد، گزارش یا جلسه به پورتال سازمان</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">سازمان</label>
                  <select
                    value={newItemOrgId}
                    onChange={(e) => setNewItemOrgId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                  >
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">نوع آیتم</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                  >
                    <option value="dashboard">داشبورد مدیریتی</option>
                    <option value="report">گزارش تحلیلی</option>
                    <option value="session">جلسه مشاوره</option>
                    <option value="goal">هدف و شاخص (KPI)</option>
                    <option value="file">فایل و مستندات</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#64748B] mb-1">عنوان *</label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64748B] mb-1">توضیح کوتاه</label>
                <input
                  type="text"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">برچسب زمان/متا</label>
                  <input
                    type="text"
                    value={newItemMeta}
                    onChange={(e) => setNewItemMeta(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">لینک داشبورد/فایل</label>
                  <input
                    type="text"
                    value={newItemLink}
                    onChange={(e) => setNewItemLink(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-bold cursor-pointer"
              >
                ثبت در پورتال مشتری
              </button>
            </form>

            {/* Create Client Organization & User */}
            <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-5">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newOrgName.trim()) return;
                  await apiFetch('/api/admin/organizations', {
                    method: 'POST',
                    body: JSON.stringify({
                      name: newOrgName.trim(),
                      contractModules: ['داشبوردهای مدیریتی', 'تحلیل و پایش مستمر']
                    })
                  });
                  setNewOrgName('');
                  showToast('سازمان جدید ایجاد شد.');
                  fetchAdminOverview();
                }}
                className="space-y-2 pb-4 border-b border-[#E3EBF0]"
              >
                <h3 className="text-sm font-bold text-[#062B4D]">تعریف سازمان مشتری جدید</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="نام شرکت یا سازمان مشتری..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#062B4D] text-white text-xs font-bold cursor-pointer"
                  >
                    افزودن سازمان
                  </button>
                </div>
              </form>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newUserFullName.trim() || !newUserPhone.trim() || !newUserPass.trim()) return;
                  const res = await apiFetch('/api/admin/users', {
                    method: 'POST',
                    body: JSON.stringify({
                      fullName: newUserFullName.trim(),
                      phone: newUserPhone.trim(),
                      email: newUserEmail.trim(),
                      password: newUserPass,
                      role: newUserRole,
                      organizationId: newUserOrgId
                    })
                  });
                  if (res.ok) {
                    setNewUserFullName('');
                    setNewUserPhone('');
                    setNewUserEmail('');
                    setNewUserPass('');
                    showToast('حساب کاربری مشتری با موفقیت ایجاد شد.');
                    fetchAdminOverview();
                  }
                }}
                className="space-y-3"
              >
                <h3 className="text-sm font-bold text-[#062B4D]">تعریف کاربر جدید برای پورتال</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                    placeholder="نام و نام خانوادگی *"
                    className="px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                  />
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="شماره موبایل *"
                    className="px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-mono-num dir-ltr text-left"
                  />
                  <input
                    type="password"
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                    placeholder="رمز عبور *"
                    className="px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                  />
                  <select
                    value={newUserOrgId}
                    onChange={(e) => setNewUserOrgId(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
                  >
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#087A9D] text-white text-xs font-bold cursor-pointer"
                >
                  ایجاد کاربر مشتری
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: CONTACT INFO & SMS/EMAIL NOTIFICATION SETTINGS
      ===================================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site Contact Info */}
          <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#062B4D]">
              اطلاعات تماس و شبکه‌های اجتماعی وب‌سایت
            </h2>
            <p className="text-xs text-[#64748B]">
              تغییرات این بخش بلافاصله در صفحه «تماس با بینش» و فوتر سایت اعمال می‌شود.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#263B50] mb-1">شماره تماس</label>
                <input
                  type="text"
                  value={contactForm.phone || ''}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value || null })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-mono-num dir-ltr text-left"
                />
              </div>
              <div>
                <label className="block text-xs text-[#263B50] mb-1">ایمیل رسمی</label>
                <input
                  type="text"
                  value={contactForm.email || ''}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value || null })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-mono-num dir-ltr text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#263B50] mb-1">ساعات پاسخ‌گویی</label>
              <input
                type="text"
                value={contactForm.workingHours || ''}
                onChange={(e) =>
                  setContactForm({ ...contactForm, workingHours: e.target.value || null })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#263B50] mb-1">آدرس (در صورت خالی بودن نمایش داده نمی‌شود)</label>
              <input
                type="text"
                value={contactForm.address || ''}
                onChange={(e) => setContactForm({ ...contactForm, address: e.target.value || null })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#263B50] mb-1">لینک LinkedIn</label>
                <input
                  type="text"
                  value={contactForm.linkedin || ''}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, linkedin: e.target.value || null })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                />
              </div>
              <div>
                <label className="block text-xs text-[#263B50] mb-1">لینک Telegram</label>
                <input
                  type="text"
                  value={contactForm.telegram || ''}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, telegram: e.target.value || null })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                />
              </div>
            </div>
          </div>

          {/* Instant SMS & Email Notification Settings */}
          <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#062B4D]">
                تنظیمات اطلاع‌رسانی فوری (پیامک و ایمیل)
              </h2>
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={testingNotif}
                className="px-3 py-1.5 rounded-xl bg-[#EAF7F9] text-[#087A9D] hover:bg-[#08A9C5] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingNotif ? 'در حال تست...' : 'تست ارسال پیامک/ایمیل'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#263B50] mb-1">
                  موبایل مدیر (دریافت‌کننده پیامک هشدار)
                </label>
                <input
                  type="text"
                  value={notifForm.adminAlertPhone}
                  onChange={(e) => setNotifForm({ ...notifForm, adminAlertPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-mono-num dir-ltr text-left"
                />
              </div>
              <div>
                <label className="block text-xs text-[#263B50] mb-1">
                  ایمیل مدیر (دریافت‌کننده ایمیل هشدار)
                </label>
                <input
                  type="text"
                  value={notifForm.adminAlertEmail}
                  onChange={(e) => setNotifForm({ ...notifForm, adminAlertEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-mono-num dir-ltr text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#263B50] mb-1">درگاه پیامکی ایرانی</label>
              <select
                value={notifForm.smsProvider}
                onChange={(e) =>
                  setNotifForm({
                    ...notifForm,
                    smsProvider: e.target.value as 'none' | 'kavenegar' | 'melipayamak'
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC]"
              >
                <option value="none">غیرفعال (فقط اعلان داخل پنل و ایمیل)</option>
                <option value="kavenegar">کاوه‌نگار (Kavenegar)</option>
                <option value="melipayamak">ملی‌پیامک (MeliPayamak)</option>
              </select>
            </div>

            {notifForm.smsProvider === 'kavenegar' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">Kavenegar API Key</label>
                  <input
                    type="password"
                    value={notifForm.kavenegarApiKey}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, kavenegarApiKey: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">شماره خط فرستنده (اختیاری)</label>
                  <input
                    type="text"
                    value={notifForm.kavenegarSender}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, kavenegarSender: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
              </div>
            )}

            {notifForm.smsProvider === 'melipayamak' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">نام کاربری ملی‌پیامک</label>
                  <input
                    type="text"
                    value={notifForm.melipayamakUsername}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, melipayamakUsername: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">رمز عبور / API Key</label>
                  <input
                    type="password"
                    value={notifForm.melipayamakPassword}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, melipayamakPassword: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">شماره خط فرستنده</label>
                  <input
                    type="text"
                    value={notifForm.melipayamakFrom}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, melipayamakFrom: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-3">
              <span className="text-xs font-bold text-[#062B4D] block">تنظیمات ایمیل (SMTP استاندارد)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#64748B] mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={notifForm.smtpHost}
                    onChange={(e) => setNotifForm({ ...notifForm, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">Port</label>
                  <input
                    type="number"
                    value={notifForm.smtpPort}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, smtpPort: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] mb-1">SMTP User</label>
                  <input
                    type="text"
                    value={notifForm.smtpUser}
                    onChange={(e) => setNotifForm({ ...notifForm, smtpUser: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#64748B] mb-1">SMTP Password</label>
                  <input
                    type="password"
                    value={notifForm.smtpPass}
                    onChange={(e) => setNotifForm({ ...notifForm, smtpPass: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E3EBF0] bg-white dir-ltr text-left"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#062B4D] hover:bg-[#087A9D] text-white text-xs font-bold cursor-pointer"
            >
              ذخیره تمامی تنظیمات تماس و اطلاع‌رسانی
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
