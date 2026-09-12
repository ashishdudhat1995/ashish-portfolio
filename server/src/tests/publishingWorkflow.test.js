import assert from 'assert';
import { publishingValidationService } from '../services/publishingValidationService.js';
import { publishingRepository } from '../repositories/publishingRepository.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runPublishingWorkflowTests() {
  console.log('[Test Suite] Running Global Portfolio Settings & Draft / Published Workflow Tests...\n');

  try {
    await publishingRepository.getPortfolioSettings();

    // 1. Validate Personal missing fullName
    console.log('Test 1: Validate Personal missing fullName...');
    const errs1 = await publishingValidationService.validatePersonal({
      fullName: '',
      professionalTitle: 'Lead Engineer'
    });
    assert.ok(errs1.some(e => e.field === 'fullName'));
    console.log('✅ Test 1 Passed: Personal validation caught missing fullName!\n');

    // 2. Validate Project missing description
    console.log('Test 2: Validate Project missing description...');
    const errs2 = await publishingValidationService.validateProject({
      name: 'Test Project',
      description: ''
    });
    assert.ok(errs2.some(e => e.field === 'description'));
    console.log('✅ Test 2 Passed: Project validation caught missing description!\n');

    // 3. Validate SEO invalid JSON-LD syntax
    console.log('Test 3: Validate SEO invalid JSON-LD syntax...');
    const errs3 = await publishingValidationService.validateSeo({
      title: 'Valid Title',
      description: 'Valid Meta Description',
      structuredDataEnabled: true,
      structuredDataJson: '{ invalid json syntax }'
    });
    assert.ok(errs3.some(e => e.field === 'structuredDataJson'));
    console.log('✅ Test 3 Passed: SEO validation caught invalid JSON-LD syntax!\n');

    // 4. Pending Drafts Summary
    console.log('Test 4: Get pending drafts summary...');
    const summary = await publishingRepository.getPendingDraftsSummary();
    assert.ok(summary.hasOwnProperty('isFullyPublished'));
    assert.ok(summary.hasOwnProperty('totalDrafts'));
    assert.ok(Array.isArray(summary.draftEntities));
    console.log('✅ Test 4 Passed: Pending drafts summary returned cleanly!\n');

    // 5. Publish Entity
    console.log('Test 5: Publish entity (personal)...');
    const pubRes = await publishingRepository.publishEntity('personal');
    assert.strictEqual(pubRes.success, true);
    assert.strictEqual(pubRes.data.status, 'PUBLISHED');
    console.log('✅ Test 5 Passed: Entity published cleanly!\n');

    console.log('🎉 ALL PUBLISHING WORKFLOW TESTS PASSED CLEANLY!\n');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runPublishingWorkflowTests();
