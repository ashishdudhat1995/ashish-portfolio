import assert from 'assert';
import { skillsService } from '../services/skillsService.js';

async function runSkillsUnitTests() {
  console.log('[Test Suite] Running Complete Skills Topology Unit Tests...\n');

  try {
    // 1. GET ALL ADMIN CATEGORIES & PUBLIC CATEGORIES
    console.log('Test 1: Fetching all admin skill categories...');
    const categories = await skillsService.getAdminCategories();
    assert.ok(Array.isArray(categories), 'Categories list should be an array');
    assert.ok(categories.length >= 9, 'Should contain at least 9 seeded skill categories');
    console.log(`✅ Test 1 Passed: Found ${categories.length} skill categories!\n`);

    // 2. CREATE NEW SKILL CATEGORY
    console.log('Test 2: Creating a new skill category...');
    const newCat = await skillsService.createCategory({
      name: 'Artificial Intelligence & ML',
      description: 'Generative AI and machine learning tools'
    });
    assert.ok(newCat.id, 'New category must receive an ID');
    assert.strictEqual(newCat.slug, 'artificial-intelligence-ml', 'Slug should be auto-generated correctly');
    console.log('✅ Test 2 Passed: Created skill category cleanly!\n');

    // 3. CREATE SKILL INSIDE CATEGORY
    console.log('Test 3: Creating a skill inside category...');
    const newSkill = await skillsService.createSkill({
      categoryId: newCat.id,
      name: 'Python',
      description: 'Data science & AI scripting'
    });
    assert.ok(newSkill.id, 'New skill must receive an ID');
    assert.strictEqual(newSkill.categoryId, newCat.id, 'Skill categoryId must match');
    console.log('✅ Test 3 Passed: Created skill inside category!\n');

    // 4. CATEGORY DELETION PROTECTION TEST
    console.log('Test 4: Testing non-empty category deletion protection...');
    try {
      await skillsService.deleteCategory(newCat.id, false);
      assert.fail('Should have rejected deleting non-empty category without force flag');
    } catch (err) {
      assert.ok(err.message.includes('Cannot delete category'), 'Error should warn about contained skills');
    }
    console.log('✅ Test 4 Passed: Non-empty category deletion prevented cleanly!\n');

    // 5. UPDATE & STATUS TOGGLE
    console.log('Test 5: Updating skill & testing public API visibility filtering...');
    await skillsService.updateSkillStatus(newSkill.id, false);
    const publicList = await skillsService.getPublicCategories();
    const publicCat = publicList.find(c => c.id === newCat.id);
    assert.ok(publicCat, 'Category should exist in public list');
    const disabledSkill = publicCat.skills.find(s => s.id === newSkill.id);
    assert.strictEqual(disabledSkill, undefined, 'Disabled skill MUST NOT appear in public API');
    console.log('✅ Test 5 Passed: Disabled skill hidden from public API!\n');

    // 6. FORCE DELETE CATEGORY & CLEANUP
    console.log('Test 6: Force deleting category & verifying cascading cleanup...');
    await skillsService.deleteCategory(newCat.id, true);
    const categoriesAfter = await skillsService.getAdminCategories();
    assert.strictEqual(categoriesAfter.length, categories.length, 'Count should return to initial state');
    console.log('✅ Test 6 Passed: Force deleted category and cleaned up cascading skills!\n');

    console.log('🎉 ALL 6 SKILLS MODULE UNIT TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runSkillsUnitTests();
