/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, ChevronDown, ShieldCheck } from 'lucide-react';
import {
  RoutePath,
  SERVICE_CATEGORIES,
  PORTFOLIO_PLACEHOLDERS,
  INSIGHTS_PLACEHOLDERS,
  PortfolioPlaceholderItem,
  InsightPlaceholderItem
} from './data/bineshData';
import { SEO_META } from './data/seoMeta';
import { contactInfo as defaultContactInfo, ContactInfo } from './data/contactInfo';
import { BineshLogo, ConsultationModal } from './components/BrandComponents';
import { HomePage } from './pages/HomePage';
import { ServicesPages } from './pages/ServicesPages';
import { DemosPages } from './pages/DemosPages';
import { ContentPages } from './pages/ContentPages';
import { PortalAndAuthPages, AuthUserInfo } from './pages/PortalAndAuthPages';
import { AdminPage } from './pages/AdminPage';
import { DesignSystemAndSitemapPage } from './pages/DesignSystemAndSitemapPage';
import { apiFetch, getAuthToken } from './lib/submitRequest';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RoutePath>('/');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
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
  >(INSIGHTS_PLACEHOLDERS);
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
          if (Array.isArray(data.insights) && data.insights.length > 0) {
            setInsightPosts(data.insights);
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

  // Sync with browser pathname on load and popstate
  useEffect(() => {
    const validRoutes: RoutePath[] = [
      '/',
      '/services',
      '/services/dashboards',
      '/services/bi-analytics',
      '/services/consulting',
      '/demos',
      '/portfolio',
      '/insights',
      '/about',
      '/contact',
      '/privacy',
      '/auth',
      '/portal',
      '/admin',
      '/design-system'
    ];
    const rawPath = window.location.pathname;
    if (rawPath === '/demos/web-dashboard' || rawPath === '/demos/power-bi') {
      setCurrentRoute('/demos');
    } else if (validRoutes.includes(rawPath as RoutePath)) {
      setCurrentRoute(rawPath as RoutePath);
    }

    const handlePopState = () => {
      const nextPath = window.location.pathname;
      if (nextPath === '/demos/web-dashboard' || nextPath === '/demos/power-bi') {
        setCurrentRoute('/demos');
      } else if (validRoutes.includes(nextPath as RoutePath)) {
        setCurrentRoute(nextPath as RoutePath);
      } else {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SEO title, description & robots synchronization on route change
  useEffect(() => {
    const meta = SEO_META[currentRoute] || SEO_META['/'];
    document.title = meta.title;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', meta.description);

    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', meta.noindex ? 'noindex' : 'index,follow');
  }, [currentRoute]);

  const handleNavigate = (route: RoutePath) => {
    setCurrentRoute(route);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    try {
      window.history.pushState({}, '', route);
    } catch {
      // Ignore pushState restrictions in sandboxed environments
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConsultation = (serviceTitle?: string) => {
    setConsultationServiceTitle(serviceTitle);
    setConsultationModalOpen(true);
  };

  const isServiceActive = currentRoute.startsWith('/services');
  const isDemoActive = currentRoute.startsWith('/demos');

  const hasAnyContactInfo = Boolean(
    contactInfo.phone ||
      contactInfo.email ||
      contactInfo.address ||
      contactInfo.workingHours ||
      contactInfo.linkedin ||
      contactInfo.telegram ||
      contactInfo.otherSocial
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC] text-[#263B50]" dir="rtl">
      {/* =====================================================================
          STICKY TOP HEADER
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
          {/* Zone 1: Official BINESH Logo */}
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className="focus:outline-none cursor-pointer shrink-0"
          >
            <BineshLogo size="md" />
          </button>

          {/* Zone 2: Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#435466]">
            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentRoute === '/'
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              خانه
            </button>

            {/* Services with submenu */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => handleNavigate('/services')}
                className={`py-1 inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isServiceActive
                    ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                    : 'hover:text-[#062B4D]'
                }`}
              >
                <span>خدمات</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-72 z-50">
                  <div className="bg-white rounded-2xl border border-[#E3EBF0] shadow-lg p-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => handleNavigate('/services')}
                      className="w-full text-right px-3.5 py-2 rounded-xl text-xs font-bold text-[#062B4D] hover:bg-[#F7FAFC] cursor-pointer"
                    >
                      خدمات بینش
                    </button>
                    <div className="h-px bg-[#E3EBF0] my-1" />
                    {SERVICE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleNavigate(cat.route)}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          currentRoute === cat.route
                            ? 'bg-[#EAF7F9] text-[#062B4D] font-bold'
                            : 'text-[#435466] hover:bg-[#F7FAFC] hover:text-[#062B4D]'
                        }`}
                      >
                        <span className="font-mono-num text-[#08A9C5] font-bold ml-1.5">
                          {cat.order}.
                        </span>
                        {cat.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('/demos')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDemoActive
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              دموهای تعاملی
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/portfolio')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentRoute === '/portfolio'
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              نمونه‌کارها
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/insights')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentRoute === '/insights'
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              بینش‌نامه
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/about')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentRoute === '/about'
                  ? 'text-[#087A9D] font-bold border-b-2 border-[#08A9C5]'
                  : 'hover:text-[#062B4D]'
              }`}
            >
              درباره بینش
            </button>
          </nav>

          {/* Zone 3: Auth & Consultation CTA */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {authUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => handleNavigate('/admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentRoute === '/admin'
                    ? 'bg-[#062B4D] text-white'
                    : 'bg-[#EAF7F9] text-[#087A9D] hover:bg-[#062B4D] hover:text-white'
                }`}
              >
                پنل مدیریت
              </button>
            )}
            <button
              type="button"
              onClick={() => handleNavigate(authUser ? '/portal' : '/auth')}
              className={`text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentRoute === '/auth' || currentRoute === '/portal'
                  ? 'text-[#087A9D] font-bold'
                  : 'text-[#435466] hover:text-[#062B4D]'
              }`}
            >
              {authUser ? `حساب من (${authUser.fullName})` : 'ورود / عضویت'}
            </button>

            <button
              type="button"
              onClick={() => handleOpenConsultation()}
              className="px-4 py-2.5 rounded-xl bg-[#087A9D] text-white text-xs font-medium hover:bg-[#062B4D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              درخواست جلسه مشاوره
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenConsultation()}
              className="px-3 py-2 rounded-xl bg-[#087A9D] text-white text-xs font-medium whitespace-nowrap"
            >
              درخواست جلسه مشاوره
            </button>
            <button
              type="button"
              aria-label="منوی موبایل"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#E3EBF0] text-[#062B4D] bg-[#F7FAFC]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E3EBF0] bg-white px-4 py-5 space-y-3 shadow-lg">
            <div className="grid grid-cols-1 gap-1.5 text-sm">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="text-right px-3.5 py-2.5 rounded-xl font-medium text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                خانه
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/services')}
                className="text-right px-3.5 py-2.5 rounded-xl font-medium text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                خدمات
              </button>
              <div className="pr-4 space-y-1 border-r-2 border-[#E3EBF0] mr-3">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleNavigate(cat.route)}
                    className="block w-full text-right px-3 py-2 rounded-lg text-xs text-[#435466] hover:text-[#062B4D]"
                  >
                    • {cat.title}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('/demos')}
                className="text-right px-3.5 py-2.5 rounded-xl font-medium text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                دموهای تعاملی
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/portfolio')}
                className="text-right px-3.5 py-2.5 rounded-xl font-medium text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                نمونه‌کارها
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/insights')}
                className="text-right px-3.5 py-2.5 rounded-xl font-medium text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                بینش‌نامه
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/about')}
                className="text-right px-3.5 py-2.5 rounded-xl font-medium text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                درباره بینش
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/contact')}
                className="text-right px-3.5 py-2.5 rounded-xl font-medium text-[#062B4D] hover:bg-[#F7FAFC]"
              >
                تماس با بینش
              </button>
            </div>

            <div className="pt-3 border-t border-[#E3EBF0] flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleNavigate('/auth')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#F7FAFC] border border-[#E3EBF0] text-xs font-medium text-[#062B4D]"
              >
                ورود / عضویت
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/portal')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#EAF7F9] text-xs font-medium text-[#062B4D]"
              >
                فضای اختصاصی مشتریان
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          MAIN PAGE ROUTER VIEWPORT
      ===================================================================== */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
            portfolioItems={portfolioItems}
            insightPosts={insightPosts}
          />
        )}

        {(currentRoute === '/services' ||
          currentRoute === '/services/dashboards' ||
          currentRoute === '/services/bi-analytics' ||
          currentRoute === '/services/consulting') && (
          <ServicesPages
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {currentRoute === '/demos' && (
          <DemosPages
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {(currentRoute === '/portfolio' ||
          currentRoute === '/insights' ||
          currentRoute === '/about' ||
          currentRoute === '/contact' ||
          currentRoute === '/privacy') && (
          <ContentPages
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
            portfolioItems={portfolioItems}
            insightPosts={insightPosts}
            siteContactInfo={siteContactInfo}
          />
        )}

        {(currentRoute === '/auth' || currentRoute === '/portal') && (
          <PortalAndAuthPages
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            authUser={authUser}
            onAuthChange={setAuthUser}
          />
        )}

        {currentRoute === '/admin' && (
          <AdminPage
            onNavigate={handleNavigate}
            authUser={authUser}
            onAuthChange={setAuthUser}
            onRefreshPublicData={refreshPublicData}
          />
        )}

        {currentRoute === '/design-system' && (
          <DesignSystemAndSitemapPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* =====================================================================
          SECTION 10 — FOOTER (Deep Navy #062B4D — No Logo per 01_LOGO_TASKS.md)
      ===================================================================== */}
      <footer className="bg-[#062B4D] text-white border-t border-[#087A9D]/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            {/* Col 1: Brand Slogan & Short Intro (No Logo) */}
            <div className="lg:col-span-4 space-y-3">
              <p className="text-sm font-bold text-[#3CDDDD]">
                همراه کسب‌وکار شما، با نگاهی تحلیلی
              </p>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                بینش در زمینه هوش تجاری، تحلیل داده و مشاوره کسب‌وکار فعالیت می‌کند. ما به کسب‌وکارها کمک می‌کنیم اطلاعات پراکنده خود را بهتر بشناسند، عملکردشان را با شاخص‌های روشن بررسی کنند و برای تصمیم‌های مدیریتی، تصویری دقیق‌تر و تحلیلی‌تر داشته باشند.
              </p>
            </div>

            {/* Col 2: Main Pages */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-[#3CDDDD]">دسترسی سریع</h3>
              <ul className="space-y-2 text-xs text-white/80">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/')}
                    className="hover:text-white cursor-pointer"
                  >
                    خانه
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/services')}
                    className="hover:text-white cursor-pointer"
                  >
                    خدمات
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/demos')}
                    className="hover:text-white cursor-pointer"
                  >
                    دموهای تعاملی
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/portfolio')}
                    className="hover:text-white cursor-pointer"
                  >
                    نمونه‌کارها
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/insights')}
                    className="hover:text-white cursor-pointer"
                  >
                    بینش‌نامه
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/about')}
                    className="hover:text-white cursor-pointer"
                  >
                    درباره بینش
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/contact')}
                    className="hover:text-white cursor-pointer"
                  >
                    تماس با بینش
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Services Links */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-bold text-[#3CDDDD]">خدمات بینش</h3>
              <ul className="space-y-2 text-xs text-white/80">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/services/dashboards')}
                    className="hover:text-white cursor-pointer text-right"
                  >
                    طراحی و توسعه داشبوردهای مدیریتی
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/services/bi-analytics')}
                    className="hover:text-white cursor-pointer text-right"
                  >
                    تحلیل و پایش مستمر کسب‌وکار
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/services/consulting')}
                    className="hover:text-white cursor-pointer text-right"
                  >
                    مشاوره و کوچینگ کسب‌وکار
                  </button>
                </li>
                <li className="pt-2">
                  <a
                    href="/demo-webapp.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3CDDDD] hover:underline cursor-pointer"
                  >
                    • تجربه دموی وب‌اپلیکیشن
                  </a>
                </li>
                <li>
                  <a
                    href="/demo-powerbi.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3CDDDD] hover:underline cursor-pointer"
                  >
                    • تجربه دموی Power BI
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Portal & Verified Contact */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-bold text-[#3CDDDD]">فضای کاربری و ارتباط</h3>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleNavigate('/portal')}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-right flex items-center justify-between cursor-pointer"
                >
                  <span>فضای اختصاصی همکاری شما با بینش</span>
                  <ShieldCheck className="w-4 h-4 text-[#3CDDDD] shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenConsultation()}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#087A9D] hover:bg-[#08A9C5] text-white text-center font-medium transition-colors cursor-pointer"
                >
                  درخواست جلسه مشاوره
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
                  {contactInfo.linkedin && <div>LinkedIn: {contactInfo.linkedin}</div>}
                  {contactInfo.telegram && <div>Telegram: {contactInfo.telegram}</div>}
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
              <button
                type="button"
                onClick={() => handleNavigate('/privacy')}
                className="hover:text-white cursor-pointer"
              >
                حریم خصوصی و محرمانگی اطلاعات
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleNavigate('/contact')}
                className="hover:text-white cursor-pointer"
              >
                تماس با بینش
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleNavigate('/auth')}
                className="hover:text-white cursor-pointer"
              >
                ورود به حساب بینش
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleNavigate('/admin')}
                className="hover:text-white cursor-pointer"
              >
                پنل مدیریت
              </button>
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
