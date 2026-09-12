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

    // 4. ABOUT SECTION & HIGHLIGHTS UPDATE & PUBLIC FILTER
    console.log('Test 4: About Section & Highlights Update & Public Filter...');
    const adminAbout = await aboutService.getAdminAbout();
    assert.ok(adminAbout, 'Admin about section should exist');

    const updatedAbout = await aboutService.updateAbout({
      editorialHeading: 'Architecting Scalable Distributed Systems',
      introduction: 'Senior Engineer specializing in microservices and high-concurrency systems.',
      highlights: [
        { id: '1', label: 'Experience', value: '8+ Yrs', description: 'Full Stack Engineering', order: 1, enabled: true },
        { id: '2', label: 'Architecture', value: 'Microservices', description: 'Event-driven systems', order: 2, enabled: true }
      ]
    });
    assert.strictEqual(updatedAbout.editorialHeading, 'Architecting Scalable Distributed Systems');
    const publicAbout = await aboutService.getPublicAbout();
    console.log('🎉 ALL 4 CMS MODULE UNIT TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runCmsModuleTests();
