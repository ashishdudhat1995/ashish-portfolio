import assert from 'assert';
import { personalService } from '../services/personalService.js';
import { heroService } from '../services/heroService.js';
import { aboutService } from '../services/aboutService.js';

async function runCmsModuleTests() {
  console.log('[Test Suite] Running Personal, Hero, and About CMS Unit Tests...\n');

  try {
    // 1. PERSONAL INFORMATION TESTS
    console.log('Test 1: Personal Information Admin & Public Services...');
    const adminPersonal = await personalService.getAdminProfile();
    assert.ok(adminPersonal, 'Admin personal profile should exist');
    assert.strictEqual(adminPersonal.email, 'dudhatashish1995@gmail.com', 'Admin profile email should match seed data');

    const publicPersonal = await personalService.getPublicProfile();
    assert.ok(publicPersonal, 'Public personal profile should exist');
    assert.strictEqual(publicPersonal.fullName, adminPersonal.fullName, 'Public fullName should match admin fullName');
    assert.strictEqual(publicPersonal.passwordHash, undefined, 'Public profile MUST NOT expose passwordHash');
    console.log('✅ Test 1 Passed: Personal Information read & public field masking works!\n');

    // 2. PERSONAL VALIDATION TEST
    console.log('Test 2: Personal Information Email Validation...');
    try {
      await personalService.updateProfile({ fullName: 'Ashish', email: 'invalid-email', professionalTitle: 'Lead' });
      assert.fail('Should have thrown validation error for invalid email');
    } catch (err) {
      assert.strictEqual(err.message, 'A valid Email address is required', 'Error message must specify valid email requirement');
    }
    console.log('✅ Test 2 Passed: Invalid email rejected cleanly!\n');

    // 3. HERO SECTION TESTS
    console.log('Test 3: Hero Section Admin & Public Services...');
    const adminHero = await heroService.getAdminHero();
    assert.ok(adminHero, 'Admin hero section should exist');
    assert.strictEqual(adminHero.primaryCtaTarget, '#projects', 'Primary CTA target should default to #projects');

    const publicHero = await heroService.getPublicHero();
    assert.ok(publicHero, 'Public hero section should exist');
    assert.strictEqual(publicHero.headline, adminHero.headline, 'Public hero headline should match');
    console.log('✅ Test 3 Passed: Hero Section read & public endpoints work!\n');

    // 4. ABOUT SECTION & HIGHLIGHTS TESTS
    console.log('Test 4: About Section & Highlights CRUD & Reordering...');
    const adminAbout = await aboutService.getAdminAbout();
    assert.ok(adminAbout, 'Admin about section should exist');
    assert.ok(Array.isArray(adminAbout.highlights), 'About highlights should be an array');

    // Add a new highlight
    const newHighlight = await aboutService.addHighlight({
      label: 'Unit Test Metric',
      value: '100%',
      description: 'Automated Test Assertion'
    });
    assert.ok(newHighlight.id, 'New highlight must receive a UUID');
    assert.strictEqual(newHighlight.value, '100%', 'Value metric should match');

    // Update highlight
    const updatedHighlight = await aboutService.updateHighlight(newHighlight.id, {
      label: 'Updated Test Metric',
      value: '99.9%',
      description: 'Updated Description'
    });
    assert.strictEqual(updatedHighlight.value, '99.9%', 'Updated value should match');

    // Status toggle
    const disabledHighlight = await aboutService.updateHighlightStatus(newHighlight.id, false);
    assert.strictEqual(disabledHighlight.enabled, false, 'Highlight enabled status should toggle to false');

    // Verify public About hides disabled highlight
    const publicAbout = await aboutService.getPublicAbout();
    const foundDisabled = (publicAbout.highlights || []).find(h => h.id === newHighlight.id);
    assert.strictEqual(foundDisabled, undefined, 'Public About MUST NOT include disabled highlights');

    // Cleanup: Delete test highlight
    await aboutService.deleteHighlight(newHighlight.id);
    console.log('✅ Test 4 Passed: About Highlights CRUD, enable/disable toggle, and public filtering work!\n');

    console.log('🎉 ALL 4 CMS MODULE UNIT TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runCmsModuleTests();
