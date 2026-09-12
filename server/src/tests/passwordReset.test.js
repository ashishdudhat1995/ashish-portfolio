import assert from 'assert';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { authController } from '../controllers/authController.js';
import { emailService } from '../services/emailService.js';

function createMockReqRes(body = {}) {
  const req = { body, headers: {}, cookies: {} };
  let statusCode = 200;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
    cookie() {},
    clearCookie() {},
    getStatusCode() { return statusCode; },
    getResponse() { return jsonResponse; }
  };

  return { req, res };
}

async function runPasswordResetTests() {
  console.log('[Test Suite] Running 3-Step Email Verification & Password Reset Unit Tests...\n');

  try {
    const adminEmail = 'dudhatashish1995@gmail.com';

    // 1. STEP 1: Request Forgot Password Code via Email Dispatch
    console.log('Step 1: Requesting forgot password code via email dispatch...');
    const { req: req1, res: res1 } = createMockReqRes({ email: adminEmail });
    let lastDispatchedCode = null;
    const originalSendEmail = emailService.sendPasswordResetEmail;
    emailService.sendPasswordResetEmail = async (email, code) => {
      lastDispatchedCode = code;
      return await originalSendEmail.call(emailService, email, code);
    };

    await authController.forgotPassword(req1, res1);

    assert.strictEqual(res1.getStatusCode(), 200, 'Forgot password request should return HTTP 200');
    const resp1 = res1.getResponse();
    assert.strictEqual(resp1.success, true, 'Response should indicate success');
    assert.strictEqual(resp1.code, undefined, 'API response MUST NOT leak verification code in JSON response');
    console.log('✅ Step 1 Passed: Password reset email dispatched (code omitted from JSON response for security)!');
    console.log(`ℹ️ Live Dispatched Code Captured for Verification: ${lastDispatchedCode}`);

    // 2. STEP 2: Reject Invalid Verification Code
    console.log('\nStep 2a: Testing rejection of invalid 6-digit verification code...');
    const { req: req2a, res: res2a } = createMockReqRes({
      email: adminEmail,
      code: '000000'
    });
    await authController.verifyResetCode(req2a, res2a);
    assert.strictEqual(res2a.getStatusCode(), 400, 'Should reject invalid verification code with HTTP 400');
    console.log('✅ Step 2a Passed: Invalid verification code rejected cleanly!');

    // 3. STEP 2: Verify Code & Obtain Reset Token
    console.log('\nStep 2b: Verifying 6-digit code to obtain single-use resetToken...');
    const { req: req2b, res: res2b } = createMockReqRes({
      email: adminEmail,
      code: lastDispatchedCode
    });
    await authController.verifyResetCode(req2b, res2b);

    assert.strictEqual(res2b.getStatusCode(), 200, 'Code verification should succeed with HTTP 200');
    const resp2b = res2b.getResponse();
    assert.strictEqual(resp2b.verified, true, 'Code verification response should be verified');
    assert.ok(resp2b.resetToken, 'Code verification response should contain single-use resetToken');
    const resetToken = resp2b.resetToken;
    console.log(`✅ Step 2b Passed: 6-Digit code verified cleanly! ResetToken obtained: ${resetToken}`);

    // 4. STEP 3: Reset Password with Verified ResetToken
    console.log('\nStep 3: Setting new password with verified resetToken...');
    const { req: req3, res: res3 } = createMockReqRes({
      email: adminEmail,
      resetToken,
      newPassword: 'NewSecurePassword123!',
      confirmPassword: 'NewSecurePassword123!'
    });
    await authController.resetPassword(req3, res3);

    assert.strictEqual(res3.getStatusCode(), 200, 'Password reset should succeed with HTTP 200');
    assert.strictEqual(res3.getResponse().success, true, 'Reset response should indicate success');
    console.log('✅ Step 3 Passed: Admin password updated successfully!');

    // 5. STEP 4: Verify Admin Login with New Password
    console.log('\nStep 4: Verifying admin login with newly set password...');
    const { req: req4, res: res4 } = createMockReqRes({
      email: adminEmail,
      password: 'NewSecurePassword123!'
    });
    await authController.login(req4, res4);

    assert.strictEqual(res4.getStatusCode(), 200, 'Login with new password should succeed');
    assert.ok(res4.getResponse().token, 'Login response should contain session token');
    console.log('✅ Step 4 Passed: Admin authenticated successfully with new password!');

    // Cleanup: Reset password back to default for test suite continuity
    await authController.resetToDefaultPassword();

    console.log('\n🎉 ALL 3-STEP EMAIL DISPATCH & PASSWORD RESET TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  }
}

runPasswordResetTests();
