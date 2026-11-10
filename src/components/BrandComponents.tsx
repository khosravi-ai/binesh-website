import React, { useState } from 'react';
import { Play, X, ChevronDown } from 'lucide-react';
import { FaqItem } from '../data/bineshData';
import {
  submitConsultationRequest,
  trackConsultationByCode,
  TrackedConsultationInfo
} from '../lib/submitRequest';

interface BineshLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light-bg' | 'dark-bg';
  className?: string;
}

/**
 * Official BINESH Logo Component (SVG only)
 */
export const BineshLogo: React.FC<BineshLogoProps> = ({
  size = 'md',
  variant = 'light-bg',
  className = ''
}) => {
  const heightClasses = {
    sm: 'h-4 md:h-5',
    md: 'h-5 md:h-6',
    lg: 'h-6 md:h-8'
  };

  if (variant === 'dark-bg') {
    return (
      <div
        className={`inline-flex items-center px-3.5 py-2 rounded-xl bg-white border border-[#E3EBF0] select-none ${className}`}
        title="بینش — همراه کسب‌وکار شما، با نگاهی تحلیلی"
      >
        <img
          src="/assets/brand/binesh-logo.svg"
          alt="لوگوی رسمی بینش (Binesh)"
          width={2960}
          height={370}
          draggable={false}
          className={`${heightClasses[size]} w-auto block select-none`}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center py-0.5 px-0 select-none ${className}`}
      title="بینش — همراه کسب‌وکار شما، با نگاهی تحلیلی"
    >
      <img
        src="/assets/brand/binesh-logo.svg"
        alt="لوگوی رسمی بینش (Binesh)"
        width={2960}
        height={370}
        draggable={false}
        className={`${heightClasses[size]} w-auto block select-none`}
      />
    </div>
  );
};

export type MascotName =
  | 'welcome'
  | 'listening'
  | 'presenter'
  | 'thinker'
  | 'companion'
  | 'empty'
  | 'success'
  | 'help'
  | 'analyst'
  | 'strategist'
  | 'reader'
  | 'builder'
  | 'security'
  | 'network';

export const MASCOTS: Record<
  MascotName,
  { src: string; w: number; h: number; alt: string; opaque: boolean }
> = {
  welcome: {
    src: '/assets/mascots/binesh_welcome_mascot.webp',
    w: 1160,
    h: 1355,
    opaque: false,
    alt: 'ماسکات بینش در حال خوشامدگویی، با تبلت در دست'
  },
  listening: {
    src: '/assets/mascots/binesh_listening_mascot.webp',
    w: 1000,
    h: 1200,
    opaque: false,
    alt: 'ماسکات بینش نشسته روی مبل، در حال گوش دادن به نیاز شما'
  },
  presenter: {
    src: '/assets/mascots/binesh_presenter_mascot.webp',
    w: 1200,
    h: 1200,
    opaque: false,
    alt: 'ماسکات بینش در حال معرفی یک داشبورد تحلیلی'
  },
  thinker: {
    src: '/assets/mascots/binesh_thinker_mascot.webp',
    w: 1200,
    h: 1200,
    opaque: false,
    alt: 'ماسکات بینش در حال بررسی و مقایسه نمودارها'
  },
  companion: {
    src: '/assets/mascots/binesh_companion_mascot.webp',
    w: 1000,
    h: 1000,
    opaque: false,
    alt: 'ماسکات بینش با هدست، آماده گفت‌وگو و همراهی'
  },
  empty: {
    src: '/assets/mascots/binesh_mascot_06_empty_state.webp',
    w: 800,
    h: 800,
    opaque: false,
    alt: 'ماسکات بینش کنار یک جعبه خالی'
  },
  success: {
    src: '/assets/mascots/binesh_mascot_07_success.webp',
    w: 800,
    h: 800,
    opaque: false,
    alt: 'ماسکات بینش در حال شادی؛ درخواست ثبت شد'
  },
  help: {
    src: '/assets/mascots/binesh_mascot_08_help.webp',
    w: 800,
    h: 800,
    opaque: false,
    alt: 'ماسکات بینش با هدست، آماده پاسخ‌گویی به سؤال‌های شما'
  },
  analyst: {
    src: '/assets/aistudio/Turquoise_Data_Explorer_Mascot_9d4eddb0.webp',
    w: 1254,
    h: 1254,
    opaque: false,
    alt: 'ماسکات بینش با ذره‌بین در حال کاوش داده‌ها و شناسایی تغییرات کلیدی'
  },
  strategist: {
    src: '/assets/aistudio/Teal_Mascot_Presenting_a_Strategic_Roadmap_bfb71281.webp',
    w: 1536,
    h: 1024,
    opaque: false,
    alt: 'ماسکات بینش در حال ارائه نقشه راه استراتژیک و کوچینگ کسب‌وکار'
  },
  reader: {
    src: '/assets/aistudio/Insightful_Mascot_Reading_Analytics_4cb3c7f5.webp',
    w: 1536,
    h: 1024,
    opaque: false,
    alt: 'ماسکات بینش در حال مطالعه و استخراج بینش‌های تحلیلی در بینش‌نامه'
  },
  builder: {
    src: '/assets/aistudio/Mascot_Building_a_Data_Dashboard_34f4bfda.webp',
    w: 1536,
    h: 1024,
    opaque: false,
    alt: 'ماسکات بینش در حال یکپارچه‌سازی منابع داده پراکنده و ساخت داشبورد مدیریتی'
  },
  security: {
    src: '/assets/aistudio/Friendly_Data_Guardian_Shield_Mascot_aaa2cbc8.webp',
    w: 1536,
    h: 1024,
    opaque: false,
    alt: 'ماسکات بینش با سپر امنیت و محرمانگی اطلاعات کسب‌وکار'
  },
  network: {
    src: '/assets/aistudio/Friendly_Teamwork_Network_Mascot_fa665961.webp',
    w: 1536,
    h: 1024,
    opaque: false,
    alt: 'ماسکات بینش در کنار شبکه تخصصی داده، مالی، نرم‌افزار و استراتژی'
  }
};

interface MascotProps {
  name: MascotName;
  priority?: boolean;
  framed?: boolean;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  name,
  priority = false,
  framed,
  className = ''
}) => {
  const m = MASCOTS[name];
  const useFrame = framed ?? m.opaque;
  return (
    <div
      className={`${useFrame ? 'bg-white rounded-2xl overflow-hidden' : ''} ${className}`}
    >
      <img
        src={m.src}
        alt={m.alt}
        width={m.w}
        height={m.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="block w-full h-auto select-none"
      />
    </div>
  );
};

interface VideoPlaceholderProps {
  title: string;
  subtitle: string;
  videoLabel?: string;
  buttonLabel?: string;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  title,
  subtitle,
  videoLabel = 'راهنمای ویدئویی',
  buttonLabel = 'تماشای ویدئو'
}) => {
  return (
    <div className="relative rounded-2xl border border-[#E3EBF0] bg-white p-4 sm:p-6 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E3EBF0]">
        <span className="text-xs font-medium text-[#062B4D]">{videoLabel}</span>
        <span className="text-xs font-medium text-[#087A9D]">در حال آماده‌سازی</span>
      </div>

      {/* 16:9 Video Cover Frame (Disabled playback until video is published) */}
      <div className="relative aspect-video w-full rounded-xl bg-gradient-to-br from-[#062B4D] via-[#093863] to-[#087A9D] p-6 flex flex-col justify-between overflow-hidden select-none">
        <div className="absolute inset-0 opacity-15 bg-binesh-grid pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between text-xs text-white/80">
          <span>بینش (Binesh)</span>
          <span>در حال آماده‌سازی</span>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-lg mx-auto">
          <button
            type="button"
            disabled
            aria-label={buttonLabel}
            className="w-16 h-16 rounded-full bg-white/15 text-white/60 border border-white/25 flex items-center justify-center cursor-not-allowed"
          >
            <Play className="w-7 h-7 fill-current ml-0.5" />
          </button>
          <h4 className="mt-4 text-base sm:text-lg font-bold text-white">{title}</h4>
          <p className="mt-1.5 text-xs sm:text-sm text-white/85 leading-relaxed">{subtitle}</p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/75 pt-2 border-t border-white/15">
          <span>این بخش به‌زودی تکمیل می‌شود.</span>
          <span>{buttonLabel} (در حال آماده‌سازی)</span>
        </div>
      </div>
    </div>
  );
};

interface FaqListProps {
  items: FaqItem[];
  showMascot?: boolean;
}

export const FaqList: React.FC<FaqListProps> = ({ items, showMascot = true }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EBF0]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">سؤالات متداول</h2>
        </div>
        {showMascot && (
          <Mascot
            name="help"
            className="w-24 sm:w-28 shrink-0"
          />
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] overflow-hidden transition-colors"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-right flex items-center justify-between gap-4 text-sm font-bold text-[#062B4D] hover:text-[#087A9D] transition-colors cursor-pointer"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#087A9D] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#435466] leading-relaxed border-t border-[#E3EBF0]/60 bg-white">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const FORM_SERVICE_OPTIONS = [
  'داشبوردهای مدیریتی',
  'تحلیل و پایش مستمر',
  'مشاوره و کوچینگ',
  'هنوز مطمئن نیستم و به راهنمایی نیاز دارم'
] as const;

export function normalizeServiceOption(serviceTitle?: string): string {
  if (!serviceTitle) return 'داشبوردهای مدیریتی';
  if (serviceTitle.includes('داشبورد')) return 'داشبوردهای مدیریتی';
  if (serviceTitle.includes('تحلیل')) return 'تحلیل و پایش مستمر';
  if (serviceTitle.includes('مشاوره') || serviceTitle.includes('کوچینگ')) return 'مشاوره و کوچینگ';
  return 'هنوز مطمئن نیستم و به راهنمایی نیاز دارم';
}

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  defaultService
}) => {
  const [modalTab, setModalTab] = useState<'submit' | 'track'>('submit');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(normalizeServiceOption(defaultService));
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Tracking lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState<TrackedConsultationInfo | null>(null);

  React.useEffect(() => {
    setService(normalizeServiceOption(defaultService));
  }, [defaultService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError('لطفاً نام و شماره تماس را وارد کنید.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await submitConsultationRequest({
        fullName: fullName.trim(),
        businessName: company.trim(),
        phone: phone.trim(),
        email: email.trim(),
        service,
        notes: notes.trim()
      });
      if (res.ok) {
        setTrackingCode(res.trackingCode || '');
        setSubmitted(true);
      } else {
        setError(res.error || 'ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
      }
    } catch {
      setError('ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) {
      setLookupError('لطفاً کد رهگیری خود را وارد کنید (مثلاً BN-1042).');
      return;
    }
    setLookupError('');
    setLookupResult(null);
    setLookupLoading(true);
    try {
      const res = await trackConsultationByCode(lookupCode.trim());
      if (res.ok && res.request) {
        setLookupResult(res.request);
      } else {
        setLookupError(res.error || 'درخواستی با این کد رهگیری یافت نشد.');
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setTrackingCode('');
    setFullName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setNotes('');
    setError('');
    setLookupResult(null);
    setLookupError('');
    setModalTab('submit');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#062B4D]/65 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={resetAndClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#E3EBF0] max-w-lg w-full p-6 sm:p-7 shadow-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3EBF0]">
          <div>
            <h3 className="text-lg font-bold text-[#062B4D]">درخواست جلسه مشاوره</h3>
            <p className="text-xs text-[#435466] mt-1 leading-relaxed">
              ثبت درخواست جدید یا پیگیری وضعیت درخواست قبلی با کد رهگیری
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#062B4D] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 mt-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
          <button
            type="button"
            onClick={() => setModalTab('submit')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              modalTab === 'submit' ? 'bg-[#062B4D] text-white' : 'text-[#435466] hover:text-[#062B4D]'
            }`}
          >
            ثبت درخواست جدید
          </button>
          <button
            type="button"
            onClick={() => setModalTab('track')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              modalTab === 'track' ? 'bg-[#062B4D] text-white' : 'text-[#435466] hover:text-[#062B4D]'
            }`}
          >
            پیگیری با کد رهگیری
          </button>
        </div>

        {modalTab === 'track' ? (
          <div className="pt-4 space-y-4">
            <form onSubmit={handleTrackLookup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                  کد رهگیری درخواست مشاوره
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    placeholder="مثلاً BN-482012"
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num dir-ltr text-left"
                  />
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    {lookupLoading ? 'در حال بررسی...' : 'استعلام وضعیت'}
                  </button>
                </div>
              </div>
            </form>

            {lookupError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {lookupError}
              </div>
            )}

            {lookupResult && (
              <div className="p-4 rounded-xl bg-[#EAF7F9]/70 border border-[#08A9C5] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#08A9C5]/30">
                  <span className="text-[#435466]">کد رهگیری:</span>
                  <span className="font-mono-num font-bold text-[#062B4D] text-sm">
                    {lookupResult.trackingCode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#435466]">نام درخواست‌دهنده:</span>
                  <span className="font-bold text-[#062B4D]">{lookupResult.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#435466]">خدمت موردنظر:</span>
                  <span className="font-medium text-[#263B50]">{lookupResult.service}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#08A9C5]/30">
                  <span className="text-[#435466]">وضعیت فعلی:</span>
                  <span className="font-bold text-[#087A9D]">{lookupResult.statusLabel}</span>
                </div>
              </div>
            )}
          </div>
        ) : submitted ? (
          <div className="py-6 text-center space-y-4">
            <Mascot name="success" className="mx-auto w-full max-w-[150px]" />
            <h4 className="text-base font-bold text-[#062B4D]">درخواست شما با موفقیت ثبت شد.</h4>
            {trackingCode && (
              <div className="max-w-xs mx-auto p-3.5 rounded-xl bg-[#EAF7F9] border border-[#08A9C5] space-y-1">
                <span className="text-[11px] text-[#435466] block">کد رهگیری اختصاصی شما:</span>
                <span className="font-mono-num text-lg font-bold text-[#062B4D] block tracking-wider">
                  {trackingCode}
                </span>
              </div>
            )}
            <p className="text-xs sm:text-sm text-[#435466] max-w-sm mx-auto leading-relaxed">
              اطلاعات شما در سامانه ثبت شد و به اطلاع کارشناسان بینش رسید. پس از بررسی، برای هماهنگی جلسه با شما تماس می‌گیریم.
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors cursor-pointer"
            >
              بستن پنجره
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">
                  نام و نام خانوادگی *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                />
                <span className="block text-[11px] text-[#64748B] mt-1">
                  نام فردی که برای هماهنگی با او ارتباط برقرار می‌کنیم.
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">
                  نام کسب‌وکار
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                />
                <span className="block text-[11px] text-[#64748B] mt-1">
                  نام شرکت یا مجموعه و در صورت امکان حوزه فعالیت.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">
                  شماره تماس *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num"
                />
                <span className="block text-[11px] text-[#64748B] mt-1">
                  شماره‌ای که امکان هماهنگی از طریق آن وجود داشته باشد.
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1">
                  ایمیل
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num"
                />
                <span className="block text-[11px] text-[#64748B] mt-1">
                  در صورت تمایل، ایمیل کاری برای ارسال اطلاعات تکمیلی.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">
                خدمت موردنظر
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
              >
                {FORM_SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#263B50] mb-1">
                توضیحات تکمیلی
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
              />
              <span className="block text-[11px] text-[#64748B] mt-1">
                مسئله اصلی، نرم‌افزارهای مورد استفاده یا پرسشی که می‌خواهید بررسی شود را بنویسید.
              </span>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'در حال ثبت درخواست...' : 'ارسال درخواست'}
                </button>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                اطلاعات ثبت‌شده در پایگاه داده امن بینش ذخیره شده و فقط برای بررسی درخواست و هماهنگی ارتباط استفاده می‌شود.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

