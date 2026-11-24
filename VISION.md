# BINESH (بینش) | bineshbi.ir

## 1. Business Identity & Goal
- **Brand:** BINESH (بینش) — B2B Business Intelligence consulting & custom management dashboards (Power BI & web apps), based in Shiraz, Iran.
- **Target Audience:** CEOs, CFOs, and sales/operations managers in Iranian trading, distribution, and manufacturing companies (especially Sepidar & Holoo users).
- **Primary Goal:** Generate qualified B2B leads through technical credibility, interactive demos, and SEO-optimized solution/portfolio pages.
- **Standard CTA (Strict):** Always use `جلسه ۳۰ دقیقه‌ای کشف نیاز (رایگان)` consistently across headers, heroes, footers, and landing pages.
- **Official Contact:** Email is strictly `info@bineshbi.ir` (NEVER `info@binesh.ir`). Phone: `09164006698`.

## 2. Tech Stack & Deployment (cPanel Node.js)
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, `lucide-react`.
- **Backend:** Express (`server.ts`, ESM), deployed on cPanel Node.js (v22 / Passenger).
- **Databases:** SQLite (`better-sqlite3`) for internal visitor analytics; MySQL (`mysql2`) for app data.
- **Build Command:** `npm run build` MUST always run `vite build && tsx scripts/prerender.tsx`.
- **Server Bundle:** `server.js` MUST be bundled with `--packages=external`:
  `npx esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=server.js`

## 3. Technical Red Lines (DO NOT BREAK)
- **No Unapproved Packages:** Do NOT add new npm dependencies without explicit user permission. Keep `esbuild` version identical in `devDependencies` and `overrides`.
- **Preserve Pre-rendering:** Every public route (`/`, `/services/*`, `/solutions/*`, `/portfolio/*`, `/demos`, `/about`, `/contact`) must output full static HTML with real `<a href>` links and proper `H1 > H2 > H3` hierarchy.
- **No Soft 404s:** Invalid routes and missing assets must return HTTP `404` with `X-Robots-Tag: noindex, nofollow`.
- **Canonical URLs:** Force `https://bineshbi.ir` (non-www, no trailing slash) via `301` redirects.
- **Protect Server Data:** Never include or overwrite `.env` or SQLite `.db` files in deployment builds.

## 4. UI, Content & SEO Standards
- **Design System:** RTL (`dir="rtl"`), Persian UI, Vazirmatn font, clean corporate palette (`#062B4D`, `#087A9D`, `#08A9C5`, `#F7FAFC`).
- **No Thin/Draft Content:** Draft or "در حال آماده‌سازی" articles must ONLY appear in `/admin`, never on public pages or in `sitemap.xml`.
- **FAQ & Schema:** All FAQ answers (including collapsed items) must be rendered in initial HTML (toggle via CSS only) with `FAQPage` JSON-LD in `<head>`.
- **Analytics:** Filter out bot/crawler User-Agents in SQLite analytics and display timestamps in `Asia/Tehran` time.

## Database Rules (Production on cPanel Only)
- **No DB in Repo:** The live database (SQLite/MySQL) exists ONLY on the cPanel server and is NOT included in this repository or deployment zips. Never commit `.db`, `.sqlite`, or `.env` files.
- **Safe Auto-Migrations:** Any new table or column MUST be added safely on server startup (e.g., `CREATE TABLE IF NOT EXISTS`, checking column existence before `ALTER TABLE`) without dropping tables or losing existing production data.
- **Schema Reference:** Always inspect `server.ts` (or database initialization files) to understand the current schema before writing queries.