import { passwordService } from '../services/passwordService.js';
import { sessionService } from '../services/sessionService.js';

async function runAuthTests() {
  console.log('=================== AUTHENTICATION UNIT TESTS ===================');

  // Test 1: Password Hashing and Verification
  try {
    const plain = 'admin123_secure_password';
    const hash = await passwordService.hashPassword(plain);
    const isValid = await passwordService.verifyPassword(plain, hash);
    const isInvalid = await passwordService.verifyPassword('wrong_password', hash);

    if (isValid && !isInvalid) {
      console.log('✅ TEST 1 PASSED: Password hashing & bcrypt verification works correctly.');
    } else {
      console.error('❌ TEST 1 FAILED: Password verification logic failed.');
    }
  } catch (err) {
    console.error('❌ TEST 1 ERROR:', err);
  }

  // Test 2: Session Creation & Token Verification
  try {
    const mockAdmin = { id: 'admin_test_1', email: 'admin@test.com', name: 'Test Admin', role: 'ADMIN' };
    const session = await sessionService.createSession(mockAdmin);
    const retrieved = await sessionService.getSession(session.sessionToken);

    if (retrieved && retrieved.adminUserId === 'admin_test_1') {
      console.log('✅ TEST 2 PASSED: Session creation & token retrieval works correctly.');
    } else {
      console.error('❌ TEST 2 FAILED: Session retrieval failed.');
    }
  } catch (err) {
    console.error('❌ TEST 2 ERROR:', err);
  }

  // Test 3: Session Invalidation on Logout
  try {
    const mockAdmin = { id: 'admin_test_2', email: 'admin2@test.com', name: 'Test Admin 2', role: 'ADMIN' };
    const session = await sessionService.createSession(mockAdmin);
    await sessionService.invalidateSession(session.sessionToken);
    const retrieved = await sessionService.getSession(session.sessionToken);

    if (retrieved === null) {
      console.log('✅ TEST 3 PASSED: Logout session invalidation works correctly.');
    } else {
      console.error('❌ TEST 3 FAILED: Session was not invalidated after logout.');
    }
  } catch (err) {
    console.error('❌ TEST 3 ERROR:', err);
  }

  console.log('=================================================================');
}

runAuthTests();
