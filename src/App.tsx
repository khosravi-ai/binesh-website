/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, X, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RoutePath,
  PORTFOLIO_PLACEHOLDERS,
  INSIGHTS_PLACEHOLDERS,
  PortfolioPlaceholderItem,
  InsightPlaceholderItem,
  UNIFIED_CTA_LABEL,
  isPublicInsightPost
} from './data/bineshData';
import { SEO_META, SITE_ORIGIN, VALID_SPA_ROUTES } from './data/seoMeta';
import { SolutionRoutePath, SOLUTIONS_BY_ROUTE } from './data/solutionsData';
import {
  contactInfo as defaultContactInfo,
  ContactInfo,
  getSafeExternalUrl
} from './data/contactInfo';
import { BineshLogo, ConsultationModal } from './components/BrandComponents';
import { NavLink } from './components/NavLink';
import { HomePage } from './pages/HomePage';
import { ServicesPages } from './pages/ServicesPages';
import { DemosPages } from './pages/DemosPages';
import { ContentPages } from './pages/ContentPages';
import { SolutionsPages } from './pages/SolutionsPages';
import { PortfolioDetailPage, NotFoundPage } from './pages/PortfolioDetailPage';
import { PortalAndAuthPages, AuthUserInfo } from './pages/PortalAndAuthPages';
import { AdminPage } from './pages/AdminPage';
import { DesignSystemAndSitemapPage } from './pages/DesignSystemAndSitemapPage';
import { apiFetch, getAuthToken } from './lib/submitRequest';

const VALID_ROUTE_SET = new Set<string>(VALID_SPA_ROUTES);

const SOLUTION_ROUTES = new Set<string>([
  '/solutions',
  '/solutions/power-bi-sepidar',
  '/solutions/power-bi-holoo',
  '/solutions/distribution-sales',
  '/solutions/trading-sales',
  '/solutions/finance',
  '/solutions/shiraz'
]);

const PORTFOLIO_DETAIL_ROUTES = new Set<string>([
  '/portfolio/kabino-wood',
  '/portfolio/paytakht-office',
  '/portfolio/takapoo',
  '/portfolio/arya-pakhsh'
]);

function normalizePathname(rawPath: string): string {
  const collapsed = rawPath.replace(/^\/+/, '/');
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.replace(/\/+$/, '') || '/';
  }
  return collapsed || '/';
}

function resolveBrowserPath(rawPath: string): { route: RoutePath; notFound: boolean } {
  const clean = normalizePathname(rawPath);
  if (clean === '/demos/web-dashboard' || clean === '/demos/power-bi') {
    return { route: '/demos', notFound: false };
  }
  if (VALID_ROUTE_SET.has(clean)) {
    return { route: clean as RoutePath, notFound: false };
  }
  return { route: '/', notFound: true };
}

export interface AppProps {
  initialRoute?: RoutePath;
  initialNotFound?: boolean;
}

