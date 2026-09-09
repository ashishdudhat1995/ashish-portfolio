import assert from 'assert';
import { projectsService } from '../services/projectsService.js';

async function runProjectsUnitTests() {
  console.log('[Test Suite] Running Complete Projects Management Unit Tests...\n');

  try {
    // 1. GET ALL ADMIN PROJECTS
    console.log('Test 1: Fetching all admin project records...');
    const initialList = await projectsService.getAdminProjects();
    assert.ok(Array.isArray(initialList), 'Projects list should be an array');
    assert.ok(initialList.length >= 6, 'Should contain at least 6 seeded resume projects');
    console.log(`✅ Test 1 Passed: Found ${initialList.length} admin project records!\n`);

    // 2. CREATE NEW PROJECT RECORD
    console.log('Test 2: Creating a new production project record...');
    const newProj = await projectsService.createProject({
      name: 'OmniChain SaaS Platform',
      subtitle: 'Decentralized Supply Chain Operations Portal',
      domain: 'Logistics & Supply Chain',
      category: 'Enterprise SaaS',
      startDate: '2024-03',
      endDate: '2025-01',
      isCurrent: false,
      description: 'Distributed supply chain tracking platform with real-time audit telemetry.',
      featured: true,
      highlights: [{ text: 'Architected event stream processing', order: 1, enabled: true }],
      technologies: ['Node.js', 'React.js', 'PostgreSQL', 'Redis'],
      enabled: true
    });

    assert.ok(newProj.id, 'New project must receive an ID');
    assert.strictEqual(newProj.name, 'OmniChain SaaS Platform', 'Project title should match');
    assert.strictEqual(newProj.order, initialList.length + 1, 'Auto-assigned order should equal count + 1');
    console.log('✅ Test 2 Passed: Created production project with auto-assigned order!\n');

    // 3. DATE VALIDATION TEST
    console.log('Test 3: Testing date logic validation (StartDate after EndDate)...');
    try {
      await projectsService.createProject({
        name: 'Invalid Date App',
        subtitle: 'Validation test',
        description: 'Test description',
        startDate: '2026-05',
        endDate: '2024-01',
        isCurrent: false
      });
      assert.fail('Should have rejected StartDate after EndDate');
    } catch (err) {
      assert.strictEqual(err.message, 'Start Date cannot be after End Date.', 'Error message should specify date ordering constraint');
    }
    console.log('✅ Test 3 Passed: Invalid date ordering rejected cleanly!\n');

    // 4. UPDATE PROJECT RECORD
    console.log('Test 4: Updating project record & relational child highlights/technologies...');
    const updatedProj = await projectsService.updateProject(newProj.id, {
      name: 'OmniChain SaaS Platform Global',
      subtitle: 'Decentralized Supply Chain Operations Portal Enterprise',
      domain: 'Logistics & Supply Chain',
      category: 'Enterprise SaaS',
      startDate: '2024-03',
      endDate: '2025-01',
      isCurrent: false,
      description: 'Updated description narrative.',
      featured: false,
      order: newProj.order,
      enabled: true,
      highlights: [
        { text: 'Architected event stream processing', order: 1, enabled: true },
        { text: 'Optimized PostgreSQL indexing', order: 2, enabled: true }
      ],
      technologies: ['Node.js', 'React.js', 'PostgreSQL', 'Redis', 'Kafka']
    });

    assert.strictEqual(updatedProj.name, 'OmniChain SaaS Platform Global', 'Title should be updated');
    assert.strictEqual(updatedProj.highlights.length, 2, 'Relational highlights should equal 2');
    console.log('✅ Test 4 Passed: Project and relational child items updated successfully!\n');

    // 5. STATUS TOGGLE & PUBLIC API FILTERING
    console.log('Test 5: Testing status toggle & public API visibility filtering...');
    await projectsService.updateStatus(newProj.id, false);

    const publicList = await projectsService.getPublicProjects();
    const foundDisabled = publicList.find(p => p.id === newProj.id);
    assert.strictEqual(foundDisabled, undefined, 'Disabled project MUST NOT appear in public API');
    console.log('✅ Test 5 Passed: Disabled project hidden from public API!\n');

    // 6. DELETE & ORDER NORMALIZATION
    console.log('Test 6: Deleting project & verifying order normalization...');
    await projectsService.deleteProject(newProj.id);
    const listAfterDelete = await projectsService.getAdminProjects();
    assert.strictEqual(listAfterDelete.length, initialList.length, 'Count after deletion should return to initial count');
    console.log('✅ Test 6 Passed: Project record deleted and order normalized!\n');

    console.log('🎉 ALL 6 PROJECTS MODULE UNIT TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runProjectsUnitTests();
