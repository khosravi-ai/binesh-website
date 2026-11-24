import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Download,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Send,
  Briefcase,
  BookOpen,
  Settings,
  Inbox,
  LogOut,
  ShieldCheck,
  BarChart3,
  Eye,
  UserCheck,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock
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

type AdminTab = 'consultations' | 'analytics' | 'portfolio' | 'insights' | 'settings';

interface AnalyticsSummary {
  dbEngine: 'mysql' | 'sqlite';
  rangeDays: number;
  totalVisits: number;
  totalUniqueVisitors: number;
  periodVisits: number;
  periodUniqueVisitors: number;
  todayVisits: number;
  todayUniqueVisitors: number;
  last7DaysVisits: number;
  topPages: { path: string; pageTitle: string; views: number; uniqueVisitors: number }[];
  dailyTrend: { date: string; views: number; uniqueVisitors: number }[];
  deviceBreakdown: { deviceType: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  recentVisits: {
    id: number;
    path: string;
    pageTitle: string;
    referrer: string;
    deviceType: string;
    browser: string;
    visitedAt: string;
  }[];
}

const ROUTE_PERSIAN_LABELS: Record<string, string> = {
  '/': 'صفحه اصلی',
  '/services': 'خدمات بینش',
  '/services/dashboards': 'طراحی داشبوردهای مدیریتی',
  '/services/bi-analytics': 'تحلیل و پایش مستمر',
  '/services/consulting': 'مشاوره و کوچینگ کسب‌وکار',
  '/solutions': 'راهکارهای هوش تجاری',
  '/solutions/power-bi-sepidar': 'اتصال Power BI به سپیدار',
  '/solutions/power-bi-holoo': 'اتصال Power BI به هلو',
  '/solutions/distribution-sales': 'هوش تجاری پخش مویرگی',
  '/solutions/trading-sales': 'هوش تجاری فروش بازرگانی',
  '/solutions/finance': 'داشبورد مالی و نقدینگی',
  '/solutions/shiraz': 'هوش تجاری در شیراز',
  '/demos': 'دموهای تعاملی',
  '/portfolio': 'نمونه‌کارها',
  '/portfolio/kabino-wood': 'نمونه‌کار کابینو وود',
  '/portfolio/paytakht-office': 'نمونه‌کار تجهیزات اداری پایتخت',
  '/portfolio/takapoo': 'نمونه‌کار تکاپو',
  '/portfolio/arya-pakhsh': 'نمونه‌کار آریا پخش',
  '/insights': 'بینش‌نامه (مقالات)',
  '/about': 'درباره بینش',
  '/contact': 'تماس با بینش',
  '/privacy': 'حریم خصوصی'
};

function formatIranDateTime(rawUtc: string): string {
  const trimmed = String(rawUtc || '').trim();
  if (!trimmed) return '—';
  // Normalize SQLite/MySQL space-separated UTC strings (YYYY-MM-DD HH:MM:SS) to ISO UTC
  const normalized =
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(trimmed)
      ? `${trimmed.replace(' ', 'T')}Z`
      : trimmed;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(parsed);
  } catch {
    return trimmed;
  }
}

