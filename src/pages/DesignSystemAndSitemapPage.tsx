import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { RoutePath } from '../data/bineshData';
import { BineshLogo, Mascot, MASCOTS, MascotName } from '../components/BrandComponents';

interface DesignSystemAndSitemapPageProps {
  onNavigate: (route: RoutePath) => void;
}

const MASCOT_GALLERY_ITEMS: {
  name: MascotName;
  title: string;
  placement: string;
}[] = [
  {
    name: 'welcome',
    title: '۱. ماسکات خوشامدگویی (welcome)',
    placement: 'صفحه اصلی — بخش آغازین (Hero)'
  },
  {
    name: 'listening',
    title: '۲. ماسکات شنونده (listening)',
    placement: 'صفحه اصلی — بخش راهنمای انتخاب مسیر کنار ویدئو'
  },
  {
    name: 'presenter',
    title: '۳. ماسکات ارائه‌دهنده (presenter)',
    placement: 'صفحه معرفی دموهای تعاملی (/demos)'
  },
  {
    name: 'thinker',
    title: '۴. ماسکات متفکر (thinker)',
    placement: 'صفحه داشبوردهای مدیریتی (/services/dashboards) — مقایسه وب و Power BI'
  },
  {
    name: 'companion',
    title: '۵. ماسکات همراه (companion)',
    placement: 'صفحه اصلی — بخش دعوت به همکاری پایانی (CTA سرمه‌ای)'
  },
  {
    name: 'empty',
    title: '۶. ماسکات حالت خالی (empty)',
    placement: 'حالت‌های خالی پنل مشتریان (/portal) و بخش نمونه‌کارها'
  },
  {
    name: 'success',
    title: '۷. ماسکات موفقیت (success)',
    placement: 'پیام دریافت موفق در هر سه فرم درخواست مشاوره'
  },
  {
    name: 'help',
    title: '۸. ماسکات راهنما و پاسخ‌گویی (help)',
    placement: 'بخش آغازین صفحه تماس (/contact) و سرفصل سؤالات متداول خدمات'
  },
  {
    name: 'analyst',
    title: '۹. ماسکات کاوشگر داده (analyst)',
    placement: 'صفحه تحلیل و پایش مستمر (/services/bi-analytics) — بخش معرفی'
  },
  {
    name: 'strategist',
    title: '۱۰. ماسکات مشاور و هم‌فکر استراتژیک (strategist)',
    placement: 'صفحه مشاوره و کوچینگ (/services/consulting) — بخش معرفی'
  },
  {
    name: 'reader',
    title: '۱۱. ماسکات مطالعه‌گر بینش‌نامه (reader)',
    placement: 'صفحه بینش‌نامه (/insights) و بخش بینش‌نامه در صفحه اصلی'
  },
  {
    name: 'builder',
    title: '۱۲. ماسکات معمار داشبورد و یکپارچه‌ساز (builder)',
    placement: 'صفحه طراحی داشبورد (/services/dashboards) — بخش یکپارچه‌سازی داده‌های پراکنده'
  },
  {
    name: 'security',
    title: '۱۳. ماسکات نگهبان امنیت و محرمانگی (security)',
    placement: 'صفحه حریم خصوصی و محرمانگی اطلاعات (/privacy) و صفحه ورود (/auth)'
  },
  {
    name: 'network',
    title: '۱۴. ماسکات شبکه تخصصی و همکاری تیمی (network)',
    placement: 'بخش شبکه تخصصی بینش در صفحه درباره ما (/about) و صفحه اصلی'
  }
];

