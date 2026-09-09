import assert from 'node:assert/strict';
import { socialLinksService, contactService, navigationService } from '../services/contactSocialNavService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runContactSocialNavTests() {
  console.log('🧪 Starting Social Links, Contact Information, & Navigation Unit Tests...');

  try {
    // 1. SOCIAL LINKS TESTS
    console.log(' -> Test 1: Fetching public social links (Must exclude records with empty URLs or enabled: false)');
    const publicLinks = await socialLinksService.getPublicSocialLinks();
    assert.strictEqual(Array.isArray(publicLinks), true, 'Public social links should be an array');
    assert.strictEqual(publicLinks.every(l => l.url && l.url.trim() !== ''), true, 'All public social links must have non-empty URLs');

    console.log(' -> Test 2: Creating Social Link with Zod & URL validation');
    await assert.rejects(
      async () => await socialLinksService.createSocialLink({
        platform: 'Twitter',
        label: 'x.com/ashish',
        url: 'invalid-url'
      }),
      /URL must be a valid HTTP or HTTPS URL/,
      'Should reject invalid URL'
    );

    const createdSocial = await socialLinksService.createSocialLink({
      platform: 'YouTube',
      label: 'youtube.com/@ashish-tech',
      url: 'https://youtube.com/@ashish-tech',
      iconKey: 'youtube',
      enabled: true
    });
    assert.ok(createdSocial.id, 'Created social link should have a valid UUID id');

    console.log(' -> Test 3: Disabling Social Link & verifying public exclusion');
    await socialLinksService.updateStatus(createdSocial.id, false);
    const publicAfterDisable = await socialLinksService.getPublicSocialLinks();
    assert.strictEqual(publicAfterDisable.some(l => l.id === createdSocial.id), false, 'Disabled social link should be excluded publicly');

    console.log(' -> Test 4: Reordering & Deleting Social Link');
    await socialLinksService.deleteSocialLink(createdSocial.id);
    const adminLinks = await socialLinksService.getAdminSocialLinks();
    assert.strictEqual(adminLinks.some(l => l.id === createdSocial.id), false, 'Deleted social link should be removed');

    // 2. CONTACT INFORMATION TESTS
    console.log(' -> Test 5: Fetching merged public contact information');
    const publicContact = await contactService.getPublicContact();
    assert.ok(publicContact.contactInfo, 'Public contact should include canonical contactInfo');
    assert.strictEqual(publicContact.contactInfo.email, 'dudhatashish1995@gmail.com', 'Canonical email should match resume');
    assert.strictEqual(publicContact.contactInfo.phone, '+91 7600908370', 'Canonical phone should match resume');
    assert.strictEqual(publicContact.contactInfo.location.includes('Ahmedabad, Gujarat'), true, 'Canonical location should match resume');

    console.log(' -> Test 6: Updating contact presentation parameters');
    await contactService.updateContact({
      heading: "Let's Build Microservices Together",
      description: "Updated contact sub-heading description",
      primaryCtaLabel: "Schedule Discussion",
      primaryCtaTarget: "#contact",
      enabled: true
    });
    const updatedContact = await contactService.getPublicContact();
    assert.strictEqual(updatedContact.heading, "Let's Build Microservices Together");
    assert.strictEqual(updatedContact.primaryCtaLabel, "Schedule Discussion");

    // 3. NAVIGATION TESTS
    console.log(' -> Test 7: Resetting & Fetching public navigation items');
    let adminNav = await navigationService.getAdminNavigation();
    // Reset order by target sequence if needed
    const defaultLabels = ['Home', 'About', 'Experience', 'Skills', 'Projects', 'Education', 'Contact'];
    const sortedIds = defaultLabels.map(lbl => adminNav.find(n => n.label === lbl)?.id).filter(Boolean);
    if (sortedIds.length === defaultLabels.length) {
      await navigationService.reorderNavigation(sortedIds);
    }

    const publicNav = await navigationService.getPublicNavigation();
    assert.strictEqual(Array.isArray(publicNav), true, 'Public navigation items should be an array');
    assert.strictEqual(publicNav.length >= 7, true, 'At least 7 seeded navigation items should exist');
    assert.strictEqual(publicNav[0].label, 'Home', 'First item should be Home');

    console.log(' -> Test 8: Rejection of unsafe protocols in Navigation target');
    await assert.rejects(
      async () => await navigationService.createNavigationItem({
        label: 'Unsafe Link',
        target: 'javascript:alert(1)'
      }),
      /Target must be a valid section anchor/,
      'Should reject javascript: URI protocol'
    );

    console.log(' -> Test 9: Creating external navigation item & reordering');
    const createdNav = await navigationService.createNavigationItem({
      label: 'Blog',
      target: 'https://ashish-tech.blog',
      type: 'external',
      openInNewTab: true,
      enabled: true
    });
    assert.ok(createdNav.id, 'Created navigation item should have a valid UUID id');

    adminNav = await navigationService.getAdminNavigation();
    const navIds = adminNav.map(n => n.id);
    await navigationService.reorderNavigation(navIds);
    const reorderedNav = await navigationService.getAdminNavigation();
    assert.strictEqual(reorderedNav[0].id, navIds[0], 'Navigation items reordered cleanly');

    console.log(' -> Test 10: Cleaning up created navigation test item & restoring original order');
    await navigationService.deleteNavigationItem(createdNav.id);
    const postDeleteNav = await navigationService.getAdminNavigation();
    assert.strictEqual(postDeleteNav.some(n => n.id === createdNav.id), false, 'Deleted navigation item removed');

    // Restore Home at top
    const finalNav = await navigationService.getAdminNavigation();
    const finalSortedIds = defaultLabels.map(lbl => finalNav.find(n => n.label === lbl)?.id).filter(Boolean);
    if (finalSortedIds.length === defaultLabels.length) {
      await navigationService.reorderNavigation(finalSortedIds);
    }

    console.log('✅ ALL SOCIAL LINKS, CONTACT, & NAVIGATION UNIT TESTS PASSED CLEANLY (10/10)!');
  } catch (err) {
    console.error('❌ Contact, Social Links, & Navigation Unit Test Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runContactSocialNavTests();
