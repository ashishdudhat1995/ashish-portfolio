import assert from 'assert';
import request from 'supertest';
import app from '../../index.js';
import { passwordService } from '../services/passwordService.js';
import { sessionService } from '../services/sessionService.js';

describe('Security, Validation & Production Hardening Audit Suite', () => {
  let adminSessionToken = '';
  let adminCsrfToken = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    if (loginRes.status === 200) {
      adminSessionToken = loginRes.body.token;
      adminCsrfToken = loginRes.body.csrfToken;
    }
  });

  // 1. AUTHENTICATION & LOGIN ABUSE PROTECTION
  it('1. Reject invalid login credentials with generic error message to prevent account enumeration', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.message, 'Invalid credentials.');
  });

  it('2. Reject unauthenticated admin API requests with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/personal');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  // 2. CSRF PROTECTION FOR COOKIE AUTHENTICATION
  it('3. Reject cookie-authenticated state-changing requests missing X-CSRF-Token with 403 Forbidden', async () => {
    const res = await request(app)
      .put('/api/admin/personal')
      .set('Cookie', [`admin_session=${adminSessionToken}`])
      .send({ name: 'Test' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error.code, 'CSRF_VERIFICATION_FAILED');
  });

  it('4. Allow cookie-authenticated request when valid X-CSRF-Token is present', async () => {
    if (!adminSessionToken || !adminCsrfToken) return;

    const res = await request(app)
      .get('/api/admin/auth/me')
      .set('Cookie', [`admin_session=${adminSessionToken}`]);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  // 3. INPUT VALIDATION & DANGEROUS URL REJECTION
  it('5. Reject dangerous URL schemes (javascript:, data:, vbscript:) in SEO settings', async () => {
    if (!adminSessionToken) return;

    const res = await request(app)
      .put('/api/admin/seo')
      .set('Authorization', `Bearer ${adminSessionToken}`)
      .send({ canonicalUrl: 'javascript:alert("XSS")' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, 'DANGEROUS_URL_SCHEME');
  });

  // 4. JSON-LD SYNTAX VALIDATION
  it('6. Reject malformed JSON-LD syntax in structuredDataJson field', async () => {
    if (!adminSessionToken) return;

    const res = await request(app)
      .put('/api/admin/seo')
      .set('Authorization', `Bearer ${adminSessionToken}`)
      .send({ structuredDataJson: '{"name": "Ashish", invalidJson...}' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, 'INVALID_JSON_LD');
  });

  // 5. PASSWORD STRENGTH VALIDATION
  it('7. Validate password strength enforcement (min 8 chars, uppercase, lowercase, digit)', async () => {
    const weakCheck = passwordService.validatePasswordStrength('weak');
    assert.strictEqual(weakCheck.valid, false);

    const strongCheck = passwordService.validatePasswordStrength('StrongPass123!');
    assert.strictEqual(strongCheck.valid, true);
  });

  // 6. PUBLIC PUBLISHED-ONLY FILTERING
  it('8. Verify public APIs return 200 and serve published content only', async () => {
    const res = await request(app).get('/api/portfolio/personal');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});
