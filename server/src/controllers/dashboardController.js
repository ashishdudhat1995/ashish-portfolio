import { initialPortfolio } from '../data/initialPortfolio.js';
import { experienceRepository } from '../repositories/experienceRepository.js';
import { skillsRepository } from '../repositories/skillsRepository.js';
import { projectsRepository } from '../repositories/projectsRepository.js';
import { educationRepository, certificationsRepository, achievementsRepository } from '../repositories/academicRepository.js';
import { socialLinksRepository, contactSettingsRepository, navigationRepository } from '../repositories/contactSocialNavRepository.js';
import { seoSettingsRepository, siteSettingsRepository } from '../repositories/seoSiteSettingsRepository.js';
import { mediaRepository } from '../repositories/mediaRepository.js';
import { publishingRepository } from '../repositories/publishingRepository.js';
import { resumeRepository } from '../repositories/resumeRepository.js';

export const dashboardController = {
  /**
   * GET /api/admin/dashboard/summary
   * Returns dynamic database record counts, publishing status, and completeness.
   */
  async getSummary(req, res) {
    try {
      const [
        dbExperiences,
        dbSkillCategories,
        dbProjects,
        dbEducation,
        dbCertifications,
        dbAchievements,
        dbSocialLinks,
        dbContactSettings,
        dbNavigation,
        dbSeoSettings,
        dbSiteSettings,
        dbMedia,
        publishingSummary,
        dbResumes
      ] = await Promise.all([
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
        siteSettingsRepository.getSiteSettings(),
        mediaRepository.getAdminMediaList({ limit: 1000 }),
        publishingRepository.getPendingDraftsSummary(),
        resumeRepository.getAllResumes()
      ]);

      const experienceCount = dbExperiences.length;
      const skillCategoriesCount = dbSkillCategories.length;
      const totalSkillsCount = dbSkillCategories.reduce((acc, cat) => acc + (cat.skills ? cat.skills.length : 0), 0);
      const projectsCount = dbProjects.length;
      const educationCount = dbEducation.length;
      const certificationsCount = dbCertifications.length;
      const achievementsCount = dbAchievements.length;
      const socialLinksCount = dbSocialLinks.length;
      const navigationCount = dbNavigation.length;
      const mediaList = dbMedia.items || [];
      const mediaCount = dbMedia.pagination?.totalItems !== undefined ? dbMedia.pagination.totalItems : mediaList.length;
      const mediaImagesCount = mediaList.filter(m => m.mediaType === 'IMAGE').length;
      const mediaDocsCount = mediaList.filter(m => m.mediaType === 'DOCUMENT' || m.mimeType === 'application/pdf').length;

      const mediaStats = {
        total: mediaCount,
        images: mediaImagesCount,
        documents: mediaDocsCount,
        active: mediaList.filter(m => m.status === 'ACTIVE').length,
        archived: mediaList.filter(m => m.status === 'ARCHIVED').length,
        public: mediaList.filter(m => m.visibility === 'PUBLIC').length,
        private: mediaList.filter(m => m.visibility === 'PRIVATE').length
      };

      const activeResume = dbResumes.find(r => r.isActive && r.status === 'PUBLISHED') || null;
      const draftResumeCount = dbResumes.filter(r => r.status === 'DRAFT').length;

      let resumeState = 'NO_RESUME';
      if (activeResume) {
        resumeState = 'ACTIVE';
      } else if (draftResumeCount > 0) {
        resumeState = 'DRAFT_AVAILABLE';
      }

      const completeness = [
        { key: 'personal', title: 'Personal Information', status: initialPortfolio.personal ? 'Configured' : 'Not configured', count: 1 },
        { key: 'hero', title: 'Hero Stats', status: initialPortfolio.heroStats && initialPortfolio.heroStats.length > 0 ? 'Configured' : 'Not configured', count: initialPortfolio.heroStats ? initialPortfolio.heroStats.length : 0 },
        { key: 'about', title: 'About Section', status: initialPortfolio.about ? 'Configured' : 'Not configured', count: 1 },
        { key: 'experience', title: 'Experience Timeline', status: experienceCount > 0 ? `${experienceCount} entries` : 'Not configured', count: experienceCount },
        { key: 'skills', title: 'Skills Topology', status: skillCategoriesCount > 0 ? `${skillCategoriesCount} categories (${totalSkillsCount} skills)` : 'Not configured', count: skillCategoriesCount },
        { key: 'projects', title: 'Production Case Studies', status: projectsCount > 0 ? `${projectsCount} entries` : 'Not configured', count: projectsCount },
        { key: 'education', title: 'Academic Education', status: educationCount > 0 ? `${educationCount} entry` : 'Not configured', count: educationCount },
        { key: 'certifications', title: 'Certifications', status: certificationsCount > 0 ? `${certificationsCount} entries` : 'Not configured', count: certificationsCount },
        { key: 'achievements', title: 'Achievements', status: achievementsCount > 0 ? `${achievementsCount} entries` : 'Not configured', count: achievementsCount },
        { key: 'contact', title: 'Contact Settings', status: dbContactSettings && dbContactSettings.enabled ? 'Configured' : 'Disabled', count: 1 },
        { key: 'socialLinks', title: 'Social Links', status: socialLinksCount > 0 ? `${socialLinksCount} links` : 'Not configured', count: socialLinksCount },
        { key: 'navigation', title: 'Single-Page Navigation', status: navigationCount > 0 ? `${navigationCount} items` : 'Not configured', count: navigationCount },
        { key: 'seo', title: 'SEO Configuration', status: dbSeoSettings && dbSeoSettings.title ? 'Configured' : 'Not configured', count: 1 },
        { key: 'siteSettings', title: 'Global Site Settings', status: dbSiteSettings && dbSiteSettings.siteName ? 'Configured' : 'Not configured', count: 1 },
        { key: 'media', title: 'Media Reference Library', status: mediaCount > 0 ? `${mediaCount} assets` : '0 uploaded assets', count: mediaCount },
        { key: 'resume', title: 'PDF Resume', status: activeResume ? 'Active Published Resume' : (draftResumeCount > 0 ? `${draftResumeCount} Drafts Available` : 'No Resume Configured'), count: dbResumes.length }
      ];

      const seoStatus = {
        seoConfigured: Boolean(dbSeoSettings && dbSeoSettings.title && dbSeoSettings.description),
        canonicalConfigured: Boolean(dbSeoSettings && dbSeoSettings.canonicalUrl && dbSeoSettings.canonicalUrl.trim() !== ''),
        ogImageConfigured: Boolean(dbSeoSettings && dbSeoSettings.ogImageId),
        faviconConfigured: Boolean(dbSeoSettings && dbSeoSettings.faviconMediaId),
        structuredDataEnabled: Boolean(dbSeoSettings && dbSeoSettings.structuredDataEnabled),
        maintenanceMode: Boolean(dbSiteSettings && dbSiteSettings.maintenanceMode)
      };

      return res.json({
        success: true,
        data: {
          counts: {
            experience: experienceCount,
            skills: skillCategoriesCount,
            totalSkills: totalSkillsCount,
            projects: projectsCount,
            education: educationCount,
            certifications: certificationsCount,
            achievements: achievementsCount,
            socialLinks: socialLinksCount,
            navigation: navigationCount,
            media: mediaCount,
            mediaImages: mediaImagesCount,
            mediaDocs: mediaDocsCount,
            resume: dbResumes.length
          },
          resumeStatus: resumeState,
          activeResume: activeResume ? {
            id: activeResume.id,
            title: activeResume.title,
            versionLabel: activeResume.versionLabel,
            filename: activeResume.media?.originalFilename || activeResume.media?.filename,
            size: activeResume.media?.size,
            publishedAt: activeResume.publishedAt
          } : null,
          completeness,
          seoStatus,
          mediaStats,
          publishing: publishingSummary
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate dashboard summary'
      });
    }
  }
};
