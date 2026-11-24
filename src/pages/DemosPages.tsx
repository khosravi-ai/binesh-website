import React, { useState } from 'react';
import {
  Store,
  Wallet,
  Maximize2,
  Minimize2,
  ArrowLeft,
  RotateCw
} from 'lucide-react';
import { RoutePath, UNIFIED_CTA_LABEL } from '../data/bineshData';
import { Mascot } from '../components/BrandComponents';
import { NavLink } from '../components/NavLink';

interface DemosPagesProps {
  currentRoute: '/demos';
  onNavigate: (route: RoutePath) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

const WEB_DEMO_SRC = '/demo-webapp.html';
const PBI_DEMO_SRC = '/demo-powerbi.html';

export const DemosPages: React.FC<DemosPagesProps> = ({
  onNavigate,
  onOpenConsultation
}) => {
  const [activeDemo, setActiveDemo] = useState<'webapp' | 'powerbi'>('webapp');
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [expandedViewport, setExpandedViewport] = useState<boolean>(false);

  const currentSrc = activeDemo === 'webapp' ? WEB_DEMO_SRC : PBI_DEMO_SRC;
  const currentTitle =
    activeDemo === 'webapp'
      ? 'داشبورد مدیریتی یک زنجیره فروشگاهی (وب‌اپلیکیشن اختصاصی)'
      : 'داشبورد مالی، بهای تمام‌شده و کنترل بودجه (Power BI)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Dark Engineered Header + Demo Selector Cards */}
      <section className="rounded-3xl bg-[#062B4D] bg-binesh-blueprint text-white p-6 sm:p-10 relative overflow-hidden border border-[#087A9D]/30 space-y-8">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3CDDDD]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#3CDDDD]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>اتصال مستقیم و به‌روزرسانی لحظه‌ای داده‌های کسب‌وکار</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">
              اتاق تجربه زنده داشبوردهای مدیریتی بینش
            </h1>

