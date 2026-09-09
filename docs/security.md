# Production Security & Hardening Documentation

This document outlines the security architecture, authentication policies, authorization boundaries, CSRF/CORS protections, rate limiting, and production readiness guidelines for the portfolio application.

---

## 1. Authentication & Session Security

- **Password Hashing**: Uses `bcrypt` with work factor 12. Password hashes are never stored in plaintext and are strictly excluded from all API responses.
- **Admin Password Policy**: Password updates (`POST /api/admin/auth/change-password`) enforce a minimum of 8 characters, requiring at least 1 uppercase letter, 1 lowercase letter, and 1 number.
- **Session Tokens**: Generated using 256-bit cryptographically secure random bytes (`crypto.randomBytes(32).toString('hex')`).
- **Session Cookie Policy**:
  - `HttpOnly: true` (prevents JavaScript access / XSS token extraction)
  - `Secure: true` in production (`NODE_ENV === 'production'`)
  - `SameSite: 'Lax'` (prevents CSRF while preserving navigation compatibility)
  - `Path: '/'`
- **Session Invalidation**: Logging out (`POST /api/admin/auth/logout`) or changing passwords immediately invalidates all active sessions server-side.

---

## 2. CSRF & CORS Protections

- **CSRF Token Enforcement**:
  - All cookie-authenticated state-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) must include a matching `X-CSRF-Token` header.
  - Missing or invalid CSRF tokens are rejected with `403 Forbidden`.
  - Clients can retrieve active CSRF tokens via `GET /api/admin/auth/csrf`.
- **CORS Allowed Origins**:
  - Production restricts allowed origins via `process.env.ADMIN_ALLOWED_ORIGINS` / `process.env.CLIENT_ORIGIN`.
  - Wildcard origins (`*`) are strictly prohibited for authenticated endpoints with credentials.

---

## 3. Security Headers & Rate Limiting

- **Security Headers (Helmet)**:
  - `Frameguard`: `action: 'deny'` (clickjacking prevention)
  - `X-Content-Type-Options`: `nosniff` (MIME sniffing prevention)
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Strict-Transport-Security` (HSTS enabled in production)
- **Rate Limiters**:
  - **Login Rate Limiter**: 5 attempts per 15 minutes window (`POST /api/admin/auth/login`).
  - **Sensitive Operation Limiter**: 10 attempts per 15 minutes window (Password changes, Publish All).
  - **Media Upload Limiter**: 30 uploads per 15 minutes window (`POST /api/admin/media/upload`).
  - **Public API Rate Limiter**: 300 requests per 15 minutes window (`/api/portfolio/*`).

---

## 4. Input & Output Validation

- **URL Scheme Validation**: All CMS URL fields strictly reject dangerous schemes (`javascript:`, `data:`, `vbscript:`) with `400 Bad Request`.
- **JSON-LD Validation**: The `structuredDataJson` field validates JSON syntax via `JSON.parse` before storing.
- **SVG Sanitization**: SVG uploads are sanitized to strip `<script>` tags, inline event handlers (`onload=`, `onerror=`), and `javascript:` URIs.
- **Output DTO Filtering**: Public APIs return sanitized fields only and exclude internal fields, session tokens, draft records, or private media references.

---

## 5. Production Readiness Checklist

Before deploying to production:

- [ ] `NODE_ENV` is set to `production`.
- [ ] `ADMIN_PASSWORD` is set to a custom strong password in environment variables (never `admin123`).
- [ ] `ADMIN_ALLOWED_ORIGINS` contains exact production domains (e.g. `https://yourdomain.com`).
- [ ] `DATABASE_URL` connects to a secure PostgreSQL instance with TLS enabled.
- [ ] `MAX_UPLOAD_SIZE` is configured appropriately (default 10MB).
- [ ] HTTPS reverse proxy / SSL certificates are active.
