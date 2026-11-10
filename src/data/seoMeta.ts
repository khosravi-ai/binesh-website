/**
 * SEO titles & meta descriptions — taken verbatim from content/BINESH_Content_Pack_v0_1.txt §19
 * (the 3 rows marked noindex are internal/private pages; their strings come from §15/§16).
 * Wire this into App.tsx: on every route change set document.title, the
 * <meta name="description"> content, and <meta name="robots"> (noindex when flagged).
 */
export interface SeoEntry { title: string; description: string; noindex?: boolean }

export const SEO_META: Record<string, SeoEntry> = {
  "/": {
    "title": "بینش | هوش تجاری، تحلیل داده و مشاوره کسب‌وکار",
    "description": "بینش با طراحی داشبوردهای مدیریتی، تحلیل مستمر و مشاوره کسب‌وکار به شناخت بهتر عملکرد و تصمیم‌گیری آگاهانه‌تر کمک می‌کند."
  },
  "/services": {
    "title": "خدمات بینش | داشبورد مدیریتی، تحلیل و مشاوره",
    "description": "با سه مسیر همکاری بینش آشنا شوید: طراحی داشبوردهای مدیریتی، تحلیل و پایش مستمر کسب‌وکار و مشاوره و کوچینگ."
  },
  "/services/dashboards": {
    "title": "طراحی داشبورد مدیریتی و Power BI | بینش",
    "description": "طراحی داشبوردهای تحت وب و Power BI، یکپارچه‌سازی داده‌ها، تعریف KPI و خودکارسازی گزارش‌های مدیریتی متناسب با نیاز کسب‌وکار."
  },
  "/services/bi-analytics": {
    "title": "تحلیل و پایش مستمر کسب‌وکار | بینش",
    "description": "گزارش‌های تحلیلی هفتگی و ماهانه، تحلیل فروش و مالی، پایش KPI و بررسی داده‌محور پرسش‌های مدیریتی."
  },
  "/services/consulting": {
    "title": "مشاوره و کوچینگ کسب‌وکار | بینش",
    "description": "همراهی در تعیین اهداف، تعریف شاخص‌های عملکرد، بررسی نتایج و پیگیری اقدامات بهبود کسب‌وکار."
  },
  "/demos": {
    "title": "دموی تعاملی داشبورد وب و Power BI | بینش",
    "description": "تجربه دو سناریوی نمایشی برای آشنایی با داشبورد مدیریتی تحت وب و گزارش تعاملی Power BI."
  },
  "/portfolio": {
    "title": "نمونه‌کارهای تحلیل داده و داشبورد مدیریتی | بینش",
    "description": "مطالعات موردی و نمونه پروژه‌های قابل انتشار در حوزه هوش تجاری، داشبورد مدیریتی و تحلیل کسب‌وکار."
  },
  "/insights": {
    "title": "مقالات و آموزش هوش تجاری و تحلیل داده | بینش",
    "description": "مقالات، ویدئوها و راهنماهای کاربردی درباره هوش تجاری، تحلیل داده، KPI و مدیریت عملکرد."
  },
  "/about": {
    "title": "درباره بینش | همراه کسب‌وکار با نگاهی تحلیلی",
    "description": "با رویکرد، فلسفه فعالیت و شبکه همکاران تخصصی بینش در حوزه هوش تجاری و تحلیل کسب‌وکار آشنا شوید."
  },
  "/contact": {
    "title": "تماس با بینش | درخواست جلسه مشاوره",
    "description": "برای بررسی نیازهای تحلیلی، طراحی داشبورد یا مشاوره کسب‌وکار با بینش در ارتباط باشید."
  },
  "/privacy": {
    "title": "حریم خصوصی و محرمانگی اطلاعات | بینش",
    "description": "اصول حفظ حریم خصوصی، محرمانگی داده‌های کسب‌وکار، مالکیت اطلاعات و نحوه نگهداری داده‌ها در بینش."
  },
  "/auth": {
    "title": "ورود به حساب بینش | بینش",
    "description": "برای دسترسی به فضای کاربری خود، اطلاعات حساب را وارد کنید.",
    "noindex": true
  },
  "/portal": {
    "title": "فضای اختصاصی همکاری شما با بینش | بینش",
    "description": "در این فضا، اطلاعات و خروجی‌های مرتبط با همکاری فعال شما در دسترس قرار می‌گیرند.",
    "noindex": true
  },
  "/admin": {
    "title": "پنل مدیریت یکپارچه | بینش",
    "description": "مدیریت درخواست‌های مشاوره، نمونه‌کارها، بینش‌نامه، اطلاعات تماس و پورتال مشتریان.",
    "noindex": true
  },
  "/design-system": {
    "title": "Binesh Design System",
    "description": "صفحه داخلی راهنمای هویت بصری.",
    "noindex": true
  }
};
