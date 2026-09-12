import assert from 'assert';
import request from 'supertest';
import app from '../../index.js';

async function runSeoSiteSettingsTests() {
  console.log('[Test Suite] Running SEO & Site Settings CMS API Endpoints Unit Tests...\n');

  try {
    // 1. Authenticate to obtain valid Admin Bearer token
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
    
    const adminToken = loginRes.body && loginRes.body.token ? loginRes.body.token : '';

    // 1. GET /api/admin/seo requires authentication
    console.log('Test 1: GET /api/admin/seo requires authentication...');
    const res1 = await request(app).get('/api/admin/seo');
    assert.strictEqual(res1.status, 401);
    assert.strictEqual(res1.body.success, false);
    console.log('✅ Test 1 Passed: Authentication required for admin SEO!\n');

    // 2. GET /api/admin/seo returns singleton SEO record for authenticated admin
    console.log('Test 2: GET /api/admin/seo returns singleton SEO record...');
    const res2 = await request(app)
      .get('/api/admin/seo')
      .set('Authorization', `Bearer ${adminToken}`);
    
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.body.success, true);
    assert.ok(res2.body.data.id === 'default-seo' || res2.body.data.id);
    console.log('✅ Test 2 Passed: Singleton SEO record retrieved!\n');

    // 3. PUT /api/admin/seo updates SEO settings successfully
    console.log('Test 3: PUT /api/admin/seo updates SEO settings...');
    const payload3 = {
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

    const res3 = await request(app)
      .put('/api/admin/seo')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload3);

    assert.strictEqual(res3.status, 200);
    assert.strictEqual(res3.body.success, true);
    assert.strictEqual(res3.body.data.title, payload3.title);
    console.log('✅ Test 3 Passed: SEO settings updated successfully!\n');

    // 4. PUT /api/admin/seo rejects invalid canonical URL
    console.log('Test 4: PUT /api/admin/seo rejects invalid canonical URL...');
    const res4 = await request(app)
      .put('/api/admin/seo')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Valid Title',
        description: 'Valid description that meets minimum length requirements.',
        canonicalUrl: 'not-a-valid-url'
      });

    assert.strictEqual(res4.status, 400);
    assert.strictEqual(res4.body.success, false);
    console.log('✅ Test 4 Passed: Invalid canonical URL rejected cleanly!\n');

    // 5. GET /api/portfolio/seo returns safe public SEO metadata
    console.log('Test 5: GET /api/portfolio/seo returns safe public metadata...');
    const res5 = await request(app).get('/api/portfolio/seo');
    assert.strictEqual(res5.status, 200);
    assert.strictEqual(res5.body.success, true);
    assert.ok(res5.body.data.title);
    console.log('✅ Test 5 Passed: Public SEO metadata retrieved!\n');

    // 6. PUT /api/admin/site-settings updates site settings cleanly
    console.log('Test 6: PUT /api/admin/site-settings updates site settings...');
    const payload6 = {
      siteName: 'Ashishkumar Dudhat Enterprise Portfolio',
      defaultTitle: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
      defaultDescription: 'Senior Software Engineer & Lead Engineer specializing in full stack Web Applications.',
      locale: 'en-US',
      timezone: 'Asia/Kolkata',
      maintenanceMode: false
    };

    const res6 = await request(app)
      .put('/api/admin/site-settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload6);

    assert.strictEqual(res6.status, 200);
    assert.strictEqual(res6.body.success, true);
    console.log('✅ Test 6 Passed: Site settings updated cleanly!\n');

    // 7. GET /api/portfolio/site-config returns consolidated public site config
    console.log('Test 7: GET /api/portfolio/site-config returns consolidated config...');
    const res7 = await request(app).get('/api/portfolio/site-config');
    assert.strictEqual(res7.status, 200);
    assert.strictEqual(res7.body.success, true);
    assert.ok(res7.body.data.seo);
    assert.ok(res7.body.data.siteSettings);
    console.log('✅ Test 7 Passed: Consolidated site config retrieved!\n');

    console.log('🎉 ALL SEO & SITE SETTINGS CMS TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runSeoSiteSettingsTests();
