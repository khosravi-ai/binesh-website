import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  LineChart,
  Compass,
  CheckCircle2,
  ArrowLeft,
  BarChart3,
  Globe,
  Database,
  Layers,
  Target,
  Activity
} from 'lucide-react';
import {
  RoutePath,
  SERVICE_CATEGORIES,
  COLLABORATION_STEPS,
  GENERAL_FAQS,
  DASHBOARDS_FAQS,
  ANALYTICS_FAQS,
  CONSULTING_FAQS,
  UNIFIED_CTA_LABEL
} from '../data/bineshData';
import { SOLUTIONS_DATA } from '../data/solutionsData';
import {
  Mascot,
  FaqList,
  FORM_SERVICE_OPTIONS,
  normalizeServiceOption,
  TrackingCodeCopyBox
} from '../components/BrandComponents';
import { NavLink } from '../components/NavLink';
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
  const defaultServiceForRoute =
    currentRoute === '/services/bi-analytics'
      ? SERVICE_CATEGORIES[1].title
      : currentRoute === '/services/consulting'
      ? SERVICE_CATEGORIES[2].title
      : SERVICE_CATEGORIES[0].title;

  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formService, setFormService] = useState(normalizeServiceOption(defaultServiceForRoute));
  const [formNotes, setFormNotes] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [formTrackingCode, setFormTrackingCode] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormService(normalizeServiceOption(defaultServiceForRoute));
  }, [defaultServiceForRoute]);

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

  const renderInlineConsultationSection = () => (
    <section className="rounded-2xl bg-[#EAF7F9]/70 border border-[#E3EBF0] p-6 sm:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">{UNIFIED_CTA_LABEL}</h2>
          <ul className="space-y-2 text-xs sm:text-sm text-[#435466]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0" />
              <span>۳۰ دقیقه گفت‌وگوی تخصصی رایگان برای شناخت نیاز و منابع داده</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0" />
              <span>بررسی نرم‌افزارهای فعلی بدون نیاز به ارسال اطلاعات محرمانه</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0" />
              <span>صدور کد رهگیری آنی پس از ثبت درخواست</span>
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
                <TrackingCodeCopyBox
                  code={formTrackingCode}
                  helperText="برای پیگیری وضعیت درخواست، این کد را کپی و نزد خود نگه دارید."
                />
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
                  placeholder="نرم‌افزارهای فعلی (مثل سپیدار، هلو، اکسل...) یا دغدغه اصلی گزارش‌گیری خود را بنویسید..."
                  className="w-full p-3 text-xs rounded-lg border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-bold hover:bg-[#062B4D] transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{formSubmitting ? 'در حال ثبت...' : UNIFIED_CTA_LABEL}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );

  // =========================================================================
  // DEDICATED ROUTE: /services/dashboards
  // =========================================================================
  if (currentRoute === '/services/dashboards') {
    const category = SERVICE_CATEGORIES[0];
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <nav
          aria-label="مسیر صفحه"
          className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]"
        >
          <NavLink href="/" onNavigate={onNavigate} className="hover:text-[#087A9D]">
            خانه
          </NavLink>
          <span>/</span>
          <NavLink href="/services" onNavigate={onNavigate} className="hover:text-[#087A9D]">
            خدمات
          </NavLink>
          <span>/</span>
          <span className="text-[#062B4D] font-bold">طراحی و توسعه داشبوردهای مدیریتی</span>
        </nav>

        {/* Hero */}
        <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>خدمت تخصصی ۰۱ · مهندسی داده و داشبورد مدیریتی</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
                طراحی و پیاده‌سازی داشبوردهای مدیریتی (Power BI و وب‌اپلیکیشن اختصاصی)
              </h1>

              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-3xl">
                فایل‌های اکسل پراکنده، داده‌های نرم‌افزار حسابداری (سپیدار، هلو، راهکاران و...)، انبار و فروش را بدون تغییر در سیستم‌های جاری شرکت به یک داشبورد مدیریتی سریع، دقیق و خودکار تبدیل می‌کنیم.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenConsultation(category.title)}
                  className="px-6 py-3.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs sm:text-sm font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{UNIFIED_CTA_LABEL}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <NavLink
                  href="/demos"
                  onNavigate={onNavigate}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-[#3CDDDD]" />
                  <span>تجربه زنده دموی وب و Power BI</span>
                </NavLink>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Mascot name="builder" priority className="mx-auto w-full max-w-[280px]" />
            </div>
          </div>
        </section>

        {/* Power BI vs Custom Web Application Comparison */}
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#087A9D] block mb-1">
              انتخاب بستر فنی متناسب با زیرساخت شرکت
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              داشبورد Microsoft Power BI یا وب‌اپلیکیشن مدیریتی اختصاصی؟
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#087A9D]" />
                <h3 className="text-base sm:text-lg font-bold text-[#062B4D]">
                  داشبورد Microsoft Power BI
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                بهترین گزینه برای تحلیل‌های چندبعدی، مدل‌سازی پیچیده مالی و فروش (DAX)، امکان فیلترهای متقاطع (Cross-Filtering) و استقرار روی سرور داخلی (Power BI Report Server) بدون خروج داده از شبکه شرکت.
              </p>
              <ul className="space-y-1.5 text-xs text-[#263B50]">
                <li>• مناسب مدیران مالی، تحلیلگران و شرکت‌های دارای دیتابیس SQL (سپیدار، هلو، ERP)</li>
                <li>• پیاده‌سازی سریع‌تر مدل داده و قابلیت Drill-down تا سطح تک‌سند و فاکتور</li>
                <li>• کنترل سطح دسترسی ردیفی (RLS) برای شعب و سرپرستان فروش</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#EAF7F9]/60 border border-[#08A9C5]/30 p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-[#087A9D]" />
                <h3 className="text-base sm:text-lg font-bold text-[#062B4D]">
                  داشبورد وب‌اپلیکیشن اختصاصی
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                مناسب مجموعه‌هایی که علاوه بر نمایش KPI، نیاز به پنل کاربری کاملاً فارسی و واکنش‌گرا روی موبایل، ثبت اطلاعات تکمیلی (تارگت، سفارش، پیگیری)، برندینگ اختصاصی و دسترسی نامحدود کاربران بدون هزینه لایسنس دارند.
              </p>
              <ul className="space-y-1.5 text-xs text-[#263B50]">
                <li>• رابط کاربری ۱۰۰٪ اختصاصی، سریع و بهینه برای موبایل مدیرعامل</li>
                <li>• بدون محدودیت تعداد کاربران و بدون وابستگی به تحریم یا لایسنس ارزی</li>
                <li>• امکان افزودن ماژول‌های عملیاتی مثل هشدار موجودی، ثبت تارگت و خروجی PDF</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5 Dashboard Sub-Services */}
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#087A9D] block mb-1">
              معماری کامل از اتصال داده تا تحویل نهایی
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              پنج زیرخدمت تخصصی در طراحی داشبوردهای مدیریتی
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {category.subServices.map((sub) => (
              <div
                key={sub.code}
                className="rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono-num font-bold text-[#087A9D]">{sub.code}</span>
                    <span className="text-[#64748B]">زیرخدمت داشبورد</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#062B4D] leading-snug">
                    {sub.title}
                  </h3>
                  <p className="text-xs text-[#435466] leading-relaxed">{sub.description}</p>
                </div>

                <div className="pt-3 border-t border-[#E3EBF0] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#062B4D] block">
                    خروجی‌های قابل تحویل:
                  </span>
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

        {/* Specialized Software Integrations & Case Studies */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-[#062B4D]">
              راهکارهای اتصال مستقیم به نرم‌افزارهای ایرانی و صنایع
            </h2>
            <div className="space-y-2.5">
              {SOLUTIONS_DATA.map((sol) => (
                <NavLink
                  key={sol.route}
                  href={sol.route}
                  onNavigate={onNavigate}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#062B4D] transition-colors"
                >
                  <span>{sol.shortTitle}</span>
                  <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
                </NavLink>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-[#062B4D]">
              نمونه‌کارهای اجراشده در حوزه داشبورد مدیریتی
            </h2>
            <div className="space-y-2.5">
              <NavLink
                href="/portfolio/kabino-wood"
                onNavigate={onNavigate}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#062B4D] transition-colors"
              >
                <span>کابینو وود — داشبورد مدیریتی و مالی (Power BI + وب)</span>
                <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
              </NavLink>
              <NavLink
                href="/portfolio/paytakht-office"
                onNavigate={onNavigate}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#062B4D] transition-colors"
              >
                <span>تجهیزات اداری پایتخت — وب‌اپلیکیشن فروش و موجودی</span>
                <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
              </NavLink>
              <NavLink
                href="/portfolio/arya-pakhsh"
                onNavigate={onNavigate}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#062B4D] transition-colors"
              >
                <span>آریا پخش — داشبورد Power BI فروش و عملکرد شعب</span>
                <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
              </NavLink>
              <NavLink
                href="/portfolio/takapoo"
                onNavigate={onNavigate}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#062B4D] transition-colors"
              >
                <span>تکاپو — داشبورد پایش و کشف مغایرت‌های فروش</span>
                <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
              </NavLink>
            </div>
          </div>
        </section>

        <FaqList items={DASHBOARDS_FAQS} showMascot={false} />
        {renderInlineConsultationSection()}
      </div>
    );
  }

  // =========================================================================
  // DEDICATED ROUTE: /services/bi-analytics
  // =========================================================================
  if (currentRoute === '/services/bi-analytics') {
    const category = SERVICE_CATEGORIES[1];
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <nav
          aria-label="مسیر صفحه"
          className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]"
        >
          <NavLink href="/" onNavigate={onNavigate} className="hover:text-[#087A9D]">
            خانه
          </NavLink>
          <span>/</span>
          <NavLink href="/services" onNavigate={onNavigate} className="hover:text-[#087A9D]">
            خدمات
          </NavLink>
          <span>/</span>
          <span className="text-[#062B4D] font-bold">تحلیل و پایش مستمر کسب‌وکار</span>
        </nav>

        <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                <Activity className="w-3.5 h-3.5" />
                <span>خدمت تخصصی ۰۲ · واحد تحلیل داده برون‌سپاری‌شده</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
                تحلیل داده‌ها و پایش مستمر عملکرد کسب‌وکار
              </h1>

              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-3xl">
                به‌جای آنکه فقط عدد و نمودار ببینید، تیم تحلیلی بینش به‌صورت هفتگی و ماهانه داده‌های فروش، حاشیه سود، انبار و مالی شما را رصد می‌کند، ریشه افت‌ها و ناهنجاری‌ها را می‌یابد و گزارش تفسیری آماده تصمیم‌گیری ارائه می‌دهد.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenConsultation(category.title)}
                  className="px-6 py-3.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs sm:text-sm font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{UNIFIED_CTA_LABEL}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <NavLink
                  href="/portfolio/takapoo"
                  onNavigate={onNavigate}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>مشاهده مطالعه موردی پایش فروش تکاپو</span>
                </NavLink>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Mascot name="analyst" priority className="mx-auto w-full max-w-[260px]" />
            </div>
          </div>
        </section>

        {/* 6 Sub-Services */}
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
            شش محور تخصصی در پایش و تحلیل مستمر داده‌ها
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {category.subServices.map((sub) => (
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
                  <span className="text-[11px] font-bold text-[#062B4D] block">
                    خروجی‌های قابل تحویل:
                  </span>
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

        {/* Related links */}
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#062B4D]">راهکارها و خدمات مکمل</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NavLink
              href="/solutions/distribution-sales"
              onNavigate={onNavigate}
              className="p-4 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] text-xs sm:text-sm font-bold text-[#062B4D] flex items-center justify-between"
            >
              <span>تحلیل فروش شرکت‌های پخش</span>
              <ArrowLeft className="w-4 h-4 text-[#087A9D]" />
            </NavLink>
            <NavLink
              href="/solutions/finance"
              onNavigate={onNavigate}
              className="p-4 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] text-xs sm:text-sm font-bold text-[#062B4D] flex items-center justify-between"
            >
              <span>تحلیل مالی و بهای تمام‌شده</span>
              <ArrowLeft className="w-4 h-4 text-[#087A9D]" />
            </NavLink>
            <NavLink
              href="/services/dashboards"
              onNavigate={onNavigate}
              className="p-4 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] text-xs sm:text-sm font-bold text-[#062B4D] flex items-center justify-between"
            >
              <span>طراحی داشبوردهای مدیریتی</span>
              <ArrowLeft className="w-4 h-4 text-[#087A9D]" />
            </NavLink>
          </div>
        </section>

        <FaqList items={ANALYTICS_FAQS} showMascot={false} />
        {renderInlineConsultationSection()}
      </div>
    );
  }

  // =========================================================================
  // DEDICATED ROUTE: /services/consulting
  // =========================================================================
  if (currentRoute === '/services/consulting') {
    const category = SERVICE_CATEGORIES[2];
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <nav
          aria-label="مسیر صفحه"
          className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]"
        >
          <NavLink href="/" onNavigate={onNavigate} className="hover:text-[#087A9D]">
            خانه
          </NavLink>
          <span>/</span>
          <NavLink href="/services" onNavigate={onNavigate} className="hover:text-[#087A9D]">
            خدمات
          </NavLink>
          <span>/</span>
          <span className="text-[#062B4D] font-bold">مشاوره و کوچینگ کسب‌وکار</span>
        </nav>

        <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                <Target className="w-3.5 h-3.5" />
                <span>خدمت تخصصی ۰۳ · استراتژی، KPI و کوچینگ مدیران</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
                مشاوره هوش تجاری، طراحی KPI و کوچینگ کسب‌وکار برای مدیران
              </h1>

              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-3xl">
                ابزار بدون فرهنگ تصمیم‌گیری داده‌محور نتیجه کامل نمی‌دهد. در جلسات مشاوره و کوچینگ بینش، اهداف کلان شرکت به شاخص‌های عددی قابل پیگیری تبدیل شده و در ریتم منظم مدیریتی پایش می‌شوند.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenConsultation(category.title)}
                  className="px-6 py-3.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs sm:text-sm font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{UNIFIED_CTA_LABEL}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <NavLink
                  href="/solutions/shiraz"
                  onNavigate={onNavigate}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>جلسات حضوری در شیراز و آنلاین سراسر ایران</span>
                </NavLink>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Mascot name="strategist" priority className="mx-auto w-full max-w-[280px]" />
            </div>
          </div>
        </section>

        {/* 4 Consulting Sub-Services */}
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
            چهار زیرخدمت تخصصی در مشاوره و کوچینگ کسب‌وکار
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {category.subServices.map((sub) => (
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
                  <span className="text-[11px] font-bold text-[#062B4D] block">
                    خروجی‌های قابل تحویل:
                  </span>
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

        <FaqList items={CONSULTING_FAQS} showMascot={false} />
        {renderInlineConsultationSection()}
      </div>
    );
  }

  // =========================================================================
  // OVERVIEW HUB: /services
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      {/* HERO HEADER + CRAWLABLE LINKS TO THE 3 DEDICATED SERVICE PAGES */}
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

            {/* Semantic <a href> links to the 3 dedicated sub-service pages */}
            <div className="pt-3 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
              <NavLink
                href="/services/dashboards"
                onNavigate={onNavigate}
                className="px-4 py-2.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>۰۱. داشبوردهای مدیریتی</span>
              </NavLink>
              <NavLink
                href="/services/bi-analytics"
                onNavigate={onNavigate}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
              >
                <LineChart className="w-4 h-4 text-[#3CDDDD]" />
                <span>۰۲. تحلیل و پایش مستمر</span>
              </NavLink>
              <NavLink
                href="/services/consulting"
                onNavigate={onNavigate}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#3CDDDD]" />
                <span>۰۳. مشاوره و کوچینگ</span>
              </NavLink>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Mascot name="thinker" priority className="mx-auto w-full max-w-[240px]" />
          </div>
        </div>
      </section>

      {/* 3 MAIN SERVICE SUMMARY CARDS LINKING TO DEDICATED PAGES */}
      <section className="space-y-6">
        {SERVICE_CATEGORIES.map((category, idx) => {
          const mascotName = idx === 0 ? 'builder' : idx === 1 ? 'analyst' : 'strategist';
          return (
            <div
              key={category.id}
              className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6 shadow-2xs"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-num text-xs font-bold px-3 py-1 rounded-lg bg-[#EAF7F9] text-[#087A9D]">
                      خدمت ۰{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#087A9D]">{category.subtitle}</span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-bold text-[#062B4D]">
                    <NavLink
                      href={category.route}
                      onNavigate={onNavigate}
                      className="hover:text-[#087A9D] transition-colors"
                    >
                      {category.title}
                    </NavLink>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                    {category.summary} {category.idealFor}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {category.subServices.map((sub) => (
                      <span
                        key={sub.code}
                        className="px-3 py-1 rounded-lg bg-[#F7FAFC] border border-[#E3EBF0] text-xs text-[#263B50]"
                      >
                        ✓ {sub.title}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <NavLink
                      href={category.route}
                      onNavigate={onNavigate}
                      className="px-5 py-2.5 rounded-xl bg-[#062B4D] hover:bg-[#087A9D] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
                    >
                      <span>مشاهده جزئیات کامل {category.shortTitle}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => onOpenConsultation(category.title)}
                      className="px-5 py-2.5 rounded-xl bg-[#EAF7F9] hover:bg-[#08A9C5] text-[#062B4D] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {UNIFIED_CTA_LABEL}
                    </button>
                    {idx === 0 && (
                      <NavLink
                        href="/demos"
                        onNavigate={onNavigate}
                        className="px-4 py-2.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] hover:border-[#08A9C5] text-[#062B4D] text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#08A9C5]" />
                        <span>مشاهده زنده دموها</span>
                      </NavLink>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <Mascot name={mascotName} className="mx-auto w-full max-w-[260px]" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* SPECIALIZED SOLUTIONS & INTEGRATIONS STRIP */}
      <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#087A9D]">
              <Layers className="w-4 h-4" />
              <span>اتصال به نرم‌افزارهای ایرانی و راهکارهای صنعتی</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              راهکارهای تخصصی قابل اجرا در بینش
            </h2>
          </div>
          <NavLink
            href="/solutions"
            onNavigate={onNavigate}
            className="text-xs font-bold text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5"
          >
            <span>مشاهده همه راهکارها</span>
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOLUTIONS_DATA.map((sol) => (
            <NavLink
              key={sol.route}
              href={sol.route}
              onNavigate={onNavigate}
              className="p-4 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] flex items-center justify-between gap-3 transition-colors"
            >
              <div>
                <span className="text-[11px] font-bold text-[#087A9D] block">{sol.badge}</span>
                <span className="text-xs sm:text-sm font-bold text-[#062B4D]">
                  {sol.shortTitle}
                </span>
              </div>
              <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
            </NavLink>
          ))}
        </div>
      </section>

      {/* 4-Step Roadmap */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      <FaqList items={GENERAL_FAQS} showMascot />
      {renderInlineConsultationSection()}
    </div>
  );
};
