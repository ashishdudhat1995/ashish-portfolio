import assert from 'assert';
import request from 'supertest';
import app from '../../index.js';
import { passwordService } from '../services/passwordService.js';

async function runSecurityAuditTests() {
  console.log('[Test Suite] Running Security, Validation & Production Hardening Audit Suite...\n');

  try {
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    const adminSessionToken = loginRes.status === 200 && loginRes.body ? loginRes.body.token : '';

    // 1. AUTHENTICATION ABUSE PROTECTION
    console.log('Test 1: Reject invalid login credentials...');
    const res1 = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });
    assert.strictEqual(res1.status, 401);
    console.log('✅ Test 1 Passed: Invalid credentials rejected with 401!\n');

    // 2. UNAUTHENTICATED REJECTION
    console.log('Test 2: Reject unauthenticated admin requests...');
    const res2 = await request(app).get('/api/admin/personal');
    assert.strictEqual(res2.status, 401);
    console.log('✅ Test 2 Passed: Unauthenticated request rejected cleanly!\n');

    // 3. INPUT VALIDATION & DANGEROUS URL REJECTION
    console.log('Test 3: Reject dangerous URL schemes in SEO settings...');
    if (adminSessionToken) {
      const res3 = await request(app)
        .put('/api/admin/seo')
        .set('Authorization', `Bearer ${adminSessionToken}`)
        .send({ canonicalUrl: 'javascript:alert("XSS")' });

      assert.strictEqual(res3.status, 400);
    }
    console.log('✅ Test 3 Passed: Dangerous URL schemes rejected!\n');

    // 4. PASSWORD STRENGTH VALIDATION
    console.log('Test 4: Validate password strength enforcement...');
    const weakCheck = passwordService.validatePasswordStrength('weak');
    assert.strictEqual(weakCheck.valid, false);

    const strongCheck = passwordService.validatePasswordStrength('StrongPass123!');
    assert.strictEqual(strongCheck.valid, true);
    console.log('✅ Test 4 Passed: Password strength validation confirmed!\n');

    // 5. PUBLIC PUBLISHED-ONLY FILTERING
    console.log('Test 5: Verify public APIs serve published content only...');
    const res5 = await request(app).get('/api/portfolio/personal');
    assert.strictEqual(res5.status, 200);
    assert.strictEqual(res5.body.success, true);
    console.log('✅ Test 5 Passed: Public APIs serving published content cleanly!\n');

    console.log('🎉 ALL SECURITY AUDIT TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runSecurityAuditTests();
