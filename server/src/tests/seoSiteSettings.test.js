import request from 'supertest';
import app from '../../index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('SEO & Site Settings CMS API Endpoints', () => {
  let adminToken = '';

  beforeAll(async () => {
    // 1. Authenticate to obtain valid Admin Bearer token
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
    await prisma.$disconnect();
  });

  // ------------------- ADMIN SEO TESTS -------------------

  test('1. GET /api/admin/seo requires authentication', async () => {
    const res = await request(app).get('/api/admin/seo');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('2. GET /api/admin/seo returns singleton SEO record for authenticated admin', async () => {
    const res = await request(app)
      .get('/api/admin/seo')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe('default-seo');
    expect(res.body.data.title).toContain('ASHISHKUMAR DUDHAT');
  });

  test('3. PUT /api/admin/seo updates SEO settings successfully', async () => {
    const payload = {
      title: 'ASHISHKUMAR DUDHAT | Technical Lead & Full Stack Architect',
      description: 'Senior Software Engineer & Technical Lead with 8+ years experience architecting MERN/MEAN apps.',
      keywords: 'Senior Software Engineer, Technical Lead, Node.js, React',
      canonicalUrl: 'https://ashishdudhat.dev',
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: 'ASHISHKUMAR DUDHAT | Technical Lead',
      ogDescription: 'Senior Software Engineer & Lead Engineer.',
      twitterCard: 'summary_large_image',
      structuredDataEnabled: true,
      structuredDataJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Ashishkumar Dudhat"
      })
    };

    const res = await request(app)
      .put('/api/admin/seo')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(payload.title);
    expect(res.body.data.canonicalUrl).toBe(payload.canonicalUrl);
  });

  test('4. PUT /api/admin/seo rejects invalid canonical URL', async () => {
    const payload = {
      title: 'Valid Title',
      description: 'Valid description that meets minimum length requirements.',
      canonicalUrl: 'not-a-valid-url'
    };

    const res = await request(app)
      .put('/api/admin/seo')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Canonical URL must be a valid HTTP or HTTPS URL');
  });

  test('5. PUT /api/admin/seo rejects malformed JSON-LD', async () => {
    const payload = {
      title: 'Valid Title',
      description: 'Valid description that meets minimum length requirements.',
      structuredDataEnabled: true,
      structuredDataJson: '{ invalid_json: true '
    };

    const res = await request(app)
      .put('/api/admin/seo')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.message || res.body.message).toBeDefined();
  });

  // ------------------- PUBLIC SEO TESTS -------------------

  test('6. GET /api/portfolio/seo returns safe public SEO metadata', async () => {
    const res = await request(app).get('/api/portfolio/seo');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBeDefined();
    expect(res.body.data.description).toBeDefined();
    expect(res.body.data.robots).toBeDefined();
  });

  // ------------------- ADMIN SITE SETTINGS TESTS -------------------

  test('7. GET /api/admin/site-settings requires authentication', async () => {
    const res = await request(app).get('/api/admin/site-settings');
    expect(res.status).toBe(401);
  });

  test('8. PUT /api/admin/site-settings updates site settings cleanly', async () => {
    const payload = {
      siteName: 'Ashishkumar Dudhat Enterprise Portfolio',
      defaultTitle: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
      defaultDescription: 'Senior Software Engineer & Lead Engineer specializing in full stack Web Applications.',
      locale: 'en-US',
      timezone: 'Asia/Kolkata',
      maintenanceMode: false
    };

    const res = await request(app)
      .put('/api/admin/site-settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.siteName).toBe(payload.siteName);
  });

  // ------------------- PUBLIC SITE CONFIG TESTS -------------------

  test('9. GET /api/portfolio/site-settings returns safe public site settings', async () => {
    const res = await request(app).get('/api/portfolio/site-settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.siteName).toBeDefined();
    expect(res.body.data.maintenanceMode).toBe(false);
  });

  test('10. GET /api/portfolio/site-config returns consolidated public site configuration', async () => {
    const res = await request(app).get('/api/portfolio/site-config');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.seo).toBeDefined();
    expect(res.body.data.siteSettings).toBeDefined();
    expect(res.body.data.navigation).toBeDefined();
    expect(res.body.data.contact).toBeDefined();
    expect(res.body.data.socialLinks).toBeDefined();
  });
});
