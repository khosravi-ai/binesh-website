import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart3,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { RoutePath, UNIFIED_CTA_LABEL } from '../data/bineshData';
import {
  SOLUTIONS_DATA,
  SOLUTIONS_BY_ROUTE,
  SolutionRoutePath
} from '../data/solutionsData';
import { NavLink } from '../components/NavLink';
import { FaqList, Mascot } from '../components/BrandComponents';

interface SolutionsPagesProps {
  currentRoute: '/solutions' | SolutionRoutePath;
  onNavigate: (route: RoutePath) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

export const SolutionsPages: React.FC<SolutionsPagesProps> = ({
  currentRoute,
  onNavigate,
  onOpenConsultation
}) => {
  // =========================================================================
  // HUB PAGE: /solutions
  // =========================================================================
  if (currentRoute === '/solutions') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Hero */}
        <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>راهکارهای بومی هوش تجاری برای کسب‌وکارهای ایرانی</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
                راهکارهای هوش تجاری، داشبورد مدیریتی و اتصال به نرم‌افزارهای ایرانی
              </h1>

              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl">
                بسته به نرم‌افزار حسابداری (سپیدار، هلو و...)، صنعت فعالیت (پخش مویرگی، بازرگانی، تولیدی و مالی) یا نیاز به جلسات حضوری در شیراز، راهکار تخصصی متناسب با ساختار شرکت شما را پیاده‌سازی می‌کنیم.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenConsultation('داشبوردهای مدیریتی')}
                  className="px-6 py-3 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs sm:text-sm font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{UNIFIED_CTA_LABEL}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <NavLink
                  href="/demos"
                  onNavigate={onNavigate}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-[#3CDDDD]" />
                  <span>مشاهده زنده دموهای تعاملی</span>
                </NavLink>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Mascot name="builder" priority className="mx-auto w-full max-w-[260px]" />
            </div>
          </div>
        </section>

        {/* All 6 Solution Cards (Crawlable <a href="/solutions/..."> links) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#087A9D] block mb-1">
                انتخاب بر اساس نرم‌افزار، صنعت یا موقعیت
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-[#062B4D]">
                راهکارهای تخصصی قابل استقرار در بینش
              </h2>
            </div>
            <NavLink
              href="/services/dashboards"
              onNavigate={onNavigate}
              className="text-xs font-bold text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5"
            >
              <span>آشنایی کامل با خدمت طراحی داشبورد مدیریتی</span>
              <ArrowLeft className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS_DATA.map((sol, idx) => (
              <NavLink
                key={sol.route}
                href={sol.route}
                onNavigate={onNavigate}
                className="group rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] hover:shadow-sm p-6 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EAF7F9] text-[#087A9D] text-[11px] font-bold">
                      {sol.badge}
                    </span>
                    <span className="font-mono-num text-xs font-bold text-[#64748B]">
                      ۰{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#062B4D] group-hover:text-[#087A9D] transition-colors leading-snug">
                    {sol.shortTitle}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">{sol.lead}</p>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {sol.kpis.slice(0, 3).map((kpi) => (
                      <span
                        key={kpi.title}
                        className="px-2 py-0.5 rounded-md bg-[#F7FAFC] border border-[#E3EBF0] text-[11px] text-[#263B50]"
                      >
                        {kpi.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E3EBF0] flex items-center justify-between text-xs font-bold text-[#087A9D]">
                  <span>مشاهده جزئیات معماری و شاخص‌ها</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </NavLink>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-2xl bg-[#062B4D] text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">
              نرم‌افزار یا صنعت شما در این فهرست نیست؟
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              معماری داده‌محور بینش قابلیت اتصال به انواع پایگاه‌های داده (SQL Server، MySQL، PostgreSQL)، خروجی‌های ERP ایرانی و فایل‌های اکسل را دارد.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsultation('داشبوردهای مدیریتی')}
            className="px-6 py-3.5 rounded-xl bg-[#08A9C5] hover:bg-[#3CDDDD] text-[#062B4D] font-bold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer"
          >
            {UNIFIED_CTA_LABEL}
          </button>
        </section>
      </div>
    );
  }

  // =========================================================================
  // DEDICATED SOLUTION PAGE: /solutions/<slug>
  // =========================================================================
  const solution = SOLUTIONS_BY_ROUTE[currentRoute];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav
        aria-label="مسیر صفحه"
        className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]"
      >
        <NavLink href="/" onNavigate={onNavigate} className="hover:text-[#087A9D]">
          خانه
        </NavLink>
        <span>/</span>
        <NavLink href="/solutions" onNavigate={onNavigate} className="hover:text-[#087A9D]">
          راهکارهای هوش تجاری
        </NavLink>
        <span>/</span>
        <span className="text-[#062B4D] font-bold">{solution.shortTitle}</span>
      </nav>

      {/* Hero Section */}
      <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{solution.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
              {solution.h1}
            </h1>

            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-3xl">
              {solution.lead}
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white/90 leading-relaxed">
              <strong className="text-[#3CDDDD] ml-1">مناسب برای:</strong>
              {solution.targetAudience}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenConsultation(solution.shortTitle)}
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
                <span>تجربه زنده دموهای تعاملی</span>
              </NavLink>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Mascot name="analyst" priority className="mx-auto w-full max-w-[250px]" />
          </div>
        </div>
      </section>

      {/* Pain Points + Deliverables */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold text-[#062B4D]">
              چالش‌های رایج پیش از پیاده‌سازی این راهکار
            </h2>
          </div>
          <ul className="space-y-3">
            {solution.painPoints.map((point, idx) => (
              <li
                key={idx}
                className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs sm:text-sm text-[#263B50] leading-relaxed flex items-start gap-2.5"
              >
                <span className="font-mono-num text-xs font-bold text-amber-700 mt-0.5">
                  ۰{idx + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-[#EAF7F9]/70 border border-[#08A9C5]/30 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-5 h-5 text-[#087A9D] shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-[#062B4D]">
                خروجی‌ها و تحویلی‌های پروژه
              </h2>
            </div>
            <ul className="space-y-2.5">
              {solution.deliverables.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-[#E3EBF0] text-xs sm:text-sm text-[#263B50] flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onOpenConsultation(solution.shortTitle)}
            className="w-full py-3 rounded-xl bg-[#087A9D] hover:bg-[#062B4D] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            {UNIFIED_CTA_LABEL}
          </button>
        </div>
      </section>

      {/* 3-Step Engineering Architecture */}
      <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[#08A9C5]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
            {solution.architectureTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {solution.architectureSteps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] p-5 space-y-2.5"
            >
              <h3 className="text-sm sm:text-base font-bold text-[#062B4D] leading-snug">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key KPIs Grid */}
      <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
        <div>
          <span className="text-xs font-bold text-[#087A9D] block mb-1">
            شاخص‌های کلیدی عملکرد قابل پایش
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
            مهم‌ترین گزارش‌ها و KPIهای این داشبورد
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {solution.kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] p-5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-[#062B4D]">{kpi.title}</h3>
              </div>
              <p className="text-xs text-[#435466] leading-relaxed">{kpi.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Case Studies & Related Solutions (Internal Linking) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#062B4D]">نمونه‌کارها و دموهای مرتبط</h2>
          <div className="space-y-2.5">
            {solution.relatedPortfolioRoutes.map((item) => (
              <NavLink
                key={item.route}
                href={item.route}
                onNavigate={onNavigate}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#062B4D] transition-colors"
              >
                <span>{item.label}</span>
                <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
              </NavLink>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#062B4D]">سایر راهکارها و خدمات مرتبط</h2>
          <div className="space-y-2.5">
            {solution.relatedSolutionRoutes.map((item) => (
              <NavLink
                key={item.route}
                href={item.route}
                onNavigate={onNavigate}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#062B4D] transition-colors"
              >
                <span>{item.label}</span>
                <ArrowLeft className="w-4 h-4 text-[#087A9D] shrink-0" />
              </NavLink>
            ))}
            <NavLink
              href="/services/dashboards"
              onNavigate={onNavigate}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] text-xs sm:text-sm font-bold text-[#087A9D] transition-colors"
            >
              <span>مشاهده صفحه تخصصی طراحی داشبوردهای مدیریتی</span>
              <ArrowLeft className="w-4 h-4 shrink-0" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <FaqList items={solution.faqs} showMascot={false} />

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-7 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#087A9D]/40">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold">
            آماده بررسی امکان‌سنجی برای شرکت خود هستید؟
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            در یک گفت‌وگوی ۳۰ دقیقه‌ای رایگان، ساختار نرم‌افزار فعلی، شاخص‌های موردنیاز و نقشه راه استقرار داشبورد شما را بررسی می‌کنیم.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenConsultation(solution.shortTitle)}
          className="px-6 py-3.5 rounded-xl bg-[#08A9C5] hover:bg-[#3CDDDD] text-[#062B4D] font-bold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer"
        >
          {UNIFIED_CTA_LABEL}
        </button>
      </section>
    </div>
  );
};
