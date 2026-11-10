import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  RoutePath,
  SERVICE_CATEGORIES,
  ServiceCategory,
  DASHBOARDS_FAQS,
  ANALYTICS_FAQS,
  CONSULTING_FAQS
} from '../data/bineshData';
import {
  Mascot,
  VideoPlaceholder,
  FaqList,
  FORM_SERVICE_OPTIONS,
  normalizeServiceOption
} from '../components/BrandComponents';
import { submitConsultationRequest } from '../lib/submitRequest';

interface ServicesPagesProps {
  currentRoute:
    | '/services'
    | '/services/dashboards'
    | '/services/bi-analytics'
    | '/services/consulting';
  onNavigate: (route: RoutePath) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

export const ServicesPages: React.FC<ServicesPagesProps> = ({
  currentRoute,
  onNavigate,
  onOpenConsultation
}) => {
  const categoryMap: Record<string, ServiceCategory> = {
    '/services/dashboards': SERVICE_CATEGORIES[0],
    '/services/bi-analytics': SERVICE_CATEGORIES[1],
    '/services/consulting': SERVICE_CATEGORIES[2]
  };
  const currentCategory = categoryMap[currentRoute] || SERVICE_CATEGORIES[0];

  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formService, setFormService] = useState(
    normalizeServiceOption(currentCategory.title)
  );
  const [formNotes, setFormNotes] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [formTrackingCode, setFormTrackingCode] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormService(normalizeServiceOption(currentCategory.title));
    setFormSent(false);
    setFormTrackingCode('');
    setFormError('');
  }, [currentRoute, currentCategory.title]);

  const handleInlineForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      setFormError('لطفاً اطلاعات خواسته‌شده را بررسی کنید.');
      return;
    }
    setFormError('');
    setFormSubmitting(true);
    try {
      const res = await submitConsultationRequest({
        fullName: formName.trim(),
        businessName: formOrg.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        service: formService,
        notes: formNotes.trim()
      });
      if (res.ok) {
        setFormTrackingCode(res.trackingCode || '');
        setFormSent(true);
      } else {
        setFormError(res.error || 'ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
      }
    } catch {
      setFormError('ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // =========================================================================
  // 3.1. MAIN SERVICES HUB (/services — Pack §4)
  // =========================================================================
  if (currentRoute === '/services') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-10">
          <div className="pb-6 mb-6 border-b border-[#E3EBF0]">
            <div className="text-xs font-medium text-[#087A9D]">
              سه مسیر همکاری برای شناخت بهتر و مدیریت آگاهانه‌تر کسب‌وکار
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D] leading-snug">
            خدمات بینش
          </h1>
          <p className="mt-2 text-base font-medium text-[#087A9D]">
            سه مسیر همکاری برای شناخت بهتر و مدیریت آگاهانه‌تر کسب‌وکار
          </p>
          <p className="mt-3 text-sm sm:text-base text-[#435466] max-w-3xl leading-relaxed">
            نیاز هر کسب‌وکار یکسان نیست. گاهی مسئله، نبود گزارش یکپارچه است؛ گاهی مدیر به تحلیل منظم عملکرد نیاز دارد و گاهی هدف‌گذاری و پیگیری اقدامات به همراهی بیشتری احتیاج دارد. بینش این نیازها را در سه مسیر اصلی پوشش می‌دهد.
          </p>
        </div>

        {/* 3 Main Service Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] transition-all p-6 sm:p-7 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono-num text-2xl font-bold text-[#08A9C5]">
                    {cat.order}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[#062B4D]">{cat.title}</h2>
                <p className="mt-2.5 text-sm text-[#435466] leading-relaxed">
                  {cat.summary}
                </p>

                <div className="mt-5 p-3.5 rounded-xl bg-[#EAF7F9]/60 border border-[#E3EBF0] text-xs text-[#263B50] leading-relaxed">
                  <strong className="text-[#062B4D] block mb-1">خروجی مورد انتظار:</strong>
                  {cat.idealFor}
                </div>

                <div className="mt-6 space-y-2.5">
                  <span className="text-xs font-bold text-[#062B4D] block">
                    زیرخدمت‌ها:
                  </span>
                  {cat.subServices.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F7FAFC] border border-[#E3EBF0] text-xs text-[#263B50]"
                    >
                      <span className="font-mono-num font-bold text-[#087A9D] shrink-0">
                        {sub.id}.
                      </span>
                      <span>{sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 pt-4 border-t border-[#E3EBF0] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(cat.route)}
                  className="w-full py-3 px-4 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>مشاهده جزئیات خدمت</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm sm:text-base font-medium text-[#062B4D]">
            برای انتخاب مسیر مناسب، می‌توانید درخواست جلسه شناخت اولیه ثبت کنید.
          </p>
          <button
            type="button"
            onClick={() => onOpenConsultation()}
            className="px-6 py-3 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            درخواست جلسه مشاوره
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
      {/* Sub-navigation between the 3 service pages */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#E3EBF0]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/services')}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#062B4D] cursor-pointer"
          >
            خدمات بینش
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onNavigate(cat.route)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentRoute === cat.route
                  ? 'bg-[#062B4D] text-white'
                  : 'bg-[#F7FAFC] text-[#435466] hover:text-[#062B4D]'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SERVICE 1: /services/dashboards (Pack §5)
      ===================================================================== */}
      {currentRoute === '/services/dashboards' && (
        <>
          {/* D-HERO */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-5">
            <div className="text-xs font-medium text-[#087A9D]">
              طراحی و توسعه داشبوردهای مدیریتی
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D] leading-snug">
              اطلاعات کسب‌وکار را یکپارچه ببینید و ساده‌تر بررسی کنید.
            </h1>
            <p className="text-sm sm:text-base text-[#435466] leading-relaxed max-w-3xl">
              اطلاعات فروش، مالی، انبار و سایر بخش‌ها معمولاً در ابزارها و منابع مختلف ثبت می‌شوند. داشبورد مدیریتی کمک می‌کند شاخص‌های مهم در یک محیط منظم و قابل بررسی نمایش داده شوند. بینش بر اساس نیاز کسب‌وکار، داشبوردهای اختصاصی تحت وب یا گزارش‌های Power BI طراحی می‌کند.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/demos')}
                className="px-5 py-3 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors cursor-pointer"
              >
                بررسی نمونه دمو
              </button>
              <button
                type="button"
                onClick={() => onOpenConsultation(currentCategory.title)}
                className="px-5 py-3 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-[#062B4D] hover:border-[#08A9C5] text-xs font-medium transition-colors cursor-pointer"
              >
                درخواست جلسه مشاوره
              </button>
            </div>
          </section>

          {/* D-PROBLEM + Builder Mascot */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
                    وقتی اطلاعات وجود دارد، اما تصویر روشنی از عملکرد نداریم.
                  </h2>
                  <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
                    ممکن است داده‌ها در نرم‌افزار حسابداری، فایل‌های اکسل، سیستم فروش و انبار ثبت شده باشند؛ اما برای تهیه یک گزارش مدیریتی، لازم باشد اطلاعات به‌صورت دستی جمع‌آوری و تطبیق داده شوند. این فرایند می‌تواند زمان‌بر باشد و بررسی به‌موقع تغییرات را دشوار کند.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'اطلاعات پراکنده در چند منبع',
                    'گزارش‌گیری دستی و تکراری',
                    'نبود تعریف یکسان برای شاخص‌ها',
                    'دشواری مقایسه دوره‌ها، شعب یا واحدها',
                    'تأخیر در شناسایی تغییرات عملکرد'
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs sm:text-sm font-medium text-[#263B50]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <Mascot
                  name="builder"
                  className="mx-auto w-full max-w-[420px]"
                />
              </div>
            </div>
          </section>

          {/* D-SOLUTIONS */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              از اتصال داده‌ها تا گزارش مدیریتی قابل استفاده
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  num: '۱',
                  title: 'طراحی داشبورد وب',
                  desc: 'طراحی محیط اختصاصی متناسب با ساختار، کاربران و نیازهای اطلاعاتی سازمان.'
                },
                {
                  num: '۲',
                  title: 'طراحی داشبورد Power BI',
                  desc: 'ساخت گزارش‌های تعاملی با قابلیت فیلتر، مقایسه و بررسی جزئیات.'
                },
                {
                  num: '۳',
                  title: 'یکپارچه‌سازی داده‌ها',
                  desc: 'شناسایی منابع، اتصال و استانداردسازی داده‌ها متناسب با امکانات فنی.'
                },
                {
                  num: '۴',
                  title: 'طراحی KPI',
                  desc: 'تعریف شاخص، فرمول محاسبه، واحد اندازه‌گیری و هدف یا آستانه مورد توافق.'
                },
                {
                  num: '۵',
                  title: 'خودکارسازی گزارش‌ها',
                  desc: 'طراحی فرایند به‌روزرسانی و گزارش‌گیری زمان‌بندی‌شده، در صورت پشتیبانی زیرساخت.'
                }
              ].map((sol) => (
                <div
                  key={sol.num}
                  className="p-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2"
                >
                  <span className="font-mono-num text-lg font-bold text-[#08A9C5] block">
                    {sol.num}.
                  </span>
                  <h3 className="text-sm font-bold text-[#062B4D]">{sol.title}</h3>
                  <p className="text-xs text-[#435466] leading-relaxed">{sol.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* =====================================================================
          SERVICE 2: /services/bi-analytics (Pack §6)
      ===================================================================== */}
      {currentRoute === '/services/bi-analytics' && (
        <>
          {/* A-HERO + Analyst Mascot */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="text-xs font-medium text-[#087A9D]">
                  تحلیل و پایش مستمر کسب‌وکار
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D] leading-snug">
                  فقط گزارش را نبینید؛ دلیل تغییرات را هم بررسی کنید.
                </h1>
                <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
                  داشبورد نشان می‌دهد چه اتفاقی افتاده است؛ تحلیل به بررسی چرایی تغییرات و پیامدهای آن کمک می‌کند. در خدمت تحلیل و پایش مستمر، اطلاعات کسب‌وکار در بازه‌های توافق‌شده بررسی می‌شوند و گزارش‌هایی شامل روندها، نکات مهم، پرسش‌های قابل بررسی و پیشنهادهای عملیاتی در اختیار مدیر قرار می‌گیرند.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenConsultation(currentCategory.title)}
                    className="px-5 py-3 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors cursor-pointer"
                  >
                    درخواست گفت‌وگوی اولیه
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Mascot
                  name="analyst"
                  className="mx-auto w-full max-w-[340px]"
                />
              </div>
            </div>
          </section>

          {/* A-WHAT */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              تحلیل مستمر چیست؟
            </h2>
            <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
              تحلیل مستمر یعنی عملکرد کسب‌وکار فقط در زمان تهیه یک گزارش یا بروز یک مشکل بررسی نشود. شاخص‌ها و روندهای مهم در دوره‌های منظم دنبال شوند، تغییرات قابل توجه شناسایی شوند و پرسش‌های مدیریتی با اتکا به داده‌ها بررسی شوند.
            </p>
            <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
              این همکاری می‌تواند شامل گزارش هفتگی، گزارش ماهانه، تحلیل موردی یا جلسه مرور عملکرد باشد. تناوب، دامنه تحلیل و خروجی‌ها در آغاز همکاری و متناسب با نیاز مجموعه توافق می‌شوند.
            </p>
          </section>
        </>
      )}

      {/* =====================================================================
          SERVICE 3: /services/consulting (Pack §7)
      ===================================================================== */}
      {currentRoute === '/services/consulting' && (
        <>
          {/* C-HERO + Strategist Mascot */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="text-xs font-medium text-[#087A9D]">
                  مشاوره و کوچینگ کسب‌وکار
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D] leading-snug">
                  هدف‌ها را روشن کنید؛ عملکرد را آگاهانه‌تر پیگیری کنید.
                </h1>
                <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
                  تعیین هدف به‌تنهایی کافی نیست. مدیران برای تبدیل هدف‌ها به شاخص‌های قابل اندازه‌گیری، بررسی منظم عملکرد و پیگیری اقدام‌ها به یک چارچوب روشن نیاز دارند. بینش در مسیر هدف‌گذاری، طراحی شاخص‌ها، تحلیل وضعیت و جلسات همراهی مدیریتی در کنار کسب‌وکار قرار می‌گیرد.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenConsultation(currentCategory.title)}
                    className="px-5 py-3 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors cursor-pointer"
                  >
                    درخواست جلسه مشاوره
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Mascot
                  name="strategist"
                  className="mx-auto w-full max-w-[420px]"
                />
              </div>
            </div>
          </section>

          {/* C-WHAT */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              رویکرد مشاوره و کوچینگ
            </h2>
            <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
              مشاوره و کوچینگ در بینش بر شناخت مسئله، گفت‌وگوی ساختاریافته و استفاده از اطلاعات برای بررسی تصمیم‌ها تمرکز دارد. هدف، ارائه نسخه یکسان برای همه کسب‌وکارها نیست؛ بلکه کمک به مدیر برای روشن کردن مسئله، تعیین هدف، انتخاب شاخص مناسب و پیگیری اقدام‌های توافق‌شده است.
            </p>
          </section>
        </>
      )}

      {/* =====================================================================
          SUB-SERVICES GRID (Items 1-5, 6-11, or 12-15)
      ===================================================================== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
            شرح خدمات
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentCategory.subServices.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl bg-white border border-[#E3EBF0] p-6 flex flex-col justify-between hover:border-[#08A9C5]/70 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3EBF0]">
                  <span className="font-mono-num text-sm font-bold text-[#08A9C5]">
                    {sub.id}.
                  </span>
                  <span className="text-xs text-[#64748B]">{currentCategory.shortTitle}</span>
                </div>
                <h3 className="text-lg font-bold text-[#062B4D]">{sub.title}</h3>
                <p className="mt-2.5 text-sm text-[#435466] leading-relaxed">
                  {sub.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E3EBF0]">
                <span className="text-xs text-[#64748B] block mb-2">خروجی‌های قابل توافق:</span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#062B4D]">
                  {sub.deliverables.map((del, i) => (
                    <React.Fragment key={del}>
                      {i > 0 && <span className="text-[#64748B]">·</span>}
                      <span className="font-medium">{del}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          ADDITIONAL SECTIONS FOR /services/dashboards (D-WEB-POWERBI, D-PROCESS, D-FAQ)
      ===================================================================== */}
      {currentRoute === '/services/dashboards' && (
        <>
          {/* D-WEB-POWERBI + Thinker Mascot (#4) + VIDEO 02 */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-8">
            <div className="max-w-3xl space-y-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
                داشبورد تحت وب یا Power BI؟
              </h2>
              <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
                انتخاب ابزار مناسب به نیازهای مدیریتی، تعداد کاربران، منابع داده، سطح سفارشی‌سازی، شیوه دسترسی و زیرساخت سازمان بستگی دارد. هیچ‌یک از این دو گزینه برای تمام کسب‌وکارها بهترین انتخاب مطلق نیست.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-5">
                <div className="overflow-x-auto rounded-xl border border-[#E3EBF0]">
                  <table className="w-full text-right text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#062B4D] text-white">
                        <th className="p-3.5 font-bold border-b border-[#E3EBF0]/20">معیار</th>
                        <th className="p-3.5 font-bold border-b border-[#E3EBF0]/20">
                          وب‌اپلیکیشن اختصاصی
                        </th>
                        <th className="p-3.5 font-bold border-b border-[#E3EBF0]/20">Power BI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBF0] bg-white text-[#263B50]">
                      <tr>
                        <td className="p-3.5 font-bold text-[#062B4D] bg-[#F7FAFC]">
                          سفارشی‌سازی تجربه کاربری
                        </td>
                        <td className="p-3.5">بسیار قابل تنظیم بر اساس پروژه</td>
                        <td className="p-3.5">در چارچوب امکانات Power BI</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-[#062B4D] bg-[#F7FAFC]">
                          گزارش‌سازی و مصورسازی
                        </td>
                        <td className="p-3.5">وابسته به طراحی و توسعه</td>
                        <td className="p-3.5">ابزار تخصصی گزارش و تحلیل</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-[#062B4D] bg-[#F7FAFC]">
                          تعامل با سامانه‌های دیگر
                        </td>
                        <td className="p-3.5">قابل طراحی از طریق توسعه</td>
                        <td className="p-3.5">وابسته به کانکتورها و معماری</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-[#062B4D] bg-[#F7FAFC]">
                          مدیریت دسترسی
                        </td>
                        <td className="p-3.5">قابل طراحی در Backend</td>
                        <td className="p-3.5">وابسته به مدل انتشار و مجوزها</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-[#062B4D] bg-[#F7FAFC]">
                          نگهداری و توسعه
                        </td>
                        <td className="p-3.5">نیازمند نگهداری نرم‌افزار</td>
                        <td className="p-3.5">نیازمند نگهداری مدل و گزارش</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-[#062B4D] bg-[#F7FAFC]">هزینه</td>
                        <td className="p-3.5">وابسته به طراحی، زیرساخت و نگهداری</td>
                        <td className="p-3.5">وابسته به مجوزها، ظرفیت و روش انتشار</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs sm:text-sm text-[#435466] leading-relaxed p-4 rounded-xl bg-[#EAF7F9]/60 border border-[#E3EBF0]">
                  در جلسه شناخت، نیازهای واقعی، زیرساخت و مدل استفاده بررسی می‌شوند تا گزینه مناسب‌تر یا ترکیبی از دو روش پیشنهاد شود.
                </p>
              </div>

              {/* Thinker Mascot (#4) */}
              <div className="lg:col-span-4">
                <Mascot
                  name="thinker"
                  className="mx-auto w-full max-w-[320px]"
                />
              </div>
            </div>

            {/* VIDEO 02 */}
            <div className="pt-4">
              <VideoPlaceholder
                videoLabel="Power BI یا وب‌اپلیکیشن اختصاصی؛ کدام برای کسب‌وکار شما مناسب‌تر است؟"
                title="Power BI یا وب‌اپلیکیشن اختصاصی؟"
                subtitle="تفاوت دو رویکرد را از نظر کاربرد، سفارشی‌سازی، دسترسی، هزینه و نگهداری بررسی کنید."
              />
            </div>
          </section>

          {/* D-PROCESS */}
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              مراحل اجرای پروژه داشبورد
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  num: '۱',
                  title: 'جلسه شناخت و تعریف نیاز',
                  desc: 'تعیین پرسش‌های مدیریتی، کاربران و خروجی مورد انتظار.'
                },
                {
                  num: '۲',
                  title: 'بررسی منابع داده',
                  desc: 'شناسایی نرم‌افزارها، ساختار جداول، دسترسی‌ها و کیفیت داده‌ها.'
                },
                {
                  num: '۳',
                  title: 'تعریف KPI و طراحی اولیه',
                  desc: 'تعیین شاخص‌ها، صفحات و طرح اولیه گزارش.'
                },
                {
                  num: '۴',
                  title: 'توسعه و آزمون',
                  desc: 'پیاده‌سازی، کنترل محاسبات و دریافت بازخورد.'
                },
                {
                  num: '۵',
                  title: 'تحویل و آشنایی کاربران',
                  desc: 'ارائه نسخه توافق‌شده، مستندات و آموزش استفاده.'
                },
                {
                  num: '۶',
                  title: 'پشتیبانی و توسعه بعدی',
                  desc: 'در صورت توافق، اصلاحات و توسعه‌های بعدی در چارچوب قرارداد.'
                }
              ].map((step) => (
                <div
                  key={step.num}
                  className="p-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2"
                >
                  <span className="font-mono-num text-lg font-bold text-[#08A9C5] block">
                    {step.num}.
                  </span>
                  <h3 className="text-sm font-bold text-[#062B4D]">{step.title}</h3>
                  <p className="text-xs text-[#435466] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* D-FAQ */}
          <FaqList items={DASHBOARDS_FAQS} showMascot />
        </>
      )}

      {/* =====================================================================
          ADDITIONAL SECTIONS FOR /services/bi-analytics (A-MODEL, A-FAQ)
      ===================================================================== */}
      {currentRoute === '/services/bi-analytics' && (
        <>
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
            <div className="max-w-3xl space-y-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
                یک همراه تحلیلی در کنار جلسات مدیریت
              </h2>
              <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
                در آغاز همکاری، پرسش‌های مدیریتی، شاخص‌های مهم و منابع داده مشخص می‌شوند. سپس تقویم گزارش‌دهی و جلسات مرور عملکرد بر اساس نیاز مجموعه تنظیم می‌شود.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#062B4D]">نمونه ساختار قابل توافق:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  'دریافت یا به‌روزرسانی داده‌ها بر اساس برنامه مشخص',
                  'کنترل اولیه کیفیت و کامل بودن داده‌ها',
                  'تهیه گزارش دوره‌ای',
                  'بررسی تغییرات و نکات مهم',
                  'گفت‌وگو درباره پرسش‌های مدیریتی',
                  'ثبت موارد نیازمند پیگیری و مرور آن‌ها در دوره بعد'
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs sm:text-sm text-[#263B50]"
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <FaqList items={ANALYTICS_FAQS} showMascot />
        </>
      )}

      {/* =====================================================================
          ADDITIONAL SECTIONS FOR /services/consulting (C-METHOD, C-FAQ)
      ===================================================================== */}
      {currentRoute === '/services/consulting' && (
        <>
          <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              ساختار پیشنهادی جلسات
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  num: '۱',
                  title: 'تعیین موضوع و هدف جلسه',
                  desc: 'مشخص کردن مسئله یا هدفی که باید بررسی شود.'
                },
                {
                  num: '۲',
                  title: 'مرور شواهد و شاخص‌ها',
                  desc: 'بررسی اطلاعات و عملکرد مرتبط با موضوع.'
                },
                {
                  num: '۳',
                  title: 'گفت‌وگو و تصمیم‌گیری',
                  desc: 'بررسی گزینه‌ها، موانع و اقدام‌های ممکن.'
                },
                {
                  num: '۴',
                  title: 'ثبت و پیگیری',
                  desc: 'مشخص کردن مسئول، موعد و معیار بررسی اقدام‌ها.'
                }
              ].map((step) => (
                <div
                  key={step.num}
                  className="p-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2"
                >
                  <span className="font-mono-num text-lg font-bold text-[#08A9C5] block">
                    {step.num}.
                  </span>
                  <h3 className="text-sm font-bold text-[#062B4D]">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <FaqList items={CONSULTING_FAQS} showMascot />
        </>
      )}

      {/* =====================================================================
          BOTTOM INLINE CONSULTATION FORM (§14 Form + Mascot #7)
      ===================================================================== */}
      <section className="rounded-2xl bg-[#EAF7F9]/70 border border-[#E3EBF0] p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              درخواست جلسه مشاوره
            </h2>
            <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
              با تکمیل اطلاعات زیر، به ما کمک می‌کنید پیش از جلسه، آشنایی اولیه‌ای با کسب‌وکار و نیاز شما داشته باشیم.
            </p>
          </div>

          <div className="lg:col-span-8">
            {formSent ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#08A9C5] text-center space-y-4">
                <Mascot name="success" className="mx-auto w-full max-w-[180px]" />
                <h3 className="text-base font-bold text-[#062B4D]">
                  درخواست شما دریافت شد.
                </h3>
                <p className="text-xs sm:text-sm text-[#435466]">
                  پس از بررسی اطلاعات، برای هماهنگی با شما تماس می‌گیریم.
                </p>
                {formTrackingCode && (
                  <div className="p-3.5 rounded-xl bg-[#EAF7F9] border border-[#08A9C5]/40 max-w-xs mx-auto space-y-1">
                    <span className="text-[11px] text-[#435466] block">
                      کد رهگیری اختصاصی شما:
                    </span>
                    <span className="font-mono-num text-base font-bold text-[#062B4D] tracking-wider dir-ltr block">
                      {formTrackingCode}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFormSent(false);
                    setFormTrackingCode('');
                    setFormName('');
                    setFormOrg('');
                    setFormPhone('');
                    setFormEmail('');
                    setFormNotes('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#087A9D] text-white text-xs font-medium cursor-pointer"
                >
                  ثبت درخواست جدید
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleInlineForm}
                className="bg-white p-6 rounded-2xl border border-[#E3EBF0] space-y-4"
              >
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#263B50] mb-1">
                      نام و نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
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
                      value={formOrg}
                      onChange={(e) => setFormOrg(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
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
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num"
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
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num"
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
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
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
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-3 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                  />
                  <span className="block text-[11px] text-[#64748B] mt-1">
                    مسئله اصلی، نرم‌افزارهای مورد استفاده یا پرسشی که می‌خواهید بررسی شود را بنویسید.
                  </span>
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      ارسال درخواست
                    </button>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    اطلاعات ثبت‌شده فقط برای بررسی درخواست و هماهنگی ارتباط استفاده می‌شود. جزئیات نحوه نگهداری و پردازش اطلاعات در بخش{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/privacy')}
                      className="text-[#087A9D] font-medium hover:underline cursor-pointer"
                    >
                      حریم خصوصی و محرمانگی اطلاعات
                    </button>{' '}
                    توضیح داده شده است.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
