import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App.tsx';
import { RoutePath } from '../data/bineshData.ts';
import { SEO_META, SITE_ORIGIN } from '../data/seoMeta.ts';
import { SOLUTIONS_BY_ROUTE, SolutionRoutePath } from '../data/solutionsData.ts';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function serializeSafeJsonLd(payload: unknown): string {
  return JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

interface HeadMetaOptions {
  title: string;
  description: string;
  robots: string;
  canonicalUrl?: string;
  faqJsonLd?: string;
}

function injectHeadMeta(templateHtml: string, opts: HeadMetaOptions): string {
  const safeTitle = escapeHtml(opts.title);
  const safeDesc = escapeHtml(opts.description);
  const safeRobots = escapeHtml(opts.robots);
  const safeCanonical = opts.canonicalUrl ? escapeHtml(opts.canonicalUrl) : '';

  let html = templateHtml;

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  // Replace <meta name="description" ... />
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/>/i,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Replace <meta name="robots" ... />
  html = html.replace(
    /<meta\s+name="robots"[\s\S]*?\/>/i,
    `<meta name="robots" content="${safeRobots}" />`
  );

  // Replace or strip <link rel="canonical" ... />
  if (safeCanonical) {
    html = html.replace(
      /<link\s+rel="canonical"[\s\S]*?\/>/i,
      `<link rel="canonical" href="${safeCanonical}" />`
    );
  } else {
    html = html.replace(/<link\s+rel="canonical"[\s\S]*?\/>\s*/i, '');
  }

  // OpenGraph tags
  html = html.replace(
    /<meta\s+property="og:title"[\s\S]*?\/>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"[\s\S]*?\/>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  if (safeCanonical) {
    html = html.replace(
      /<meta\s+property="og:url"[\s\S]*?\/>/i,
      `<meta property="og:url" content="${safeCanonical}" />`
    );
  }

  // Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"[\s\S]*?\/>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"[\s\S]*?\/>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  if (safeCanonical) {
    html = html.replace(
      /<meta\s+name="twitter:url"[\s\S]*?\/>/i,
      `<meta name="twitter:url" content="${safeCanonical}" />`
    );
  }

  // Inject FAQPage JSON-LD into <head> when applicable
  if (opts.faqJsonLd) {
    const faqTag = `    <script id="binesh-faq-schema" type="application/ld+json">${opts.faqJsonLd}</script>\n  </head>`;
    html = html.replace(/<\/head>/i, faqTag);
  }

  return html;
}

/**
 * Pre-renders any valid route into full crawlable HTML containing
 * route-specific <title>, <meta description>, <link rel="canonical">, H1,
 * main content, FAQPage JSON-LD (for /solutions/*), and semantic <a href="/..."> links.
 */
export function renderPageHtml(templateHtml: string, route: RoutePath): string {
  const meta = SEO_META[route] || SEO_META['/'];
  const canonicalUrl = route === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`;
  const robots = meta.noindex ? 'noindex,nofollow' : 'index,follow';

  let faqJsonLd: string | undefined;
  if (route in SOLUTIONS_BY_ROUTE) {
    const sol = SOLUTIONS_BY_ROUTE[route as SolutionRoutePath];
    if (sol && sol.faqs.length > 0) {
      faqJsonLd = serializeSafeJsonLd({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: sol.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      });
    }
  }

  const appMarkup = renderToStaticMarkup(<App initialRoute={route} />);
  const withHead = injectHeadMeta(templateHtml, {
    title: meta.title,
    description: meta.description,
    robots,
    canonicalUrl: meta.noindex ? undefined : canonicalUrl,
    faqJsonLd
  });

  return withHead.replace('<div id="root"></div>', `<div id="root">${appMarkup}</div>`);
}

/**
 * Renders the branded 404 Not Found HTML with strict noindex,nofollow and no canonical tag.
 */
export function render404Html(templateHtml: string): string {
  const notFoundMarkup = renderToStaticMarkup(<App initialRoute="/" initialNotFound />);
  const withHead = injectHeadMeta(templateHtml, {
    title: 'صفحه یافت نشد (۴۰۴) | بینش',
    description:
      'صفحه موردنظر در وب‌سایت بینش یافت نشد. می‌توانید از طریق صفحه اصلی به خدمات، راهکارها و نمونه‌کارها دسترسی داشته باشید.',
    robots: 'noindex,nofollow'
  });

  return withHead.replace('<div id="root"></div>', `<div id="root">${notFoundMarkup}</div>`);
}
