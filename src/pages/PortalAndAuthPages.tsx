import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquarePlus,
  Calendar,
  Target,
  FolderOpen,
  Settings,
  LogOut,
  Layers,
  ExternalLink,
  ShieldCheck,
  Send,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { RoutePath } from '../data/bineshData';
import { Mascot } from '../components/BrandComponents';
import { apiFetch, getAuthToken, setAuthToken } from '../lib/submitRequest';

export interface AuthUserInfo {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'collaborator';
  organizationId: string | null;
}

interface PortalAndAuthPagesProps {
  currentRoute: '/auth' | '/portal';
  onNavigate: (route: RoutePath) => void;
  authUser?: AuthUserInfo | null;
  onAuthChange?: (user: AuthUserInfo | null) => void;
}

type PortalTabId =
  | 'overview'
  | 'dashboards'
  | 'reports'
  | 'requests'
  | 'sessions'
  | 'goals'
  | 'files'
  | 'settings';

const PORTAL_TAB_INTRO: Record<PortalTabId, string> = {
  overview: 'خلاصه‌ای از وضعیت همکاری، موارد جدید و فعالیت‌های قابل پیگیری در فضای سازمانی شما.',
  dashboards: 'دسترسی به داشبوردهایی که برای سازمان شما فعال شده‌اند.',
  reports: 'مشاهده و دریافت گزارش‌های تحلیلی منتشرشده برای سازمان شما.',
  requests: 'ثبت پرسش یا موضوعی که نیازمند بررسی تحلیلی است و پیگیری وضعیت آن.',
  sessions: 'مشاهده برنامه جلسات، موضوع‌های مورد بررسی و جمع‌بندی‌های ثبت‌شده.',
  goals: 'مشاهده اهداف، شاخص‌ها و اقدام‌هایی که در جلسات توافق و ثبت شده‌اند.',
  files: 'دسترسی به فایل‌ها و مستندات مرتبط با همکاری، مطابق سطح دسترسی.',
  settings: 'مدیریت اطلاعات کاربری و تنظیمات مجاز حساب.'
};

const PORTAL_EMPTY_MESSAGES: Record<PortalTabId, string> = {
  overview: 'هنوز داشبوردی برای این سازمان فعال نشده است.',
  dashboards: 'هنوز داشبوردی برای این سازمان فعال نشده است.',
  reports:
    'گزارشی برای نمایش وجود ندارد. پس از انتشار گزارش جدید، در این قسمت قابل مشاهده خواهد بود.',
  requests: 'هنوز درخواست تحلیلی ثبت نکرده‌اید.',
  sessions: 'جلسه‌ای برای نمایش ثبت نشده است.',
  goals: 'هدف یا اقدام فعالی برای نمایش وجود ندارد.',
  files: 'فایلی در این بخش بارگذاری نشده است.',
  settings: 'اطلاعاتی برای نمایش وجود ندارد.'
};

const PORTAL_STATUS_LABELS = [
  'در انتظار بررسی',
  'در حال بررسی',
  'نیازمند اطلاعات تکمیلی',
  'برنامه‌ریزی شده',
  'تکمیل شده',
  'لغو شده',
  'منتشر شده'
] as const;

const AUTH_SYSTEM_MESSAGES = [
  'اطلاعات ورود صحیح نیست. لطفاً دوباره بررسی کنید.',
  'حسابی با این مشخصات پیدا نشد.',
  'این ایمیل یا شماره همراه قبلاً ثبت شده است.',
  'حساب کاربری با موفقیت ایجاد شد.',
  'راهنمای بازیابی رمز عبور ارسال شد؛ در صورت دریافت نکردن، اطلاعات واردشده را بررسی کنید.',
  'برای ادامه، ابتدا حساب خود را تأیید کنید.'
] as const;

interface PortalItemRow {
  id: number;
  organizationId: string;
  itemType: 'dashboard' | 'report' | 'session' | 'goal' | 'file';
  title: string;
  description: string;
  status: string;
  metaText: string;
  linkUrl: string;
  createdAt: string;
}

interface AnalysisRequestRow {
  id: number;
  organizationId: string;
  userId: number;
  userName: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  adminResponse: string;
  createdAt: string;
}

interface OrgRow {
  id: string;
  name: string;
  contractModules: string[];
}

