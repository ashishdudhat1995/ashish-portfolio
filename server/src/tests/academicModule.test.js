import assert from 'node:assert/strict';
import { educationService, certificationsService, achievementsService } from '../services/academicService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runAcademicModuleTests() {
  console.log('🧪 Starting Academic Modules Unit Tests (Education, Certifications, Achievements)...');

  try {
    // 1. PUBLIC READ TESTS
    console.log(' -> Test 1: Fetching public education records');
    const publicEducation = await educationService.getPublicEducation();
    assert.strictEqual(Array.isArray(publicEducation), true, 'Public education should be an array');
    assert.strictEqual(publicEducation.length > 0, true, 'At least one education record should be returned from seed');
    
    const firstEdu = publicEducation[0];
    assert.strictEqual(firstEdu.degree.includes('Bachelor of Engineering'), true, 'Degree title should match resume BE-IT');
    assert.strictEqual(firstEdu.institution.includes('Saffrony Institute of Technology'), true, 'Institution should match resume');
    assert.strictEqual(firstEdu.period, 'Jun 2013 – Jul 2017', 'Period should format cleanly to "Jun 2013 – Jul 2017"');

    console.log(' -> Test 2: Fetching public certifications (Should return clean [] empty array)');
    const publicCerts = await certificationsService.getPublicCertifications();
    assert.strictEqual(Array.isArray(publicCerts), true, 'Public certifications should be an array');
    assert.strictEqual(publicCerts.length, 0, 'Public certifications should be 0 as per resume');

    console.log(' -> Test 3: Fetching public achievements (Should return clean [] empty array)');
    const publicAchievements = await achievementsService.getPublicAchievements();
    assert.strictEqual(Array.isArray(publicAchievements), true, 'Public achievements should be an array');
    assert.strictEqual(publicAchievements.length, 0, 'Public achievements should be 0 as per resume');

    // 2. EDUCATION VALIDATION & CRUD TESTS
    console.log(' -> Test 4: Creating new Education record with validation');
    await assert.rejects(
      async () => await educationService.createEducation({ degree: '' }),
      /Degree \/ Program title is required/,
      'Should reject empty degree title'
    );

    await assert.rejects(
      async () => await educationService.createEducation({
        degree: 'Master of Science',
        institution: 'Test University',
        startDate: '2020-05',
        endDate: '2019-05',
        isCurrent: false
      }),
      /Start Date cannot be after End Date/,
      'Should reject invalid date ordering'
    );

    const createdEdu = await educationService.createEducation({
      degree: 'Master of Technology – Software Architecture',
      institution: 'Gujarat Technological University',
      location: 'Ahmedabad, India',
      startDate: '2018-06',
      endDate: '2020-05',
      isCurrent: false,
      description: 'Advanced studies in distributed systems.',
      enabled: true
    });

    assert.ok(createdEdu.id, 'Created education record should have a valid UUID id');
    assert.strictEqual(createdEdu.degree, 'Master of Technology – Software Architecture');

    console.log(' -> Test 5: Reordering Education records');
    const allEdu = await educationService.getAdminEducation();
    const ids = allEdu.map(e => e.id).reverse();
    await educationService.reorderEducation(ids);
    const reorderedEdu = await educationService.getAdminEducation();
    assert.strictEqual(reorderedEdu[0].id, ids[0], 'First item after reordering should match reversed order ID');

    console.log(' -> Test 6: Deleting Education test record');
    await educationService.deleteEducation(createdEdu.id);
    const postDeleteEdu = await educationService.getAdminEducation();
    assert.strictEqual(postDeleteEdu.some(e => e.id === createdEdu.id), false, 'Deleted education record should no longer exist');

    // 3. CERTIFICATIONS CRUD & VALIDATION TESTS
    console.log(' -> Test 7: Creating Certification record with URL validation');
    await assert.rejects(
      async () => await certificationsService.createCertification({
        name: 'AWS Solutions Architect',
        issuer: 'AWS',
        credentialUrl: 'invalid-url'
      }),
      /Credential URL must be a valid URL/,
      'Should reject malformed credential URL'
    );

    const createdCert = await certificationsService.createCertification({
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      credentialId: 'AWS-CERT-998877',
      credentialUrl: 'https://aws.amazon.com/verification',
      issueDate: '2024-05',
      expirationDate: '2027-05',
      description: 'Cloud systems architecture and microservices design on AWS.',
      enabled: true
    });

    assert.ok(createdCert.id, 'Created certification should have a valid UUID id');
    const adminCerts = await certificationsService.getAdminCertifications();
    assert.strictEqual(adminCerts.length, 1, 'Admin certifications count should be 1');

    await certificationsService.deleteCertification(createdCert.id);
    const postDeleteCerts = await certificationsService.getAdminCertifications();
    assert.strictEqual(postDeleteCerts.length, 0, 'Admin certifications should return to 0');

    // 4. ACHIEVEMENTS CRUD & VALIDATION TESTS
    console.log(' -> Test 8: Creating Achievement record with validation');
    await assert.rejects(
      async () => await achievementsService.createAchievement({ title: '' }),
      /Achievement Title is required/,
      'Should reject empty achievement title'
    );

    const createdAchievement = await achievementsService.createAchievement({
      title: 'Engineering Excellence Award 2025',
      organization: 'ThirdRock Techkno',
      date: '2025-12',
      url: 'https://example.com/award',
      description: 'Recognized for sub-50ms API latency optimization.',
      enabled: true
    });

    assert.ok(createdAchievement.id, 'Created achievement should have a valid UUID id');
    const adminAchievements = await achievementsService.getAdminAchievements();
    assert.strictEqual(adminAchievements.length, 1, 'Admin achievements count should be 1');

    await achievementsService.deleteAchievement(createdAchievement.id);
    const postDeleteAchievements = await achievementsService.getAdminAchievements();
    assert.strictEqual(postDeleteAchievements.length, 0, 'Admin achievements should return to 0');

    console.log('✅ ALL ACADEMIC MODULES UNIT TESTS PASSED CLEANLY (8/8)!');
  } catch (err) {
    console.error('❌ Academic Modules Unit Test Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAcademicModuleTests();
