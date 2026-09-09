# Comprehensive Technical Architecture & Content Pipeline

This document defines the technical architecture, data pipeline, publishing workflow, security layer, and media management strategy for the portfolio and CMS platform.

---

## 1. High-Level Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Public Visitors (UI)   │
                          └────────────┬─────────────┘
                                       │ HTTP GET
                                       ▼
                          ┌──────────────────────────┐
                          │  Public Read-Only APIs   │
                          │  (/api/portfolio/*)      │
                          └────────────┬─────────────┘
                                       │
┌──────────────────────────┐           │ Filter: status == 'PUBLISHED'
│  Admin CMS Dashboard UI  │           │ HTTP Caching: ETag + max-age
└────────────┬─────────────┘           │
             │ Auth Session            ▼
             ▼            ┌──────────────────────────┐
┌──────────────────────────┐│   Service / Repository   │
│ Protected Admin REST API ││          Layer           │
│     (/api/admin/*)       │└────────────┬─────────────┘
└────────────┬─────────────┘             │
             │                           │ Prisma ORM
             ▼                           ▼
┌────────────────────────────────────────────────────┐
│              PostgreSQL Database                   │
│  (Personal, Hero, About, Experience, Skills,       │
│   Projects, Education, Certifications, Media, etc) │
└────────────────────────────────────────────────────┘
```

---

## 2. Content Pipeline & Single Source of Truth

**PostgreSQL Database $\rightarrow$ Prisma ORM $\rightarrow$ Express Services $\rightarrow$ REST APIs $\rightarrow$ React Portfolio UI**

- **Database-Driven Content**: No hardcoded resume fallbacks or mock data remain in the frontend bundle.
- **Published vs Draft Separation**:
  - **Public APIs**: Serve content filtered strictly by `status: 'PUBLISHED'` and `enabled: true`.
  - **Admin CMS APIs**: Serve full draft records, metadata, audit trails, and version counters.
  - **Preview API**: `GET /api/admin/preview` returns draft snapshots for authorized admin preview without exposing draft content to public search engine crawlers.

---

## 3. CMS Modules & Data Topology

1. **Personal Information**: Name, title, email, phone, location, availability, bio.
2. **Hero Section**: Headline, subheadline, primary/secondary CTAs, stats counter.
3. **About Section**: Editorial heading, introduction paragraphs, key highlight metrics.
4. **Experience Topology**: Roles, companies, dates, technology tags, responsibilities, metrics.
5. **Skills Topology**: Skill categories, skill items, proficiency ratings, AWS components.
6. **Production Projects**: Titles, category, description, metrics, technology tags, project links, media mockups.
7. **Academic Education**: Degrees, institutions, periods, highlights.
8. **Certifications & Achievements**: Professional certifications, honors, awards.
9. **Social Links & Navigation**: Filtered social channels, brand navbar items.
10. **SEO & Site Settings**: Canonical URLs, meta descriptions, Open Graph images, JSON-LD structured data.
11. **Media Library**: Uploaded files, alt text, captions, visibility tags, mime types.

---

## 4. Draft $\rightarrow$ Validation $\rightarrow$ Transactional Publish Workflow

1. Admin edits content in CMS $\rightarrow$ Saved as `status: 'DRAFT'`.
2. Public website continues serving previous published snapshot.
3. Admin clicks **Publish**:
   - Validation service checks required fields, date formats, and URL schemes.
   - If valid, Prisma transaction atomically updates `status: 'PUBLISHED'`, increments `publishedVersion`, and sets `publishedAt = now()`.
   - `cacheService.invalidatePublicCache()` bumps global ETag version timestamp.
   - Public website updates immediately without server restarts.

---

## 5. Security & Access Control

- **Authentication**: Bcrypt password hashing (work factor 12), HTTP-only cookies (`SameSite=Lax`, `Secure` in production).
- **CSRF & CORS**: Mandatory `X-CSRF-Token` headers for cookie-authenticated mutations. CORS origin restrictions via `ADMIN_ALLOWED_ORIGINS`.
- **Rate Limiting**: Rate limiters applied to login, uploads, sensitive operations, and public read APIs.

---

## 6. Resume Storage & Streaming Architecture

- **Data Model**: `Resume` entity in PostgreSQL references `Media` record (`mediaId`), storing version label, title, status (`DRAFT` | `PUBLISHED` | `ARCHIVED`), and `isActive` boolean flag.
- **Single Active Invariant**: `prisma.$transaction` guarantees that activating a resume atomically sets `isActive = false` and `status = 'ARCHIVED'` for all previous resumes.
- **Validation**: Strict `application/pdf` MIME filtering, magic byte buffer header check (`%PDF-`), and file size restriction via `MAX_RESUME_SIZE_MB` env variable (default: 10MB).
- **Public Streaming**: `GET /api/portfolio/resume/download` streams the PDF file using Node.js Streams (`storageProvider.getFileStream`) with `Content-Disposition: attachment; filename="Ashishkumar-Dudhat-Resume.pdf"` headers without loading whole files into RAM or exposing internal file paths.
- **Delete Safety**: Active published resumes cannot be deleted until replaced or archived. Backup considerations include backing up `server/uploads` directory alongside PostgreSQL database dumps.
