import React from 'react';
import {
  ExternalLink,
  Store,
  Wallet
} from 'lucide-react';
import { RoutePath } from '../data/bineshData';
import { Mascot } from '../components/BrandComponents';

interface DemosPagesProps {
  currentRoute: '/demos';
  onNavigate: (route: RoutePath) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

const WEB_DEMO_SRC = '/demo-webapp.html';
const PBI_DEMO_SRC = '/demo-powerbi.html';

export const DemosPages: React.FC<DemosPagesProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      {/* Header + Presenter Mascot (#3) */}
      <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10">
        <div className="pb-6 mb-6 border-b border-[#E3EBF0]">
          <div className="text-xs font-medium text-[#087A9D]">
            قبل از انتخاب، تجربه کنید.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D] leading-snug">
              دموهای تعاملی
            </h1>
            <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
              در دو محیط نمایشی با سناریوهای متفاوت، نمونه‌ای از تجربه کار با داشبوردهای مدیریتی را بررسی کنید. این دموها از داده‌های ساختگی استفاده می‌کنند و برای آشنایی با ساختار و قابلیت‌ها طراحی شده‌اند.
            </p>
            <div className="p-4 rounded-xl bg-[#EAF7F9]/80 border border-[#08A9C5]/40 text-xs sm:text-sm text-[#263B50] leading-relaxed">
              این محیط صرفاً برای آشنایی با قابلیت‌های داشبورد طراحی شده و از داده‌های نمایشی استفاده می‌کند. با کلیک روی هر گزینه، دمو به‌صورت مستقیم و تمام‌صفحه در تب جدید باز می‌شود.
            </div>
          </div>

          {/* Presenter Mascot (#3) */}
          <div className="lg:col-span-4">
            <Mascot
              name="presenter"
              className="mx-auto w-full max-w-[320px]"
            />
          </div>
        </div>
      </section>

      {/* Two Independent Demo Cards (H04) — Direct Fullscreen Launch in New Tab */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demo 01 Card */}
        <div className="rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] transition-all p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-xs font-bold text-[#087A9D] dir-ltr">
                DEMO 01 | WEB APPLICATION
              </span>
              <Store className="w-5 h-5 text-[#08A9C5]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              داشبورد مدیریتی یک زنجیره فروشگاهی
            </h2>

            <p className="text-sm text-[#435466] leading-relaxed">
              در این سناریوی نمایشی، نمای کلی زنجیره، نقشه فروش استان‌ها، مشتریان و وفاداری، محصولات و عملکرد شعب را در قالب یک وب‌اپلیکیشن مدیریتی بررسی کنید.
            </p>

            <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs text-[#263B50]">
              <strong className="text-[#062B4D]">داده:</strong> داده‌های فرضی و نمایشی
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E3EBF0] flex items-center justify-between">
            <span className="text-xs text-[#64748B]">داده‌های فرضی و نمایشی</span>
            <a
              href={WEB_DEMO_SRC}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>تجربه دموی وب‌اپلیکیشن</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Demo 02 Card */}
        <div className="rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] transition-all p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-xs font-bold text-[#087A9D] dir-ltr">
                DEMO 02 | POWER BI
              </span>
              <Wallet className="w-5 h-5 text-[#08A9C5]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
              داشبورد مالی و بودجه یک سازمان
            </h2>

            <p className="text-sm text-[#435466] leading-relaxed">
              در این سناریوی نمایشی، عملکرد مالی، بهای تمام‌شده، کنترل بودجه و جریان نقدینگی را در یک گزارش تعاملی به سبک Power BI بررسی کنید.
            </p>

            <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs text-[#263B50]">
              <strong className="text-[#062B4D]">داده:</strong> داده‌های فرضی و نمایشی
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E3EBF0] flex items-center justify-between">
            <span className="text-xs text-[#64748B]">داده‌های فرضی و نمایشی</span>
            <a
              href={PBI_DEMO_SRC}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-[#062B4D] text-white text-xs font-medium hover:bg-[#087A9D] transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>تجربه دموی Power BI</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
