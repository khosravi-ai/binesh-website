import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  LineChart,
  Compass,
  CheckCircle2,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import {
  RoutePath,
  SERVICE_CATEGORIES,
  COLLABORATION_STEPS,
  GENERAL_FAQS
} from '../data/bineshData';
import {
  Mascot,
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
  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formService, setFormService] = useState(
    normalizeServiceOption(SERVICE_CATEGORIES[0].title)
  );
  const [formNotes, setFormNotes] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [formTrackingCode, setFormTrackingCode] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Scroll to specific section if direct sub-route is visited
  useEffect(() => {
    if (currentRoute === '/services/dashboards') {
      document.getElementById('section-dashboards')?.scrollIntoView({ behavior: 'smooth' });
    } else if (currentRoute === '/services/bi-analytics') {
      document.getElementById('section-bi-analytics')?.scrollIntoView({ behavior: 'smooth' });
    } else if (currentRoute === '/services/consulting') {
      document.getElementById('section-consulting')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentRoute]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInlineForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      setFormError('لطفاً نام و شماره تماس را وارد کنید.');
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
        setFormError(
          res.error || 'ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.'
        );
      }
    } catch {
      setFormError('ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      {/* =====================================================================
          HERO HEADER + STICKY QUICK JUMP ANCHORS
      ===================================================================== */}
      <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30 space-y-8">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>سه خدمت تخصصی و مکمل برای مدیریت داده‌محور</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
              خدمات مهندسی داده، داشبوردهای مدیریتی و مشاوره بینش
            </h1>

            <ul className="space-y-2 text-xs sm:text-sm text-white/85">
              <li>• تجمیع اطلاعات پراکنده فروش، مالی و انبار بدون تغییر سیستم‌های فعلی شما</li>
              <li>• طراحی داشبوردهای تعاملی (Power BI و وب‌اپلیکیشن اختصاصی)</li>
              <li>• پایش دوره‌ای شاخص‌ها (KPI) و جلسات مستمر تحلیل و کوچینگ مدیریتی</li>
            </ul>

            {/* Quick Anchor Buttons to the 3 Scrollable Sections */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('section-dashboards')}
                className="px-4 py-2.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>۰۱. داشبوردهای مدیریتی</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('section-bi-analytics')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <LineChart className="w-4 h-4 text-[#3CDDDD]" />
                <span>۰۲. تحلیل و پایش مستمر</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('section-consulting')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#3CDDDD]" />
                <span>۰۳. مشاوره و کوچینگ</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Mascot name="thinker" className="mx-auto w-full max-w-[240px]" />
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 01 — طراحی و توسعه داشبوردهای مدیریتی (#section-dashboards)
      ===================================================================== */}
      <section
        id="section-dashboards"
        className="scroll-mt-24 rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-8 shadow-2xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-6 border-b border-[#E3EBF0]">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono-num text-xs font-bold px-3 py-1 rounded-lg bg-[#EAF7F9] text-[#087A9D]">
                خدمت ۰۱
              </span>
              <span className="text-xs font-bold text-[#087A9D]">
                یکپارچه‌سازی و تصویرسازی داده‌ها
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-bold text-[#062B4D]">
              {SERVICE_CATEGORIES[0].title}
            </h2>

            <ul className="space-y-2 text-xs sm:text-sm text-[#435466]">
              <li>• اتصال مستقیم به نرم‌افزار حسابداری، فروش، انبار، CRM و فایل‌های اکسل</li>
              <li>• طراحی داشبورد در دو بستر: <strong>وب‌اپلیکیشن اختصاصی</strong> یا <strong>Microsoft Power BI</strong></li>
              <li>• حذف کامل گزارش‌گیری دستی و نمایش لحظه‌ای شاخص‌های کلیدی (KPI)</li>
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenConsultation(SERVICE_CATEGORIES[0].title)}
                className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-bold hover:bg-[#062B4D] transition-colors cursor-pointer"
              >
                جلسه رایگان عیب‌یابی داده برای داشبورد
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/demos')}
                className="px-4 py-2.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] hover:border-[#08A9C5] text-[#062B4D] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#08A9C5]" />
                <span>مشاهده زنده دموهای داشبورد</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Mascot name="builder" className="mx-auto w-full max-w-[280px]" />
          </div>
        </div>

        {/* 5 Sub-Services of Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICE_CATEGORIES[0].subServices.map((sub) => (
            <div
              key={sub.code}
              className="rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-num font-bold text-[#087A9D]">{sub.code}</span>
                  <span className="text-[#64748B]">زیرخدمت تخصصی</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#062B4D] leading-snug">
                  {sub.title}
                </h3>
                <p className="text-xs text-[#435466] leading-relaxed">{sub.description}</p>
              </div>

              <div className="pt-3 border-t border-[#E3EBF0] space-y-1.5">
                <span className="text-[11px] font-bold text-[#062B4D] block">خروجی‌های قابل تحویل:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sub.deliverables.map((del) => (
                    <span
                      key={del}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#E3EBF0] text-[11px] text-[#263B50]"
                    >
                      ✓ {del}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 — تحلیل و پایش مستمر کسب‌وکار (#section-bi-analytics)
      ===================================================================== */}
      <section
        id="section-bi-analytics"
        className="scroll-mt-24 rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-8 shadow-2xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-6 border-b border-[#E3EBF0]">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono-num text-xs font-bold px-3 py-1 rounded-lg bg-[#EAF7F9] text-[#087A9D]">
                خدمت ۰۲
              </span>
              <span className="text-xs font-bold text-[#087A9D]">
                کشف ریشه نوسانات و فرصت‌های سودآوری
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-bold text-[#062B4D]">
              {SERVICE_CATEGORIES[1].title}
            </h2>

            <ul className="space-y-2 text-xs sm:text-sm text-[#435466]">
              <li>• بررسی دوره‌ای فروش، بهای تمام‌شده، حاشیه سود و جریان نقدینگی</li>
              <li>• کشف مغایرت‌های قیمتی، تخفیف‌های غیرعادی و انحراف شعب از تارگت</li>
              <li>• ارائه گزارش‌های تحلیلی هفتگی و ماهانه به همراه پیشنهادهای اجرایی</li>
            </ul>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenConsultation(SERVICE_CATEGORIES[1].title)}
                className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-bold hover:bg-[#062B4D] transition-colors cursor-pointer"
              >
                درخواست جلسه بررسی و پایش تحلیلی
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Mascot name="analyst" className="mx-auto w-full max-w-[260px]" />
          </div>
        </div>

        {/* 6 Sub-Services of Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICE_CATEGORIES[1].subServices.map((sub) => (
            <div
              key={sub.code}
              className="rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-num font-bold text-[#087A9D]">{sub.code}</span>
                  <span className="text-[#64748B]">زیرخدمت تحلیلی</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#062B4D] leading-snug">
                  {sub.title}
                </h3>
                <p className="text-xs text-[#435466] leading-relaxed">{sub.description}</p>
              </div>

              <div className="pt-3 border-t border-[#E3EBF0] space-y-1.5">
                <span className="text-[11px] font-bold text-[#062B4D] block">خروجی‌های قابل تحویل:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sub.deliverables.map((del) => (
                    <span
                      key={del}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#E3EBF0] text-[11px] text-[#263B50]"
                    >
                      ✓ {del}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 — مشاوره و کوچینگ کسب‌وکار (#section-consulting)
      ===================================================================== */}
      <section
        id="section-consulting"
        className="scroll-mt-24 rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-8 shadow-2xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-6 border-b border-[#E3EBF0]">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono-num text-xs font-bold px-3 py-1 rounded-lg bg-[#EAF7F9] text-[#087A9D]">
                خدمت ۰۳
              </span>
              <span className="text-xs font-bold text-[#087A9D]">
                هدف‌گذاری، تعریف KPI و پیگیری نتیجه‌محور
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-bold text-[#062B4D]">
              {SERVICE_CATEGORIES[2].title}
            </h2>

            <ul className="space-y-2 text-xs sm:text-sm text-[#435466]">
              <li>• تبدیل اهداف کلان مدیرعامل به شاخص‌های عددی و قابل سنجش (KPI)</li>
              <li>• برگزاری جلسات منظم مرور عملکرد و پیگیری مصوبات بهبود</li>
              <li>• آموزش عملی تیم کارفرما برای کار با داشبوردها و تحلیل داده‌ها</li>
            </ul>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenConsultation(SERVICE_CATEGORIES[2].title)}
                className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-bold hover:bg-[#062B4D] transition-colors cursor-pointer"
              >
                هماهنگی جلسه مشاوره و هدف‌گذاری
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Mascot name="strategist" className="mx-auto w-full max-w-[280px]" />
          </div>
        </div>

        {/* 4 Sub-Services of Consulting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICE_CATEGORIES[2].subServices.map((sub) => (
            <div
              key={sub.code}
              className="rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-num font-bold text-[#087A9D]">{sub.code}</span>
                  <span className="text-[#64748B]">زیرخدمت مشاوره‌ای</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#062B4D] leading-snug">
                  {sub.title}
                </h3>
                <p className="text-xs text-[#435466] leading-relaxed">{sub.description}</p>
              </div>

              <div className="pt-3 border-t border-[#E3EBF0] space-y-1.5">
                <span className="text-[11px] font-bold text-[#062B4D] block">خروجی‌های قابل تحویل:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sub.deliverables.map((del) => (
                    <span
                      key={del}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#E3EBF0] text-[11px] text-[#263B50]"
                    >
                      ✓ {del}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 04 — مسیر ۴ گام همکاری با بینش (4-Step Roadmap)
      ===================================================================== */}
      <section className="rounded-2xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 space-y-8 border border-[#087A9D]/30">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#3CDDDD] block mb-1">
              شفافیت از روز اول تا استقرار کامل
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              مسیر ۴ گام همکاری با بینش
            </h2>
          </div>
          <span className="font-mono-num text-xs text-[#3CDDDD]">
            ۴ مرحله استاندارد مهندسی و تحلیلی
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {COLLABORATION_STEPS.map((item) => (
            <div
              key={item.step}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-2xl font-bold text-[#3CDDDD]">
                  {item.step}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-[11px] text-white/85">
                  {item.subtitle}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-white/80 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          FAQ + BOTTOM INLINE CONSULTATION FORM
      ===================================================================== */}
      <FaqList items={GENERAL_FAQS} showMascot />

      <section className="rounded-2xl bg-[#EAF7F9]/70 border border-[#E3EBF0] p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              جلسه رایگان عیب‌یابی داده
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-[#435466]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0" />
                <span>۱۵ دقیقه گفت‌وگوی تخصصی رایگان</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0" />
                <span>بررسی منابع داده بدون نیاز به اطلاعات محرمانه</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0" />
                <span>صدور کد رهگیری آنی پس از ثبت</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-8">
            {formSent ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#08A9C5] text-center space-y-4">
                <Mascot name="success" className="mx-auto w-full max-w-[180px]" />
                <h3 className="text-base font-bold text-[#062B4D]">
                  درخواست شما با موفقیت ثبت شد.
                </h3>
                <p className="text-xs sm:text-sm text-[#435466]">
                  پس از بررسی اطلاعات، کارشناسان بینش برای هماهنگی جلسه با شما تماس می‌گیرند.
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
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263B50] mb-1">
                    توضیحات تکمیلی (اختیاری)
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="نرم‌افزارهای فعلی یا دغدغه اصلی گزارش‌گیری خود را بنویسید..."
                    className="w-full p-3 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-bold hover:bg-[#062B4D] transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{formSubmitting ? 'در حال ثبت...' : 'ثبت درخواست جلسه رایگان'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
