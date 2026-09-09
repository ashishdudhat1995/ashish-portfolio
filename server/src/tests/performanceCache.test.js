import assert from 'assert';
import request from 'supertest';
import app from '../../index.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

describe('Performance, HTTP Caching & Invalidation Test Suite', () => {
  let adminSessionToken = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    if (loginRes.status === 200) {
      adminSessionToken = loginRes.body.token;
    }
  });

  // 1. PUBLIC API CACHING HEADERS & ETAGS
  it('1. Public API GET endpoints return Cache-Control and ETag headers', async () => {
    const res = await request(app).get('/api/portfolio/personal');

    assert.strictEqual(res.status, 200);
    assert.ok(res.headers['cache-control'], 'Cache-Control header must be present');
    assert.ok(res.headers['cache-control'].includes('public'), 'Cache-Control must specify public');
    assert.ok(res.headers['etag'], 'ETag header must be present');
  });

  it('2. Public API returns 304 Not Modified when matching If-None-Match ETag is sent', async () => {
    const firstRes = await request(app).get('/api/portfolio/personal');
    const etag = firstRes.headers['etag'];

    if (etag) {
      const secondRes = await request(app)
        .get('/api/portfolio/personal')
        .set('If-None-Match', etag);

      assert.strictEqual(secondRes.status, 304);
    }
  });

  // 2. ADMIN API STRICT NO-CACHE BOUNDARY
  it('3. Admin APIs enforce strict Cache-Control: no-store, no-cache headers', async () => {
    if (!adminSessionToken) return;

    const res = await request(app)
      .get('/api/admin/personal')
      .set('Authorization', `Bearer ${adminSessionToken}`);

    assert.ok(res.headers['cache-control'], 'Cache-Control header must be present on admin endpoints');
    assert.ok(res.headers['cache-control'].includes('no-store'), 'Admin endpoints must include no-store');
    assert.ok(res.headers['cache-control'].includes('no-cache'), 'Admin endpoints must include no-cache');
  });

  // 3. PUBLISHING CACHE INVALIDATION
  it('4. Calling cacheService.invalidatePublicCache updates ETag and invalidates 304 responses', async () => {
    const firstRes = await request(app).get('/api/portfolio/personal');
    const oldEtag = firstRes.headers['etag'];

    // Invalidate public cache
    cacheService.invalidatePublicCache();

    const secondRes = await request(app)
      .get('/api/portfolio/personal')
      .set('If-None-Match', oldEtag);

    assert.strictEqual(secondRes.status, 200, 'Must return fresh 200 response after cache invalidation instead of 304');
    assert.notStrictEqual(secondRes.headers['etag'], oldEtag, 'ETag must change after cache invalidation');
  });
});
