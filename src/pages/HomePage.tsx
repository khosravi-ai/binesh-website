import React, { useState } from 'react';
import {
  LayoutDashboard,
  LineChart,
  Compass,
  ArrowLeft,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import {
  RoutePath,
  SERVICE_CATEGORIES,
  COLLABORATION_STEPS,
  PORTFOLIO_PLACEHOLDERS,
  INSIGHTS_PLACEHOLDERS,
  PortfolioPlaceholderItem,
  InsightPlaceholderItem
} from '../data/bineshData';
import { Mascot, VideoPlaceholder } from '../components/BrandComponents';

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
  insightPosts = INSIGHTS_PLACEHOLDERS
}) => {
  const [activeServiceCard, setActiveServiceCard] = useState<string>('dashboards');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [heroMetricTab, setHeroMetricTab] = useState<'sales' | 'finance' | 'ops'>('sales');

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
    <div className="space-y-20 md:space-y-28 pb-16">
      {/* =====================================================================
          SECTION 01 — HERO SECTION (H01)
      ===================================================================== */}
      <section className="relative pt-8 md:pt-14 pb-12 border-b border-[#E3EBF0] bg-gradient-to-b from-white to-[#F7FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Right Column: Brand Proposition & Primary Actions */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#087A9D]">
                <span>هوش تجاری</span>
                <span>|</span>
                <span>تحلیل داده</span>
                <span>|</span>
                <span>داشبوردهای مدیریتی</span>
                <span>|</span>
                <span>مشاوره کسب‌وکار</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#062B4D] leading-[1.35] tracking-tight">
                کسب‌وکارتان را بهتر بشناسید؛ آگاهانه‌تر تصمیم بگیرید.
              </h1>

              <p className="text-base sm:text-lg text-[#435466] leading-relaxed max-w-2xl">
                بینش به شما کمک می‌کند اطلاعات پراکنده کسب‌وکار را به تصویری روشن‌تر از عملکرد تبدیل کنید؛ با داشبوردهای مدیریتی، تحلیل مستمر و همراهی مشاوره‌ای.
              </p>

              <p className="text-sm font-bold text-[#087A9D]">
                همراه کسب‌وکار شما، با نگاهی تحلیلی.
              </p>

              {/* Primary Action Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/services')}
                  className="px-6 py-3.5 rounded-xl bg-[#087A9D] text-white text-sm font-medium hover:bg-[#062B4D] active:scale-[0.99] transition-all inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  <span>مشاهده خدمات</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/demos')}
                  className="px-6 py-3.5 rounded-xl bg-white text-[#062B4D] border border-[#E3EBF0] hover:border-[#08A9C5] hover:bg-[#EAF7F9]/50 text-sm font-medium transition-all inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-[#08A9C5]" />
                  <span>تجربه دموهای تعاملی</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenConsultation()}
                  className="px-4 py-3.5 rounded-xl text-[#087A9D] hover:text-[#062B4D] text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  درخواست جلسه مشاوره
                </button>
              </div>

              {/* Supplementary text */}
              <div className="pt-4 border-t border-[#E3EBF0]">
                <p className="text-xs sm:text-sm text-[#64748B]">
                  سه مسیر برای شناخت بهتر، تحلیل دقیق‌تر و بهبود عملکرد کسب‌وکار.
                </p>
              </div>
            </div>

            {/* Left Column: Welcome Mascot (#1) + Analytical Visual Element */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="relative rounded-3xl bg-gradient-to-b from-[#EAF7F9] to-white border border-[#E3EBF0] px-6 pt-6 pb-2">
                <Mascot
                  name="welcome"
                  priority
                  className="mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px]"
                />
              </div>

              {/* Analytical Mini-Dashboard Widget (Decorative UI Element) */}
              <div className="rounded-2xl bg-white border border-[#E3EBF0] p-4 shadow-2xs">
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E3EBF0]">
                  <div className="text-xs font-bold text-[#062B4D]">
                    پیش‌نمایش رابط کاربری داشبورد (داده‌های فرضی و نمایشی)
                  </div>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F7FAFC] border border-[#E3EBF0]">
                    <button
                      type="button"
                      onClick={() => setHeroMetricTab('sales')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        heroMetricTab === 'sales'
                          ? 'bg-[#062B4D] text-white'
                          : 'text-[#64748B] hover:text-[#062B4D]'
                      }`}
                    >
                      فروش
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroMetricTab('finance')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        heroMetricTab === 'finance'
                          ? 'bg-[#062B4D] text-white'
                          : 'text-[#64748B] hover:text-[#062B4D]'
                      }`}
                    >
                      مالی
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroMetricTab('ops')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        heroMetricTab === 'ops'
                          ? 'bg-[#062B4D] text-white'
                          : 'text-[#64748B] hover:text-[#062B4D]'
                      }`}
                    >
                      عملیات
                    </button>
                  </div>
                </div>

                {/* Mini Decorative Bar Chart */}
                <div className="grid grid-cols-3 gap-3 items-end pt-1">
                  <div className="col-span-2 space-y-1.5">
                    <span className="text-[11px] text-[#64748B] block">
                      {heroMetricTab === 'sales' && 'شاخص نمونه: روند تحقق هدف فروش'}
                      {heroMetricTab === 'finance' && 'شاخص نمونه: بررسی حاشیه سود'}
                      {heroMetricTab === 'ops' && 'شاخص نمونه: پایش عملکرد عملیاتی'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#062B4D]">
                        داده‌های فرضی و نمایشی
                      </span>
                      <span className="text-xs text-[#087A9D] font-medium">
                        · نمونه رابط کاربری
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-end gap-1.5 h-12">
                    <span className="w-2.5 h-6 rounded-t-xs bg-[#E3EBF0]" />
                    <span className="w-2.5 h-8 rounded-t-xs bg-[#08A9C5]/50" />
                    <span className="w-2.5 h-7 rounded-t-xs bg-[#087A9D]/70" />
                    <span className="w-2.5 h-10 rounded-t-xs bg-[#08A9C5]" />
                    <span className="w-2.5 h-12 rounded-t-xs bg-[#062B4D]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 — انتخاب مسیر همکاری (H02)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              کسب‌وکار شما به چه نوع همراهی نیاز دارد؟
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#435466] max-w-2xl leading-relaxed">
              هر کسب‌وکار با مسئله و نیاز متفاوتی روبه‌روست. مسیر همکاری را بر اساس چیزی انتخاب کنید که امروز برای مدیریت بهتر به آن نیاز دارید.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SERVICE_CATEGORIES.map((service) => {
            const isSelected = activeServiceCard === service.id;
            return (
              <div
                key={service.id}
                onMouseEnter={() => setActiveServiceCard(service.id)}
                onClick={() => onNavigate(service.route)}
                className={`group rounded-2xl bg-white p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
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
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 — راهنمای انتخاب مسیر (H03 + VIDEO 01 + MASCOT #2)
      ===================================================================== */}
      <section className="bg-[#EAF7F9]/60 border-y border-[#E3EBF0] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-medium text-[#087A9D] mb-2">
              راهنمای انتخاب مسیر همکاری
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              برای بهبود عملکرد کسب‌وکار از کجا شروع کنیم؟
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#435466] leading-relaxed">
              شاید به یک داشبورد مدیریتی نیاز داشته باشید، شاید به تحلیل منظم اطلاعات یا همراهی در تعیین و پیگیری اهداف. در این راهنما، تفاوت این مسیرها را مرور می‌کنیم تا نقطه شروع مناسب‌تری پیدا کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <VideoPlaceholder
                videoLabel="راهنمای انتخاب مسیر همکاری"
                buttonLabel="تماشای راهنما"
                title="برای تحلیل و بهبود کسب‌وکار از کجا شروع کنیم؟"
                subtitle="در این ویدئو سه مسیر اصلی همکاری با بینش را مرور می‌کنیم تا بتوانید نیاز فعلی کسب‌وکارتان را روشن‌تر مشخص کنید."
              />
            </div>

            {/* Right Column: Listening Mascot (#2) + Short reassuring note */}
            <div className="lg:col-span-4 space-y-4">
              <Mascot
                name="listening"
                className="mx-auto w-full max-w-[260px] sm:max-w-[300px]"
              />
              <div className="rounded-2xl bg-white border border-[#E3EBF0] p-4 text-center">
                <p className="text-xs sm:text-sm text-[#263B50] leading-relaxed font-medium">
                  لازم نیست از ابتدا همه پاسخ‌ها را بدانید. کافی است مسئله‌ای را که می‌خواهید بهتر بشناسید مشخص کنید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 04 — دموهای تعاملی (H04)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              قبل از انتخاب، تجربه کنید.
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#435466] max-w-2xl leading-relaxed">
              در دو محیط نمایشی با سناریوهای متفاوت، نمونه‌ای از تجربه کار با داشبوردهای مدیریتی را بررسی کنید. این دموها از داده‌های ساختگی استفاده می‌کنند و برای آشنایی با ساختار و قابلیت‌ها طراحی شده‌اند.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/demos')}
            className="text-xs font-medium text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5 cursor-pointer self-start md:self-auto shrink-0"
          >
            <span>مشاهده جزئیات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo 01 — Web Application */}
          <div className="rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] transition-all p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E3EBF0]">
                <span className="font-mono-num text-xs text-[#087A9D] font-bold dir-ltr">
                  DEMO 01 | WEB APPLICATION
                </span>
                <span className="text-xs text-[#64748B]">داده‌های فرضی و نمایشی</span>
              </div>

              <h3 className="text-xl font-bold text-[#062B4D]">
                داشبورد مدیریتی یک زنجیره فروشگاهی
              </h3>
              <p className="mt-2.5 text-sm text-[#435466] leading-relaxed">
                در این سناریوی نمایشی، نمای کلی زنجیره، نقشه فروش استان‌ها، مشتریان و وفاداری، محصولات و عملکرد شعب را در قالب یک وب‌اپلیکیشن مدیریتی بررسی کنید.
              </p>

              {/* Preview Box with Neutral Labels */}
              <div className="mt-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>پیش‌نمایش بخش‌های داشبورد فروشگاهی</span>
                  <span>داده‌های فرضی و نمایشی</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EBF0]">
                    <span className="text-[10px] text-[#64748B] block">فروش زنجیره</span>
                    <span className="font-mono-num text-xs font-bold text-[#062B4D]">—</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EBF0]">
                    <span className="text-[10px] text-[#64748B] block">نقشه استان‌ها</span>
                    <span className="font-mono-num text-xs font-bold text-[#08A9C5]">—</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EBF0]">
                    <span className="text-[10px] text-[#64748B] block">وفاداری مشتریان</span>
                    <span className="font-mono-num text-xs font-bold text-[#062B4D]">—</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E3EBF0] flex items-center justify-between gap-4">
              <span className="text-xs text-[#64748B]">داده‌های فرضی و نمایشی</span>
              <a
                href="/demo-webapp.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>تجربه دموی وب‌اپلیکیشن</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Demo 02 — Power BI */}
          <div className="rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] transition-all p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E3EBF0]">
                <span className="font-mono-num text-xs text-[#087A9D] font-bold dir-ltr">
                  DEMO 02 | POWER BI
                </span>
                <span className="text-xs text-[#64748B]">داده‌های فرضی و نمایشی</span>
              </div>

              <h3 className="text-xl font-bold text-[#062B4D]">
                داشبورد مالی و بودجه یک سازمان
              </h3>
              <p className="mt-2.5 text-sm text-[#435466] leading-relaxed">
                در این سناریوی نمایشی، عملکرد مالی، بهای تمام‌شده، کنترل بودجه و جریان نقدینگی را در یک گزارش تعاملی به سبک Power BI بررسی کنید.
              </p>

              {/* Preview Box with Neutral Labels */}
              <div className="mt-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>پیش‌نمایش بخش‌های گزارش مالی</span>
                  <span>داده‌های فرضی و نمایشی</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EBF0]">
                    <span className="text-[10px] text-[#64748B] block">درآمد و بودجه</span>
                    <span className="font-mono-num text-xs font-bold text-[#062B4D]">—</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EBF0]">
                    <span className="text-[10px] text-[#64748B] block">بهای تمام‌شده</span>
                    <span className="font-mono-num text-xs font-bold text-[#08A9C5]">—</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E3EBF0]">
                    <span className="text-[10px] text-[#64748B] block">جریان نقدینگی</span>
                    <span className="font-mono-num text-xs font-bold text-[#062B4D]">—</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E3EBF0] flex items-center justify-between gap-4">
              <span className="text-xs text-[#64748B]">داده‌های فرضی و نمایشی</span>
              <a
                href="/demo-powerbi.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#062B4D] text-white text-xs font-medium hover:bg-[#087A9D] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>تجربه دموی Power BI</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 05 — روش همکاری (H05)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              از شناخت مسئله تا بهبود عملکرد
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#435466] leading-relaxed">
              همکاری با بینش با شناخت نیاز واقعی آغاز می‌شود و بر اساس نوع خدمت، به طراحی راهکار، تحلیل و پیگیری نتایج می‌رسد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {COLLABORATION_STEPS.map((item, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`rounded-xl p-5 border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#EAF7F9]/70 border-[#08A9C5]'
                      : 'bg-[#F7FAFC] border-[#E3EBF0] hover:border-[#08A9C5]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono-num text-2xl font-bold text-[#08A9C5]">
                      {item.step}
                    </span>
                    <span className="text-[11px] text-[#64748B]">{item.subtitle}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#062B4D] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 06 — نمونه‌کارها (H06)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              نمونه‌هایی از نگاه تحلیلی در عمل
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#435466] max-w-2xl leading-relaxed">
              در این بخش، پروژه‌ها و مطالعات موردی بینش معرفی می‌شوند؛ از مسئله اولیه و داده‌های مورد استفاده تا راهکار طراحی‌شده و نتایج قابل انتشار.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/portfolio')}
            className="text-xs font-medium text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5 cursor-pointer self-start md:self-auto shrink-0"
          >
            <span>مشاهده همه نمونه‌کارها</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Published Portfolio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('/portfolio')}
              className="group rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] transition-all overflow-hidden flex flex-col justify-between cursor-pointer shadow-2xs"
            >
              <div>
                <div className="relative aspect-16/9 bg-[#062B4D] overflow-hidden border-b border-[#E3EBF0]">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
                    <span className="font-bold text-[#087A9D]">{item.industry}</span>
                    <span>{item.serviceType}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#062B4D] group-hover:text-[#087A9D] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#435466] leading-relaxed line-clamp-2">
                    {item.intro[0]}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#F7FAFC] border-t border-[#E3EBF0] flex items-center justify-between text-xs font-medium text-[#087A9D]">
                <span>مشاهده جزئیات مطالعه موردی</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 07 — شبکه همکاران تخصصی (H07 + Network Mascot)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
                  شبکه تخصصی بینش
                </h2>
                <p className="mt-2.5 text-sm sm:text-base text-[#435466] leading-relaxed">
                  برای پاسخ‌گویی به نیازهای متنوع پروژه‌ها، بینش با متخصصان حوزه‌های مرتبط همکاری می‌کند. ترکیب همکاران هر پروژه بر اساس مسئله، ابزار و تخصص موردنیاز انتخاب می‌شود.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <p className="text-xs sm:text-sm text-[#435466]">
                  معرفی همکاران تخصصی پس از نهایی شدن ترکیب و دریافت تأیید افراد منتشر می‌شود.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('/about')}
                  className="px-5 py-2.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs font-medium text-[#087A9D] hover:text-[#062B4D] hover:border-[#08A9C5] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>آشنایی با شبکه تخصصی</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Mascot name="network" className="mx-auto w-full max-w-[380px]" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 08 — بینش‌نامه (H08 + Reader Mascot + I01–I04)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              بینش‌نامه
            </h2>
            <p className="text-sm sm:text-base text-[#435466] max-w-2xl leading-relaxed">
              مجموعه‌ای از مقاله‌ها، ویدئوها و راهنماهای کاربردی درباره هوش تجاری، تحلیل داده، شاخص‌های عملکرد و تصمیم‌گیری مدیریتی.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/insights')}
                className="text-xs font-medium text-[#087A9D] hover:text-[#062B4D] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>مشاهده همه مطالب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="lg:col-span-4">
            <Mascot name="reader" className="mx-auto w-full max-w-[280px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insightPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-white border border-[#E3EBF0] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#64748B] pb-3 mb-4 border-b border-[#E3EBF0]">
                  <span className="font-bold text-[#087A9D]">{post.category}</span>
                  <span>{post.statusNote}</span>
                </div>

                <h3 className="text-base font-bold text-[#062B4D] leading-snug">
                  {post.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[#435466] leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#E3EBF0] flex items-center justify-between text-xs text-[#64748B]">
                <span>{post.statusNote}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 09 — دعوت به همکاری پایانی (H09 + Companion Mascot #5)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#062B4D] text-white p-7 sm:p-12 border border-[#087A9D]/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="text-xs font-medium text-[#3CDDDD]">
                شروع مسیر تصمیم‌گیری داده‌محور
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug">
                آماده‌اید کسب‌وکارتان را با نگاهی تحلیلی‌تر بررسی کنید؟
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
                در یک گفت‌وگوی اولیه، درباره وضعیت فعلی کسب‌وکار، گزارش‌ها و پرسش‌های مدیریتی شما صحبت می‌کنیم تا مسیر مناسب همکاری مشخص‌تر شود.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onOpenConsultation()}
                  className="px-6 py-3.5 rounded-xl bg-[#08A9C5] text-white text-sm font-medium hover:bg-[#3CDDDD] hover:text-[#062B4D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  درخواست جلسه مشاوره
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="px-6 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  تماس با بینش
                </button>
              </div>
            </div>

            {/* Companion Mascot (#5) on navy background */}
            <div className="lg:col-span-4">
              <Mascot
                name="companion"
                className="mx-auto w-full max-w-[240px] sm:max-w-[260px]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
