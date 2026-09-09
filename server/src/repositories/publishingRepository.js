import { PrismaClient } from '@prisma/client';
import { publishingValidationService } from '../services/publishingValidationService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

const prisma = new PrismaClient();

export const publishingRepository = {
  /**
   * Get global PortfolioSettings singleton
   */
  async getPortfolioSettings() {
    try {
      let settings = await prisma.portfolioSettings.findFirst();
      if (!settings) {
        settings = await prisma.portfolioSettings.create({
          data: {
            id: 'default-portfolio-settings',
            status: 'PUBLISHED',
            draftVersion: 1,
            publishedVersion: 1,
            lastPublishedAt: new Date()
          }
        });
      }
      return settings;
    } catch (err) {
      throw new Error('Database error fetching portfolio settings: ' + err.message);
    }
  },

  /**
   * Log administrative action into AdminAuditLog
   */
  async logAudit({ adminUserId, adminEmail, action, entityType, entityId, metadata }) {
    try {
      return await prisma.adminAuditLog.create({
        data: {
          adminUserId: adminUserId || null,
          adminEmail: adminEmail || null,
          action,
          entityType,
          entityId: entityId ? String(entityId) : null,
          metadata: metadata || null
        }
      });
    } catch {
      // Non-blocking audit log catch
    }
  },

  /**
   * Get audit log history
   */
  async getAuditLogs({ page = 1, limit = 50 } = {}) {
    const take = Math.max(1, Math.min(100, Number(limit)));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      prisma.adminAuditLog.count()
    ]);

    return {
      items,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1
      }
    };
  },

  /**
   * Get overview of pending draft changes across all portfolio entities
   */
  async getPendingDraftsSummary() {
    try {
      const settings = await this.getPortfolioSettings();

      const [
        personal,
        hero,
        about,
        draftExperiences,
        draftSkills,
        draftProjects,
        draftEducation,
        draftCertifications,
        draftAchievements,
        draftSocial,
        contact,
        draftNav,
        seo,
        siteSettings
      ] = await Promise.all([
        prisma.personalInformation.findFirst(),
        prisma.hero.findFirst(),
        prisma.about.findFirst(),
        prisma.experienceItem.findMany({ where: { status: 'DRAFT' } }),
        prisma.skillCategory.findMany({ where: { status: 'DRAFT' } }),
        prisma.project.findMany({ where: { status: 'DRAFT' } }),
        prisma.academicEducation.findMany({ where: { status: 'DRAFT' } }),
        prisma.professionalCertification.findMany({ where: { status: 'DRAFT' } }),
        prisma.achievement.findMany({ where: { status: 'DRAFT' } }),
        prisma.socialLink.findMany({ where: { status: 'DRAFT' } }),
        prisma.contactSettings.findFirst(),
        prisma.navigationItem.findMany({ where: { status: 'DRAFT' } }),
        prisma.seoSettings.findFirst(),
        prisma.siteSettings.findFirst()
      ]);

      const draftEntities = [];

      if (personal && personal.status === 'DRAFT') {
        draftEntities.push({ entity: 'Personal', name: 'Personal Profile', id: personal.id, updatedAt: personal.updatedAt });
      }
      if (hero && hero.status === 'DRAFT') {
        draftEntities.push({ entity: 'Hero', name: 'Hero Section', id: hero.id, updatedAt: hero.updatedAt });
      }
      if (about && about.status === 'DRAFT') {
        draftEntities.push({ entity: 'About', name: 'About Section', id: about.id, updatedAt: about.updatedAt });
      }
      if (contact && contact.status === 'DRAFT') {
        draftEntities.push({ entity: 'Contact', name: 'Contact Settings', id: contact.id, updatedAt: contact.updatedAt });
      }
      if (seo && seo.status === 'DRAFT') {
        draftEntities.push({ entity: 'SEO', name: 'SEO Configuration', id: seo.id, updatedAt: seo.updatedAt });
      }
      if (siteSettings && siteSettings.status === 'DRAFT') {
        draftEntities.push({ entity: 'SiteSettings', name: 'Global Site Settings', id: siteSettings.id, updatedAt: siteSettings.updatedAt });
      }

      draftExperiences.forEach(item => draftEntities.push({ entity: 'Experience', name: item.company, id: item.id, updatedAt: item.updatedAt }));
      draftSkills.forEach(item => draftEntities.push({ entity: 'Skills', name: item.name, id: item.id, updatedAt: item.updatedAt }));
      draftProjects.forEach(item => draftEntities.push({ entity: 'Projects', name: item.name, id: item.id, updatedAt: item.updatedAt }));
      draftEducation.forEach(item => draftEntities.push({ entity: 'Education', name: item.degree, id: item.id, updatedAt: item.updatedAt }));
      draftCertifications.forEach(item => draftEntities.push({ entity: 'Certifications', name: item.title, id: item.id, updatedAt: item.updatedAt }));
      draftAchievements.forEach(item => draftEntities.push({ entity: 'Achievements', name: item.title, id: item.id, updatedAt: item.updatedAt }));
      draftSocial.forEach(item => draftEntities.push({ entity: 'SocialLink', name: item.platform, id: item.id, updatedAt: item.updatedAt }));
      draftNav.forEach(item => draftEntities.push({ entity: 'Navigation', name: item.label, id: item.id, updatedAt: item.updatedAt }));

      return {
        isFullyPublished: draftEntities.length === 0,
        totalDrafts: draftEntities.length,
        draftEntities,
        lastPublishedAt: settings.lastPublishedAt,
        publishedVersion: settings.publishedVersion,
        draftVersion: settings.draftVersion
      };
    } catch (err) {
      throw new Error('Failed to generate pending drafts summary: ' + err.message);
    }
  },

  /**
   * Transactional publish for a specific entity
   */
  async publishEntity(entityType, entityId, { adminUser } = {}) {
    const errors = [];
    const now = new Date();

    let targetModel = null;
    let record = null;

    switch (entityType.toLowerCase()) {
      case 'personal': {
        record = await prisma.personalInformation.findFirst();
        if (!record) throw new Error('Personal Information record not found.');
        const valErrors = await publishingValidationService.validatePersonal(record);
        if (valErrors.length > 0) return { success: false, errors: valErrors };

        const updated = await prisma.personalInformation.update({
          where: { id: record.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Personal', entityId: updated.id });
        return { success: true, data: updated };
      }

      case 'hero': {
        record = await prisma.hero.findFirst();
        if (!record) throw new Error('Hero record not found.');
        const valErrors = await publishingValidationService.validateHero(record);
        if (valErrors.length > 0) return { success: false, errors: valErrors };

        const updated = await prisma.hero.update({
          where: { id: record.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Hero', entityId: updated.id });
        return { success: true, data: updated };
      }

      case 'about': {
        record = await prisma.about.findFirst();
        if (!record) throw new Error('About record not found.');
        const valErrors = await publishingValidationService.validateAbout(record);
        if (valErrors.length > 0) return { success: false, errors: valErrors };

        const updated = await prisma.about.update({
          where: { id: record.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'About', entityId: updated.id });
        return { success: true, data: updated };
      }

      case 'project':
      case 'projects': {
        record = await prisma.project.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Project not found.');
        const valErrors = await publishingValidationService.validateProject(record);
        if (valErrors.length > 0) return { success: false, errors: valErrors };

        const updated = await prisma.project.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Projects', entityId });
        return { success: true, data: updated };
      }

      case 'experience': {
        record = await prisma.experienceItem.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Experience item not found.');
        const valErrors = await publishingValidationService.validateExperience(record);
        if (valErrors.length > 0) return { success: false, errors: valErrors };

        const updated = await prisma.experienceItem.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Experience', entityId });
        return { success: true, data: updated };
      }

      case 'skills':
      case 'skillcategory': {
        record = await prisma.skillCategory.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Skill category not found.');
        const valErrors = await publishingValidationService.validateSkillCategory(record);
        if (valErrors.length > 0) return { success: false, errors: valErrors };

        const updated = await prisma.skillCategory.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Skills', entityId });
        return { success: true, data: updated };
      }

      case 'education': {
        record = await prisma.academicEducation.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Education item not found.');

        const updated = await prisma.academicEducation.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Education', entityId });
        return { success: true, data: updated };
      }

      case 'certifications': {
        record = await prisma.professionalCertification.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Certification not found.');

        const updated = await prisma.professionalCertification.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Certifications', entityId });
        return { success: true, data: updated };
      }

      case 'achievements': {
        record = await prisma.achievement.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Achievement not found.');

        const updated = await prisma.achievement.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Achievements', entityId });
        return { success: true, data: updated };
      }

      case 'sociallink':
      case 'social-links': {
        record = await prisma.socialLink.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Social link not found.');

        const updated = await prisma.socialLink.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'SocialLink', entityId });
        return { success: true, data: updated };
      }

      case 'contact': {
        record = await prisma.contactSettings.findFirst();
        if (!record) throw new Error('Contact settings not found.');

        const updated = await prisma.contactSettings.update({
          where: { id: record.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Contact', entityId: updated.id });
        return { success: true, data: updated };
      }

      case 'navigation': {
        record = await prisma.navigationItem.findUnique({ where: { id: entityId } });
        if (!record) throw new Error('Navigation item not found.');

        const updated = await prisma.navigationItem.update({
          where: { id: entityId },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'Navigation', entityId });
        return { success: true, data: updated };
      }

      case 'seo': {
        record = await prisma.seoSettings.findFirst();
        if (!record) throw new Error('SEO settings record not found.');
        const valErrors = await publishingValidationService.validateSeo(record);
        if (valErrors.length > 0) return { success: false, errors: valErrors };

        const updated = await prisma.seoSettings.update({
          where: { id: record.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'SEO', entityId: updated.id });
        return { success: true, data: updated };
      }

      case 'sitesettings':
      case 'site-settings': {
        record = await prisma.siteSettings.findFirst();
        if (!record) throw new Error('Site settings record not found.');

        const updated = await prisma.siteSettings.update({
          where: { id: record.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedData: JSON.parse(JSON.stringify(record)),
            version: { increment: 1 }
          }
        });
        await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH', entityType: 'SiteSettings', entityId: updated.id });
        return { success: true, data: updated };
      }

      default:
        throw new Error(`Unsupported entity type: '${entityType}'.`);
    }
  },

  /**
   * Transactional PUBLISH ALL CHANGES across entire portfolio
   */
  async publishAllChanges({ adminUser } = {}) {
    const allErrors = [];

    // 1. Fetch current draft records to validate
    const [personal, hero, about, seo, draftProjects, draftNav] = await Promise.all([
      prisma.personalInformation.findFirst(),
      prisma.hero.findFirst(),
      prisma.about.findFirst(),
      prisma.seoSettings.findFirst(),
      prisma.project.findMany({ where: { status: 'DRAFT' } }),
      prisma.navigationItem.findMany({ where: { status: 'DRAFT' } })
    ]);

    if (personal) allErrors.push(...(await publishingValidationService.validatePersonal(personal)));
    if (hero) allErrors.push(...(await publishingValidationService.validateHero(hero)));
    if (about) allErrors.push(...(await publishingValidationService.validateAbout(about)));
    if (seo) allErrors.push(...(await publishingValidationService.validateSeo(seo)));
    if (draftNav.length > 0) allErrors.push(...(await publishingValidationService.validateNavigation(draftNav)));

    for (const proj of draftProjects) {
      allErrors.push(...(await publishingValidationService.validateProject(proj)));
    }

    if (allErrors.length > 0) {
      return {
        success: false,
        message: 'Publish All operation blocked due to validation errors.',
        errors: allErrors
      };
    }

    // 2. Execute transactional update across PostgreSQL
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // Singletons
      if (personal && personal.status === 'DRAFT') {
        await tx.personalInformation.update({ where: { id: personal.id }, data: { status: 'PUBLISHED', publishedAt: now, publishedData: JSON.parse(JSON.stringify(personal)), version: { increment: 1 } } });
      }
      if (hero && hero.status === 'DRAFT') {
        await tx.hero.update({ where: { id: hero.id }, data: { status: 'PUBLISHED', publishedAt: now, publishedData: JSON.parse(JSON.stringify(hero)), version: { increment: 1 } } });
      }
      if (about && about.status === 'DRAFT') {
        await tx.about.update({ where: { id: about.id }, data: { status: 'PUBLISHED', publishedAt: now, publishedData: JSON.parse(JSON.stringify(about)), version: { increment: 1 } } });
      }
      if (seo && seo.status === 'DRAFT') {
        await tx.seoSettings.update({ where: { id: seo.id }, data: { status: 'PUBLISHED', publishedAt: now, publishedData: JSON.parse(JSON.stringify(seo)), version: { increment: 1 } } });
      }

      const contact = await tx.contactSettings.findFirst();
      if (contact && contact.status === 'DRAFT') {
        await tx.contactSettings.update({ where: { id: contact.id }, data: { status: 'PUBLISHED', publishedAt: now, publishedData: JSON.parse(JSON.stringify(contact)), version: { increment: 1 } } });
      }

      const siteSettings = await tx.siteSettings.findFirst();
      if (siteSettings && siteSettings.status === 'DRAFT') {
        await tx.siteSettings.update({ where: { id: siteSettings.id }, data: { status: 'PUBLISHED', publishedAt: now, publishedData: JSON.parse(JSON.stringify(siteSettings)), version: { increment: 1 } } });
      }

      // Collections
      await tx.experienceItem.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.skillCategory.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.skill.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.project.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.academicEducation.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.professionalCertification.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.achievement.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.socialLink.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });
      await tx.navigationItem.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED', publishedAt: now } });

      // Update Global Portfolio Settings
      const currentSettings = await tx.portfolioSettings.findFirst();
      await tx.portfolioSettings.update({
        where: { id: currentSettings.id },
        data: {
          status: 'PUBLISHED',
          publishedVersion: { increment: 1 },
          draftVersion: { increment: 1 },
          lastPublishedAt: now,
          publishedBy: adminUser?.email || 'admin'
        }
      });
    });

    await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'PUBLISH_ALL', entityType: 'Global', metadata: { publishedAt: now } });
    cacheService.invalidatePublicCache();

    return {
      success: true,
      message: 'All draft changes have been transactionally published to the live portfolio!'
    };
  },

  /**
   * Discard all draft changes and restore to last published state
   */
  async discardDraftChanges({ adminUser } = {}) {
    await prisma.$transaction(async (tx) => {
      // 1. Singletons with publishedData snapshots
      const singletons = [
        { model: tx.personalInformation, name: 'Personal' },
        { model: tx.hero, name: 'Hero' },
        { model: tx.about, name: 'About' },
        { model: tx.contactSettings, name: 'Contact' },
        { model: tx.seoSettings, name: 'SEO' },
        { model: tx.siteSettings, name: 'SiteSettings' }
      ];

      for (const item of singletons) {
        const rec = await item.model.findFirst();
        if (rec && rec.status === 'DRAFT' && rec.publishedData) {
          const snapshot = typeof rec.publishedData === 'string' ? JSON.parse(rec.publishedData) : rec.publishedData;
          delete snapshot.id;
          delete snapshot.createdAt;
          delete snapshot.updatedAt;
          await item.model.update({
            where: { id: rec.id },
            data: { ...snapshot, status: 'PUBLISHED' }
          });
        }
      }

      // 2. Collections: reset DRAFT items to PUBLISHED if they were edited, or remove if newly created draft
      await tx.experienceItem.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.skillCategory.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.skill.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.project.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.academicEducation.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.professionalCertification.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.achievement.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.socialLink.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
      await tx.navigationItem.updateMany({ where: { status: 'DRAFT' }, data: { status: 'PUBLISHED' } });
    });

    await this.logAudit({ adminUserId: adminUser?.id, adminEmail: adminUser?.email, action: 'DISCARD_DRAFT', entityType: 'Global' });

    return {
      success: true,
      message: 'Draft changes discarded cleanly and restored to live published state.'
    };
  }
};
