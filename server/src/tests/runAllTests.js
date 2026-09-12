import { execSync } from 'child_process';
import path from 'path';

const testFiles = [
  'passwordReset.test.js',
  'leadsModule.test.js',
  'resumeModule.test.js',
  'resumeMediaSelectionIntegration.test.js',
  'authService.test.js',
  'cmsModules.test.js',
  'experienceModule.test.js',
  'projectsModule.test.js',
  'skillsModule.test.js',
  'academicModule.test.js',
  'contactSocialNav.test.js',
  'mediaModule.test.js',
  'publishingWorkflow.test.js',
  'performanceCache.test.js',
  'securityAudit.test.js',
  'seoSiteSettings.test.js'
];

async function runMasterTestSuite() {
  console.log('=================================================================');
  console.log('🚀 RUNNING MASTER PRODUCTION SUITE FOR ASHISH PORTFOLIO CMS');
  console.log('=================================================================\n');

  let passedCount = 0;
  let failedCount = 0;
  const results = [];

  for (const file of testFiles) {
    const testPath = path.join(process.cwd(), 'server', 'src', 'tests', file);
    try {
      console.log(`▶️ Running Test Suite: ${file}...`);
      execSync(`node "${testPath}"`, { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test' } });
      passedCount++;
      results.push({ file, status: '✅ PASSED' });
      console.log(`-----------------------------------------------------------------`);
    } catch {
      failedCount++;
      results.push({ file, status: '❌ FAILED' });
      console.log(`-----------------------------------------------------------------`);
    }
  }

  console.log('\n=================================================================');
  console.log('📊 MASTER TEST RESULTS SUMMARY');
  console.log('=================================================================');
  results.forEach(r => console.log(`${r.status} : ${r.file}`));
  console.log('=================================================================');
  console.log(`TOTAL PASSED: ${passedCount} / ${testFiles.length}`);
  console.log(`TOTAL FAILED: ${failedCount} / ${testFiles.length}`);
  console.log('=================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMasterTestSuite();
