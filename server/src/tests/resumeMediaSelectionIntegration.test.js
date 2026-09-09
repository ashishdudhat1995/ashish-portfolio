import assert from 'assert';
import { mediaService } from '../services/mediaService.js';
import { resumeService } from '../services/resumeService.js';
import { resumeRepository } from '../repositories/resumeRepository.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

async function runMediaSelectionIntegrationTest() {
  console.log('[Test Suite] Running Resume Selection from Media Library Integration Test...\n');

  let createdMediaId = null;
  let createdResumeId = null;

  try {
    // 1. Upload a PDF document directly into Media Library
    console.log('Step 1: Uploading a PDF document to Media Library...');
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const mediaItem = await mediaService.uploadMedia({
      file: {
        buffer: pdfBuffer,
        originalname: 'Ashish-Dudhat-Media-Resume.pdf',
        mimetype: 'application/pdf'
      },
      altText: 'Ashishkumar Dudhat Resume PDF',
      caption: 'PDF Document for Portfolio',
      visibility: 'PUBLIC'
    });

    assert.ok(mediaItem.id, 'Media item must have a valid UUID');
    createdMediaId = mediaItem.id;
    console.log(`✅ Step 1 Passed: Media item uploaded (ID: ${mediaItem.id})\n`);

    // 2. Select the existing Media item in Resume module with publishNow = true
    console.log('Step 2: Selecting existing Media item by mediaId and publishing immediately...');
    const resumeRecord = await resumeService.uploadResume({
      mediaId: createdMediaId,
      title: 'Ashishkumar Dudhat - Senior Lead Resume',
      versionLabel: 'v3.5.0',
      publishNow: true
    });

    assert.ok(resumeRecord.id, 'Resume record must have a valid UUID');
    assert.strictEqual(resumeRecord.mediaId, createdMediaId, 'Resume mediaId must match selected media');
    assert.strictEqual(resumeRecord.status, 'PUBLISHED', 'Resume status must be PUBLISHED');
    assert.strictEqual(resumeRecord.isActive, true, 'Resume must be active');
    createdResumeId = resumeRecord.id;
    console.log(`✅ Step 2 Passed: Resume created & set active using mediaId (ID: ${resumeRecord.id})\n`);

    // 3. Fetch public resume metadata from GET /api/portfolio/resume endpoint
    console.log('Step 3: Fetching public resume metadata for website...');
    const publicData = await resumeService.getPublicResume();

    assert.ok(publicData, 'Public resume metadata must exist');
    assert.strictEqual(publicData.id, createdResumeId, 'Public resume ID must match published resume');
    assert.strictEqual(publicData.downloadUrl, '/api/portfolio/resume/download', 'Download URL must be present');
    assert.ok(publicData.filename.toLowerCase().includes('pdf'), 'Filename must be present for download button');
    console.log('✅ Step 3 Passed: Website public resume metadata returned with downloadUrl!\n');

    // 4. Clean up test records
    console.log('Step 4: Cleaning up test records...');
    await resumeService.deleteResume(createdResumeId);
    console.log('✅ Step 4 Passed: Test records cleaned up successfully!\n');

    console.log('🎉 ALL MEDIA SELECTION RESUME TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Integration Test Failure:', err);
    if (createdResumeId) {
      await resumeService.deleteResume(createdResumeId).catch(() => {});
    }
    process.exit(1);
  }
}

runMediaSelectionIntegrationTest();
