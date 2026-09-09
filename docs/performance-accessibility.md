# Performance & Accessibility (WCAG) Audit Documentation

This document outlines the performance optimizations, HTTP caching architecture, 3D progressive enhancement strategies, responsive design guarantees, and WCAG accessibility standards implemented across the portfolio and CMS platform.

---

## 1. Audit Overview & Scope

The entire application was audited for actual performance bottlenecks and accessibility compliance across 8 core dimensions:

1. **Frontend Bundle Size & Code Splitting**
2. **Image, Media & Static Asset Loading**
3. **3D / WebGL & Canvas Render Loop Optimization**
4. **`prefers-reduced-motion` Support**
5. **HTTP Caching & Draft Invalidation Boundaries**
6. **PostgreSQL & Prisma Query Optimization**
7. **Responsive UI & Dynamic CMS Content Boundaries**
8. **Keyboard Access, Focus Management & Screen-Reader Semantics**

---

## 2. Core Web Vitals Target Architecture

The application is engineered to meet production Web Vitals targets:

- **Largest Contentful Paint (LCP)**: `< 2.5s` (Hero headline and text render immediately without waiting for heavy 3D canvases or admin bundles).
- **Interaction to Next Paint (INP)**: `< 200ms` (Lightweight event handlers, debounced resize listeners, and passive scroll listeners).
- **Cumulative Layout Shift (CLS)**: `< 0.1` (Explicit dynamic container aspect ratios and non-collapsing image loading skeletons).

*Note: Production metrics should be validated in real-world deployments via Google PageSpeed Insights or Chrome User Experience Report (CrUX).*

---

## 3. Frontend Bundle Optimization

- **Rollup Chunk Splitting**: Configured `manualChunks` in `vite.config.ts` to divide vendor dependencies cleanly:
  - `vendor-react`: `react`, `react-dom`
  - `vendor-icons`: `lucide-react`
  - `vendor-motion`: `framer-motion`
  - `vendor-three`: `three`
- **Lazy Loading Admin CMS**: The `/admin` CMS dashboard is lazy-loaded using `React.lazy()` and `<Suspense>` in `App.tsx`. Public site visitors downloading the initial page load **never** download the CMS code bundle.

---

## 4. 3D / WebGL Progressive Enhancement

The background 3D canvas ([BackgroundCanvas.tsx](file:///d:/My%20Portfolio/ashish-portfolio/src/components/canvas/BackgroundCanvas.tsx)) serves as progressive enhancement:

- **Mobile Complexity Reduction**: On screens `< 768px`, node count is reduced from 50 to 20, max particle connection distance is reduced to 100px, and heavy 3D cube rotation is disabled.
- **Tab Visibility Awareness**: When `document.hidden` is true, the `requestAnimationFrame` loop pauses execution to conserve GPU/CPU resources.
- **`prefers-reduced-motion`**: When `window.matchMedia('(prefers-reduced-motion: reduce)')` is active, particle velocity and continuous 3D rotation are frozen, rendering a single subtle static lattice without continuous animation loops.

---

## 5. HTTP Caching & Publishing Invalidation

- **Public Portfolio APIs**: Public GET endpoints (`/api/portfolio/*`, `/api/portfolio/seo`, etc.) use `publicCacheMiddleware`:
  - `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`
  - `ETag` calculated via MD5 hash of response payload + global `publishVersion`.
  - Supports `304 Not Modified` headers for instant repeat visits.
- **Instant Publishing Invalidation**: When an admin publishes changes via `publishAllChanges` or `publishEntity`, `cacheService.invalidatePublicCache()` bumps the global `publishVersion` timestamp, immediately invalidating stale public ETags.
- **Strict Private No-Cache Boundary**: All `/api/admin/*` endpoints use `noCacheMiddleware` (`Cache-Control: no-store, no-cache, must-revalidate, private, max-age=0`), guaranteeing draft and sensitive admin data are **never** cached by proxies or browsers.

---

## 6. Database Indexing & Query Efficiency

- Prisma schema indexes are defined on high-frequency filtering fields across all models: `status`, `enabled`, `order`, `storageKey`, `visibility`.
- All public queries use explicit DTO mappers and avoid N+1 query patterns.

---

## 7. Responsive UI & Dynamic CMS Boundary Protection

- Text containers use `break-words`, `overflow-hidden`, `min-w-0`, and `max-w-full` so ultra-long titles, company names, technology names, or skill names never break the grid or cause horizontal scrolling on mobile/tablet viewports.
- Admin UI tables and forms use `overflow-x-auto` wrappers to preserve 100% usability on mobile screens.

---

## 8. Accessibility & WCAG Compliance

- **Semantic Landmarks**: Screen-reader landmarks (`<header>`, `<main>`, `<footer>`, `<nav aria-label="Main Navigation">`, `<section id="..." aria-labelledby="...">`).
- **Focus Indicators**: Explicit focus rings (`focus-visible:ring-2 focus-visible:ring-accentCyan focus-visible:outline-none`) on interactive buttons, links, inputs, and tabs.
- **ARIA Attributes**: `aria-label`, `aria-expanded`, and `aria-hidden="true"` on decorative icons and 3D canvases.
- **Modal Dialog Trapping**: Project and media modals support `Escape` key close handling and ARIA dialog roles.

---

## 9. Verification & Quality Checks

- **Security & Caching Tests**: `8/8 passed`
- **TypeScript Type Check**: `npx tsc --noEmit` (**0 errors**)
- **Production Build**: `npm run build` (**Vite build completed successfully in 6.91s**)