            <ul className="space-y-1.5 text-xs sm:text-sm text-white/85">
              <li>• بدون نیاز به خروج از صفحه، هر دو محیط وب‌اپلیکیشن و Power BI را در قاب زیر امتحان کنید.</li>
              <li>• فیلترها، تب‌ها، نقشه استان‌ها و جداول کاملاً تعاملی هستند (با داده‌های فرضی و نمایشی).</li>
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <NavLink
                href="/services/dashboards"
                onNavigate={onNavigate}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium transition-colors"
              >
                آشنایی با خدمات طراحی داشبورد ←
              </NavLink>
              <NavLink
                href="/solutions"
                onNavigate={onNavigate}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[#3CDDDD] font-medium transition-colors"
              >
                راهکارهای اتصال به سپیدار و هلو ←
              </NavLink>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Mascot name="presenter" priority className="mx-auto w-full max-w-[240px]" />
          </div>
        </div>

        {/* Two Glassmorphic Demo Switcher Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
          {/* Demo 01 Card */}
          <div
            onClick={() => setActiveDemo('webapp')}
            className={`bg-white/5 backdrop-blur-md border rounded-2xl p-6 shadow-2xl cursor-pointer transition-all ${
              activeDemo === 'webapp'
                ? 'border-[#3CDDDD] ring-2 ring-[#3CDDDD]/30 bg-white/10'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-num text-xs font-bold text-[#3CDDDD] dir-ltr">
                DEMO 01 | WEB APPLICATION
              </span>
              <Store className="w-5 h-5 text-[#3CDDDD]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              داشبورد مدیریتی یک زنجیره فروشگاهی
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
              نمای کلی زنجیره، نقشه فروش ۳۱ استان، وفاداری مشتریان، سبد کالا و عملکرد ۱۶۴ شعبه در قالب وب‌اپلیکیشن اختصاصی.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="font-mono-num text-white/70">۳۱ استان · ۱۶۴ شعبه</span>
              <span
                className={`px-3 py-1 rounded-lg font-bold ${
                  activeDemo === 'webapp'
                    ? 'bg-[#3CDDDD] text-[#062B4D]'
                    : 'bg-white/10 text-white'
                }`}
              >
                {activeDemo === 'webapp' ? 'در حال نمایش در قاب پایین' : 'انتخاب و نمایش دمو'}
              </span>
            </div>
          </div>

          {/* Demo 02 Card */}
          <div
            onClick={() => setActiveDemo('powerbi')}
            className={`bg-white/5 backdrop-blur-md border rounded-2xl p-6 shadow-2xl cursor-pointer transition-all ${
              activeDemo === 'powerbi'
                ? 'border-[#3CDDDD] ring-2 ring-[#3CDDDD]/30 bg-white/10'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-num text-xs font-bold text-[#3CDDDD] dir-ltr">
                DEMO 02 | POWER BI
              </span>
              <Wallet className="w-5 h-5 text-[#3CDDDD]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              داشبورد مالی و بودجه یک سازمان (Power BI)
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
              عملکرد مالی، بهای تمام‌شده، کنترل بودجه و جریان نقدینگی در قالب گزارش تعاملی به سبک Microsoft Power BI.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="font-mono-num text-white/70">۴ صفحه گزارش مالی</span>
              <span
                className={`px-3 py-1 rounded-lg font-bold ${
                  activeDemo === 'powerbi'
                    ? 'bg-[#3CDDDD] text-[#062B4D]'
                    : 'bg-white/10 text-white'
                }`}
              >
                {activeDemo === 'powerbi' ? 'در حال نمایش در قاب پایین' : 'انتخاب و نمایش دمو'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          EMBEDDED BROWSER FRAME MOCKUP WITH TOP CONVERSION BAR
      ===================================================================== */}
      <section
        className={
          expandedViewport
            ? 'fixed inset-3 z-50 flex flex-col bg-[#062B4D] rounded-2xl shadow-2xl border border-[#3CDDDD]/40 overflow-hidden'
            : 'rounded-2xl bg-[#062B4D] border border-[#E3EBF0] shadow-xl overflow-hidden flex flex-col'
        }
      >
        {/* Top Conversion Banner Inside Frame */}
        <div className="bg-gradient-to-l from-[#062B4D] via-[#093863] to-[#087A9D] px-4 sm:px-6 py-3 border-b border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              در حال مشاهده دموی زنده هستید:{' '}
              <strong className="text-[#3CDDDD]">{currentTitle}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenConsultation(currentTitle)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#3CDDDD] hover:bg-white text-[#062B4D] text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{UNIFIED_CTA_LABEL}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Browser Chrome Bar */}
        <div className="bg-[#041E36] px-3 sm:px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs text-white/80">
          {/* Right: Browser Window Dots & Mode Switch */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveDemo('webapp')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                  activeDemo === 'webapp'
                    ? 'bg-[#08A9C5] text-[#062B4D]'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                دموی ۱: وب‌اپلیکیشن فروشگاهی
              </button>
              <button
                type="button"
                onClick={() => setActiveDemo('powerbi')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                  activeDemo === 'powerbi'
                    ? 'bg-[#08A9C5] text-[#062B4D]'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                دموی ۲: داشبورد مالی Power BI
              </button>
            </div>
          </div>

          {/* Center: Simulated Address Bar */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1 rounded-lg bg-white/5 border border-white/10 font-mono-num text-[11px] text-white/70 dir-ltr">
            <span className="text-emerald-400">https://</span>
            <span>binesh.analytics/live-demo/{activeDemo}</span>
          </div>

          {/* Left: Reload & Expand Controls */}
          <div className="flex items-center gap-2 mr-auto sm:mr-0">
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
              title="بارگذاری مجدد دمو"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>بازنشانی</span>
            </button>
            <button
              type="button"
              onClick={() => setExpandedViewport(!expandedViewport)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              {expandedViewport ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#3CDDDD]" />
                  <span>خروج از تمام‌صفحه</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#3CDDDD]" />
                  <span>بزرگ‌نمایی قاب</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Embedded Interactive Iframe */}
        <div
          className={
            expandedViewport
              ? 'flex-1 bg-white'
              : 'w-full h-[540px] sm:h-[680px] lg:h-[780px] bg-white'
          }
        >
          <iframe
            key={`${activeDemo}-${iframeKey}`}
            src={currentSrc}
            title={currentTitle}
            className="w-full h-full border-0"
          />
        </div>
      </section>
    </div>
  );
};