const DEVICE_PERSIAN_LABELS: Record<string, string> = {
  desktop: 'دسکتاپ',
  mobile: 'موبایل',
  tablet: 'تبلت'
};

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
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Overview state from /api/admin/overview
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [consultations, setConsultations] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [portfolio, setPortfolio] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [insights, setInsights] = useState<any[]>([]);

  // Internal Visitor Analytics State
  const [analyticsDays, setAnalyticsDays] = useState<7 | 30 | 90>(30);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Consultations Filter
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Portfolio Form State
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [pfTitle, setPfTitle] = useState('');
  const [pfClient, setPfClient] = useState('');
  const [pfIndustry, setPfIndustry] = useState('');
  const [pfService, setPfService] = useState('طراحی و توسعه داشبوردهای مدیریتی');
  const [pfImage, setPfImage] = useState('/assets/aistudio/Kabinowood_9a6089ec.webp');
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

  // Settings State
  const [contactForm, setContactForm] = useState<ContactInfo>({
    phone: '09164006698',
    email: 'info@bineshbi.ir',
    address: null,
    workingHours: 'شنبه تا چهارشنبه، ساعت ۹ تا ۱۷',
    instagram: null,
    telegram: null,
    bale: null,
    linkedin: null,
    otherSocial: null
  });
  const [notifForm, setNotifForm] = useState({
    adminAlertPhone: '09164006698',
    adminAlertEmail: 'info@bineshbi.ir',
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

  const fetchAdminOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setConsultations(data.consultations || []);
          setPortfolio(data.portfolio || []);
          setInsights(data.insights || []);
          if (data.settings?.contactInfo) {
            setContactForm({
              phone: data.settings.contactInfo.phone ?? null,
              email: data.settings.contactInfo.email ?? null,
              address: data.settings.contactInfo.address ?? null,
              workingHours: data.settings.contactInfo.workingHours ?? null,
              instagram: data.settings.contactInfo.instagram ?? null,
              telegram: data.settings.contactInfo.telegram ?? null,
              bale: data.settings.contactInfo.bale ?? null,
              linkedin: data.settings.contactInfo.linkedin ?? null,
              otherSocial: data.settings.contactInfo.otherSocial ?? null
            });
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
  }, []);

  const fetchAnalytics = useCallback(async (days: 7 | 30 | 90) => {
    setAnalyticsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/analytics?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.analytics) {
          setAnalyticsData(data.analytics);
        }
      }
    } catch {
      // ignore
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUser?.role === 'admin') {
      fetchAdminOverview();
    }
  }, [authUser?.id, authUser?.role, fetchAdminOverview]);

  useEffect(() => {
    if (authUser?.role === 'admin') {
      fetchAnalytics(analyticsDays);
    }
  }, [authUser?.id, authUser?.role, analyticsDays, fetchAnalytics]);

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
      image: pfImage.trim() || '/assets/aistudio/Kabinowood_9a6089ec.webp',
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
              برای مدیریت درخواست‌های مشاوره، آمار بازدید داخلی، نمونه‌کارها و محتوای سایت وارد شوید.
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
            مدیریت درخواست‌ها، آمار بازدید داخلی و محتوای وب‌سایت
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
            onClick={() => {
              fetchAdminOverview();
              fetchAnalytics(analyticsDays);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer"
            title="به‌روزرسانی اطلاعات"
          >
            <RefreshCw className={`w-4 h-4 ${loading || analyticsLoading ? 'animate-spin' : ''}`} />
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
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'analytics'
              ? 'bg-[#062B4D] text-white'
              : 'text-[#435466] hover:bg-[#F7FAFC]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>
            آمار بازدید داخلی
            {analyticsData ? ` (${analyticsData.totalVisits.toLocaleString('fa-IR')})` : ''}
          </span>
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
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#062B4D] text-white'
              : 'text-[#435466] hover:bg-[#F7FAFC]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>اطلاعات تماس، شبکه‌های اجتماعی و اطلاع‌رسانی</span>
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

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="w-4 h-4 text-[#64748B] absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جست‌وجو نام، شماره، کد رهگیری..."
                  className="pr-9 pl-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:outline-none w-full md:w-56"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-xl bg-[#087A9D] hover:bg-[#062B4D] text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer shrink-0"
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
          TAB 4: INTERNAL VISITOR ANALYTICS (MySQL / SQLite Backed)
      ===================================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header & Range Controls */}
          <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#062B4D]">
                  آمار بازدید داخلی وب‌سایت بینش
                </h2>
                {analyticsData && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EAF7F9] text-[#087A9D] text-[11px] font-bold">
                    دیتابیس فعال: {analyticsData.dbEngine === 'mysql' ? 'MySQL' : 'SQLite'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                گزارش مستقیم بازدید صفحات عمومی سایت ذخیره‌شده روی سرور (بدون وابستگی به سرویس‌های خارجی).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {([7, 30, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setAnalyticsDays(days)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    analyticsDays === days
                      ? 'bg-[#062B4D] text-white'
                      : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0] hover:bg-[#EAF7F9]'
                  }`}
                >
                  {days} روز اخیر
                </button>
              ))}
              <button
                type="button"
                onClick={() => fetchAnalytics(analyticsDays)}
                className="px-3 py-2 rounded-xl bg-[#EAF7F9] text-[#087A9D] hover:bg-[#08A9C5] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                <span>به‌روزرسانی</span>
              </button>
            </div>
          </div>

          {!analyticsData ? (
            <div className="bg-white rounded-2xl border border-[#E3EBF0] p-12 text-center text-sm text-[#64748B]">
              {analyticsLoading ? 'در حال بارگذاری آمار بازدید...' : 'هنوز داده‌ای برای نمایش وجود ندارد.'}
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>کل بازدیدها (همه زمان‌ها)</span>
                    <Eye className="w-4 h-4 text-[#08A9C5]" />
                  </div>
                  <div className="text-2xl font-bold text-[#062B4D] font-mono-num">
                    {analyticsData.totalVisits.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-[11px] text-[#087A9D]">
                    {analyticsData.periodVisits.toLocaleString('fa-IR')} بازدید در {analyticsData.rangeDays} روز اخیر
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>بازدیدهای امروز</span>
                    <Clock className="w-4 h-4 text-[#08A9C5]" />
                  </div>
                  <div className="text-2xl font-bold text-[#062B4D] font-mono-num">
                    {analyticsData.todayVisits.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-[11px] text-[#087A9D]">
                    {analyticsData.todayUniqueVisitors.toLocaleString('fa-IR')} بازدیدکننده یکتا امروز
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>بازدیدکنندگان یکتا ({analyticsData.rangeDays} روز)</span>
                    <UserCheck className="w-4 h-4 text-[#08A9C5]" />
                  </div>
                  <div className="text-2xl font-bold text-[#062B4D] font-mono-num">
                    {analyticsData.periodUniqueVisitors.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    مجموع کل: {analyticsData.totalUniqueVisitors.toLocaleString('fa-IR')} نفر یکتا
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>بازدید ۷ روز اخیر</span>
                    <BarChart3 className="w-4 h-4 text-[#08A9C5]" />
                  </div>
                  <div className="text-2xl font-bold text-[#062B4D] font-mono-num">
                    {analyticsData.last7DaysVisits.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    میانگین روزانه:{' '}
                    {Math.round(analyticsData.last7DaysVisits / 7).toLocaleString('fa-IR')} بازدید
                  </div>
                </div>
              </div>

              {/* Daily Trend Chart */}
              <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#062B4D]">
                    روند بازدید روزانه ({analyticsData.rangeDays} روز اخیر)
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    نشانگر روی هر ستون تعداد بازدید و کاربر یکتا را نشان می‌دهد
                  </span>
                </div>
                {(() => {
                  const maxViews = Math.max(
                    1,
                    ...analyticsData.dailyTrend.map((d) => d.views)
                  );
                  return (
                    <div className="overflow-x-auto pb-2">
                      <div className="min-w-[460px] h-48 flex items-end gap-1.5 pt-6 border-b border-[#E3EBF0]">
                        {analyticsData.dailyTrend.map((day) => {
                          const pct = Math.max(
                            day.views > 0 ? 8 : 2,
                            Math.round((day.views / maxViews) * 100)
                          );
                          return (
                            <div
                              key={day.date}
                              className="flex-1 flex flex-col items-center justify-end h-full group relative"
                              title={`${day.date} — ${day.views} بازدید (${day.uniqueVisitors} یکتا)`}
                            >
                              <div className="hidden group-hover:block absolute -top-7 whitespace-nowrap px-2 py-0.5 rounded bg-[#062B4D] text-white text-[10px] font-mono-num z-10">
                                {day.date.slice(5)}: {day.views} ({day.uniqueVisitors} یکتا)
                              </div>
                              <div
                                className={`w-full rounded-t-md transition-all ${
                                  day.views > 0
                                    ? 'bg-[#08A9C5] group-hover:bg-[#062B4D]'
                                    : 'bg-[#E3EBF0]'
                                }`}
                                style={{ height: `${pct}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="min-w-[460px] flex justify-between text-[10px] text-[#64748B] font-mono-num mt-2 dir-ltr">
                        <span>{analyticsData.dailyTrend[0]?.date}</span>
                        <span>
                          {
                            analyticsData.dailyTrend[
                              Math.floor(analyticsData.dailyTrend.length / 2)
                            ]?.date
                          }
                        </span>
                        <span>
                          {analyticsData.dailyTrend[analyticsData.dailyTrend.length - 1]?.date}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Top Pages + Device/Browser/Referrer Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Top Pages */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[#062B4D]">
                    پربازدیدترین صفحات سایت ({analyticsData.rangeDays} روز اخیر)
                  </h3>
                  {analyticsData.topPages.length === 0 ? (
                    <p className="text-xs text-[#64748B]">هنوز بازدیدی در این بازه ثبت نشده است.</p>
                  ) : (
                    <div className="space-y-3">
                      {analyticsData.topPages.map((pg) => {
                        const share =
                          analyticsData.periodVisits > 0
                            ? Math.round((pg.views / analyticsData.periodVisits) * 100)
                            : 0;
                        return (
                          <div
                            key={pg.path}
                            className="p-3 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-[#062B4D] truncate">
                                  {ROUTE_PERSIAN_LABELS[pg.path] || pg.pageTitle || pg.path}
                                </span>
                                <span className="font-mono-num text-[11px] text-[#64748B] dir-ltr">
                                  {pg.path}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 font-mono-num shrink-0">
                                <span className="font-bold text-[#087A9D]">
                                  {pg.views.toLocaleString('fa-IR')} بازدید
                                </span>
                                <span className="text-[11px] text-[#64748B]">
                                  ({pg.uniqueVisitors.toLocaleString('fa-IR')} یکتا)
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#E3EBF0] overflow-hidden">
                              <div
                                className="h-full bg-[#08A9C5] rounded-full"
                                style={{ width: `${Math.max(4, share)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Devices, Browsers, Referrers */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Devices */}
                  <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#062B4D]">تفکیک دستگاه بازدیدکنندگان</h3>
                    {analyticsData.deviceBreakdown.length === 0 ? (
                      <p className="text-xs text-[#64748B]">داده‌ای ثبت نشده است.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {analyticsData.deviceBreakdown.map((dev) => {
                          const pct =
                            analyticsData.periodVisits > 0
                              ? Math.round((dev.count / analyticsData.periodVisits) * 100)
                              : 0;
                          return (
                            <div
                              key={dev.deviceType}
                              className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#F7FAFC]"
                            >
                              <div className="flex items-center gap-2 font-medium text-[#062B4D]">
                                {dev.deviceType === 'mobile' ? (
                                  <Smartphone className="w-4 h-4 text-[#08A9C5]" />
                                ) : dev.deviceType === 'tablet' ? (
                                  <Tablet className="w-4 h-4 text-[#08A9C5]" />
                                ) : (
                                  <Monitor className="w-4 h-4 text-[#08A9C5]" />
                                )}
                                <span>
                                  {DEVICE_PERSIAN_LABELS[dev.deviceType] || dev.deviceType}
                                </span>
                              </div>
                              <span className="font-mono-num font-bold text-[#087A9D]">
                                {dev.count.toLocaleString('fa-IR')} ({pct}٪)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Browsers */}
                  <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#062B4D]">مرورگرهای پرتکرار</h3>
                    {analyticsData.browserBreakdown.length === 0 ? (
                      <p className="text-xs text-[#64748B]">داده‌ای ثبت نشده است.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.browserBreakdown.map((br) => (
                          <div
                            key={br.browser}
                            className="px-3 py-1.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs flex items-center gap-2"
                          >
                            <span className="font-mono-num font-medium text-[#062B4D]">
                              {br.browser}
                            </span>
                            <span className="font-mono-num font-bold text-[#087A9D]">
                              {br.count.toLocaleString('fa-IR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top Referrers */}
                  <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#062B4D] flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#08A9C5]" />
                      <span>منابع ورودی (Referrers)</span>
                    </h3>
                    {analyticsData.topReferrers.length === 0 ? (
                      <p className="text-xs text-[#64748B]">
                        بیشتر بازدیدها به‌صورت مستقیم (Direct) ثبت شده‌اند.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {analyticsData.topReferrers.map((ref) => (
                          <div
                            key={ref.referrer}
                            className="flex items-center justify-between gap-2 text-xs p-2 rounded-lg bg-[#F7FAFC]"
                          >
                            <span className="font-mono-num text-[#263B50] truncate dir-ltr">
                              {ref.referrer}
                            </span>
                            <span className="font-mono-num font-bold text-[#087A9D] shrink-0">
                              {ref.count.toLocaleString('fa-IR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Visits Table */}
              <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#062B4D]">آخرین بازدیدهای ثبت‌شده</h3>
                {analyticsData.recentVisits.length === 0 ? (
                  <p className="text-xs text-[#64748B]">هنوز بازدیدی ثبت نشده است.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[#E3EBF0] text-[#64748B]">
                          <th className="py-2.5 px-3 font-medium">صفحه</th>
                          <th className="py-2.5 px-3 font-medium">دستگاه</th>
                          <th className="py-2.5 px-3 font-medium">مرورگر</th>
                          <th className="py-2.5 px-3 font-medium">منبع ورودی</th>
                          <th className="py-2.5 px-3 font-medium">زمان (به وقت ایران)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBF0]">
                        {analyticsData.recentVisits.map((v) => (
                          <tr key={v.id} className="hover:bg-[#F7FAFC]">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-[#062B4D] block">
                                {ROUTE_PERSIAN_LABELS[v.path] || v.path}
                              </span>
                              <span className="font-mono-num text-[11px] text-[#64748B] dir-ltr">
                                {v.path}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[#435466]">
                              {DEVICE_PERSIAN_LABELS[v.deviceType] || v.deviceType}
                            </td>
                            <td className="py-2.5 px-3 font-mono-num text-[#435466]">
                              {v.browser}
                            </td>
                            <td className="py-2.5 px-3 font-mono-num text-[#64748B] max-w-[200px] truncate dir-ltr">
                              {v.referrer || 'مستقیم'}
                            </td>
                            <td className="py-2.5 px-3 font-mono-num text-[#64748B] whitespace-nowrap">
                              {formatIranDateTime(v.visitedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
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

            <div className="pt-2 border-t border-[#E3EBF0] space-y-3">
              <h3 className="text-xs font-bold text-[#062B4D]">
                لینک شبکه‌های اجتماعی (در صورت خالی بودن نمایش داده نمی‌شود)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#263B50] mb-1">
                    لینک اینستاگرام (Instagram)
                  </label>
                  <input
                    type="url"
                    value={contactForm.instagram || ''}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, instagram: e.target.value || null })
                    }
                    placeholder="https://instagram.com/bineshbi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#263B50] mb-1">
                    لینک تلگرام (Telegram)
                  </label>
                  <input
                    type="url"
                    value={contactForm.telegram || ''}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, telegram: e.target.value || null })
                    }
                    placeholder="https://t.me/bineshbi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#263B50] mb-1">
                    لینک بله (Bale)
                  </label>
                  <input
                    type="url"
                    value={contactForm.bale || ''}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, bale: e.target.value || null })
                    }
                    placeholder="https://ble.ir/bineshbi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#263B50] mb-1">
                    لینک لینکدین (LinkedIn)
                  </label>
                  <input
                    type="url"
                    value={contactForm.linkedin || ''}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, linkedin: e.target.value || null })
                    }
                    placeholder="https://linkedin.com/company/bineshbi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] dir-ltr text-left"
                  />
                </div>
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
