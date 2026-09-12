import assert from 'assert';
import request from 'supertest';
import app from '../../index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMediaModuleTests() {
  console.log('[Test Suite] Running Media Library CMS API Endpoints Unit Tests...\n');
  let uploadedMediaId = '';

  try {
    // 1. Authenticate Admin
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    const adminToken = loginRes.body && loginRes.body.token ? loginRes.body.token : '';

    // 1. GET /api/admin/media requires authentication
    console.log('Test 1: GET /api/admin/media requires authentication...');
    const res1 = await request(app).get('/api/admin/media');
    assert.strictEqual(res1.status, 401);
    console.log('✅ Test 1 Passed: Authentication required for admin media!\n');

    // 2. POST /api/admin/media/upload requires authentication
    console.log('Test 2: POST /api/admin/media/upload requires authentication...');
    const res2 = await request(app).post('/api/admin/media/upload');
    assert.strictEqual(res2.status, 401);
    console.log('✅ Test 2 Passed: Authentication required for uploads!\n');

    // 3. POST /api/admin/media/upload uploads valid image file
    console.log('Test 3: POST /api/admin/media/upload uploads valid image file...');
    const fakeImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res3 = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', fakeImageBuffer, 'test-unit-avatar.png')
      .field('altText', 'Test Unit Avatar')
      .field('visibility', 'PUBLIC');

    assert.strictEqual(res3.status, 201);
    assert.strictEqual(res3.body.success, true);
    assert.ok(res3.body.data.id);
    uploadedMediaId = res3.body.data.id;
    console.log('✅ Test 3 Passed: Valid image file uploaded successfully!\n');

    // 4. GET /api/admin/media returns paginated list of assets
    console.log('Test 4: GET /api/admin/media returns paginated list...');
    const res4 = await request(app)
      .get('/api/admin/media?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res4.status, 200);
    assert.strictEqual(res4.body.success, true);
    assert.ok(Array.isArray(res4.body.data));
    console.log('✅ Test 4 Passed: Paginated media list retrieved!\n');

    // 5. GET /api/admin/media/:id returns asset details
    console.log('Test 5: GET /api/admin/media/:id returns single media details...');
    if (uploadedMediaId) {
      const res5 = await request(app)
        .get(`/api/admin/media/${uploadedMediaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res5.status, 200);
      assert.strictEqual(res5.body.success, true);
      assert.strictEqual(res5.body.data.id, uploadedMediaId);
    }
    console.log('✅ Test 5 Passed: Single media asset details retrieved!\n');

    // 6. DELETE /api/admin/media/:id deletes unreferenced asset
    console.log('Test 6: DELETE /api/admin/media/:id deletes media asset...');
    if (uploadedMediaId) {
      const res6 = await request(app)
        .delete(`/api/admin/media/${uploadedMediaId}?force=true`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res6.status, 200);
      assert.strictEqual(res6.body.success, true);
    }
    console.log('✅ Test 6 Passed: Media asset deleted cleanly!\n');

    console.log('🎉 ALL MEDIA MODULE UNIT TESTS PASSED CLEANLY!\n');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runMediaModuleTests();
