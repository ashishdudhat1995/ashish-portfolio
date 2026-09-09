# Content Architecture & Publishing Flow Documentation

This document outlines the end-to-end data pipeline, publishing boundary, security model, and API integration strategy for the portfolio.

---

## 1. Single Source of Truth Pipeline

The portfolio relies strictly on a database-backed CMS pipeline:

```
PostgreSQL Database
       ↓
Prisma ORM
       ↓
Backend Repositories & Services
       ↓
Public REST APIs (/api/portfolio/*)
       ↓
Frontend Data Layer (src/services/apiClient.ts & portfolioService.ts)
       ↓
React UI Components (Hero, About, Experience, Skills, Projects, Education, Contact, Footer, SeoHead)
```

No hardcoded portfolio content or duplicate fallback arrays exist in the frontend layer. All personal details, work experience, skill categories, projects, education history, social links, contact info, navigation, SEO metadata, and site configuration originate dynamically from PostgreSQL.

---

## 2. Public API Inventory

All public portfolio endpoints require **no authentication** and enforce strict filtering for `status = 'PUBLISHED'` and `enabled = true`.

| Endpoint | Resource Description | Security Filtering Rules |
| :--- | :--- | :--- |
| `GET /api/portfolio/personal` | Single-record Personal Information | Published snapshot only |
| `GET /api/portfolio/hero` | Single-record Hero section configuration | Published snapshot only |
| `GET /api/portfolio/about` | Single-record About section & narrative | Published snapshot only |
| `GET /api/portfolio/experience` | Work Experience timeline items | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/skills` | Skill categories & child skill items | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/projects` | Portfolio projects | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/education` | Education history records | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/certifications` | Certifications records | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/achievements` | Achievements records | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/social-links` | Social profiles (LinkedIn, GitHub, etc.) | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/contact` | Contact section configuration | `status: PUBLISHED`, `enabled: true` |
| `GET /api/portfolio/navigation` | Site navigation links | `status: PUBLISHED`, `enabled: true`, ordered by `order` |
| `GET /api/portfolio/seo` | Global SEO configuration & meta tags | Published snapshot only |
| `GET /api/portfolio/site-settings` | Global Site Settings & maintenance flags | Published snapshot only |
| `GET /api/portfolio` | Consolidated portfolio payload | All published public content combined |

---

## 3. Draft / Published / Preview Architecture

The CMS enforces a strict published vs. draft boundary to guarantee that unfinished administrator changes never leak to public visitors:

1. **Draft Stage**:
   - Edits made in `/admin` CMS modules update entity draft fields (`status = 'DRAFT'`).
   - Public APIs continue serving `publishedData` snapshots until explicit publishing occurs.

2. **Draft Preview Mode**:
   - Administrators can launch an inline preview modal from `/admin/publishing` or section modules.
   - Preview requests include `?preview=true&token=<ADMIN_TOKEN>`.
   - The server injects `<meta name="robots" content="noindex, nofollow">` to prevent search engine indexing during draft preview.

3. **Publishing Execution**:
   - Clicking **Publish All** or individual **Publish** triggers an atomic Prisma transaction (`prisma.$transaction`).
   - The system validates pre-publish requirements (required fields, JSON-LD syntax, media asset visibility).
   - Valid draft state is snapshot into `publishedData`, `status` changes to `'PUBLISHED'`, `publishedAt` updates, and an entry is logged in `AdminAuditLog`.

---

## 4. Media Library References

- The Media Library (`/admin/media`) serves as the central manager for portfolio imagery and assets.
- Entities reference media items via `profileImageId`, `ogImageId`, `twitterImageId`, `faviconMediaId`, or project media arrays.
- Pre-publish validation verifies that public entities do NOT reference `PRIVATE` or `ARCHIVED` media assets.

---

## 5. Adding New CMS Content Types

To add a new content type to the portfolio:
1. Define the entity model in `server/prisma/schema.prisma` with `status PublishStatus`, `publishedAt DateTime?`, `publishedData Json?`, `version Int`.
2. Add repository queries in `server/src/repositories/` filtering `status: 'PUBLISHED'` and `enabled: true` for public requests.
3. Register the API endpoint under `server/src/routes/portfolioRoutes.js` and public service `server/src/services/portfolioService.js`.
4. Add response TypeScript definitions in `src/types/portfolio.ts`.
5. Update `src/services/apiClient.ts` to expose the new fetch function.
6. Render the data dynamically inside the corresponding React UI component.
