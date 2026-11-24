import React, { useState } from 'react';
import { RoutePath } from '../data/bineshData';
import { Mascot } from '../components/BrandComponents';
import { apiFetch, setAuthToken } from '../lib/submitRequest';

export interface AuthUserInfo {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'collaborator';
  organizationId: string | null;
}

interface PortalAndAuthPagesProps {
  currentRoute: '/auth';
  onNavigate: (route: RoutePath) => void;
  authUser?: AuthUserInfo | null;
  onAuthChange?: (user: AuthUserInfo | null) => void;
}

const AUTH_SYSTEM_MESSAGES = [
  'اطلاعات ورود صحیح نیست. لطفاً دوباره بررسی کنید.',
  'حسابی با این مشخصات پیدا نشد.',
  'این ایمیل یا شماره همراه قبلاً ثبت شده است.',
  'حساب کاربری با موفقیت ایجاد شد.',
  'راهنمای بازیابی رمز عبور ارسال شد؛ در صورت دریافت نکردن، اطلاعات واردشده را بررسی کنید.',
  'برای ادامه، ابتدا حساب خود را تأیید کنید.'
] as const;

export const PortalAndAuthPages: React.FC<PortalAndAuthPagesProps> = ({
  onNavigate,
  authUser,
  onAuthChange
}) => {
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
          setTimeout(() => onNavigate('/'), 600);
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
        setTimeout(() => onNavigate('/'), 600);
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
                  <span className="text-[#062B4D] font-bold">واردشده: {authUser.fullName}</span>
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
                  <h1 className="text-xl font-bold text-[#062B4D]">ورود به حساب بینش</h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#435466]">
                    برای دسترسی به حساب کاربری یا پنل مدیریت وب‌سایت، مشخصات ورود خود را وارد کنید.
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
                    placeholder="شماره همراه یا ایمیل"
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
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-[#062B4D]">ایجاد حساب کاربری</h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#435466] leading-relaxed">
                    اطلاعات زیر را تکمیل کنید تا حساب کاربری شما در سامانه بینش ثبت شود.
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
                  <label className="block text-xs font-medium text-[#263B50] mb-1">ایمیل</label>
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
            <span>سامانه احراز هویت امن بینش</span>
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="text-[#087A9D] font-bold hover:text-[#062B4D] cursor-pointer"
            >
              ورود به پنل مدیریت سایت ←
            </button>
          </div>
        </div>

        {/* Left Column: Security Info & Contact CTA */}
        <div className="lg:col-span-5 rounded-2xl bg-[#062B4D] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs text-[#3CDDDD] block">امنیت و محرمانگی بینش</span>
            <h2 className="text-xl font-bold leading-snug">
              دسترسی امن به سامانه و خدمات تحلیلی بینش
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              اطلاعات کاربری و داده‌های کسب‌وکار شما تحت استانداردهای محرمانگی بینش محافظت می‌شود. برای هماهنگی جلسه مشاوره یا پیگیری درخواست‌ها می‌توانید از صفحه تماس استفاده کنید.
            </p>

            <Mascot
              name="security"
              priority
              framed
              className="mx-auto w-full max-w-[260px] p-2"
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="w-full py-3 rounded-xl bg-[#08A9C5] text-white text-xs font-medium hover:bg-[#3CDDDD] hover:text-[#062B4D] transition-colors cursor-pointer"
          >
            ارتباط با کارشناسان بینش
          </button>
        </div>
      </div>
    </div>
  );
};
