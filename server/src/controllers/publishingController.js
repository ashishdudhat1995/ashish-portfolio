import { publishingRepository } from '../repositories/publishingRepository.js';
import { publishingValidationService } from '../services/publishingValidationService.js';
import { personalRepository } from '../repositories/personalRepository.js';
import { heroRepository } from '../repositories/heroRepository.js';
import { aboutRepository } from '../repositories/aboutRepository.js';
import { experienceRepository } from '../repositories/experienceRepository.js';
import { skillsRepository } from '../repositories/skillsRepository.js';
import { projectsRepository } from '../repositories/projectsRepository.js';
import { educationRepository, certificationsRepository, achievementsRepository } from '../repositories/academicRepository.js';
import { socialLinksRepository, contactSettingsRepository, navigationRepository } from '../repositories/contactSocialNavRepository.js';
import { seoSettingsRepository, siteSettingsRepository } from '../repositories/seoSiteSettingsRepository.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const getPublishingSummary = async (req, res) => {
  try {
    const summary = await publishingRepository.getPendingDraftsSummary();
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch publishing summary.'
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const logs = await publishingRepository.getAuditLogs({ page, limit });
    return res.status(200).json({
      success: true,
      data: logs.items,
      pagination: logs.pagination
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch audit logs.'
    });
  }
};

export const publishAllChanges = async (req, res) => {
  try {
    const result = await publishingRepository.publishAllChanges({ adminUser: req.adminUser });
    if (!result.success) {
      return res.status(400).json(result);
    }
    cacheService.invalidatePublicCache();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to execute global publish.'
    });
  }
};

export const discardDraftChanges = async (req, res) => {
  try {
    const result = await publishingRepository.discardDraftChanges({ adminUser: req.adminUser });
    cacheService.invalidatePublicCache();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to discard draft changes.'
    });
  }
};

export const publishEntity = async (req, res) => {
  try {
    const { entity, id } = req.params;
    const result = await publishingRepository.publishEntity(entity, id, { adminUser: req.adminUser });
    if (!result.success) {
      return res.status(400).json(result);
    }
    cacheService.invalidatePublicCache();
    return res.status(200).json({
      success: true,
      message: `Successfully published ${entity} cleanly!`,
      data: result.data
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to publish entity.'
    });
  }
};

export const getAdminPreviewData = async (req, res) => {
  try {
    // 1. Authenticated preview endpoint fetching draft & published datasets
    const [
      personal,
      heroStats,
      about,
      experiences,
      skills,
      projects,
      education,
      certifications,
      achievements,
      socialLinks,
      contact,
      navigation,
      seo,
      siteSettings
    ] = await Promise.all([
      personalRepository.getPrimaryProfile(),
      heroRepository.getAllHeroStats(),
      aboutRepository.getPrimaryAbout(),
      experienceRepository.getAllAdminExperiences(),
      skillsRepository.getAllAdminCategories(),
      projectsRepository.getAllAdminProjects(),
      educationRepository.getAllAdminEducation(),
      certificationsRepository.getAllAdminCertifications(),
      achievementsRepository.getAllAdminAchievements(),
      socialLinksRepository.getAllAdminSocialLinks(),
      contactSettingsRepository.getContactSettings(),
      navigationRepository.getAllAdminNavigation(),
      seoSettingsRepository.getSeoSettings(),
      siteSettingsRepository.getSiteSettings()
    ]);

    return res.status(200).json({
      success: true,
      isPreview: true,
      data: {
        personal,
        heroStats,
        about,
        experience: experiences.filter(e => e.enabled !== false),
        skills,
        projects: projects.filter(p => p.enabled !== false),
        education: education.filter(e => e.enabled !== false),
        certifications: certifications.filter(c => c.enabled !== false),
        achievements: achievements.filter(a => a.enabled !== false),
        socialLinks: socialLinks.filter(s => s.enabled !== false),
        contact,
        navigation: navigation.filter(n => n.enabled !== false),
        seo,
        siteSettings
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate preview dataset.'
    });
  }
};
