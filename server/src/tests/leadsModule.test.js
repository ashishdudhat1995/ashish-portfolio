import assert from 'assert';
import { leadsService } from '../services/leadsService.js';
import { leadsRepository } from '../repositories/leadsRepository.js';

async function runLeadsModuleTests() {
  console.log('[Test Suite] Running Contact Form Submission & Leads CMS Unit/Integration Tests...\n');

  try {
    // 1. Submit Public Contact Form Lead
    console.log('Test 1: Submitting public contact form lead...');
    const payload = {
      name: 'Alexander Wright',
      email: 'alex.wright@quantumtech.com',
      subject: 'Architectural Consulting Inquiry',
      message: 'Hi Ashish, We are impressed with your background in microservices and Redis latency optimization. We would like to discuss an enterprise architecture project with QuantumTech.'
    };

    const submitRes = await leadsService.submitPublicLead(payload);
    assert.strictEqual(submitRes.success, true, 'Public lead submission should return success');
    assert.ok(submitRes.id, 'Lead submission response should contain lead ID');
    console.log(`✅ Test 1 Passed: Public lead created successfully (ID: ${submitRes.id})!`);

    const createdLeadId = submitRes.id;

    // 2. Fetch Admin Leads & Verify Unread Count
    console.log('\nTest 2: Fetching admin leads list & unread count...');
    const leadsRes = await leadsService.getAdminLeads({ page: 1, limit: 10 });
    assert.ok(Array.isArray(leadsRes.data), 'Leads data should be an array');
    assert.ok(leadsRes.unreadCount > 0, 'Unread count should be greater than 0');

    const createdLead = leadsRes.data.find(l => l.id === createdLeadId);
    assert.ok(createdLead, 'Created lead should exist in admin leads list');
    assert.strictEqual(createdLead.name, 'Alexander Wright', 'Lead name should match');
    assert.strictEqual(createdLead.status, 'UNREAD', 'New lead status should be UNREAD');
    console.log('✅ Test 2 Passed: Admin leads list & unread count verified!');

    // 3. Fetch Single Lead & Verify Auto-Read
    console.log('\nTest 3: Fetching single lead details (Auto-marks as READ)...');
    const leadDetail = await leadsService.getAdminLeadById(createdLeadId);
    assert.strictEqual(leadDetail.id, createdLeadId, 'Lead ID should match');
    assert.strictEqual(leadDetail.status, 'READ', 'Lead status should auto-update to READ');
    console.log('✅ Test 3 Passed: Lead details fetched & auto-updated status to READ!');

    // 4. Update Lead Status & Admin Internal Notes
    console.log('\nTest 4: Updating lead status to IN_PROGRESS & saving admin notes...');
    const updateRes = await leadsService.updateAdminLead(createdLeadId, {
      status: 'IN_PROGRESS',
      adminNotes: 'Spoke with Alexander via email. Scheduled technical discussion.'
    });
    assert.strictEqual(updateRes.status, 'IN_PROGRESS', 'Status should be IN_PROGRESS');
    assert.strictEqual(updateRes.adminNotes, 'Spoke with Alexander via email. Scheduled technical discussion.', 'Admin notes should be updated');
    console.log('✅ Test 4 Passed: Lead status & internal notes updated successfully!');

    // 5. Delete Lead Entry
    console.log('\nTest 5: Deleting lead entry...');
    const deleteRes = await leadsService.deleteAdminLead(createdLeadId);
    assert.strictEqual(deleteRes, true, 'Delete operation should return true');

    const checkDeleted = await leadsRepository.getLeadById(createdLeadId);
    assert.strictEqual(checkDeleted, null, 'Deleted lead should no longer exist');
    console.log('✅ Test 5 Passed: Lead deleted cleanly!');

    console.log('\n🎉 ALL CONTACT FORM & LEADS CMS TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  }
}

runLeadsModuleTests();