export default function App({ initialRoute, initialNotFound = false }: AppProps = {}) {
  const isBrowser = typeof window !== 'undefined';

  const initialResolved = (() => {
    if (initialRoute !== undefined || initialNotFound) {
      return { route: initialRoute || ('/' as RoutePath), notFound: initialNotFound };
    }
    if (isBrowser) {
      return resolveBrowserPath(window.location.pathname);
    }
    return { route: '/' as RoutePath, notFound: false };
  })();

  const [currentRoute, setCurrentRoute] = useState<RoutePath>(initialResolved.route);
  const [isNotFound, setIsNotFound] = useState<boolean>(initialResolved.notFound);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [consultationServiceTitle, setConsultationServiceTitle] = useState<string | undefined>(
    undefined
  );

  // Live Database State
  const [portfolioItems, setPortfolioItems] = useState<PortfolioPlaceholderItem[]>(
    PORTFOLIO_PLACEHOLDERS
  );
  const [insightPosts, setInsightPosts] = useState<
    (InsightPlaceholderItem & { content?: string })[]
  >(() => INSIGHTS_PLACEHOLDERS.filter(isPublicInsightPost));
  const [siteContactInfo, setSiteContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [authUser, setAuthUser] = useState<AuthUserInfo | null>(null);

  const refreshPublicData = useCallback(async () => {
    try {
      const res = await fetch('/api/public/bootstrap');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          if (Array.isArray(data.portfolio) && data.portfolio.length > 0) {
            setPortfolioItems(data.portfolio);
          }
          if (Array.isArray(data.insights)) {
            setInsightPosts(data.insights.filter(isPublicInsightPost));
          }
          if (data.contactInfo) {
            setSiteContactInfo(data.contactInfo);
          }
        }
      }
    } catch {
      // Fallback to static data if offline
    }
  }, []);

  useEffect(() => {
    refreshPublicData();
    const token = getAuthToken();
    if (token) {
      apiFetch('/api/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.ok && d.user) {
            setAuthUser(d.user);
          }
        })
        .catch(() => {});
    }
  }, [refreshPublicData]);

  const contactInfo = siteContactInfo;
  const lastTrackedPathRef = useRef<string | null>(null);

  // Sync with browser popstate
  useEffect(() => {
    const syncFromLocation = () => {
      const resolved = resolveBrowserPath(window.location.pathname);
      setCurrentRoute(resolved.route);
      setIsNotFound(resolved.notFound);
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  // SEO title, description, canonical, OpenGraph, Twitter & GA4 SPA pageview sync
  useEffect(() => {
    const upsertMeta = (attr: 'name' | 'property', key: string, value: string) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    if (isNotFound) {
      document.title = 'صفحه یافت نشد (۴۰۴) | بینش';
      upsertMeta(
        'name',
        'description',
        'صفحه موردنظر در وب‌سایت بینش یافت نشد. برای مشاهده خدمات، راهکارها و نمونه‌کارها به صفحه اصلی بازگردید.'
      );
      upsertMeta('name', 'robots', 'noindex,nofollow');
      const canonicalTag = document.querySelector('link[rel="canonical"]');
      if (canonicalTag) {
        canonicalTag.remove();
      }
      return;
    }

    const meta = SEO_META[currentRoute] || SEO_META['/'];
    const canonicalUrl =
      currentRoute === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${currentRoute}`;
    document.title = meta.title;

    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.noindex ? 'noindex,nofollow' : 'index,follow');
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:url', canonicalUrl);

    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // Sync FAQPage JSON-LD in <head> for /solutions/* routes
    const existingFaqScript = document.getElementById('binesh-faq-schema');
    const solutionData =
      currentRoute in SOLUTIONS_BY_ROUTE
        ? SOLUTIONS_BY_ROUTE[currentRoute as SolutionRoutePath]
        : null;
    if (solutionData && solutionData.faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: solutionData.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };
      let scriptEl = existingFaqScript as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'binesh-faq-schema';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(faqSchema);
    } else if (existingFaqScript) {
      existingFaqScript.remove();
    }

    const w = window as unknown as {
      gtag?: (cmd: string, id: string, params?: Record<string, string>) => void;
    };
    if (typeof w.gtag === 'function') {
      w.gtag('config', 'G-ZJNR5RF9EB', {
        page_path: currentRoute,
        page_title: meta.title
      });
    }
  }, [currentRoute, isNotFound]);

  // Internal Visitor Analytics (skip 404 and admin/auth/design-system routes)
  useEffect(() => {
    if (
      isNotFound ||
      currentRoute === '/admin' ||
      currentRoute === '/auth' ||
      currentRoute === '/design-system'
    ) {
      return;
    }
    if (lastTrackedPathRef.current === currentRoute) return;
    lastTrackedPathRef.current = currentRoute;

    const meta = SEO_META[currentRoute] || SEO_META['/'];
    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: currentRoute,
        pageTitle: meta.title,
        referrer: typeof document !== 'undefined' ? document.referrer || '' : ''
      })
    }).catch(() => {
      // Non-blocking analytics beacon
    });
  }, [currentRoute, isNotFound]);

  const handleNavigate = (route: RoutePath) => {
    setIsNotFound(false);
    setCurrentRoute(route);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', route);
      } catch {
        // Ignore pushState restrictions in sandboxed environments
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenConsultation = (serviceTitle?: string) => {
    setConsultationServiceTitle(serviceTitle);
    setConsultationModalOpen(true);
  };

  const isServiceActive = !isNotFound && currentRoute.startsWith('/services');
  const isSolutionActive = !isNotFound && currentRoute.startsWith('/solutions');
  const isDemoActive = !isNotFound && currentRoute.startsWith('/demos');
  const isPortfolioActive = !isNotFound && currentRoute.startsWith('/portfolio');

  const safeInstagramUrl = getSafeExternalUrl(contactInfo.instagram);
  const safeTelegramUrl = getSafeExternalUrl(contactInfo.telegram);
  const safeBaleUrl = getSafeExternalUrl(contactInfo.bale);
  const safeLinkedinUrl = getSafeExternalUrl(contactInfo.linkedin);
  const hasSocialLinks = Boolean(
    safeInstagramUrl || safeTelegramUrl || safeBaleUrl || safeLinkedinUrl
  );

  const hasAnyContactInfo = Boolean(
    contactInfo.phone ||
      contactInfo.email ||
      contactInfo.address ||
      contactInfo.workingHours ||
      hasSocialLinks ||
      contactInfo.otherSocial
  );

  const renderPageContent = () => {
    if (isNotFound) {
      return <NotFoundPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/') {
      return (
        <HomePage
          onNavigate={handleNavigate}
          onOpenConsultation={handleOpenConsultation}
          portfolioItems={portfolioItems}
          insightPosts={insightPosts}
        />
      );
    }

    if (
      currentRoute === '/services' ||
      currentRoute === '/services/dashboards' ||
      currentRoute === '/services/bi-analytics' ||
      currentRoute === '/services/consulting'
    ) {
      return (
        <ServicesPages
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenConsultation={handleOpenConsultation}
        />
      );
    }

    if (SOLUTION_ROUTES.has(currentRoute)) {
      return (
        <SolutionsPages
          currentRoute={currentRoute as '/solutions' | SolutionRoutePath}
          onNavigate={handleNavigate}
          onOpenConsultation={handleOpenConsultation}
        />
      );
    }

    if (PORTFOLIO_DETAIL_ROUTES.has(currentRoute)) {
      return (
        <PortfolioDetailPage
          currentRoute={
            currentRoute as
              | '/portfolio/kabino-wood'
              | '/portfolio/paytakht-office'
              | '/portfolio/takapoo'
              | '/portfolio/arya-pakhsh'
          }
          onNavigate={handleNavigate}
          onOpenConsultation={handleOpenConsultation}
          portfolioItems={portfolioItems}
        />
      );
    }

    if (currentRoute === '/demos') {
      return (
        <DemosPages
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenConsultation={handleOpenConsultation}
        />
      );
    }

    if (
      currentRoute === '/portfolio' ||
      currentRoute === '/insights' ||
      currentRoute === '/about' ||
      currentRoute === '/contact' ||
      currentRoute === '/privacy'
    ) {
      return (
        <ContentPages
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenConsultation={handleOpenConsultation}
          portfolioItems={portfolioItems}
          insightPosts={insightPosts}
          siteContactInfo={siteContactInfo}
        />
      );
    }

    if (currentRoute === '/auth') {
      return (
        <PortalAndAuthPages
          currentRoute="/auth"
          onNavigate={handleNavigate}
          authUser={authUser}
          onAuthChange={setAuthUser}
        />
      );
    }

    if (currentRoute === '/admin') {
      return (
        <AdminPage
          onNavigate={handleNavigate}
          authUser={authUser}
          onAuthChange={setAuthUser}
          onRefreshPublicData={refreshPublicData}
        />
      );
    }

    if (currentRoute === '/design-system') {
      return authUser?.role === 'admin' ? (
        <DesignSystemAndSitemapPage onNavigate={handleNavigate} />
      ) : (
        <NotFoundPage onNavigate={handleNavigate} />
      );
    }

    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC] text-[#263B50]" dir="rtl">
      {/* =====================================================================
          STICKY TOP HEADER (Semantic <a href> Primary Navigation + Unified CTA)
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBF0]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Zone 1: Official BINESH Logo */}
          <NavLink
            href="/"
            onNavigate={handleNavigate}
            aria-label="صفحه اصلی بینش"
            className="focus:outline-none shrink-0"
          >
            <BineshLogo size="md" />
          </NavLink>

          {/* Zone 2: Semantic Primary Navigation */}
          <nav
            aria-label="منوی اصلی"
            className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#435466]"
          >
            <NavLink
              href="/"
              onNavigate={handleNavigate}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isNotFound && currentRoute === '/'
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              خانه
            </NavLink>

            <NavLink
              href="/services"
              onNavigate={handleNavigate}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                isServiceActive
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              خدمات
            </NavLink>

            <NavLink
              href="/solutions"
              onNavigate={handleNavigate}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                isSolutionActive
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              راهکارها
            </NavLink>

            <NavLink
              href="/demos"
              onNavigate={handleNavigate}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                isDemoActive
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              دموهای تعاملی
            </NavLink>

            <NavLink
              href="/portfolio"
              onNavigate={handleNavigate}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                isPortfolioActive
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              نمونه‌کارها
            </NavLink>
          </nav>

          {/* Zone 3: Admin Badge (only if admin) & Unified Conversion CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {authUser?.role === 'admin' && (
              <NavLink
                href="/admin"
                onNavigate={handleNavigate}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  currentRoute === '/admin'
                    ? 'bg-[#062B4D] text-white'
                    : 'bg-[#EAF7F9] text-[#087A9D] hover:bg-[#062B4D] hover:text-white'
                }`}
              >
                پنل مدیریت
              </NavLink>
            )}

            <button
              type="button"
              onClick={() => handleOpenConsultation()}
              className="px-4 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-bold hover:bg-[#062B4D] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              {UNIFIED_CTA_LABEL}
            </button>
          </div>

          {/* Mobile & Tablet Quick Actions & Hamburger Button */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={`tel:${contactInfo.phone || '09164006698'}`}
              aria-label="تماس تلفنی مستقیم"
              className="p-2 rounded-xl bg-[#EAF7F9] text-[#087A9D] border border-[#08A9C5]/30 shrink-0"
              title="تماس تلفنی با یک لمس"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => handleOpenConsultation()}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#087A9D] text-white text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="sm:hidden">جلسه رایگان ۳۰ دقیقه‌ای</span>
              <span className="hidden sm:inline">{UNIFIED_CTA_LABEL}</span>
            </button>
            <button
              type="button"
              aria-label="منوی موبایل"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#E3EBF0] text-[#062B4D] bg-[#F7FAFC] shrink-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E3EBF0] bg-white px-4 py-5 space-y-3 shadow-lg">
            <div className="grid grid-cols-1 gap-1.5 text-sm">
              <NavLink
                href="/"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2.5 rounded-xl font-bold text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                خانه
              </NavLink>
              <NavLink
                href="/services"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2.5 rounded-xl font-bold text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                خدمات
              </NavLink>
              <NavLink
                href="/solutions"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2.5 rounded-xl font-bold text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                راهکارهای هوش تجاری
              </NavLink>
              <NavLink
                href="/demos"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2.5 rounded-xl font-bold text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                دموهای تعاملی
              </NavLink>
              <NavLink
                href="/portfolio"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2.5 rounded-xl font-bold text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                نمونه‌کارها
              </NavLink>

              <div className="h-px bg-[#E3EBF0] my-1" />

              <NavLink
                href="/insights"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2 rounded-xl text-xs font-medium text-[#435466] hover:bg-[#F7FAFC]"
              >
                بینش‌نامه (مقالات آموزشی)
              </NavLink>
              <NavLink
                href="/about"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2 rounded-xl text-xs font-medium text-[#435466] hover:bg-[#F7FAFC]"
              >
                درباره بینش
              </NavLink>
              <NavLink
                href="/contact"
                onNavigate={handleNavigate}
                className="text-right px-3.5 py-2 rounded-xl text-xs font-medium text-[#435466] hover:bg-[#F7FAFC]"
              >
                تماس با بینش
              </NavLink>
            </div>

            {/* Mobile Quick Direct Contact Bar */}
            <div className="pt-3 border-t border-[#E3EBF0] grid grid-cols-2 gap-2">
              <a
                href={`tel:${contactInfo.phone || '09164006698'}`}
                className="py-2.5 px-3 rounded-xl bg-[#062B4D] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#3CDDDD]" />
                <span>تماس تلفنی مستقیم</span>
              </a>
              <NavLink
                href={authUser?.role === 'admin' ? '/admin' : '/contact'}
                onNavigate={handleNavigate}
                className="py-2.5 px-3 rounded-xl bg-[#EAF7F9] text-xs font-bold text-[#062B4D] text-center"
              >
                {authUser?.role === 'admin' ? 'پنل مدیریت' : 'تماس با بینش'}
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          MAIN PAGE ROUTER VIEWPORT (Plain DOM on SSR, Motion in Browser)
      ===================================================================== */}
      <main className="flex-1">
        {isBrowser ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isNotFound ? 'not-found' : currentRoute}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {renderPageContent()}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div>{renderPageContent()}</div>
        )}
      </main>

      {/* =====================================================================
          FOOTER (Deep Navy #062B4D — Semantic <a href> Links & Unified CTA)
      ===================================================================== */}
      <footer className="bg-[#062B4D] text-white border-t border-[#087A9D]/30 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/15">
            {/* Col 1: Brand Slogan & Intro */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-3">
              <p className="text-sm font-bold text-[#3CDDDD]">
                همراه کسب‌وکار شما، با نگاهی تحلیلی
              </p>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                بینش، شریک تحلیلی و مهندسی کسب‌وکار شماست. ما داده‌های خام و پراکنده فروش، مالی و انبار را به داشبوردهای مدیریتی دقیق (Power BI و وب‌اپلیکیشن‌های اختصاصی) تبدیل می‌کنیم تا مغایرت‌ها را در نطفه کشف کنید و بر اساس واقعیت‌های عددی تصمیم بگیرید.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-xs font-bold text-[#3CDDDD]">دسترسی سریع</h2>
              <ul className="space-y-2 text-xs text-white/80">
                <li>
                  <NavLink href="/" onNavigate={handleNavigate} className="hover:text-white">
                    خانه
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/services"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    خدمات
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/solutions"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    راهکارها
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/demos" onNavigate={handleNavigate} className="hover:text-white">
                    دموهای تعاملی
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/portfolio"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    نمونه‌کارها
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/insights"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    بینش‌نامه
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/about" onNavigate={handleNavigate} className="hover:text-white">
                    درباره بینش
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/contact"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    تماس با بینش
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Col 3: Services & Key Solutions Links */}
            <div className="lg:col-span-3 space-y-3">
              <h2 className="text-xs font-bold text-[#3CDDDD]">خدمات و راهکارهای تخصصی</h2>
              <ul className="space-y-2 text-xs text-white/80">
                <li>
                  <NavLink
                    href="/services/dashboards"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    طراحی و توسعه داشبوردهای مدیریتی
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/services/bi-analytics"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    تحلیل و پایش مستمر کسب‌وکار
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/services/consulting"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    مشاوره و کوچینگ کسب‌وکار
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/solutions/power-bi-sepidar"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    اتصال Power BI به نرم‌افزار سپیدار
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/solutions/power-bi-holoo"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    اتصال Power BI به نرم‌افزار هلو
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/solutions/distribution-sales"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    هوش تجاری فروش پخش و بازرگانی
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/solutions/finance"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    داشبورد مالی و کنترل نقدینگی
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/solutions/shiraz"
                    onNavigate={handleNavigate}
                    className="hover:text-white"
                  >
                    هوش تجاری و داشبورد در شیراز
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Col 4: Verified Contact & Unified Consultation CTA */}
            <div className="lg:col-span-3 space-y-3">
              <h2 className="text-xs font-bold text-[#3CDDDD]">فضای کاربری و ارتباط</h2>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenConsultation()}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#08A9C5] hover:bg-[#3CDDDD] text-[#062B4D] text-center font-bold transition-colors cursor-pointer"
                >
                  {UNIFIED_CTA_LABEL}
                </button>
              </div>
              {hasAnyContactInfo && (
                <div className="pt-2 text-xs text-white/75 space-y-1.5 leading-relaxed">
                  {contactInfo.phone && (
                    <div>
                      شماره تماس:{' '}
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="font-mono-num hover:text-white"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {contactInfo.email && (
                    <div>
                      ایمیل:{' '}
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="font-mono-num hover:text-white"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  )}
                  {contactInfo.address && <div>آدرس: {contactInfo.address}</div>}
                  {contactInfo.workingHours && (
                    <div>ساعات پاسخ‌گویی: {contactInfo.workingHours}</div>
                  )}
                  {hasSocialLinks && (
                    <div
                      className="pt-2 flex flex-wrap items-center gap-2.5"
                      aria-label="شبکه‌های اجتماعی بینش"
                    >
                      {safeInstagramUrl && (
                        <a
                          href={safeInstagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="اینستاگرام بینش"
                          title="اینستاگرام بینش"
                          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#08A9C5] hover:text-[#062B4D] text-white inline-flex items-center justify-center transition-colors"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                            <circle cx="12" cy="12" r="4.2" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                          </svg>
                        </a>
                      )}
                      {safeTelegramUrl && (
                        <a
                          href={safeTelegramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="تلگرام بینش"
                          title="تلگرام بینش"
                          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#08A9C5] hover:text-[#062B4D] text-white inline-flex items-center justify-center transition-colors"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <path d="M21.5 3.5L2.8 10.7c-.9.35-.88 1.63.03 1.95l4.7 1.65 1.8 5.4c.28.83 1.33 1.07 1.94.44l2.7-2.75 4.9 3.6c.77.56 1.86.14 2.06-.8L22.9 4.8c.18-.87-.62-1.6-1.4-1.3z" />
                            <path d="M7.5 14.3L19.5 6.5" />
                          </svg>
                        </a>
                      )}
                      {safeBaleUrl && (
                        <a
                          href={safeBaleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="پیام‌رسان بله بینش"
                          title="پیام‌رسان بله بینش"
                          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#08A9C5] hover:text-[#062B4D] text-white inline-flex items-center justify-center transition-colors"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <path d="M12 3a8.5 8.5 0 0 0-7.4 12.6L3.5 20.5l5-1.1A8.5 8.5 0 1 0 12 3z" />
                            <path d="M8.8 12.3l2.2 2.2 4.6-4.8" />
                          </svg>
                        </a>
                      )}
                      {safeLinkedinUrl && (
                        <a
                          href={safeLinkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="لینکدین بینش"
                          title="لینکدین بینش"
                          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#08A9C5] hover:text-[#062B4D] text-white inline-flex items-center justify-center transition-colors"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
                            <path d="M8 11v6" />
                            <circle cx="8" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
                            <path d="M12 17v-6" />
                            <path d="M12 13.5a2.5 2.5 0 0 1 5 0V17" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                  {contactInfo.otherSocial && <div>{contactInfo.otherSocial}</div>}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <div>
              © تمامی حقوق مادی و معنوی این وب‌سایت متعلق به برند بینش (Binesh) است.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <NavLink href="/privacy" onNavigate={handleNavigate} className="hover:text-white">
                حریم خصوصی و محرمانگی اطلاعات
              </NavLink>
              <span>·</span>
              <NavLink href="/contact" onNavigate={handleNavigate} className="hover:text-white">
                تماس با بینش
              </NavLink>
              <span>·</span>
              <NavLink href="/auth" onNavigate={handleNavigate} className="hover:text-white">
                ورود به حساب بینش
              </NavLink>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Consultation Request Modal */}
      <ConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService={consultationServiceTitle}
      />
    </div>
  );
}
