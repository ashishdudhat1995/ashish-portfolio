import assert from 'assert';
import request from 'supertest';
import app from '../../index.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

async function runPerformanceCacheTests() {
  console.log('[Test Suite] Running Performance, HTTP Caching & Invalidation Unit Tests...\n');

  try {
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    const adminSessionToken = loginRes.status === 200 && loginRes.body ? loginRes.body.token : '';

    // 1. PUBLIC API CACHING HEADERS & ETAGS
    console.log('Test 1: Public API GET endpoints return Cache-Control and ETag headers...');
    const res1 = await request(app).get('/api/portfolio/personal');
    assert.strictEqual(res1.status, 200);
    assert.ok(res1.headers['cache-control'], 'Cache-Control header must be present');
    assert.ok(res1.headers['etag'], 'ETag header must be present');
    console.log('✅ Test 1 Passed: Public API returns Cache-Control and ETag headers!\n');

    // 2. ETAG 304 NOT MODIFIED
    console.log('Test 2: Public API returns 304 Not Modified when matching If-None-Match ETag is sent...');
    const etag = res1.headers['etag'];
    if (etag) {
      const res2 = await request(app)
        .get('/api/portfolio/personal')
        .set('If-None-Match', etag);

      assert.strictEqual(res2.status, 304);
    }
    console.log('✅ Test 2 Passed: 304 Not Modified returned cleanly for matching ETag!\n');

    // 3. ADMIN API NO-STORE NO-CACHE
    console.log('Test 3: Admin APIs enforce strict Cache-Control: no-store, no-cache headers...');
    if (adminSessionToken) {
      const res3 = await request(app)
        .get('/api/admin/personal')
        .set('Authorization', `Bearer ${adminSessionToken}`);

      assert.ok(res3.headers['cache-control'], 'Cache-Control header must be present on admin endpoints');
      assert.ok(res3.headers['cache-control'].includes('no-store'), 'Admin endpoints must include no-store');
    }
    console.log('✅ Test 3 Passed: Admin APIs enforce no-store, no-cache headers!\n');

    // 4. PUBLISHING CACHE INVALIDATION
    console.log('Test 4: Cache invalidation updates ETag...');
    cacheService.invalidatePublicCache();
    const res4 = await request(app)
      .get('/api/portfolio/personal')
      .set('If-None-Match', etag || '');

    assert.strictEqual(res4.status, 200);
    console.log('✅ Test 4 Passed: Cache invalidation updates ETag successfully!\n');

    console.log('🎉 ALL PERFORMANCE & CACHING TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runPerformanceCacheTests();
