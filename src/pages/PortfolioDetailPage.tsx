import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Maximize2,
  X,
  Home
} from 'lucide-react';
import {
  RoutePath,
  PORTFOLIO_PLACEHOLDERS,
  PortfolioPlaceholderItem,
  UNIFIED_CTA_LABEL
} from '../data/bineshData';
import {
  PORTFOLIO_ID_BY_ROUTE,
  getPortfolioRoute,
  SOLUTIONS_DATA
} from '../data/solutionsData';
import { NavLink } from '../components/NavLink';
import { Mascot } from '../components/BrandComponents';

interface PortfolioDetailPageProps {
  currentRoute:
    | '/portfolio/kabino-wood'
    | '/portfolio/paytakht-office'
    | '/portfolio/takapoo'
    | '/portfolio/arya-pakhsh';
  onNavigate: (route: RoutePath) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
  portfolioItems?: PortfolioPlaceholderItem[];
}

const RELATED_SOLUTIONS_BY_PROJECT: Record<string, RoutePath[]> = {
  kabinowood: ['/solutions/power-bi-sepidar', '/solutions/finance', '/solutions/shiraz'],
  paytakht: ['/solutions/trading-sales', '/solutions/power-bi-holoo', '/services/dashboards'],
  takapoo: ['/solutions/distribution-sales', '/solutions/power-bi-sepidar', '/services/bi-analytics'],
  aria: ['/solutions/distribution-sales', '/solutions/shiraz', '/services/dashboards']
};

