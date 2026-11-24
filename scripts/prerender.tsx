import fs from 'fs';
import path from 'path';
import { PUBLIC_PRERENDER_ROUTES, VALID_SPA_ROUTES } from '../src/data/seoMeta.ts';
import { renderPageHtml, render404Html } from '../src/server/prerenderHtml.tsx';

function runPrerender() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');
  const outputBaseDir = path.join(distDir, 'prerendered');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`dist/index.html not found at ${templatePath}. Run "vite build" first.`);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  fs.mkdirSync(outputBaseDir, { recursive: true });

  // Pre-render all valid SPA routes (public routes get full indexable HTML; private routes get noindex shell)
  for (const route of VALID_SPA_ROUTES) {
    const html = renderPageHtml(templateHtml, route);
    const relativeTarget = route === '/' ? 'index.html' : `${route.replace(/^\/+/, '')}.html`;
    const fullTarget = path.resolve(outputBaseDir, relativeTarget);
    if (!fullTarget.startsWith(outputBaseDir + path.sep)) {
      throw new Error(`Unsafe prerender output path: ${fullTarget}`);
    }
    fs.mkdirSync(path.dirname(fullTarget), { recursive: true });
    fs.writeFileSync(fullTarget, html, 'utf-8');
  }

  // Also pre-render the homepage into dist/index.html for static hosts if ever served directly
  fs.writeFileSync(templatePath, renderPageHtml(templateHtml, '/'), 'utf-8');

  // Pre-render branded 404.html with noindex,nofollow
  const notFoundHtml = render404Html(templateHtml);
  fs.writeFileSync(path.join(outputBaseDir, '404.html'), notFoundHtml, 'utf-8');

  console.log(
    `[prerender] Generated ${VALID_SPA_ROUTES.length} route HTML files (${PUBLIC_PRERENDER_ROUTES.length} public indexable) + 404.html in dist/prerendered/`
  );
}

runPrerender();