export const PortalAndAuthPages: React.FC<PortalAndAuthPagesProps> = ({
  currentRoute,
  onNavigate,
  authUser,
  onAuthChange
}) => {
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [authFeedback, setAuthFeedback] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Client Portal state
  const [activePortalTab, setActivePortalTab] = useState<PortalTabId>('overview');
  const [selectedOrg, setSelectedOrg] = useState<string>('org-1');
  const [selectedRole, setSelectedRole] = useState<'manager' | 'user' | 'collaborator'>('manager');
  const [showEmptyStatePreview, setShowEmptyStatePreview] = useState<boolean>(false);

  // Real portal backend data
  const [portalLoading, setPortalLoading] = useState<boolean>(false);
  const [portalOrg, setPortalOrg] = useState<OrgRow>({
    id: 'org-1',
    name: 'صنایع چوب و ام‌دی‌اف کابینو وود',
    contractModules: ['داشبوردهای مدیریتی', 'تحلیل و پایش مستمر', 'مشاوره و کوچینگ']
  });
  const [allOrgs, setAllOrgs] = useState<OrgRow[]>([]);
  const [portalItems, setPortalItems] = useState<PortalItemRow[]>([]);
  const [analysisRequests, setAnalysisRequests] = useState<AnalysisRequestRow[]>([]);

  // New Analysis Request Form
  const [reqTitle, setReqTitle] = useState('');
  const [reqPriority, setReqPriority] = useState('عادی');
  const [reqDesc, setReqDesc] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSuccess, setReqSuccess] = useState('');
  const [reqError, setReqError] = useState('');

  const fetchPortalData = async (orgIdOverride?: string) => {
    const token = getAuthToken();
    if (!token) return;
    setPortalLoading(true);
    try {
      const targetOrg = orgIdOverride || selectedOrg;
      const res = await apiFetch(`/api/portal/data?orgId=${encodeURIComponent(targetOrg)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          if (data.organization) setPortalOrg(data.organization);
          if (Array.isArray(data.organizations)) setAllOrgs(data.organizations);
          if (Array.isArray(data.items)) setPortalItems(data.items);
          if (Array.isArray(data.requests)) setAnalysisRequests(data.requests);
        }
      }
    } catch {
      // ignore offline fallback
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    if (currentRoute === '/portal' && getAuthToken()) {
      fetchPortalData(selectedOrg);
    }
  }, [currentRoute, selectedOrg, authUser?.id]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthFeedback('');
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setAuthError(AUTH_SYSTEM_MESSAGES[0]);
      return;
    }
    setAuthLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || AUTH_SYSTEM_MESSAGES[0]);
      } else {
        setAuthToken(data.token);
        if (onAuthChange) onAuthChange(data.user);
        setAuthFeedback(`خوش آمدید، ${data.user.fullName}. ورود با موفقیت انجام شد.`);
        if (data.user.role === 'admin') {
          setTimeout(() => onNavigate('/admin'), 500);
        } else {
          setTimeout(() => onNavigate('/portal'), 500);
        }
      }
    } catch {
      setAuthError('خطا در برقراری ارتباط با سرور.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthFeedback('');
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setAuthError('لطفاً اطلاعات خواسته‌شده را بررسی کنید.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setAuthError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: regName.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim(),
          password: regPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || AUTH_SYSTEM_MESSAGES[2]);
      } else {
        setAuthToken(data.token);
        if (onAuthChange) onAuthChange(data.user);
        setAuthFeedback(AUTH_SYSTEM_MESSAGES[3]);
        setTimeout(() => onNavigate('/portal'), 600);
      }
    } catch {
      setAuthError('خطا در ایجاد حساب کاربری.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
    if (onAuthChange) onAuthChange(null);
    onNavigate('/auth');
  };

  const handleSubmitAnalysisRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqError('');
    setReqSuccess('');
    if (!reqTitle.trim()) {
      setReqError('لطفاً عنوان پرسش یا موضوع تحلیلی را وارد کنید.');
      return;
    }
    if (!getAuthToken()) {
      setReqError('برای ثبت درخواست تحلیل در پایگاه داده، ابتدا وارد حساب کاربری شوید.');
      return;
    }
    setReqSubmitting(true);
    try {
      const res = await apiFetch('/api/portal/requests', {
        method: 'POST',
        body: JSON.stringify({
          title: reqTitle.trim(),
          description: reqDesc.trim(),
          priority: reqPriority
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setReqError(data.error || 'خطا در ثبت درخواست.');
      } else {
        setReqSuccess('درخواست تحلیل شما با موفقیت ثبت شد و برای تیم بینش ارسال گردید.');
        setReqTitle('');
        setReqDesc('');
        fetchPortalData(selectedOrg);
      }
    } catch {
      setReqError('خطا در ارتباط با سرور.');
    } finally {
      setReqSubmitting(false);
    }
  };

  // =========================================================================
  // 9.1. AUTHENTICATION & PUBLIC USER ACCOUNT (/auth — Pack §15)
  // =========================================================================
  if (currentRoute === '/auth') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Right Column: Auth Forms */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#E3EBF0]">
                <span className="text-xs font-medium text-[#087A9D]">حساب کاربری بینش</span>
                {authUser && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#062B4D] font-bold">
                      واردشده: {authUser.fullName}
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      (خروج)
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthFeedback('');
                    setAuthError('');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                    authMode === 'login' ? 'bg-[#062B4D] text-white' : 'text-[#435466]'
                  }`}
                >
                  ورود به حساب
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthFeedback('');
                    setAuthError('');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                    authMode === 'register' ? 'bg-[#062B4D] text-white' : 'text-[#435466]'
                  }`}
                >
                  ایجاد حساب کاربری
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setAuthFeedback('');
                    setAuthError('');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                    authMode === 'forgot' ? 'bg-[#062B4D] text-white' : 'text-[#435466]'
                  }`}
                >
                  بازیابی رمز عبور
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {authError}
                </div>
              )}

              {authFeedback && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#EAF7F9] border border-[#08A9C5] text-xs text-[#062B4D]">
                  {authFeedback}
                </div>
              )}

              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#062B4D]">
                      ورود به حساب بینش
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#435466]">
                      برای دسترسی به پورتال اختصاصی مشتریان یا پنل مدیریت، اطلاعات حساب را وارد کنید.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                      ایمیل یا شماره همراه
                    </label>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="09120000001 یا ایمیل"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num dir-ltr text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                      رمز عبور
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none dir-ltr text-left"
                    />
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] cursor-pointer disabled:opacity-60"
                    >
                      {authLoading ? 'در حال بررسی...' : 'ورود به حساب'}
                    </button>
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setAuthFeedback('');
                          setAuthError('');
                        }}
                        className="text-[#087A9D] hover:text-[#062B4D] font-medium cursor-pointer"
                      >
                        ایجاد حساب کاربری
                      </button>
                      <span className="text-[#64748B]">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setAuthFeedback('');
                          setAuthError('');
                        }}
                        className="text-[#435466] hover:text-[#062B4D] cursor-pointer"
                      >
                        رمز عبور را فراموش کرده‌اید؟
                      </button>
                    </div>
                  </div>

                  {/* Quick Test Credentials Helper */}
                  <div className="mt-6 pt-4 border-t border-[#E3EBF0] space-y-2">
                    <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#08A9C5]" />
                      <span>ورود سریع آزمایشی (حساب‌های پیش‌فرض دیتابیس):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('09120000001');
                          setLoginPassword('Client@1404');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#EAF7F9] hover:bg-[#08A9C5]/20 text-[#062B4D] text-[11px] font-medium cursor-pointer border border-[#08A9C5]/30"
                      >
                        مشتری نمونه (کابینو وود)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('09164006698');
                          setLoginPassword('Binesh@1404');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#F7FAFC] hover:bg-[#E3EBF0] text-[#062B4D] text-[11px] font-medium cursor-pointer border border-[#E3EBF0]"
                      >
                        مدیر سیستم (پنل مدیریت)
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#062B4D]">
                      ایجاد حساب کاربری
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#435466] leading-relaxed">
                      با ایجاد حساب، به پورتال مشتریان بینش متصل می‌شوید و می‌توانید درخواست‌های تحلیل و گزارش‌های سازمانی خود را دنبال کنید.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#263B50] mb-1">
                        نام کامل *
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#263B50] mb-1">
                        شماره همراه *
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num dir-ltr text-left"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#263B50] mb-1">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num dir-ltr text-left"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#263B50] mb-1">
                        رمز عبور *
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none dir-ltr text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#263B50] mb-1">
                        تکرار رمز عبور *
                      </label>
                      <input
                        type="password"
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none dir-ltr text-left"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] cursor-pointer disabled:opacity-60"
                  >
                    {authLoading ? 'در حال ثبت...' : 'ایجاد حساب'}
                  </button>
                </form>
              )}

              {authMode === 'forgot' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!recoveryIdentifier.trim()) {
                      setAuthError(AUTH_SYSTEM_MESSAGES[1]);
                      return;
                    }
                    setAuthError('');
                    setAuthFeedback(AUTH_SYSTEM_MESSAGES[4]);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <h1 className="text-xl font-bold text-[#062B4D]">بازیابی رمز عبور</h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#435466]">
                      ایمیل یا شماره همراه متصل به حساب خود را وارد کنید تا راهنمای بازیابی برای شما ارسال شود.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                      ایمیل یا شماره همراه
                    </label>
                    <input
                      type="text"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none dir-ltr text-left"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium cursor-pointer"
                  >
                    ارسال راهنمای بازیابی
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-[#E3EBF0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
              <span>حساب کاربری عمومی و فضای اختصاصی مشتریان</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="text-[#435466] hover:text-[#062B4D] cursor-pointer"
                >
                  پنل مدیریت سایت
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/portal')}
                  className="text-[#087A9D] font-bold hover:text-[#062B4D] cursor-pointer"
                >
                  فضای اختصاصی مشتریان ←
                </button>
              </div>
            </div>
          </div>

          {/* Left Column: Portal Access Info + Security Mascot */}
          <div className="lg:col-span-5 rounded-2xl bg-[#062B4D] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs text-[#3CDDDD] block">
                فضای کاربری بینش
              </span>
              <h2 className="text-xl font-bold leading-snug">
                فضای اختصاصی همکاری شما با بینش
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                در این فضا، اطلاعات و خروجی‌های مرتبط با همکاری فعال شما در دسترس قرار می‌گیرند. امکانات قابل مشاهده بر اساس نوع قرارداد و سطح دسترسی هر کاربر تعیین می‌شوند.
              </p>

              <Mascot
                name="security"
                framed
                className="mx-auto w-full max-w-[260px] p-2"
              />

              <div className="space-y-2.5 pt-2 text-xs text-white/85">
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <strong className="text-[#3CDDDD] block mb-1">قابلیت‌های فعال پورتال مشتریان:</strong>
                  <ul className="space-y-1 text-white/75">
                    <li>• مشاهده داشبوردهای تعاملی و گزارش‌های دوره‌ای سازمان</li>
                    <li>• ثبت مستقیم درخواست تحلیل جدید و دریافت پاسخ مشاور</li>
                    <li>• پیگیری مصوبات جلسات مشاوره و اهداف کلیدی (KPI)</li>
                    <li>• دسترسی امن به فایل‌ها و مستندات فنی پروژه</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/portal')}
              className="w-full py-3 rounded-xl bg-[#08A9C5] text-white text-xs font-medium hover:bg-[#3CDDDD] hover:text-[#062B4D] transition-colors cursor-pointer"
            >
              مشاهده فضای اختصاصی همکاری شما با بینش
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 9.2. DEDICATED CLIENT PORTAL (/portal — Pack §16 + Real DB Integration)
  // =========================================================================
  const portalNavItems: { id: PortalTabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'نمای کلی', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'dashboards', label: 'داشبوردهای من', icon: <Layers className="w-4 h-4" /> },
    { id: 'reports', label: 'گزارش‌های من', icon: <FileText className="w-4 h-4" /> },
    { id: 'requests', label: 'درخواست‌های تحلیل', icon: <MessageSquarePlus className="w-4 h-4" /> },
    { id: 'sessions', label: 'جلسات مشاوره', icon: <Calendar className="w-4 h-4" /> },
    { id: 'goals', label: 'اهداف و اقدامات', icon: <Target className="w-4 h-4" /> },
    { id: 'files', label: 'فایل‌ها و اسناد', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'settings', label: 'تنظیمات حساب', icon: <Settings className="w-4 h-4" /> }
  ];

  const isLoggedIn = Boolean(authUser && getAuthToken());
  const dashboardsList = portalItems.filter((i) => i.itemType === 'dashboard');
  const reportsList = portalItems.filter((i) => i.itemType === 'report');
  const sessionsList = portalItems.filter((i) => i.itemType === 'session');
  const goalsList = portalItems.filter((i) => i.itemType === 'goal');
  const filesList = portalItems.filter((i) => i.itemType === 'file');

  const fallbackOrgData =
    selectedOrg === 'org-1'
      ? {
          id: 'org-1',
          name: 'صنایع چوب و ام‌دی‌اف کابینو وود',
          contractModules: ['داشبوردهای مدیریتی', 'تحلیل و پایش مستمر', 'مشاوره و کوچینگ']
        }
      : {
          id: 'org-2',
          name: 'پخش مویرگی و بازرگانی پیشرو',
          contractModules: ['داشبوردهای مدیریتی']
        };

  const activeOrg = isLoggedIn ? portalOrg : fallbackOrgData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Portal Header */}
      <div className="bg-white rounded-2xl border border-[#E3EBF0] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-medium text-[#087A9D]">پنل اختصاصی مشتریان</span>
            {isLoggedIn ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EAF7F9] text-[#062B4D] text-[11px] font-bold">
                متصل به دیتابیس · {authUser?.fullName}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-lg bg-[#F7FAFC] border border-[#E3EBF0] text-[#64748B] text-[11px]">
                حالت پیش‌نمایش (برای مشاهده داده‌های واقعی وارد حساب شوید)
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#062B4D]">
            فضای اختصاصی همکاری شما با بینش
          </h1>
          <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
            در این فضا، اطلاعات و خروجی‌های مرتبط با همکاری فعال شما در دسترس قرار می‌گیرند. امکانات قابل مشاهده بر اساس نوع قرارداد و سطح دسترسی هر کاربر تعیین می‌شوند.
          </p>
        </div>

        {/* Organization, Role & Empty State Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
          {(!isLoggedIn || authUser?.role === 'admin') && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B]">سازمان:</span>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-medium text-[#062B4D]"
              >
                {allOrgs.length > 0 ? (
                  allOrgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="org-1">صنایع چوب و ام‌دی‌اف کابینو وود</option>
                    <option value="org-2">پخش مویرگی و بازرگانی پیشرو</option>
                  </>
                )}
              </select>
            </div>
          )}

          {!isLoggedIn && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B]">نقش:</span>
              <select
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as 'manager' | 'user' | 'collaborator')
                }
                className="px-3 py-1.5 rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] font-medium text-[#062B4D]"
              >
                <option value="manager">مدیر</option>
                <option value="user">کاربر</option>
                <option value="collaborator">همکار</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowEmptyStatePreview(!showEmptyStatePreview)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer ${
              showEmptyStatePreview
                ? 'bg-[#08A9C5] text-white border-[#08A9C5]'
                : 'bg-[#F7FAFC] text-[#435466] border-[#E3EBF0]'
            }`}
          >
            {showEmptyStatePreview ? 'نمایش داده‌های فعال' : 'پیش‌نمایش حالت خالی'}
          </button>

          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => onNavigate('/auth')}
              className="px-3.5 py-1.5 rounded-xl bg-[#062B4D] text-white text-xs font-medium cursor-pointer"
            >
              ورود به حساب واقعی
            </button>
          ) : (
            authUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="px-3.5 py-1.5 rounded-xl bg-[#062B4D] text-white text-xs font-medium cursor-pointer"
              >
                پنل مدیریت کل سایت
              </button>
            )
          )}
        </div>
      </div>

      {/* Portal Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-[#E3EBF0] p-3 space-y-1">
          {portalNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePortalTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activePortalTab === item.id
                  ? 'bg-[#062B4D] text-white'
                  : 'text-[#435466] hover:bg-[#F7FAFC] hover:text-[#062B4D]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-3 mt-3 border-t border-[#E3EBF0]">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب کاربری</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('/auth')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#062B4D] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>صفحه ورود به حساب</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Portal Viewport */}
        <main className="lg:col-span-9 bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 min-h-[480px] flex flex-col justify-between">
          <div>
            {/* Section Context Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E3EBF0]">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#062B4D]">
                  {portalNavItems.find((i) => i.id === activePortalTab)?.label}
                </h2>
                <p className="text-xs sm:text-sm text-[#435466] mt-1">
                  {PORTAL_TAB_INTRO[activePortalTab]}
                </p>
              </div>
              <div className="text-xs text-[#64748B]">
                سازمان: <strong className="text-[#062B4D]">{activeOrg.name}</strong> · سطح دسترسی:{' '}
                <strong className="text-[#087A9D]">
                  {authUser?.role === 'admin'
                    ? 'مدیر سیستم'
                    : (authUser?.role || selectedRole) === 'manager'
                    ? 'مدیر'
                    : (authUser?.role || selectedRole) === 'user'
                    ? 'کاربر'
                    : 'همکار'}
                </strong>
              </div>
            </div>

            {portalLoading ? (
              <div className="py-16 text-center text-xs text-[#64748B]">
                در حال بارگذاری اطلاعات سازمان از پایگاه داده...
              </div>
            ) : showEmptyStatePreview ? (
              <div className="my-6 rounded-2xl border border-[#E3EBF0] bg-white p-8 text-center space-y-4">
                <Mascot name="empty" className="max-w-[200px] mx-auto" />
                <p className="text-sm text-[#435466] leading-relaxed">
                  {PORTAL_EMPTY_MESSAGES[activePortalTab]}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* TAB 1: OVERVIEW */}
                {activePortalTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div
                        onClick={() => setActivePortalTab('dashboards')}
                        className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] hover:border-[#08A9C5] cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-[#64748B] block">داشبوردهای فعال</span>
                        <span className="font-mono-num text-xl font-bold text-[#062B4D] mt-1 block">
                          {isLoggedIn ? dashboardsList.length : 1}
                        </span>
                      </div>
                      <div
                        onClick={() => setActivePortalTab('reports')}
                        className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] hover:border-[#08A9C5] cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-[#64748B] block">گزارش‌های تحلیلی</span>
                        <span className="font-mono-num text-xl font-bold text-[#08A9C5] mt-1 block">
                          {isLoggedIn ? reportsList.length : 1}
                        </span>
                      </div>
                      <div
                        onClick={() => setActivePortalTab('sessions')}
                        className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] hover:border-[#08A9C5] cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-[#64748B] block">جلسات مشاوره</span>
                        <span className="font-mono-num text-xl font-bold text-[#062B4D] mt-1 block">
                          {isLoggedIn ? sessionsList.length : 1}
                        </span>
                      </div>
                      <div
                        onClick={() => setActivePortalTab('requests')}
                        className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] hover:border-[#08A9C5] cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-[#64748B] block">درخواست‌های تحلیل</span>
                        <span className="font-mono-num text-xl font-bold text-[#087A9D] mt-1 block">
                          {isLoggedIn ? analysisRequests.length : 1}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-[#EAF7F9]/60 border border-[#E3EBF0] space-y-2">
                      <h3 className="text-sm font-bold text-[#062B4D]">
                        مسیرهای همکاری فعال ({activeOrg.name}):
                      </h3>
                      <p className="text-xs text-[#435466]">
                        {activeOrg.contractModules.join(' · ')}
                      </p>
                    </div>

                    {!isLoggedIn && (
                      <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-[#435466]">
                          برای مشاهده داشبوردهای اختصاصی، گزارش‌ها و ثبت درخواست تحلیل واقعی، وارد حساب کاربری نمونه یا حساب سازمانی خود شوید.
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigate('/auth')}
                          className="px-4 py-2 rounded-xl bg-[#087A9D] text-white font-medium cursor-pointer shrink-0"
                        >
                          ورود به حساب ←
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: DASHBOARDS */}
                {activePortalTab === 'dashboards' && (
                  <div className="space-y-4">
                    {(isLoggedIn ? dashboardsList : [
                      {
                        id: 1,
                        title: 'داشبورد یکپارچه فروش، تولید و موجودی انبار',
                        description: 'پایش لحظه‌ای سفارشات، ضایعات برش و حاشیه سود محصولات',
                        status: 'منتشر شده',
                        metaText: 'به‌روزرسانی روزانه',
                        linkUrl: '/demo-webapp.html'
                      }
                    ]).map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#EAF7F9] text-[#087A9D] text-[11px] font-bold">
                              {item.status}
                            </span>
                            <span className="text-[11px] text-[#64748B]">{item.metaText}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#062B4D]">{item.title}</h3>
                          <p className="text-xs text-[#435466]">{item.description}</p>
                        </div>
                        {item.linkUrl && (
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-[#062B4D] text-white text-xs font-medium hover:bg-[#087A9D] inline-flex items-center gap-2 shrink-0 cursor-pointer"
                          >
                            <span>مشاهده داشبورد</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: REPORTS */}
                {activePortalTab === 'reports' && (
                  <div className="space-y-4">
                    {(isLoggedIn ? reportsList : [
                      {
                        id: 2,
                        title: 'گزارش تحلیلی بهای تمام‌شده و حاشیه سود فصل پاییز',
                        description: 'بررسی انحراف بهای تمام‌شده واقعی از استاندارد در خطوط تولید',
                        status: 'منتشر شده',
                        metaText: 'پاییز ۱۴۰۴',
                        linkUrl: '/demo-powerbi.html'
                      }
                    ]).map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#EAF7F9] text-[#087A9D] text-[11px] font-bold">
                              {item.status}
                            </span>
                            <span className="text-[11px] text-[#64748B]">{item.metaText}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#062B4D]">{item.title}</h3>
                          <p className="text-xs text-[#435466]">{item.description}</p>
                        </div>
                        {item.linkUrl && (
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] inline-flex items-center gap-2 shrink-0 cursor-pointer"
                          >
                            <span>مشاهده گزارش</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 4: ANALYSIS REQUESTS */}
                {activePortalTab === 'requests' && (
                  <div className="space-y-6">
                    {/* Form to submit a new analysis request */}
                    <form
                      onSubmit={handleSubmitAnalysisRequest}
                      className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-4"
                    >
                      <h3 className="text-sm font-bold text-[#062B4D]">
                        ثبت درخواست تحلیل یا پرسش جدید
                      </h3>

                      {reqError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                          {reqError}
                        </div>
                      )}
                      {reqSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{reqSuccess}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-[#263B50] mb-1">
                            عنوان موضوع یا پرسش تحلیلی *
                          </label>
                          <input
                            type="text"
                            value={reqTitle}
                            onChange={(e) => setReqTitle(e.target.value)}
                            placeholder="مثال: بررسی علت افزایش مرجوعی کالا در منطقه شمال"
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-white focus:border-[#08A9C5] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#263B50] mb-1">
                            اولویت بررسی
                          </label>
                          <select
                            value={reqPriority}
                            onChange={(e) => setReqPriority(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E3EBF0] bg-white focus:border-[#08A9C5] focus:outline-none"
                          >
                            <option value="عادی">عادی</option>
                            <option value="مهم">مهم</option>
                            <option value="فوری">فوری</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#263B50] mb-1">
                          توضیحات تکمیلی و بازه زمانی مدنظر
                        </label>
                        <textarea
                          rows={3}
                          value={reqDesc}
                          onChange={(e) => setReqDesc(e.target.value)}
                          placeholder="جزئیات مسئله یا داده‌های مرتبط را شرح دهید..."
                          className="w-full p-3 text-xs rounded-xl border border-[#E3EBF0] bg-white focus:border-[#08A9C5] focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={reqSubmitting}
                          className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{reqSubmitting ? 'در حال ثبت...' : 'ارسال درخواست تحلیل'}</span>
                        </button>
                      </div>
                    </form>

                    {/* List of existing analysis requests */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-[#062B4D]">
                        سوابق درخواست‌های تحلیل ثبت‌شده
                      </h3>
                      {analysisRequests.length === 0 ? (
                        <div className="p-6 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs text-[#64748B] text-center">
                          {isLoggedIn
                            ? 'هنوز درخواست تحلیلی برای این سازمان ثبت نشده است.'
                            : 'برای مشاهده و ثبت درخواست تحلیل واقعی، وارد حساب کاربری شوید.'}
                        </div>
                      ) : (
                        analysisRequests.map((req) => (
                          <div
                            key={req.id}
                            className="p-5 rounded-2xl bg-white border border-[#E3EBF0] space-y-3 shadow-2xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="text-sm font-bold text-[#062B4D]">{req.title}</h4>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2.5 py-0.5 rounded-md bg-[#F7FAFC] border border-[#E3EBF0] text-[#435466]">
                                  اولویت: {req.priority}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-[#EAF7F9] text-[#087A9D] font-bold">
                                  {req.status}
                                </span>
                              </div>
                            </div>
                            {req.description && (
                              <p className="text-xs text-[#435466] leading-relaxed">
                                {req.description}
                              </p>
                            )}
                            {req.adminResponse && (
                              <div className="p-3.5 rounded-xl bg-[#EAF7F9]/60 border border-[#08A9C5]/40 text-xs space-y-1">
                                <strong className="text-[#062B4D] block">
                                  پاسخ تیم تحلیل بینش:
                                </strong>
                                <p className="text-[#263B50] leading-relaxed">
                                  {req.adminResponse}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: SESSIONS */}
                {activePortalTab === 'sessions' && (
                  <div className="space-y-4">
                    {(isLoggedIn ? sessionsList : [
                      {
                        id: 3,
                        title: 'جلسه مرور شاخص‌های کلیدی عملکرد (KPI) و هدف‌گذاری فروش',
                        description: 'جمع‌بندی عملکرد سه‌ماهه و تعیین اهداف تیم فروش برای فصل جدید',
                        status: 'برنامه‌ریزی شده',
                        metaText: 'چهارشنبه هفته آینده - ساعت ۱۰:۰۰'
                      }
                    ]).map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#EAF7F9] text-[#087A9D] text-[11px] font-bold">
                            {item.status}
                          </span>
                          <span className="text-xs font-mono-num text-[#64748B]">{item.metaText}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#062B4D]">{item.title}</h3>
                        <p className="text-xs text-[#435466]">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 6: GOALS */}
                {activePortalTab === 'goals' && (
                  <div className="space-y-4">
                    {(isLoggedIn ? goalsList : [
                      {
                        id: 4,
                        title: 'کاهش ضایعات ورق ام‌دی‌اف به زیر ۴ درصد در خط تولید اول',
                        description: 'پایش هفتگی شاخص ضایعات و بهینه‌سازی الگوی برش',
                        status: 'در حال بررسی',
                        metaText: 'پیشرفت فعلی: ۶۵٪'
                      }
                    ]).map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#EAF7F9] text-[#087A9D] text-[11px] font-bold">
                            {item.status}
                          </span>
                          <span className="text-xs font-bold text-[#062B4D]">{item.metaText}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#062B4D]">{item.title}</h3>
                        <p className="text-xs text-[#435466]">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 7: FILES */}
                {activePortalTab === 'files' && (
                  <div className="space-y-4">
                    {(isLoggedIn ? filesList : [
                      {
                        id: 5,
                        title: 'سند دیکشنری داده‌ها و تعاریف شاخص‌های کلیدی (KPI Dictionary)',
                        description: 'مستندات فرمول‌های محاسباتی و ساختار جداول پایه',
                        status: 'منتشر شده',
                        metaText: 'PDF · ۱.۴ مگابایت'
                      }
                    ]).map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-[#062B4D]">{item.title}</h3>
                          <p className="text-xs text-[#435466]">{item.description}</p>
                        </div>
                        <span className="text-xs font-mono-num text-[#64748B] shrink-0">
                          {item.metaText}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 8: SETTINGS */}
                {activePortalTab === 'settings' && (
                  <div className="p-6 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-4">
                    <h3 className="text-sm font-bold text-[#062B4D]">اطلاعات حساب کاربری</h3>
                    {isLoggedIn && authUser ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-white border border-[#E3EBF0]">
                          <span className="text-[#64748B] block">نام و نام خانوادگی:</span>
                          <strong className="text-[#062B4D] mt-1 block">{authUser.fullName}</strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-[#E3EBF0]">
                          <span className="text-[#64748B] block">شماره همراه:</span>
                          <strong className="font-mono-num text-[#062B4D] mt-1 block dir-ltr text-right">
                            {authUser.phone}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-[#E3EBF0]">
                          <span className="text-[#64748B] block">ایمیل:</span>
                          <strong className="font-mono-num text-[#062B4D] mt-1 block dir-ltr text-right">
                            {authUser.email || '—'}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-[#E3EBF0]">
                          <span className="text-[#64748B] block">سازمان متصل:</span>
                          <strong className="text-[#062B4D] mt-1 block">{activeOrg.name}</strong>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#435466]">
                        برای مشاهده مشخصات حساب کاربری خود، ابتدا از طریق صفحه ورود اقدام نمایید.
                      </p>
                    )}
                  </div>
                )}

                {/* Status Labels Reference (§16) */}
                <div className="pt-4 border-t border-[#E3EBF0] space-y-2">
                  <span className="text-xs font-bold text-[#062B4D] block">
                    وضعیت‌های قابل نمایش در پنل:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs text-[#435466]">
                    {PORTAL_STATUS_LABELS.map((status, idx) => (
                      <React.Fragment key={status}>
                        {idx > 0 && <span className="text-[#64748B]">·</span>}
                        <span>{status}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[#E3EBF0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
            <span>فضای اختصاصی همکاری شما با بینش</span>
            <span className="inline-flex items-center gap-1 text-[#087A9D]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ارتباط امن با پایگاه داده بینش</span>
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};
