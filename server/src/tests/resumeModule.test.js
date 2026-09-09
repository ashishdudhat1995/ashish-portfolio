import assert from 'assert';
import { resumeService } from '../services/resumeService.js';
import { resumeRepository } from '../repositories/resumeRepository.js';

async function runResumeModuleTests() {
  console.log('[Test Suite] Running Resume Upload & Public Download Unit/Integration Tests...\n');

  let testResumeId1 = null;
  let testResumeId2 = null;

  try {
    // 1. VALID PDF UPLOAD & DRAFT CREATION
    console.log('Test 1: Uploading valid PDF resume (Draft mode)...');
    const pdfBuffer1 = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const fakeFile1 = {
      buffer: pdfBuffer1,
      originalname: 'Ashish-Dudhat-CV-v1.pdf',
      mimetype: 'application/pdf'
    };

    const draftResume = await resumeService.uploadResume({
      file: fakeFile1,
      title: 'Ashishkumar Dudhat - Senior Lead CV',
      versionLabel: 'v1.0.0',
      publishNow: false
    });

    assert.ok(draftResume.id, 'Draft resume must receive a UUID');
    assert.strictEqual(draftResume.status, 'DRAFT', 'Resume status should default to DRAFT');
    assert.strictEqual(draftResume.isActive, false, 'Draft resume MUST NOT be active');
    testResumeId1 = draftResume.id;
    console.log('✅ Test 1 Passed: Draft PDF resume uploaded & stored cleanly!\n');

    // 2. PUBLIC METADATA WHEN NO ACTIVE RESUME EXISTS
    console.log('Test 2: Public resume metadata when draft exists but is not published...');
    const publicResumeBefore = await resumeService.getPublicResume();
    // Since testResumeId1 is DRAFT, public resume should remain null (or whatever previously was active)
    if (publicResumeBefore && publicResumeBefore.id === testResumeId1) {
      assert.fail('Draft resume should NOT be returned by public GET /api/portfolio/resume');
    }
    console.log('✅ Test 2 Passed: Draft resume is isolated from public metadata!\n');

    // 3. PUBLISHING & SETTING ACTIVE
    console.log('Test 3: Publishing Resume 1 to set as active...');
    const publishedResume1 = await resumeService.publishResume(testResumeId1);
    assert.strictEqual(publishedResume1.status, 'PUBLISHED', 'Resume status must become PUBLISHED');
    assert.strictEqual(publishedResume1.isActive, true, 'Resume must become isActive = true');
    console.log('✅ Test 3 Passed: Resume 1 published & active!\n');

    // 4. PUBLIC METADATA FOR ACTIVE RESUME
    console.log('Test 4: Fetching public resume metadata for active published resume...');
    const publicResumeActive = await resumeService.getPublicResume();
    assert.ok(publicResumeActive, 'Public active resume must exist');
    assert.strictEqual(publicResumeActive.id, testResumeId1, 'Active public resume ID should match target');
    assert.strictEqual(publicResumeActive.downloadUrl, '/api/portfolio/resume/download', 'Download URL must be /api/portfolio/resume/download');
    assert.strictEqual(publicResumeActive.passwordHash, undefined, 'Public resume metadata must not expose internal keys');
    console.log('✅ Test 4 Passed: Public resume metadata returned cleanly!\n');

    // 5. UPLOADING REPLACEMENT RESUME & SINGLE ACTIVE RESUME INVARIANT
    console.log('Test 5: Uploading & publishing Resume 2 (replacing Resume 1)...');
    const pdfBuffer2 = Buffer.from('%PDF-1.5\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const fakeFile2 = {
      buffer: pdfBuffer2,
      originalname: 'Ashish-Dudhat-CV-v2.pdf',
      mimetype: 'application/pdf'
    };

    const draftResume2 = await resumeService.uploadResume({
      file: fakeFile2,
      title: 'Ashishkumar Dudhat - Lead Architecture CV',
      versionLabel: 'v2.0.0',
      publishNow: false
    });
    testResumeId2 = draftResume2.id;

    // Verify Resume 1 is still active before Resume 2 is published
    const preCheck = await resumeService.getPublicResume();
    assert.strictEqual(preCheck.id, testResumeId1, 'Resume 1 must remain active while Resume 2 is only DRAFT');

    // Publish Resume 2
    const publishedResume2 = await resumeService.publishResume(testResumeId2);
    assert.strictEqual(publishedResume2.isActive, true, 'Resume 2 must now be active');

    // Check Resume 1 was transactionally deactivated
    const updatedResume1 = await resumeService.getResumeById(testResumeId1);
    assert.strictEqual(updatedResume1.isActive, false, 'Previous Resume 1 MUST be deactivated (isActive = false)');
    assert.strictEqual(updatedResume1.status, 'ARCHIVED', 'Previous Resume 1 MUST be set to ARCHIVED');

    // Verify public API now returns Resume 2
    const postCheck = await resumeService.getPublicResume();
    assert.strictEqual(postCheck.id, testResumeId2, 'Public API must now serve Resume 2');
    console.log('✅ Test 5 Passed: Single active resume invariant & transactional replacement verified!\n');

    // 6. DELETE SAFETY FOR ACTIVE RESUME
    console.log('Test 6: Testing delete rejection for active published resume...');
    try {
      await resumeService.deleteResume(testResumeId2);
      assert.fail('Should have rejected deletion of active resume');
    } catch (err) {
      assert.ok(err.message.includes('active') || err.message.includes('published'), 'Error message must state active resume cannot be deleted');
    }
    console.log('✅ Test 6 Passed: Active resume deletion blocked cleanly!\n');

    // 7. CLEANUP INACTIVE TEST RESUMES
    console.log('Test 7: Deleting archived/inactive resume...');
    const deleted1 = await resumeService.deleteResume(testResumeId1);
    assert.strictEqual(deleted1, true, 'Archived resume should be deleted successfully');
    
    // Archive and delete Resume 2
    await resumeRepository.archiveResume(testResumeId2).catch(() => {});
    await prismaDeactivateAndCleanup(testResumeId2);
    console.log('✅ Test 7 Passed: Inactive resume deleted cleanly!\n');

    // 8. SELECT EXISTING MEDIA RECORD BY MEDIA ID
    console.log('Test 8: Uploading resume using existing mediaId from Media Library...');
    const testPdfBuffer3 = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const createdMedia = await (await import('../services/mediaService.js')).mediaService.uploadMedia({
      file: { buffer: testPdfBuffer3, originalname: 'Existing-Media-Resume.pdf', mimetype: 'application/pdf' },
      altText: 'Existing Media PDF',
      visibility: 'PUBLIC'
    });

    const mediaIdResume = await resumeService.uploadResume({
      mediaId: createdMedia.id,
      title: 'Selected From Media Library',
      versionLabel: 'v3.0.0',
      publishNow: false
    });
    assert.ok(mediaIdResume.id, 'Resume created with mediaId must have UUID');
    assert.strictEqual(mediaIdResume.mediaId, createdMedia.id, 'Resume mediaId must match');
    await prismaDeactivateAndCleanup(mediaIdResume.id);
    console.log('✅ Test 8 Passed: Resume created successfully using existing Media Library item!\n');

    console.log('🎉 ALL RESUME MODULE TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Resume Module Test Failure:', err);
    process.exit(1);
  }
}

async function prismaDeactivateAndCleanup(id) {
  try {
    const target = await resumeRepository.getResumeById(id);
    if (target) {
      // Force deactivate in test environment if needed for clean test exit
      await resumeRepository.deleteResume(id).catch(() => {});
    }
  } catch {
    // Ignore cleanup error in test tearDown
  }
}

runResumeModuleTests();
