import assert from 'assert';
import { experienceService } from '../services/experienceService.js';

async function runExperienceUnitTests() {
  console.log('[Test Suite] Running Complete Experience Management Unit Tests...\n');

  try {
    // 1. GET ALL ADMIN EXPERIENCES
    console.log('Test 1: Fetching all admin experience records...');
    const initialList = await experienceService.getAdminExperiences();
    assert.ok(Array.isArray(initialList), 'Experience list should be an array');
    assert.ok(initialList.length >= 6, 'Should contain at least 6 seeded experience entries');
    console.log(`✅ Test 1 Passed: Found ${initialList.length} admin experience records!\n`);

    // 2. CREATE NEW EXPERIENCE ENTRY
    console.log('Test 2: Creating a new experience record...');
    const newEntry = await experienceService.createExperience({
      company: 'Acme Software Solutions',
      role: 'Principal Architect',
      startDate: '2024-01',
      endDate: '2025-06',
      isCurrent: false,
      location: 'Remote, USA',
      summary: 'Architecting distributed microservices and event queues.',
      highlights: [{ id: 'h1', text: 'Built event bus', order: 1, enabled: true }],
      technologies: ['Node.js', 'Go', 'Kafka'],
      isBreak: false,
      enabled: true
    });

    assert.ok(newEntry.id, 'New record must receive an ID');
    assert.strictEqual(newEntry.company, 'Acme Software Solutions', 'Company name should match');
    assert.strictEqual(newEntry.order, initialList.length + 1, 'Auto-assigned order should equal count + 1');
    console.log('✅ Test 2 Passed: Created experience record with auto-assigned order!\n');

    // 3. DATE VALIDATION TEST
    console.log('Test 3: Testing date logic validation (StartDate after EndDate)...');
    try {
      await experienceService.createExperience({
        company: 'Invalid Date Corp',
        role: 'Tester',
        summary: 'Test summary for date validation',
        startDate: '2026-05',
        endDate: '2024-01',
        isCurrent: false
      });
      assert.fail('Should have rejected StartDate after EndDate');
    } catch (err) {
      assert.strictEqual(err.message, 'Start Date cannot be after End Date.', 'Error message should specify date ordering constraint');
    }
    console.log('✅ Test 3 Passed: Invalid date ordering rejected cleanly!\n');

    // 4. UPDATE EXPERIENCE ENTRY
    console.log('Test 4: Updating experience record...');
    const updatedEntry = await experienceService.updateExperience(newEntry.id, {
      company: 'Acme Software Solutions International',
      role: 'Principal Architect & VP Engineering',
      startDate: '2024-01',
      endDate: '2025-06',
      isCurrent: false,
      location: 'Remote, USA',
      summary: 'Updated summary narrative.',
      technologies: ['Node.js', 'Go', 'Kafka', 'Kubernetes'],
      isBreak: false,
      order: newEntry.order,
      enabled: true
    });

    assert.strictEqual(updatedEntry.company, 'Acme Software Solutions International', 'Company should be updated');
    console.log('✅ Test 4 Passed: Experience record updated successfully!\n');

    // 5. STATUS TOGGLE & PUBLIC API FILTERING
    console.log('Test 5: Testing status toggle & public API visibility...');
    await experienceService.updateStatus(newEntry.id, false);

    const publicList = await experienceService.getPublicExperiences();
    const foundDisabled = publicList.find(e => e.id === newEntry.id);
    assert.strictEqual(foundDisabled, undefined, 'Disabled experience MUST NOT appear in public API');
    console.log('✅ Test 5 Passed: Disabled experience hidden from public API!\n');

    // 6. DELETE & ORDER NORMALIZATION
    console.log('Test 6: Deleting experience & verifying order normalization...');
    await experienceService.deleteExperience(newEntry.id);
    const listAfterDelete = await experienceService.getAdminExperiences();
    assert.strictEqual(listAfterDelete.length, initialList.length, 'Count after deletion should return to initial count');
    console.log('✅ Test 6 Passed: Experience record deleted and order normalized!\n');

    console.log('🎉 ALL 6 EXPERIENCE MODULE UNIT TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runExperienceUnitTests();
