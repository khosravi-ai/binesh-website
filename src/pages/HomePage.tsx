import React, { useState } from 'react';
import {
  LayoutDashboard,
  LineChart,
  Compass,
  ArrowLeft,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Layers
} from 'lucide-react';
import {
  RoutePath,
  SERVICE_CATEGORIES,
  COLLABORATION_STEPS,
  PORTFOLIO_PLACEHOLDERS,
  PortfolioPlaceholderItem,
  InsightPlaceholderItem,
  UNIFIED_CTA_LABEL,
  isPublicInsightPost
} from '../data/bineshData';
import { SOLUTIONS_DATA, getPortfolioRoute } from '../data/solutionsData';
import { Mascot } from '../components/BrandComponents';
import { NavLink } from '../components/NavLink';

interface HomePageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
  portfolioItems?: PortfolioPlaceholderItem[];
  insightPosts?: (InsightPlaceholderItem & { content?: string })[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenConsultation,
  portfolioItems = PORTFOLIO_PLACEHOLDERS,
  insightPosts = []
}) => {
  const publishedInsights = insightPosts.filter(isPublicInsightPost);
  const [activeServiceCard, setActiveServiceCard] = useState<string>('dashboards');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Interactive Data Value Estimator Sliders
  const [monthlyTransactions, setMonthlyTransactions] = useState<number>(3500);
  const [weeklyExcelHours, setWeeklyExcelHours] = useState<number>(8);

  const baseAnnualHours = weeklyExcelHours * 52;
  const complexityOverheadHours = Math.round((monthlyTransactions / 1000) * 18);
  const totalWastedHoursPerYear = baseAnnualHours + complexityOverheadHours;
  const wastedWorkDaysPerYear = Math.round(totalWastedHoursPerYear / 8);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'layout-dashboard':
        return <LayoutDashboard className="w-6 h-6 text-[#08A9C5]" />;
      case 'line-chart':
        return <LineChart className="w-6 h-6 text-[#08A9C5]" />;
      case 'compass':
        return <Compass className="w-6 h-6 text-[#08A9C5]" />;
      default:
        return <LayoutDashboard className="w-6 h-6 text-[#08A9C5]" />;
    }
  };

  return (
    <div className="space-y-20 md:space-y-24 pb-16">
      {/* =====================================================================
          SECTION 01 — DARK ENGINEERED HERO SECTION + DATA VALUE CALCULATOR
      ===================================================================== */}
      <section className="relative pt-10 md:pt-16 pb-16 border-b border-[#087A9D]/30 bg-[#062B4D] bg-binesh-blueprint text-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#08A9C5]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Right Column: Value Proposition & Primary Actions */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>اتصال مستقیم و به‌روزرسانی لحظه‌ای داده‌های کسب‌وکار</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-[1.38] tracking-tight">
                تبدیل داده‌های پراکنده شرکت شما به داشبوردهای مدیریتیِ سودآور
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
                بدون به‌هم ریختن سیستم‌های فعلی، فایل‌های اکسل، نرم‌افزار حسابداری و دیتابیس‌های جزیره‌ای خود را به یک تصویر واحد، لحظه‌ای و بدون خطا تبدیل کنید.
              </p>

              {/* Key Bullet Points */}
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-white/90">
                <li className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3CDDDD] shrink-0" />
                  <span>حذف گزارش‌گیری دستی اکسل</span>
                </li>
                <li className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3CDDDD] shrink-0" />
                  <span>کشف مغایرت‌های مالی و انبار</span>
                </li>
                <li className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3CDDDD] shrink-0" />
                  <span>تصمیم‌گیری بر اساس اعداد واقعی</span>
                </li>
              </ul>

              {/* Primary Action Controls */}
              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5">
                <button
                  type="button"
                  onClick={() => onOpenConsultation()}
                  className="px-6 py-3.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-sm font-bold hover:bg-[#3CDDDD] active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer shadow-lg w-full sm:w-auto"
                >
                  <span>{UNIFIED_CTA_LABEL}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <NavLink
                  href="/demos"
                  onNavigate={onNavigate}
                  className="px-6 py-3.5 rounded-xl bg-white/10 text-white border border-white/20 hover:border-[#3CDDDD] hover:bg-white/15 text-sm font-medium transition-all inline-flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 w-full sm:w-auto"
                >
                  <BarChart3 className="w-4 h-4 text-[#3CDDDD]" />
                  <span>تجربه دموهای تعاملی زنده</span>
                </NavLink>

                <NavLink
                  href="/services"
                  onNavigate={onNavigate}
                  className="px-4 py-3 sm:py-3.5 rounded-xl text-[#3CDDDD] hover:text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 text-center"
                >
                  مشاهده خدمات ←
                </NavLink>
              </div>
            </div>

            {/* Left Column: Glassmorphism Interactive Data Value Calculator + Mascot */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#3CDDDD] shrink-0" />
                    <h2 className="text-xs sm:text-sm font-bold text-white">
                      ماشین‌حساب تخمین زمان تلف‌شده گزارش‌گیری
                    </h2>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#08A9C5]/20 text-[#3CDDDD] font-mono-num shrink-0">
                    محاسبه آنی
                  </span>
                </div>

                {/* Slider 1 */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <label htmlFor="slider-tx" className="text-white/85">
                      ۱. تعداد فاکتور یا تراکنش ماهانه شرکت:
                    </label>
                    <span className="font-mono-num font-bold text-[#3CDDDD] text-sm">
                      {monthlyTransactions.toLocaleString('fa-IR')} رکورد
                    </span>
                  </div>
                  <input
                    id="slider-tx"
                    type="range"
                    min={500}
                    max={25000}
                    step={500}
                    value={monthlyTransactions}
                    onChange={(e) => setMonthlyTransactions(Number(e.target.value))}
                    className="w-full accent-[#3CDDDD] cursor-pointer h-2 rounded-lg bg-white/15"
                  />
                  <div className="flex justify-between text-[10px] text-white/50 font-mono-num">
                    <span>۵۰۰</span>
                    <span>۱۲,۵۰۰</span>
                    <span>۲۵,۰۰۰+</span>
                  </div>
                </div>

                {/* Slider 2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="slider-hours" className="text-white/85">
                      ۲. زمان صرف‌شده برای جمع‌آوری اکسل در هفته:
                    </label>
                    <span className="font-mono-num font-bold text-[#3CDDDD] text-sm">
                      {weeklyExcelHours.toLocaleString('fa-IR')} ساعت در هفته
                    </span>
                  </div>
                  <input
                    id="slider-hours"
                    type="range"
                    min={2}
                    max={40}
                    step={1}
                    value={weeklyExcelHours}
                    onChange={(e) => setWeeklyExcelHours(Number(e.target.value))}
                    className="w-full accent-[#3CDDDD] cursor-pointer h-2 rounded-lg bg-white/15"
                  />
                  <div className="flex justify-between text-[10px] text-white/50 font-mono-num">
                    <span>۲ ساعت</span>
                    <span>۲۰ ساعت</span>
                    <span>۴۰ ساعت</span>
                  </div>
                </div>

                {/* Output Result Box */}
                <div className="p-4 rounded-xl bg-[#062B4D]/80 border border-[#3CDDDD]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-white/75 block">
                      زمان تلف‌شده تیم و مدیران در سال:
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono-num text-2xl sm:text-3xl font-bold text-[#3CDDDD]">
                        {totalWastedHoursPerYear.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-xs text-white/90 font-medium">
                        ساعت در سال (معادل{' '}
                        <strong className="font-mono-num text-white">
                          {wastedWorkDaysPerYear.toLocaleString('fa-IR')}
                        </strong>{' '}
                        روز کاری کامل)
                      </span>
                    </div>
                  </div>
                  <Mascot name="welcome" priority className="w-16 sm:w-20 shrink-0 mx-auto sm:mx-0" />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenConsultation(
                      `داشبوردهای مدیریتی (تراکنش ماهانه: ${monthlyTransactions} | زمان اکسل هفتگی: ${weeklyExcelHours} ساعت)`
                    )
                  }
                  className="w-full py-3 rounded-xl bg-[#08A9C5] hover:bg-[#3CDDDD] text-[#062B4D] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{UNIFIED_CTA_LABEL}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 — سه راهکار مهندسی بینش (Semantic <a href> Service Cards)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              سه راهکار مهندسی بینش برای رشد سودآوری شما
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#435466] max-w-2xl leading-relaxed">
              بر اساس چالش امروز شرکت خود، مسیر مناسب را انتخاب کنید:
            </p>
          </div>
          <NavLink
            href="/services"
            onNavigate={onNavigate}
            className="text-xs font-bold text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5 shrink-0"
          >
            <span>مرور کامل خدمات بینش</span>
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_CATEGORIES.map((service) => {
            const isSelected = activeServiceCard === service.id;
            return (
              <NavLink
                key={service.id}
                href={service.route}
                onNavigate={onNavigate}
                onMouseEnter={() => setActiveServiceCard(service.id)}
                className={`group rounded-2xl bg-white p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#08A9C5] shadow-md -translate-y-0.5'
                    : 'border-[#E3EBF0] hover:border-[#08A9C5]/60 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF7F9] flex items-center justify-center group-hover:bg-[#062B4D] transition-colors">
                      {getServiceIcon(service.iconName)}
                    </div>
                    <span className="font-mono-num text-xs font-bold text-[#64748B]">
                      {service.order}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#062B4D] group-hover:text-[#087A9D] transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm text-[#435466] leading-relaxed">
                    {service.homeDescription}
                  </p>

                  <div className="mt-5 p-3.5 rounded-xl bg-[#EAF7F9]/60 border border-[#E3EBF0] text-xs text-[#263B50] leading-relaxed">
                    <strong className="text-[#062B4D] block mb-1">مناسب برای:</strong>
                    {service.homeIdealFor}
                  </div>
                </div>

                <div className="mt-7 pt-4 border-t border-[#E3EBF0] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#087A9D] group-hover:text-[#062B4D] transition-colors">
                    {service.homeCta}
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-[#F7FAFC] group-hover:bg-[#087A9D] group-hover:text-white text-[#062B4D] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 — دموهای تعاملی با استایل شیشه‌ای
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>اتصال مستقیم و به‌روزرسانی لحظه‌ای داده‌های کسب‌وکار</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                قبل از تصمیم‌گیری، خروجی کار ما را زنده لمس کنید
              </h2>
              <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
                در صفحه دموها، می‌توانید هر دو محیط وب‌اپلیکیشن اختصاصی و داشبورد Power BI را مستقیماً داخل مرورگر خود فیلتر و بررسی کنید.
              </p>
            </div>
            <NavLink
              href="/demos"
              onNavigate={onNavigate}
              className="px-5 py-2.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs font-bold hover:bg-[#3CDDDD] inline-flex items-center gap-1.5 self-start md:self-auto shrink-0"
            >
              <span>ورود به اتاق دموهای زنده</span>
              <ArrowLeft className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* Demo 01 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
                  <span className="font-mono-num text-xs text-[#3CDDDD] font-bold dir-ltr">
                    DEMO 01 | WEB APPLICATION
                  </span>
                  <span className="text-xs text-white/60">تعاملی داخل صفحه</span>
                </div>

                <h3 className="text-xl font-bold text-white">
                  داشبورد مدیریتی یک زنجیره فروشگاهی (۳۱ استان)
                </h3>
                <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-white/80">
                  <li>• پایش لحظه‌ای فروش زنجیره و نقشه تعاملی استان‌ها</li>
                  <li>• بخش‌بندی مشتریان، وفاداری و تحلیل سبد کالا</li>
                  <li>• مقایسه عملکرد شعب و کشف انحراف از هدف</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono-num text-xs text-[#3CDDDD]">۱۶۴ شعبه · ۳۱ استان</span>
                <NavLink
                  href="/demos"
                  onNavigate={onNavigate}
                  className="px-5 py-2.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-xs font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 w-full sm:w-auto"
                >
                  <span>مشاهده زنده دموی وب‌اپلیکیشن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>

            {/* Demo 02 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
                  <span className="font-mono-num text-xs text-[#3CDDDD] font-bold dir-ltr">
                    DEMO 02 | POWER BI
                  </span>
                  <span className="text-xs text-white/60">تعاملی داخل صفحه</span>
                </div>

                <h3 className="text-xl font-bold text-white">
                  داشبورد مالی، بهای تمام‌شده و کنترل بودجه (Power BI)
                </h3>
                <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-white/80">
                  <li>• صورت سود و زیان تحلیلی و حاشیه سود ناخالص</li>
                  <li>• تحلیل انحراف بودجه و بهای تمام‌شده خطوط تولید</li>
                  <li>• پایش جریان نقدینگی، مطالبات و نسبت‌های مالی</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono-num text-xs text-[#3CDDDD]">۴ تب تخصصی مالی</span>
                <NavLink
                  href="/demos"
                  onNavigate={onNavigate}
                  className="px-5 py-2.5 rounded-xl bg-white text-[#062B4D] text-xs font-bold hover:bg-[#3CDDDD] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 w-full sm:w-auto"
                >
                  <span>مشاهده زنده دموی Power BI</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 04 — راهکارهای تخصصی نرم‌افزارهای ایرانی و صنایع (6 Solutions)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#087A9D] inline-flex items-center gap-1.5 mb-1">
              <Layers className="w-4 h-4" />
              <span>راهکارهای یکپارچه‌سازی و تخصصی صنایع</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              اتصال مستقیم به سپیدار، هلو و راهکارهای تخصصی پخش، بازرگانی و مالی
            </h2>
          </div>
          <NavLink
            href="/solutions"
            onNavigate={onNavigate}
            className="text-xs font-bold text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            <span>مشاهده همه راهکارها</span>
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOLUTIONS_DATA.map((sol) => (
            <NavLink
              key={sol.route}
              href={sol.route}
              onNavigate={onNavigate}
              className="group rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] hover:shadow-xs p-5 flex flex-col justify-between gap-4 transition-all"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EAF7F9] text-[#087A9D] text-[11px] font-bold">
                  {sol.badge}
                </span>
                <h3 className="text-base font-bold text-[#062B4D] group-hover:text-[#087A9D] transition-colors">
                  {sol.shortTitle}
                </h3>
                <p className="text-xs text-[#435466] leading-relaxed line-clamp-2">{sol.lead}</p>
              </div>
              <div className="pt-3 border-t border-[#E3EBF0] flex items-center justify-between text-xs font-bold text-[#087A9D]">
                <span>بررسی جزئیات راهکار</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 05 — مسیر ۴ گام همکاری با بینش
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-[#087A9D] block mb-1">
                فرآیند شفاف و بدون ریسک
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
                مسیر ۴ گام همکاری با بینش
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenConsultation()}
              className="px-4 py-2 rounded-xl bg-[#EAF7F9] text-[#062B4D] hover:bg-[#08A9C5] hover:text-white text-xs font-bold transition-colors cursor-pointer self-start md:self-auto"
            >
              {UNIFIED_CTA_LABEL} ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {COLLABORATION_STEPS.map((item, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#EAF7F9]/80 border-[#08A9C5] shadow-xs'
                      : 'bg-[#F7FAFC] border-[#E3EBF0] hover:border-[#08A9C5]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono-num text-2xl font-bold text-[#08A9C5]">
                        {item.step}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#E3EBF0] text-[11px] font-medium text-[#062B4D]">
                        {item.subtitle}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#062B4D] mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 06 — نمونه‌کارها (Semantic <a href="/portfolio/..."> Cards)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#087A9D] block mb-1">
              نتایج واقعی در شرکت‌های ایرانی
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              نمونه‌کارها و دستاوردهای مهندسی داده
            </h2>
          </div>
          <NavLink
            href="/portfolio"
            onNavigate={onNavigate}
            className="text-xs font-bold text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            <span>مشاهده جزئیات همه نمونه‌کارها</span>
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map((item) => (
            <NavLink
              key={item.id}
              href={getPortfolioRoute(item)}
              onNavigate={onNavigate}
              className="group rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] transition-all overflow-hidden flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="relative aspect-16/9 bg-[#062B4D] overflow-hidden border-b border-[#E3EBF0]">
                  <img
                    src={item.image}
                    alt={`تصویر داشبورد مدیریتی پروژه ${item.title} — ${item.serviceType}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
                    <span className="font-bold text-[#087A9D]">{item.industry}</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F7FAFC] border border-[#E3EBF0] text-[#263B50]">
                      {item.serviceType}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#062B4D] group-hover:text-[#087A9D] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* 3-Stage Structured Summary */}
                  <div className="space-y-2.5 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#062B4D]">چالش قبل از پروژه: </strong>
                        <span className="text-[#435466]">{item.intro[0]}</span>
                      </div>
                    </div>

                    {item.solution && (
                      <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] flex items-start gap-2">
                        <Wrench className="w-4 h-4 text-[#087A9D] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#062B4D]">راهکار مهندسی بینش: </strong>
                          <span className="text-[#435466]">{item.solution}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#062B4D]">نتیجه ملموس: </strong>
                        <span className="text-[#263B50] font-medium font-mono-num">
                          {item.conclusion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#F7FAFC] border-t border-[#E3EBF0] flex items-center justify-between text-xs font-bold text-[#087A9D]">
                <span>بررسی کامل مطالعه موردی و تصاویر داشبورد</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 07 — بینش‌نامه (Only rendered when published non-draft articles exist)
      ===================================================================== */}
      {publishedInsights.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
                بینش‌نامه؛ راهنمای تصمیم‌گیری داده‌محور مدیران
              </h2>
              <p className="text-sm text-[#435466] max-w-2xl leading-relaxed">
                یادداشت‌های کاربردی و کوتاه درباره طراحی داشبورد، تعریف KPI و گذار از اکسل به سیستم‌های خودکار هوش تجاری.
              </p>
              <div className="pt-1">
                <NavLink
                  href="/insights"
                  onNavigate={onNavigate}
                  className="text-xs font-bold text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5"
                >
                  <span>مشاهده همه مطالب بینش‌نامه</span>
                  <ArrowLeft className="w-4 h-4" />
                </NavLink>
              </div>
            </div>
            <div className="lg:col-span-4">
              <Mascot name="reader" className="mx-auto w-full max-w-[240px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {publishedInsights.map((post) => (
              <NavLink
                key={post.id}
                href="/insights"
                onNavigate={onNavigate}
                className="rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] p-6 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#64748B] pb-3 mb-4 border-b border-[#E3EBF0]">
                    <span className="font-bold text-[#087A9D]">{post.category}</span>
                    <span>{post.statusNote}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#062B4D] leading-snug">{post.title}</h3>
                  <p className="mt-2.5 text-xs text-[#435466] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#E3EBF0] flex items-center justify-between text-xs text-[#087A9D] font-medium">
                  <span>مطالعه در بینش‌نامه</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
              </NavLink>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 08 — دعوت به همکاری پایانی
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-7 sm:p-12 border border-[#087A9D]/40 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{UNIFIED_CTA_LABEL} — بدون نیاز به ارسال داده محرمانه</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug">
                آماده‌اید گزارش‌های دستی را به داشبوردهای دقیق و لحظه‌ای تبدیل کنید؟
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
                در یک گفت‌وگوی ۳۰ دقیقه‌ای رایگان، وضعیت فعلی گزارش‌های فروش، مالی و انبار شما را بررسی می‌کنیم و بهترین مسیر پیاده‌سازی را مشخص می‌سازیم.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => onOpenConsultation()}
                  className="px-6 py-3.5 rounded-xl bg-[#08A9C5] text-[#062B4D] text-sm font-bold hover:bg-[#3CDDDD] transition-colors whitespace-nowrap shrink-0 cursor-pointer text-center w-full sm:w-auto"
                >
                  {UNIFIED_CTA_LABEL}
                </button>
                <NavLink
                  href="/contact"
                  onNavigate={onNavigate}
                  className="px-6 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-medium transition-colors whitespace-nowrap shrink-0 text-center w-full sm:w-auto"
                >
                  تماس مستقیم با بینش
                </NavLink>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Mascot
                name="companion"
                className="mx-auto w-full max-w-[220px] sm:max-w-[250px]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
