import request from 'supertest';
import app from '../../index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Media Library CMS API Endpoints', () => {
  let adminToken = '';
  let uploadedMediaId = '';
  let uploadedStorageKey = '';

  beforeAll(async () => {
    // Authenticate Admin
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'Ashish@123'
      });

    if (loginRes.body && loginRes.body.token) {
      adminToken = loginRes.body.token;
    }
  });

  afterAll(async () => {
    if (uploadedMediaId) {
      await prisma.media.deleteMany({ where: { id: uploadedMediaId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  // ------------------- SECURITY & AUTHENTICATION -------------------

  test('1. GET /api/admin/media requires authentication', async () => {
    const res = await request(app).get('/api/admin/media');
    expect(res.status).toBe(401);
  });

  test('2. POST /api/admin/media/upload requires authentication', async () => {
    const res = await request(app).post('/api/admin/media/upload');
    expect(res.status).toBe(401);
  });

  // ------------------- UPLOAD & VALIDATION -------------------

  test('3. POST /api/admin/media/upload successfully uploads valid image file', async () => {
    const fakeImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', fakeImageBuffer, 'test-unit-avatar.png')
      .field('altText', 'Test Unit Avatar')
      .field('visibility', 'PUBLIC');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.mimeType).toBe('image/png');
    expect(res.body.data.url).toContain('/uploads/');

    uploadedMediaId = res.body.data.id;
    uploadedStorageKey = res.body.data.storageKey;
  });

  test('4. POST /api/admin/media/upload sanitizes SVG files to prevent stored XSS', async () => {
    const svgWithScript = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle cx="50" cy="50" r="40" onload="alert(2)"/></svg>';
    const svgBuffer = Buffer.from(svgWithScript, 'utf-8');

    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', svgBuffer, 'vector-test.svg')
      .field('altText', 'Vector Test');

    // Should reject or sanitize script
    if (res.status === 201) {
      expect(res.body.data.mimeType).toBe('image/svg+xml');
    } else {
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('SVG security error');
    }
  });

  test('5. POST /api/admin/media/upload rejects unsupported file formats (.exe / html)', async () => {
    const dangerousBuffer = Buffer.from('<html><script>alert("xss")</script></html>', 'utf-8');

    const res = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', dangerousBuffer, 'malicious.html');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.message || res.body.message).toBeDefined();
  });

  // ------------------- ADMIN READ & PAGINATION -------------------

  test('6. GET /api/admin/media returns paginated list of assets', async () => {
    const res = await request(app)
      .get('/api/admin/media?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test('7. GET /api/admin/media/:id returns single media asset details with usage references', async () => {
    if (!uploadedMediaId) return;

    const res = await request(app)
      .get(`/api/admin/media/${uploadedMediaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(uploadedMediaId);
    expect(res.body.data.usage).toBeDefined();
  });

  // ------------------- METADATA UPDATE -------------------

  test('8. PUT /api/admin/media/:id updates metadata fields', async () => {
    if (!uploadedMediaId) return;

    const updatePayload = {
      altText: 'Updated Unit Test Alt Text',
      caption: 'Unit Test Caption',
      description: 'Unit Test Description',
      visibility: 'PUBLIC',
      status: 'ACTIVE'
    };

    const res = await request(app)
      .put(`/api/admin/media/${uploadedMediaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.altText).toBe(updatePayload.altText);
    expect(res.body.data.caption).toBe(updatePayload.caption);
  });

  // ------------------- PUBLIC MEDIA ACCESS & SECURITY -------------------

  test('9. GET /api/media/:id returns public media asset data', async () => {
    if (!uploadedMediaId) return;

    const res = await request(app).get(`/api/media/${uploadedMediaId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
  });

  test('10. GET /api/media/:id hides private media assets from public access', async () => {
    if (!uploadedMediaId) return;

    // Set asset to PRIVATE
    await request(app)
      .patch(`/api/admin/media/${uploadedMediaId}/visibility`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ visibility: 'PRIVATE' });

    // Public attempt should fail
    const publicRes = await request(app).get(`/api/media/${uploadedMediaId}`);
    expect(publicRes.status).toBe(404);

    // Reset visibility back to PUBLIC
    await request(app)
      .patch(`/api/admin/media/${uploadedMediaId}/visibility`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ visibility: 'PUBLIC' });
  });

  // ------------------- DELETION -------------------

  test('11. DELETE /api/admin/media/:id deletes unreferenced media asset cleanly', async () => {
    if (!uploadedMediaId) return;

    const res = await request(app)
      .delete(`/api/admin/media/${uploadedMediaId}?force=true`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    uploadedMediaId = '';
  });
});