export const PortfolioDetailPage: React.FC<PortfolioDetailPageProps> = ({
  currentRoute,
  onNavigate,
  onOpenConsultation,
  portfolioItems = PORTFOLIO_PLACEHOLDERS
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const projectId = PORTFOLIO_ID_BY_ROUTE[currentRoute];
  const project =
    portfolioItems.find((p) => p.id === projectId) ||
    PORTFOLIO_PLACEHOLDERS.find((p) => p.id === projectId) ||
    PORTFOLIO_PLACEHOLDERS[0];

  const otherProjects = (portfolioItems.length > 0 ? portfolioItems : PORTFOLIO_PLACEHOLDERS).filter(
    (p) => p.id !== project.id
  );

  const relatedSolutionRoutes = RELATED_SOLUTIONS_BY_PROJECT[project.id] || [
    '/solutions/power-bi-sepidar',
    '/solutions/finance'
  ];

  const relatedSolutions = relatedSolutionRoutes
    .map((r) => SOLUTIONS_DATA.find((s) => s.route === r))
    .filter((s): s is (typeof SOLUTIONS_DATA)[number] => Boolean(s));

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
        <NavLink href="/portfolio" onNavigate={onNavigate} className="hover:text-[#087A9D]">
          نمونه‌کارها
        </NavLink>
        <span>/</span>
        <span className="text-[#062B4D] font-bold">{project.clientName}</span>
      </nav>

      {/* Project Header */}
      <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30 space-y-6">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#3CDDDD] font-bold">
              مطالعه موردی اختصاصی بینش
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90">
              صنعت: {project.industry}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#08A9C5]/25 border border-[#3CDDDD]/30 text-white font-medium">
              {project.serviceType}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
            {project.title}
          </h1>

          <p className="text-sm sm:text-base text-white/85 max-w-3xl leading-relaxed">
            {project.solution || project.intro[0]}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenConsultation(project.title)}
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
              <span>تجربه زنده دموهای تعاملی</span>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Main Content: 3-Stage Case Study + Full Screenshot */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-5">
          {/* 1. Challenge */}
          <div className="p-5 rounded-2xl bg-amber-50/75 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-[#062B4D]">
                ۱. چالش پیش از اجرای پروژه
              </h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-[#435466] leading-relaxed">
              {project.intro.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* 2. Solution */}
          {project.solution && (
            <div className="p-5 rounded-2xl bg-white border border-[#E3EBF0] space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#087A9D] shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-[#062B4D]">
                  ۲. راهکار مهندسی و طراحی بینش
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                {project.solution}
              </p>
            </div>
          )}

          {/* 3. Result */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                ۳. دستاورد و نتیجه ملموس
              </h2>
            </div>
            <p className="text-sm font-medium text-[#062B4D] leading-relaxed font-mono-num">
              {project.conclusion}
            </p>
          </div>
        </div>

        {/* Left Column: Dashboard Visual */}
        <div className="lg:col-span-6 space-y-3">
          <div
            onClick={() => setLightboxOpen(true)}
            className="group relative rounded-2xl overflow-hidden border border-[#E3EBF0] bg-[#062B4D] cursor-pointer shadow-md"
          >
            <img
              src={project.image}
              alt={`نمای داشبورد مدیریتی پروژه ${project.title} — ${project.serviceType}`}
              loading="eager"
              decoding="async"
              className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#062B4D]/85 backdrop-blur-xs text-white text-xs inline-flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#3CDDDD]" />
              <span>بزرگ‌نمایی تصویر داشبورد</span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] text-center">
            تصویر واقعی از محیط خروجی پروژه {project.clientName} (ارقام و جزئیات محرمانه جهت حفظ حریم خصوصی مشتری کنترل شده‌اند).
          </p>
        </div>
      </section>

      {/* Implemented Features */}
      <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-5">
        <h2 className="text-lg sm:text-2xl font-bold text-[#062B4D] border-r-4 border-[#08A9C5] pr-3">
          {project.featuresTitle}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {project.features.map((feat, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs sm:text-sm text-[#263B50]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Related Solutions */}
      {relatedSolutions.length > 0 && (
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#062B4D]">
            راهکارهای تخصصی مرتبط با این پروژه
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedSolutions.map((sol) => (
              <NavLink
                key={sol.route}
                href={sol.route}
                onNavigate={onNavigate}
                className="p-4 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] hover:border-[#08A9C5] flex flex-col justify-between gap-3 transition-colors"
              >
                <div>
                  <span className="text-[11px] font-bold text-[#087A9D] block mb-1">
                    {sol.badge}
                  </span>
                  <h3 className="text-sm font-bold text-[#062B4D]">{sol.shortTitle}</h3>
                </div>
                <span className="text-xs font-bold text-[#087A9D] inline-flex items-center gap-1">
                  <span>مشاهده راهکار</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </NavLink>
            ))}
          </div>
        </section>
      )}

      {/* Other Case Studies */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg sm:text-2xl font-bold text-[#062B4D]">
            سایر نمونه‌کارهای بینش
          </h2>
          <NavLink
            href="/portfolio"
            onNavigate={onNavigate}
            className="text-xs font-bold text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1"
          >
            <span>همه نمونه‌کارها</span>
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {otherProjects.map((item) => (
            <NavLink
              key={item.id}
              href={getPortfolioRoute(item)}
              onNavigate={onNavigate}
              className="group rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] overflow-hidden flex flex-col justify-between transition-all"
            >
              <div>
                <div className="aspect-16/9 bg-[#062B4D] overflow-hidden border-b border-[#E3EBF0]">
                  <img
                    src={item.image}
                    alt={`نمای داشبورد پروژه ${item.title}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-bold text-[#087A9D]">{item.industry}</span>
                  <h3 className="text-base font-bold text-[#062B4D] group-hover:text-[#087A9D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#435466] line-clamp-2">{item.conclusion}</p>
                </div>
              </div>
              <div className="px-5 py-3 bg-[#F7FAFC] border-t border-[#E3EBF0] flex items-center justify-between text-xs font-bold text-[#087A9D]">
                <span>مشاهده مطالعه موردی</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-[#062B4D] text-white p-7 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold">
            داشبورد مشابهی برای کسب‌وکار خود نیاز دارید؟
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            در یک جلسه ۳۰ دقیقه‌ای رایگان، داده‌ها و نیازهای مدیریتی شما را بررسی می‌کنیم و مسیر دقیق پیاده‌سازی را مشخص می‌سازیم.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenConsultation(project.title)}
          className="px-6 py-3.5 rounded-xl bg-[#08A9C5] hover:bg-[#3CDDDD] text-[#062B4D] font-bold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer"
        >
          {UNIFIED_CTA_LABEL}
        </button>
      </section>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#062B4D]/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full bg-white rounded-2xl overflow-hidden border border-[#E3EBF0] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-[#F7FAFC] border-b border-[#E3EBF0] flex items-center justify-between gap-4">
              <h3 className="text-sm sm:text-base font-bold text-[#062B4D]">{project.title}</h3>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#062B4D] hover:bg-[#E3EBF0]/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 bg-[#062B4D] max-h-[82vh] overflow-auto flex items-center justify-center">
              <img
                src={project.image}
                alt={`نمای تمام‌صفحه پروژه ${project.title}`}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface NotFoundPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="rounded-3xl bg-white border border-[#E3EBF0] p-8 sm:p-12 text-center space-y-6 shadow-xs">
        <Mascot name="empty" priority className="mx-auto w-full max-w-[180px]" />
        <span className="inline-block font-mono-num text-sm font-bold px-3.5 py-1 rounded-full bg-[#EAF7F9] text-[#087A9D]">
          خطای 404
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D]">
          صفحه موردنظر یافت نشد
        </h1>
        <p className="text-sm sm:text-base text-[#435466] max-w-xl mx-auto leading-relaxed">
          نشانی واردشده وجود ندارد یا منتقل شده است. می‌توانید از طریق لینک‌های زیر به بخش‌های اصلی وب‌سایت بینش بازگردید.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <NavLink
            href="/"
            onNavigate={onNavigate}
            className="px-6 py-3 rounded-xl bg-[#087A9D] hover:bg-[#062B4D] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی</span>
          </NavLink>
          <NavLink
            href="/services"
            onNavigate={onNavigate}
            className="px-5 py-3 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] text-[#062B4D] text-xs sm:text-sm font-bold transition-colors"
          >
            خدمات بینش
          </NavLink>
          <NavLink
            href="/solutions"
            onNavigate={onNavigate}
            className="px-5 py-3 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] text-[#062B4D] text-xs sm:text-sm font-bold transition-colors"
          >
            راهکارهای هوش تجاری
          </NavLink>
          <NavLink
            href="/portfolio"
            onNavigate={onNavigate}
            className="px-5 py-3 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] text-[#062B4D] text-xs sm:text-sm font-bold transition-colors"
          >
            نمونه‌کارها
          </NavLink>
          <NavLink
            href="/contact"
            onNavigate={onNavigate}
            className="px-5 py-3 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF7F9] border border-[#E3EBF0] text-[#062B4D] text-xs sm:text-sm font-bold transition-colors"
          >
            تماس با بینش
          </NavLink>
        </div>
      </div>
    </div>
  );
};