export const DesignSystemAndSitemapPage: React.FC<DesignSystemAndSitemapPageProps> = ({
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<
    'sitemap' | 'colors-type' | 'components' | 'brand-assets'
  >('sitemap');

  const colorPalette = [
    { name: 'Turquoise', hex: '#08A9C5', usage: 'رنگ اصلی برند، تأکیدها و آیکون‌ها' },
    { name: 'Deep Navy', hex: '#062B4D', usage: 'تیترها، متن‌های اصلی و فوتر' },
    { name: 'Dark Turquoise', hex: '#087A9D', usage: 'دکمه‌های اصلی و لینک‌ها' },
    { name: 'Light Aqua', hex: '#3CDDDD', usage: 'جزئیات ماسکات و هایلایت‌های محدود' },
    { name: 'Page Background', hex: '#F7FAFC', usage: 'پس‌زمینه اصلی صفحات (۷۰٪ خنثی)' },
    { name: 'White', hex: '#FFFFFF', usage: 'کارت‌ها و بخش‌های محتوایی' },
    { name: 'Soft Aqua', hex: '#EAF7F9', usage: 'پس‌زمینه بخش‌های تأکیدی' },
    { name: 'Primary Text', hex: '#263B50', usage: 'متن‌های اصلی' },
    { name: 'Secondary Text', hex: '#435466', usage: 'توضیحات و متن‌های فرعی' },
    { name: 'Muted Text', hex: '#64748B', usage: 'نوشته‌های کم‌اهمیت' },
    { name: 'Border', hex: '#E3EBF0', usage: 'خطوط جداکننده و حاشیه کارت‌ها' }
  ];

  const allRoutes: { route: RoutePath; title: string; group: string; desc: string }[] = [
    {
      route: '/',
      title: 'صفحه اصلی (Homepage)',
      group: 'هسته اصلی',
      desc: 'بخش‌های H01 تا H09 همراه با ماسکات‌های خوشامدگویی، شنونده، حالت خالی و همراه'
    },
    {
      route: '/services',
      title: 'خدمات بینش',
      group: 'خدمات (۳ مسیر و ۱۵ زیرخدمت)',
      desc: 'معرفی ۳ مسیر اصلی همکاری و ۱۵ زیرخدمت تخصصی'
    },
    {
      route: '/services/dashboards',
      title: '۱. طراحی و توسعه داشبوردهای مدیریتی',
      group: 'خدمات (۳ مسیر و ۱۵ زیرخدمت)',
      desc: 'وب‌اپلیکیشن، Power BI، یکپارچه‌سازی، KPI، خودکارسازی، جدول مقایسه + ماسکات متفکر و سؤالات متداول'
    },
    {
      route: '/services/bi-analytics',
      title: '۲. تحلیل و پایش مستمر کسب‌وکار',
      group: 'خدمات (۳ مسیر و ۱۵ زیرخدمت)',
      desc: 'تحلیل فروش، مالی، مشتریان و شعب، گزارش‌های دوره‌ای، مدل همکاری و سؤالات متداول'
    },
    {
      route: '/services/consulting',
      title: '۳. مشاوره و کوچینگ کسب‌وکار',
      group: 'خدمات (۳ مسیر و ۱۵ زیرخدمت)',
      desc: 'مشاوره BI، تعیین اهداف و KPI، ساختار پیشنهادی جلسات و سؤالات متداول'
    },
    {
      route: '/demos',
      title: 'دموهای تعاملی',
      group: 'دموها',
      desc: 'معرفی دو محیط نمایشی (وب‌اپلیکیشن و Power BI) با باز شدن مستقیم و تمام‌صفحه در تب جدید + ماسکات ارائه‌دهنده'
    },
    {
      route: '/portfolio',
      title: 'نمونه‌کارها و تجربه‌های تحلیلی',
      group: 'محتوا و برند',
      desc: 'معرفی ۴ نمونه‌کار منتشرشده با اولویت پروژه کابینو وود'
    },
    {
      route: '/insights',
      title: 'بینش‌نامه',
      group: 'محتوا و برند',
      desc: 'مقالات و راهنماهای کاربردی هوش تجاری و تحلیل داده (I01 تا I04)'
    },
    {
      route: '/about',
      title: 'درباره بینش',
      group: 'محتوا و برند',
      desc: 'معرفی برند، فلسفه فعالیت، مأموریت، ارزش‌های برند و شبکه تخصصی بینش'
    },
    {
      route: '/contact',
      title: 'تماس با بینش',
      group: 'محتوا و برند',
      desc: 'فرم درخواست جلسه مشاوره، ماسکات راهنما و سؤالات متداول عمومی'
    },
    {
      route: '/auth',
      title: 'ورود به حساب بینش',
      group: 'سیستم کاربری و پورتال',
      desc: 'ورود، ایجاد حساب کاربری و بازیابی رمز عبور'
    },
    {
      route: '/portal',
      title: 'فضای اختصاصی همکاری شما با بینش',
      group: 'سیستم کاربری و پورتال',
      desc: 'نمای کلی، داشبوردهای من، گزارش‌های من، درخواست‌های تحلیل، جلسات مشاوره، اهداف و اقدامات، فایل‌ها و تنظیمات'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-10 space-y-5">
        <div className="pb-4 border-b border-[#E3EBF0]">
          <span className="text-xs font-medium text-[#087A9D]">
            صفحه داخلی راهنمای هویت بصری (noindex)
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D]">
          راهنمای سیستم طراحی و دارایی‌های برند بینش
        </h1>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
              activeTab === 'sitemap'
                ? 'bg-[#062B4D] text-white'
                : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0]'
            }`}
          >
            ۱. نقشه کامل سایت (Sitemap)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('colors-type')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
              activeTab === 'colors-type'
                ? 'bg-[#062B4D] text-white'
                : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0]'
            }`}
          >
            ۲. پالت رنگی و تایپوگرافی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
              activeTab === 'components'
                ? 'bg-[#062B4D] text-white'
                : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0]'
            }`}
          >
            ۳. اجزای رابط کاربری
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brand-assets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
              activeTab === 'brand-assets'
                ? 'bg-[#062B4D] text-white'
                : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0]'
            }`}
          >
            ۴. لوگوی SVG، Favicon و گالری ۱۴ ماسکات رسمی (WebP)
          </button>
        </div>
      </div>

      {/* TAB 1: SITEMAP */}
      {activeTab === 'sitemap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allRoutes.map((item) => (
            <div
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className="group rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] p-5 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                  <span>{item.group}</span>
                  <span className="font-mono-num text-[#087A9D] font-bold dir-ltr">
                    {item.route}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#062B4D] group-hover:text-[#087A9D]">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-xs text-[#435466] leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E3EBF0] flex items-center justify-between text-xs text-[#087A9D] font-medium">
                <span>مشاهده صفحه</span>
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: COLORS & TYPOGRAPHY */}
      {activeTab === 'colors-type' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#062B4D]">
              پالت رنگی رسمی بینش (نسبت ۷۰٪ خنثی · ۲۰٪ سرمه‌ای · ۱۰٪ فیروزه‌ای)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {colorPalette.map((c) => (
                <div
                  key={c.hex}
                  className="rounded-xl border border-[#E3EBF0] overflow-hidden bg-[#F7FAFC]"
                >
                  <div
                    className="h-16 w-full border-b border-[#E3EBF0]"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#062B4D]">{c.name}</span>
                      <span className="font-mono-num text-xs text-[#087A9D]">{c.hex}</span>
                    </div>
                    <p className="text-[11px] text-[#435466]">{c.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-[#062B4D]">
              سیستم تایپوگرافی (Vazirmatn + Inter)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <span className="text-xs text-[#64748B] block">تیترها (Bold 700)</span>
                <p className="text-lg font-bold text-[#062B4D] mt-1">
                  همراه کسب‌وکار شما، با نگاهی تحلیلی
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <span className="text-xs text-[#64748B] block">متن فرعی و دکمه‌ها (Medium 500)</span>
                <p className="text-sm font-medium text-[#263B50] mt-1">
                  طراحی داشبوردهای مدیریتی و پایش مستمر عملکرد
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <span className="text-xs text-[#64748B] block">متن اصلی (Regular 400)</span>
                <p className="text-sm font-normal text-[#435466] mt-1">
                  بررسی دقیق شاخص‌های کلیدی برای تصمیم‌گیری آگاهانه مدیران.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UI COMPONENTS */}
      {activeTab === 'components' && (
        <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#062B4D] mb-4">
              حالت‌های دکمه‌ها (Default / Hover / Active / Disabled / Focus)
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] active:scale-95 focus:ring-2 focus:ring-[#08A9C5] cursor-pointer"
              >
                درخواست جلسه مشاوره (#087A9D)
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#062B4D] text-white text-xs font-medium hover:bg-[#087A9D] cursor-pointer"
              >
                مشاهده خدمات (#062B4D)
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-white border border-[#E3EBF0] text-[#062B4D] hover:border-[#08A9C5] text-xs font-medium cursor-pointer"
              >
                تجربه دموهای تعاملی
              </button>
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-xl bg-[#E3EBF0] text-[#64748B] text-xs font-medium cursor-not-allowed opacity-70"
              >
                در حال آماده‌سازی (Disabled)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BRAND ASSETS, FAVICON & 8 SVG MASCOTS */}
      {activeTab === 'brand-assets' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#062B4D]">
                ۱. لوگوی رسمی برداری (SVG) — /assets/brand/binesh-logo.svg
              </h2>
              <p className="text-xs text-[#435466] leading-relaxed">
                نمایش لوگوی برداری SVG با حفظ دقیق نسبت ابعاد (۸:۱) در پس‌زمینه روشن و تیره:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] flex flex-col items-center justify-center gap-2">
                  <BineshLogo size="md" variant="light-bg" />
                  <span className="text-[11px] text-[#64748B]">نسخه پس‌زمینه روشن</span>
                </div>
                <div className="p-5 rounded-xl bg-[#062B4D] flex flex-col items-center justify-center gap-2">
                  <BineshLogo size="md" variant="dark-bg" />
                  <span className="text-[11px] text-white/75">نسخه با قاب روشن در پس‌زمینه تیره</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#062B4D]">
                ۲. خروجی‌های Favicon
              </h2>
              <p className="text-xs text-[#435466] leading-relaxed">
                آیکون مربعی سایت (Site Icon / Favicon) در مسیرهای پایدار زیر ثبت شده است:
              </p>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <img
                  src="/favicon-96x96.png"
                  alt="Site Icon Preview"
                  className="w-12 h-12 rounded-lg border border-[#E3EBF0] object-cover"
                />
                <div className="text-xs space-y-1 font-mono-num text-[#263B50] dir-ltr">
                  <div>• /favicon.ico (48×48, 32×32, 16×16)</div>
                  <div>• /favicon-96x96.png (96×96)</div>
                  <div>• /favicon-192x192.png (192×192)</div>
                  <div>• /apple-touch-icon.png (180×180)</div>
                  <div>• /favicon.svg (Vector SVG)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#062B4D]">
              ۳. گالری ۱۴ ماسکات رسمی بینش (فرمت WebP با پس‌زمینه شفاف)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MASCOT_GALLERY_ITEMS.map((item) => {
                const spec = MASCOTS[item.name];
                return (
                  <div
                    key={item.name}
                    className="rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] p-4 flex flex-col justify-between space-y-3"
                  >
                    <Mascot
                      name={item.name}
                      className="mx-auto w-full max-w-[200px]"
                    />
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#062B4D]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#435466]">{item.placement}</p>
                      <p className="text-[11px] font-mono-num text-[#087A9D] dir-ltr truncate">
                        {spec.src} ({spec.w}×{spec.h})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
