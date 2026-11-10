import React, { useState } from 'react';
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  X
} from 'lucide-react';
import {
  RoutePath,
  PORTFOLIO_PLACEHOLDERS,
  INSIGHTS_PLACEHOLDERS,
  PortfolioPlaceholderItem,
  InsightPlaceholderItem,
  GENERAL_FAQS
} from '../data/bineshData';
import { contactInfo as defaultContactInfo, ContactInfo } from '../data/contactInfo';
import {
  Mascot,
  FaqList,
  FORM_SERVICE_OPTIONS
} from '../components/BrandComponents';
import {
  submitConsultationRequest,
  trackConsultationByCode,
  TrackedConsultation
} from '../lib/submitRequest';

interface ContentPagesProps {
  currentRoute: '/portfolio' | '/insights' | '/about' | '/contact' | '/privacy';
  onNavigate: (route: RoutePath) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
  portfolioItems?: PortfolioPlaceholderItem[];
  insightPosts?: (InsightPlaceholderItem & { content?: string })[];
  siteContactInfo?: ContactInfo;
}

export const ContentPages: React.FC<ContentPagesProps> = ({
  currentRoute,
  onNavigate,
  onOpenConsultation,
  portfolioItems = PORTFOLIO_PLACEHOLDERS,
  insightPosts = INSIGHTS_PLACEHOLDERS,
  siteContactInfo = defaultContactInfo
}) => {
  const contactInfo = siteContactInfo;
  // Portfolio states
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Insights states
  const [insightCategoryFilter, setInsightCategoryFilter] = useState<string>('همه');
  const [insightSearch, setInsightSearch] = useState<string>('');
  const [selectedInsightPost, setSelectedInsightPost] = useState<
    (InsightPlaceholderItem & { content?: string }) | null
  >(null);

  // Contact states
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactService, setContactService] = useState<string>(FORM_SERVICE_OPTIONS[0]);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactTrackingCode, setContactTrackingCode] = useState('');

  // Tracking lookup on /contact
  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<TrackedConsultation | null>(null);
  const [lookupError, setLookupError] = useState('');

  // =========================================================================
  // 6. PORTFOLIO PAGE (/portfolio — Dynamic Case Studies)
  // =========================================================================
  if (currentRoute === '/portfolio') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-10 space-y-4">
          <div className="pb-4 border-b border-[#E3EBF0]">
            <span className="text-xs font-medium text-[#087A9D]">
              نمونه‌هایی از نگاه تحلیلی در عمل
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D]">
            نمونه‌کارها و تجربه‌های تحلیلی
          </h1>
          <p className="text-sm sm:text-base text-[#435466] max-w-3xl leading-relaxed">
            در این بخش، پروژه‌های قابل انتشار بینش معرفی می‌شوند. هر مطالعه موردی نشان می‌دهد مسئله اولیه چه بوده، چه اطلاعاتی بررسی شده، چه راهکاری طراحی شده و چه نتایجی با شواهد قابل ارائه به دست آمده است.
          </p>
        </div>

        {/* Detailed Portfolio Case Studies */}
        <div className="space-y-10">
          {portfolioItems.map((project, index) => (
            <article
              key={project.id}
              id={project.id}
              className="rounded-2xl bg-white border border-[#E3EBF0] overflow-hidden shadow-2xs"
            >
              {/* Top Meta Header */}
              <div className="px-6 sm:px-8 py-5 bg-[#F7FAFC] border-b border-[#E3EBF0] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EAF7F9] text-[#087A9D]">
                    ۰{index + 1}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-bold text-[#062B4D]">
                    {project.title}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E3EBF0] text-[#263B50]">
                    <strong className="text-[#062B4D]">صنعت:</strong> {project.industry}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E3EBF0] text-[#263B50]">
                    <strong className="text-[#087A9D]">خدمات:</strong> {project.serviceType}
                  </span>
                </div>
              </div>

              {/* Main Content Grid: Screenshot + Case Study Details */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Right Column (RTL): Case Study Text */}
                <div className="lg:col-span-6 space-y-6">
                  {/* معرفی پروژه */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm sm:text-base font-bold text-[#062B4D] border-r-3 border-[#08A9C5] pr-3">
                      معرفی پروژه
                    </h3>
                    <div className="space-y-2 text-xs sm:text-sm text-[#435466] leading-relaxed">
                      {project.intro.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>

                  {/* راهکار اجراشده (if present) */}
                  {project.solution && (
                    <div className="space-y-2.5">
                      <h3 className="text-sm sm:text-base font-bold text-[#062B4D] border-r-3 border-[#08A9C5] pr-3">
                        راهکار اجراشده
                      </h3>
                      <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                        {project.solution}
                      </p>
                    </div>
                  )}

                  {/* امکانات / بخش‌های بررسی‌شده */}
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-bold text-[#062B4D] border-r-3 border-[#08A9C5] pr-3">
                      {project.featuresTitle}
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {project.features.map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs sm:text-sm text-[#263B50]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#08A9C5] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* جمع‌بندی */}
                  <div className="p-4 rounded-xl bg-[#EAF7F9]/60 border border-[#08A9C5]/30 text-xs sm:text-sm text-[#062B4D] leading-relaxed">
                    {project.conclusion}
                  </div>
                </div>

                {/* Left Column (RTL): Project Image Showcase */}
                <div className="lg:col-span-6 space-y-3">
                  <div
                    onClick={() =>
                      setSelectedPortfolioImage({
                        src: project.image,
                        title: project.title
                      })
                    }
                    className="group relative rounded-2xl overflow-hidden border border-[#E3EBF0] bg-[#062B4D] cursor-pointer shadow-sm"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-300"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#062B4D]/85 backdrop-blur-xs text-white text-xs inline-flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-[#3CDDDD]" />
                      <span>بزرگ‌نمایی تصویر</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748B] text-center">
                    برای مشاهده جزئیات تصویر در اندازه کامل، روی تصویر کلیک کنید.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-[#062B4D] text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <h2 className="text-xl sm:text-2xl font-bold">
              مسئله یا نیاز مشابهی در کسب‌وکار خود دارید؟
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              در یک گفت‌وگوی اولیه بدون هزینه، وضعیت داده‌ها و گزارش‌های فعلی شما را بررسی می‌کنیم تا مسیر مناسب طراحی داشبورد یا تحلیل عملکرد مشخص شود.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsultation()}
            className="px-6 py-3.5 rounded-xl bg-[#08A9C5] hover:bg-[#3CDDDD] text-[#062B4D] font-bold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer"
          >
            درخواست جلسه مشاوره
          </button>
        </div>

        {/* Fullscreen Image Lightbox Modal */}
        {selectedPortfolioImage && (
          <div
            className="fixed inset-0 z-50 bg-[#062B4D]/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedPortfolioImage(null)}
          >
            <div
              className="relative max-w-6xl w-full bg-white rounded-2xl overflow-hidden border border-[#E3EBF0] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3.5 bg-[#F7FAFC] border-b border-[#E3EBF0] flex items-center justify-between gap-4">
                <h3 className="text-sm sm:text-base font-bold text-[#062B4D]">
                  {selectedPortfolioImage.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedPortfolioImage(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#062B4D] hover:bg-[#E3EBF0]/50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 sm:p-4 bg-[#062B4D] max-h-[82vh] overflow-auto flex items-center justify-center">
                <img
                  src={selectedPortfolioImage.src}
                  alt={selectedPortfolioImage.title}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 7. INSIGHTS HUB (/insights — Pack §12)
  // =========================================================================
  if (currentRoute === '/insights') {
    const categories = [
      'همه',
      'طراحی داشبورد',
      'شاخص‌های KPI',
      'هوش تجاری',
      'تحلیل مالی و فروش'
    ];
    const filteredPosts = insightPosts.filter((post) => {
      const matchCat =
        insightCategoryFilter === 'همه' || post.category === insightCategoryFilter;
      const matchSearch =
        !insightSearch.trim() ||
        post.title.includes(insightSearch) ||
        post.category.includes(insightSearch) ||
        post.excerpt.includes(insightSearch);
      return matchCat && matchSearch;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <div className="pb-4 border-b border-[#E3EBF0]">
            <span className="text-xs font-medium text-[#087A9D]">
              مقالات و محتوای آموزشی بینش
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D]">بینش‌نامه</h1>
              <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
                در بینش‌نامه، درباره هوش تجاری، تحلیل داده، طراحی داشبورد و مدیریت عملکرد می‌خوانید و می‌آموزید. هدف، ارائه مفاهیم روشن و کاربردی برای مدیرانی است که می‌خواهند با اطلاعات بهتر تصمیم بگیرند.
              </p>
            </div>
            <div className="lg:col-span-5">
              <Mascot name="reader" className="mx-auto w-full max-w-[360px]" />
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setInsightCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    insightCategoryFilter === cat
                      ? 'bg-[#062B4D] text-white'
                      : 'bg-[#F7FAFC] text-[#435466] border border-[#E3EBF0] hover:text-[#062B4D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[#64748B] absolute right-3.5 top-3" />
              <input
                type="text"
                value={insightSearch}
                onChange={(e) => setInsightSearch(e.target.value)}
                placeholder="جست‌وجو در مطالب بینش‌نامه..."
                className="w-full pr-10 pl-4 py-2.5 text-xs rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#E3EBF0] p-8 text-center text-sm text-[#435466]">
            موردی با این مشخصات پیدا نشد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedInsightPost(post)}
                className="rounded-2xl bg-white border border-[#E3EBF0] hover:border-[#08A9C5] p-6 flex flex-col justify-between shadow-2xs transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#64748B] pb-3 mb-4 border-b border-[#E3EBF0]">
                    <span className="font-bold text-[#087A9D]">{post.category}</span>
                    <span>{post.statusNote}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#062B4D] leading-snug">
                    {post.title}
                  </h2>
                  <p className="mt-2.5 text-xs sm:text-sm text-[#435466] leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E3EBF0] flex items-center justify-between text-xs text-[#087A9D] font-medium">
                  <span>{post.statusNote}</span>
                  <span>مطالعه یادداشت ←</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insight Article Modal */}
        {selectedInsightPost && (
          <div
            className="fixed inset-0 z-50 bg-[#062B4D]/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedInsightPost(null)}
          >
            <div
              className="max-w-2xl w-full bg-white rounded-2xl border border-[#E3EBF0] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 bg-[#F7FAFC] border-b border-[#E3EBF0] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#087A9D]">{selectedInsightPost.category}</span>
                  <span className="text-[#64748B]">·</span>
                  <span className="text-[#64748B]">{selectedInsightPost.statusNote}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInsightPost(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#062B4D] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 sm:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D] leading-snug">
                  {selectedInsightPost.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#087A9D] bg-[#EAF7F9]/60 p-4 rounded-xl border border-[#08A9C5]/30 leading-relaxed">
                  {selectedInsightPost.excerpt}
                </p>
                {selectedInsightPost.content && (
                  <div className="text-sm text-[#263B50] leading-relaxed space-y-3 whitespace-pre-line">
                    {selectedInsightPost.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 8. ABOUT BINESH PAGE (/about — Pack §13 + §1.4, §1.6, §11)
  // =========================================================================
  if (currentRoute === '/about') {
    const brandValues = [
      {
        num: '۱',
        title: 'فهم مسئله پیش از ارائه راهکار',
        desc: 'ابتدا نیاز و شرایط واقعی کسب‌وکار را می‌شناسیم.'
      },
      {
        num: '۲',
        title: 'دقت و شفافیت',
        desc: 'در تحلیل، تعریف شاخص‌ها و بیان محدودیت داده‌ها شفاف عمل می‌کنیم.'
      },
      {
        num: '۳',
        title: 'تفکر تحلیلی',
        desc: 'به‌جای تکیه بر حدس، به دنبال شواهد، ارتباط‌ها و علت تغییرات می‌رویم.'
      },
      {
        num: '۴',
        title: 'همراهی',
        desc: 'هدف ما فقط تحویل یک فایل یا داشبورد نیست؛ می‌خواهیم به استفاده بهتر از آن کمک کنیم.'
      },
      {
        num: '۵',
        title: 'یادگیری و بهبود مستمر',
        desc: 'روش‌ها و راهکارها باید متناسب با نیاز و تغییرات کسب‌وکار بازبینی شوند.'
      }
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <div className="pb-4 border-b border-[#E3EBF0]">
            <span className="text-xs font-medium text-[#087A9D]">
              همراه کسب‌وکار شما، با نگاهی تحلیلی
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D]">
              درباره بینش (Binesh)
            </h1>
            <p className="text-sm sm:text-base font-bold text-[#087A9D]">
              همراه کسب‌وکار شما، با نگاهی تحلیلی
            </p>
          </div>

          {/* Story & Approach provided by owner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-4 text-sm sm:text-base text-[#263B50] leading-relaxed">
            <p>
              بینش با این باور شکل گرفت که داده‌ها زمانی ارزشمند هستند که بتوانند به درک بهتر مسائل و تصمیم‌گیری آگاهانه‌تر در کسب‌وکار کمک کنند. بسیاری از کسب‌وکارها اطلاعات ارزشمندی در اختیار دارند، اما همیشه نمی‌توانند از این اطلاعات تصویری روشن از وضعیت عملکرد خود بسازند یا فرصت‌ها و چالش‌های پیش رویشان را به‌درستی شناسایی کنند. هدف بینش، ایجاد پلی میان داده‌ها و تصمیم‌های مدیریتی است.
            </p>
            <p>
              رویکرد ما در حل مسائل داده‌ای، با شناخت مسئله و نیاز واقعی کسب‌وکار آغاز می‌شود؛ نه صرفاً انتخاب ابزار یا ساخت نمودار. ابتدا تلاش می‌کنیم ساختار کسب‌وکار، اهداف و پرسش‌های مدیریتی را درک کنیم، سپس داده‌ها را بررسی و یکپارچه‌سازی کرده و آن‌ها را به گزارش‌ها، شاخص‌ها و تحلیل‌های قابل‌فهم و کاربردی تبدیل کنیم. در بینش، فناوری و تحلیل داده ابزارهایی برای رسیدن به یک هدف بزرگ‌تر هستند: کمک به کسب‌وکارها برای شناخت بهتر وضعیت خود، تصمیم‌گیری دقیق‌تر و بهبود مستمر عملکرد.
            </p>
          </div>

          {/* 3 Main Cards: معرفی برند, فلسفه فعالیت, مأموریت */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2.5">
              <span className="text-xs font-bold text-[#087A9D]">۰۱. معرفی برند</span>
              <h2 className="text-base font-bold text-[#062B4D]">معرفی برند</h2>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                بینش در حوزه هوش تجاری، تحلیل داده و مشاوره کسب‌وکار فعالیت می‌کند. رویکرد ما کمک به مدیران برای شناخت دقیق‌تر وضعیت، بررسی شاخص‌های مهم و استفاده مؤثر از اطلاعات در تصمیم‌گیری است.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2.5">
              <span className="text-xs font-bold text-[#087A9D]">۰۲. فلسفه فعالیت</span>
              <h2 className="text-base font-bold text-[#062B4D]">فلسفه فعالیت</h2>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                برای ما، داده نقطه پایان نیست؛ نقطه شروع پرسیدن سؤال‌های بهتر است. اطلاعات زمانی ارزشمند می‌شوند که بتوانند به شناخت روندها، بررسی مسئله‌ها و انتخاب اقدام مناسب کمک کنند. به همین دلیل، در بینش طراحی ابزارهای تحلیلی را در کنار فهم مسئله و همراهی با مدیران می‌بینیم.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2.5">
              <span className="text-xs font-bold text-[#087A9D]">۰۳. مأموریت</span>
              <h2 className="text-base font-bold text-[#062B4D]">مأموریت</h2>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                مأموریت بینش کمک به کسب‌وکارها برای تبدیل داده‌ها و اطلاعات روزمره به شناخت قابل اتکا، تصمیم‌های آگاهانه‌تر و اقدامات هدفمندتر است؛ از طریق طراحی راهکارهای هوش تجاری، تحلیل عملکرد و همراهی مدیریتی.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Values (§1.6) */}
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">ارزش‌های برند</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {brandValues.map((val) => (
              <div
                key={val.num}
                className="p-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-2"
              >
                <span className="font-mono-num text-lg font-bold text-[#08A9C5] block">
                  {val.num}.
                </span>
                <h3 className="text-sm font-bold text-[#062B4D]">{val.title}</h3>
                <p className="text-xs text-[#435466] leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Specialist Network Section (§11 + Network Mascot) */}
        <section className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#062B4D]">
                  شبکه تخصصی بینش
                </h2>
                <p className="text-sm sm:text-base text-[#435466] leading-relaxed">
                  بینش برای اجرای پروژه‌های مختلف، از همکاری متخصصان حوزه‌های مرتبط استفاده می‌کند. ترکیب همکاران بر اساس نیاز هر پروژه و تخصص موردنیاز شکل می‌گیرد؛ تا هر بخش از کار توسط فرد یا تیم دارای تجربه مرتبط انجام شود.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                <p className="text-xs sm:text-sm text-[#435466]">
                  معرفی همکاران تخصصی پس از نهایی شدن ترکیب و دریافت تأیید افراد منتشر می‌شود.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Mascot name="network" className="mx-auto w-full max-w-[400px]" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // 9. PRIVACY & CONFIDENTIALITY PAGE (/privacy)
  // =========================================================================
  if (currentRoute === '/privacy') {
    const privacySections = [
      {
        title: '۱. حفظ حریم خصوصی',
        paragraphs: [
          'در بینش، حفاظت از اطلاعات و حریم خصوصی مشتریان یکی از اصول اساسی همکاری است. اطلاعاتی که از طریق فرم‌های وب‌سایت، جلسات مشاوره یا در جریان اجرای پروژه‌ها دریافت می‌شوند، صرفاً برای برقراری ارتباط، بررسی درخواست‌ها و ارائه خدمات مورد استفاده قرار می‌گیرند.'
        ]
      },
      {
        title: '۲. محرمانگی داده‌های کسب‌وکار',
        paragraphs: [
          'تمام اطلاعات، اسناد، فایل‌ها و داده‌هایی که مشتری در اختیار بینش قرار می‌دهد، محرمانه تلقی می‌شوند. این اطلاعات بدون رضایت قبلی مشتری در اختیار اشخاص یا مجموعه‌های غیرمجاز قرار نخواهند گرفت و صرفاً در چارچوب اهداف توافق‌شده برای اجرای خدمات استفاده می‌شوند.'
        ]
      },
      {
        title: '۳. نحوه استفاده و نگهداری از داده‌ها',
        paragraphs: [
          'دسترسی به اطلاعات مشتریان باید به افراد مجاز و متناسب با مسئولیت آن‌ها محدود شود. استفاده از ابزارهای هوش مصنوعی، سرویس‌های ابری یا سایر خدمات اشخاص ثالث برای پردازش اطلاعات واقعی مشتری، مستلزم بررسی شرایط امنیتی و دریافت مجوز لازم از مشتری است.',
          'بینش تلاش می‌کند با استفاده از تدابیر فنی و اجرایی متناسب، از دسترسی غیرمجاز، افشا، تغییر یا از بین رفتن اطلاعات جلوگیری کند. با این حال، هیچ بستر دیجیتالی را نمی‌توان کاملاً مصون از خطرات امنیتی دانست.'
        ]
      },
      {
        title: '۴. مالکیت اطلاعات و خروجی پروژه',
        paragraphs: [
          'مالکیت داده‌های خام و اطلاعات اختصاصی کسب‌وکار متعلق به مشتری است. نحوه مالکیت، استفاده و تحویل فایل‌ها، داشبوردها، گزارش‌ها و سایر خروجی‌های پروژه بر اساس توافق و قرارداد مربوط به هر همکاری تعیین می‌شود.'
        ]
      },
      {
        title: '۵. استفاده از اطلاعات برای معرفی پروژه‌ها',
        paragraphs: [
          'بینش بدون دریافت اجازه قبلی مشتری، اطلاعات محرمانه، نام کسب‌وکار، داده‌های واقعی یا جزئیات اختصاصی پروژه را در وب‌سایت، نمونه‌کارها، شبکه‌های اجتماعی یا سایر رسانه‌ها منتشر نخواهد کرد.'
        ]
      },
      {
        title: '۶. مدت نگهداری و حذف اطلاعات',
        paragraphs: [
          'مدت نگهداری اطلاعات و نحوه بازگرداندن یا حذف آن‌ها پس از پایان همکاری، بر اساس قرارداد، الزامات قانونی و توافق با مشتری تعیین می‌شود.'
        ]
      },
      {
        title: '۷. اطلاعات بیشتر',
        paragraphs: [
          'جزئیات مربوط به نحوه پردازش اطلاعات، سطح دسترسی، مسئولیت طرفین و تعهدات محرمانگی می‌تواند در قرارداد همکاری یا توافق‌نامه محرمانگی اطلاعات (NDA) به‌صورت مستقل مشخص شود.'
        ]
      }
    ];

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <div className="bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-10 space-y-6">
          <div className="pb-4 border-b border-[#E3EBF0]">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#087A9D]">
              <ShieldCheck className="w-4 h-4 text-[#08A9C5]" />
              <span>اصول حفاظت از اطلاعات در بینش</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <h1 className="text-2xl sm:text-4xl font-bold text-[#062B4D]">
                حریم خصوصی و محرمانگی اطلاعات
              </h1>
              <p className="text-xs sm:text-sm text-[#435466] leading-relaxed">
                حفاظت از داده‌های کسب‌وکار و رعایت اصول محرمانگی در تمامی مراحل مشاوره، تحلیل و طراحی داشبورد از تعهدات پایه در بینش است.
              </p>
            </div>
            <div className="lg:col-span-5">
              <Mascot name="security" className="mx-auto w-full max-w-[340px]" />
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {privacySections.map((sec) => (
              <div
                key={sec.title}
                className="p-6 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] space-y-3"
              >
                <h2 className="text-base sm:text-lg font-bold text-[#062B4D]">
                  {sec.title}
                </h2>
                {sec.paragraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className="text-xs sm:text-sm text-[#435466] leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. CONTACT PAGE (/contact — Pack §14 + §17 + Mascots #7 & #8)
  // =========================================================================
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      setContactError('لطفاً اطلاعات خواسته‌شده را بررسی کنید.');
      return;
    }
    setContactError('');
    setContactSubmitting(true);
    try {
      const res = await submitConsultationRequest({
        fullName: contactName.trim(),
        businessName: contactCompany.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
        service: contactService,
        notes: contactMessage.trim()
      });
      if (res.ok) {
        setContactTrackingCode(res.trackingCode || '');
        setContactSubmitted(true);
      } else {
        setContactError(
          res.error || 'ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.'
        );
      }
    } catch {
      setContactError('ارسال درخواست انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    const res = await trackConsultationByCode(lookupCode.trim());
    setLookupLoading(false);
    if (res.ok && res.request) {
      setLookupResult(res.request);
    } else {
      setLookupError(res.error || 'درخواستی با این کد رهگیری یافت نشد.');
    }
  };

  const hasContactDetails = Boolean(
    contactInfo.phone ||
      contactInfo.email ||
      contactInfo.address ||
      contactInfo.workingHours
  );
  const hasSocialLinks = Boolean(
    contactInfo.linkedin || contactInfo.telegram || contactInfo.otherSocial
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right Column: Intro + Help Mascot (#8) + Verified Contact Info (only if non-null) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#062B4D]">
              با بینش در ارتباط باشید
            </h1>
            <p className="mt-2.5 text-sm text-[#435466] leading-relaxed">
              اگر درباره داشبوردهای مدیریتی، تحلیل مستمر یا مشاوره کسب‌وکار سؤالی دارید، اطلاعات اولیه را ثبت کنید تا بتوانیم نیاز شما را بهتر بشناسیم و درباره مسیر مناسب گفت‌وگو کنیم.
            </p>
          </div>

          <Mascot
            name="help"
            className="mx-auto w-full max-w-[180px] sm:max-w-[220px]"
          />

          {hasContactDetails && (
            <div className="space-y-4 pt-2 border-t border-[#E3EBF0]">
              {contactInfo.phone && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                  <Phone className="w-5 h-5 text-[#08A9C5] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#64748B] block">شماره تماس</span>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="font-mono-num text-sm font-bold text-[#062B4D] hover:text-[#087A9D] dir-ltr block mt-0.5"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.email && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                  <Mail className="w-5 h-5 text-[#08A9C5] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#64748B] block">ایمیل</span>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="font-mono-num text-sm font-bold text-[#062B4D] hover:text-[#087A9D] block mt-0.5"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.address && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                  <MapPin className="w-5 h-5 text-[#08A9C5] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#64748B] block">آدرس</span>
                    <span className="text-xs sm:text-sm font-medium text-[#263B50] block mt-0.5 leading-relaxed">
                      {contactInfo.address}
                    </span>
                  </div>
                </div>
              )}

              {contactInfo.workingHours && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0]">
                  <Clock className="w-5 h-5 text-[#08A9C5] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-[#64748B] block">ساعات پاسخ‌گویی</span>
                    <span className="text-xs sm:text-sm font-medium text-[#263B50] block mt-0.5 leading-relaxed">
                      {contactInfo.workingHours}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasSocialLinks && (
            <div className="pt-4 border-t border-[#E3EBF0] flex flex-wrap gap-2 text-xs">
              {contactInfo.linkedin && (
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-[#435466]"
                >
                  LinkedIn
                </a>
              )}
              {contactInfo.telegram && (
                <a
                  href={contactInfo.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-[#435466]"
                >
                  Telegram
                </a>
              )}
              {contactInfo.otherSocial && (
                <span className="px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-[#435466]">
                  {contactInfo.otherSocial}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Left Column: Consultation Form (§14) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E3EBF0] p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#062B4D] mb-2">
            درخواست جلسه مشاوره
          </h2>
          <p className="text-xs sm:text-sm text-[#435466] mb-6 leading-relaxed">
            با تکمیل اطلاعات زیر، به ما کمک می‌کنید پیش از جلسه، آشنایی اولیه‌ای با کسب‌وکار و نیاز شما داشته باشیم.
          </p>

          {contactSubmitted ? (
            <div className="p-8 rounded-2xl bg-[#EAF7F9]/60 border border-[#08A9C5] text-center space-y-4">
              <Mascot name="success" className="mx-auto w-full max-w-[200px]" />
              <h3 className="text-lg font-bold text-[#062B4D]">
                درخواست شما دریافت شد.
              </h3>
              <p className="text-xs sm:text-sm text-[#435466]">
                پس از بررسی اطلاعات، برای هماهنگی با شما تماس می‌گیریم.
              </p>
              {contactTrackingCode && (
                <div className="p-4 rounded-xl bg-white border border-[#08A9C5]/50 max-w-xs mx-auto space-y-1">
                  <span className="text-[11px] text-[#435466] block">
                    کد رهگیری اختصاصی شما:
                  </span>
                  <span className="font-mono-num text-lg font-bold text-[#062B4D] tracking-wider dir-ltr block">
                    {contactTrackingCode}
                  </span>
                  <span className="text-[11px] text-[#64748B] block">
                    برای پیگیری وضعیت درخواست، این کد را نزد خود نگه دارید.
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setContactSubmitted(false);
                  setContactTrackingCode('');
                  setContactName('');
                  setContactCompany('');
                  setContactPhone('');
                  setContactEmail('');
                  setContactMessage('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium cursor-pointer"
              >
                ثبت درخواست جدید
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {contactError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                  />
                  <span className="block text-[11px] text-[#64748B] mt-1">
                    نام فردی که برای هماهنگی با او ارتباط برقرار می‌کنیم.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                    نام کسب‌وکار
                  </label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                  />
                  <span className="block text-[11px] text-[#64748B] mt-1">
                    نام شرکت یا مجموعه و در صورت امکان حوزه فعالیت.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                    شماره تماس *
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num"
                  />
                  <span className="block text-[11px] text-[#64748B] mt-1">
                    شماره‌ای که امکان هماهنگی از طریق آن وجود داشته باشد.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num"
                  />
                  <span className="block text-[11px] text-[#64748B] mt-1">
                    در صورت تمایل، ایمیل کاری برای ارسال اطلاعات تکمیلی.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                  خدمت موردنظر
                </label>
                <select
                  value={contactService}
                  onChange={(e) => setContactService(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                >
                  {FORM_SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263B50] mb-1.5">
                  توضیحات تکمیلی
                </label>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full p-3.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none"
                />
                <span className="block text-[11px] text-[#64748B] mt-1">
                  مسئله اصلی، نرم‌افزارهای مورد استفاده یا پرسشی که می‌خواهید بررسی شود را بنویسید.
                </span>
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="px-6 py-3 rounded-xl bg-[#087A9D] text-white text-sm font-medium hover:bg-[#062B4D] transition-colors cursor-pointer disabled:opacity-60"
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

      {/* Tracking Lookup Card on /contact */}
      <div className="rounded-2xl bg-white border border-[#E3EBF0] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#062B4D]">
              پیگیری وضعیت درخواست مشاوره با کد رهگیری
            </h2>
            <p className="text-xs sm:text-sm text-[#435466] mt-1">
              اگر قبلاً درخواست مشاوره ثبت کرده‌اید، کد رهگیری خود (مانند BN-123456) را وارد کنید تا آخرین وضعیت بررسی را مشاهده نمایید.
            </p>
          </div>
          <form onSubmit={handleTrackLookup} className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="مثال: BN-123456"
              className="px-3.5 py-2.5 text-sm rounded-xl border border-[#E3EBF0] bg-[#F7FAFC] focus:bg-white focus:border-[#08A9C5] focus:outline-none font-mono-num dir-ltr text-left w-44"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-4 py-2.5 rounded-xl bg-[#062B4D] text-white text-xs font-medium hover:bg-[#087A9D] cursor-pointer disabled:opacity-60"
            >
              {lookupLoading ? 'در حال بررسی...' : 'بررسی وضعیت'}
            </button>
          </form>
        </div>

        {lookupError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {lookupError}
          </div>
        )}

        {lookupResult && (
          <div className="p-4 rounded-xl bg-[#EAF7F9]/60 border border-[#08A9C5] grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#64748B] block">کد رهگیری:</span>
              <strong className="font-mono-num text-[#062B4D] text-sm dir-ltr block mt-0.5">
                {lookupResult.trackingCode}
              </strong>
            </div>
            <div>
              <span className="text-[#64748B] block">نام متقاضی:</span>
              <strong className="text-[#062B4D] block mt-0.5">{lookupResult.fullName}</strong>
            </div>
            <div>
              <span className="text-[#64748B] block">خدمت درخواستی:</span>
              <strong className="text-[#263B50] block mt-0.5">{lookupResult.service}</strong>
            </div>
            <div>
              <span className="text-[#64748B] block">وضعیت فعلی:</span>
              <span className="inline-block mt-0.5 px-2.5 py-1 rounded-lg bg-[#062B4D] text-white font-bold">
                {lookupResult.statusLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* General FAQ (§17) below the form on /contact (showMascot={false} so help mascot appears only once on /contact) */}
      <FaqList items={GENERAL_FAQS} showMascot={false} />
    </div>
  );
};
