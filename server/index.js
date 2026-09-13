import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { healthController } from './src/controllers/healthController.js';
import { authController } from './src/controllers/authController.js';
import { dashboardController } from './src/controllers/dashboardController.js';
import { personalController } from './src/controllers/personalController.js';
import { heroController } from './src/controllers/heroController.js';
import { aboutController } from './src/controllers/aboutController.js';
import { experienceController } from './src/controllers/experienceController.js';
import { skillsController } from './src/controllers/skillsController.js';
import { projectsController } from './src/controllers/projectsController.js';
import { educationController, certificationsController, achievementsController } from './src/controllers/academicController.js';
import { socialLinksController, contactController, navigationController } from './src/controllers/contactSocialNavController.js';
import { getAdminSeo, updateAdminSeo, getAdminSiteSettings, updateAdminSiteSettings, getPublicSeo, getPublicSiteSettings, getPublicSiteConfig } from './src/controllers/seoSiteSettingsController.js';
import { getAdminMediaList, getAdminMediaById, uploadAdminMedia, updateAdminMedia, updateAdminMediaStatus, updateAdminMediaVisibility, deleteAdminMedia, getPublicMedia } from './src/controllers/mediaController.js';
import { getPublishingSummary, getAuditLogs, publishAllChanges, discardDraftChanges, publishEntity, getAdminPreviewData } from './src/controllers/publishingController.js';
import { resumeController } from './src/controllers/resumeController.js';
import { singleUploadMiddleware } from './src/middleware/uploadMiddleware.js';
import { singleResumeUploadMiddleware } from './src/middleware/resumeUploadMiddleware.js';
import { requireAdminAuth } from './src/middleware/authMiddleware.js';
import { loginRateLimiter, sensitiveMutationLimiter, uploadRateLimiter, publicApiRateLimiter } from './src/middleware/rateLimiter.js';
import { requestIdMiddleware } from './src/middleware/requestIdMiddleware.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { validateEnvironment } from './src/utils/envValidation.js';
import { publicCacheMiddleware, noCacheMiddleware } from './src/middleware/cacheMiddleware.js';
import { initialPortfolio } from './src/data/initialPortfolio.js';
import { personalService } from './src/services/personalService.js';
import { heroService } from './src/services/heroService.js';
import { aboutService } from './src/services/aboutService.js';
import { experienceService } from './src/services/experienceService.js';
import { skillsService } from './src/services/skillsService.js';
import { projectsService } from './src/services/projectsService.js';
import { educationService, certificationsService, achievementsService } from './src/services/academicService.js';
import { socialLinksService, contactService, navigationService } from './src/services/contactSocialNavService.js';

dotenv.config();
validateEnvironment();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.ADMIN_ALLOWED_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

// 1. Request Correlation ID
app.use(requestIdMiddleware);

// 2. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
  xContentTypeOptions: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// 3. CORS with Explicit Allowed Origins & Credentials Support
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS request rejected for origin: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID']
}));

// 4. Request Parsers & Static Files
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'server', 'uploads')));

// 5. Admin Security: Enforce Strict No-Cache Headers on ALL Admin Routes
app.use('/api/admin', noCacheMiddleware);

// Runtime Database Cache State
let currentPortfolio = JSON.parse(JSON.stringify(initialPortfolio));
let contactMessages = [];

// ==================== PUBLIC ENDPOINTS ====================

// Health Check
app.get('/api/health', healthController.getHealth);

// Public Portfolio Read-Only APIs (with public rate limiting & ETag Revalidation)
app.use('/api/portfolio', publicApiRateLimiter, publicCacheMiddleware());
app.get('/api/portfolio/personal', personalController.getPublicPersonal);
app.get('/api/portfolio/hero', heroController.getPublicHero);
app.get('/api/portfolio/about', aboutController.getPublicAbout);
app.get('/api/portfolio/experience', experienceController.getPublicExperiences);
app.get('/api/portfolio/skills', skillsController.getPublicSkills);
app.get('/api/portfolio/projects', projectsController.getPublicProjects);
app.get('/api/portfolio/education', educationController.getPublicEducation);
app.get('/api/portfolio/certifications', certificationsController.getPublicCertifications);
app.get('/api/portfolio/achievements', achievementsController.getPublicAchievements);
app.get('/api/portfolio/social-links', socialLinksController.getPublicSocialLinks);
app.get('/api/portfolio/contact', contactController.getPublicContact);
app.get('/api/portfolio/navigation', navigationController.getPublicNavigation);

// Dynamic Public Resume APIs
app.get('/api/portfolio/resume', resumeController.getPublicResume);
app.get('/api/portfolio/resume/download', resumeController.downloadPublicResume);

// Dynamic Public SEO & Site Settings APIs
app.get('/api/portfolio/seo', getPublicSeo);
app.get('/api/portfolio/site-settings', getPublicSiteSettings);
app.get('/api/portfolio/site-config', getPublicSiteConfig);

// Dynamic Public Media API
app.get('/api/media/:id', getPublicMedia);

app.get('/api/portfolio', async (req, res) => {
  try {
    const [
      personal,
      hero,
      about,
      experiences,
      skills,
      projects,
      education,
      certifications,
      achievements,
      socialLinks,
      contact,
      navigation
    ] = await Promise.all([
      personalService.getPublicProfile(),
      heroService.getPublicHero(),
      aboutService.getPublicAbout(),
      experienceService.getPublicExperiences(),
      skillsService.getPublicCategories(),
      projectsService.getPublicProjects(),
      educationService.getPublicEducation(),
      certificationsService.getPublicCertifications(),
      achievementsService.getPublicAchievements(),
      socialLinksService.getPublicSocialLinks(),
      contactService.getPublicContact(),
      navigationService.getPublicNavigation()
    ]);

    res.json({
      success: true,
      data: {
        personal: personal || currentPortfolio.personal,
        hero: hero || currentPortfolio.hero,
        about: about || currentPortfolio.about,
        experiences: experiences && experiences.length > 0 ? experiences : currentPortfolio.experiences,
        skills: skills && skills.length > 0 ? skills : currentPortfolio.skills,
        projects: projects && projects.length > 0 ? projects : currentPortfolio.projects,
        education: education && education.length > 0 ? education : currentPortfolio.education,
        certifications,
        achievements,
        socialLinks: socialLinks && socialLinks.length > 0 ? socialLinks : currentPortfolio.socialLinks,
        contact: contact || currentPortfolio.contact,
        navigation: navigation && navigation.length > 0 ? navigation : currentPortfolio.navigation
      }
    });
  } catch {
    res.json({ success: true, data: currentPortfolio });
  }
});

// Public Contact Message Submission
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }
  const newMessage = {
    id: `msg_${Date.now()}`,
    name,
    email,
    subject: subject || 'Portfolio Contact',
    message,
    createdAt: new Date().toISOString()
  };
  contactMessages.unshift(newMessage);
  res.status(201).json({ success: true, message: 'Message received cleanly!', data: newMessage });
});

// ==================== AUTHENTICATION ENDPOINTS ====================

app.post('/api/admin/auth/login', loginRateLimiter, authController.login);
app.post('/api/auth/login', loginRateLimiter, authController.login);
app.post('/api/admin/auth/forgot-password', loginRateLimiter, authController.forgotPassword);
app.post('/api/admin/auth/verify-reset-code', loginRateLimiter, authController.verifyResetCode);
app.post('/api/admin/auth/reset-password', loginRateLimiter, authController.resetPassword);
app.get('/api/admin/auth/me', requireAdminAuth, authController.getProfile);
app.get('/api/admin/auth/csrf', requireAdminAuth, authController.getCsrfToken);
app.post('/api/admin/auth/change-password', requireAdminAuth, sensitiveMutationLimiter, authController.changePassword);
app.post('/api/admin/auth/logout', authController.logout);
app.get('/api/admin/auth/status', authController.status);

// ==================== DASHBOARD SUMMARY ENDPOINT ====================

app.get('/api/admin/dashboard/summary', requireAdminAuth, dashboardController.getSummary);

// ==================== PROTECTED CMS ADMIN MODULE ENDPOINTS ====================

// 1. Personal Information CMS
app.get('/api/admin/personal', requireAdminAuth, personalController.getAdminPersonal);
app.put('/api/admin/personal', requireAdminAuth, personalController.updatePersonal);

// 2. Hero CMS
app.get('/api/admin/hero', requireAdminAuth, heroController.getAdminHero);
app.put('/api/admin/hero', requireAdminAuth, heroController.updateHero);

// 3. About & About Highlights CMS
app.get('/api/admin/about', requireAdminAuth, aboutController.getAdminAbout);
app.put('/api/admin/about', requireAdminAuth, aboutController.updateAbout);
app.post('/api/admin/about/highlights', requireAdminAuth, aboutController.addHighlight);
app.put('/api/admin/about/highlights/:id', requireAdminAuth, aboutController.updateHighlight);
app.delete('/api/admin/about/highlights/:id', requireAdminAuth, aboutController.deleteHighlight);
app.patch('/api/admin/about/highlights/:id/status', requireAdminAuth, aboutController.updateHighlightStatus);
app.patch('/api/admin/about/highlights/reorder', requireAdminAuth, aboutController.reorderHighlights);

// 4. Experience Management CMS
app.get('/api/admin/experience', requireAdminAuth, experienceController.getAdminExperiences);
app.post('/api/admin/experience', requireAdminAuth, experienceController.createExperience);
app.get('/api/admin/experience/:id', requireAdminAuth, experienceController.getExperienceById);
app.put('/api/admin/experience/:id', requireAdminAuth, experienceController.updateExperience);
app.delete('/api/admin/experience/:id', requireAdminAuth, experienceController.deleteExperience);
app.patch('/api/admin/experience/:id/status', requireAdminAuth, experienceController.updateStatus);
app.patch('/api/admin/experience/reorder', requireAdminAuth, experienceController.reorderExperiences);

// 5. Skills Topology CMS
app.get('/api/admin/skills', requireAdminAuth, skillsController.getAdminCategories);
app.get('/api/admin/skills/categories', requireAdminAuth, skillsController.getAdminCategories);
app.post('/api/admin/skills/categories', requireAdminAuth, skillsController.createCategory);
app.get('/api/admin/skills/categories/:id', requireAdminAuth, skillsController.getCategoryById);
app.put('/api/admin/skills/categories/:id', requireAdminAuth, skillsController.updateCategory);
app.delete('/api/admin/skills/categories/:id', requireAdminAuth, skillsController.deleteCategory);
app.patch('/api/admin/skills/categories/:id/status', requireAdminAuth, skillsController.updateCategoryStatus);
app.patch('/api/admin/skills/categories/reorder', requireAdminAuth, skillsController.reorderCategories);

app.get('/api/admin/skills/:id', requireAdminAuth, skillsController.getSkillById);
app.post('/api/admin/skills', requireAdminAuth, skillsController.createSkill);
app.put('/api/admin/skills/:id', requireAdminAuth, skillsController.updateSkill);
app.delete('/api/admin/skills/:id', requireAdminAuth, skillsController.deleteSkill);
app.patch('/api/admin/skills/:id/status', requireAdminAuth, skillsController.updateSkillStatus);
app.patch('/api/admin/skills/reorder', requireAdminAuth, skillsController.reorderSkills);

// 6. Production Projects CMS
app.get('/api/admin/projects', requireAdminAuth, projectsController.getAdminProjects);
app.post('/api/admin/projects', requireAdminAuth, projectsController.createProject);
app.get('/api/admin/projects/:id', requireAdminAuth, projectsController.getProjectById);
app.put('/api/admin/projects/:id', requireAdminAuth, projectsController.updateProject);
app.delete('/api/admin/projects/:id', requireAdminAuth, projectsController.deleteProject);
app.patch('/api/admin/projects/:id/status', requireAdminAuth, projectsController.updateStatus);
app.patch('/api/admin/projects/:id/featured', requireAdminAuth, projectsController.updateFeatured);
app.patch('/api/admin/projects/reorder', requireAdminAuth, projectsController.reorderProjects);

// 7. Academic Education CMS
app.get('/api/admin/education', requireAdminAuth, educationController.getAdminEducation);
app.post('/api/admin/education', requireAdminAuth, educationController.createEducation);
app.get('/api/admin/education/:id', requireAdminAuth, educationController.getEducationById);
app.put('/api/admin/education/:id', requireAdminAuth, educationController.updateEducation);
app.delete('/api/admin/education/:id', requireAdminAuth, educationController.deleteEducation);
app.patch('/api/admin/education/:id/status', requireAdminAuth, educationController.updateStatus);
app.patch('/api/admin/education/reorder', requireAdminAuth, educationController.reorderEducation);

// 8. Professional Certifications CMS
app.get('/api/admin/certifications', requireAdminAuth, certificationsController.getAdminCertifications);
app.post('/api/admin/certifications', requireAdminAuth, certificationsController.createCertification);
app.get('/api/admin/certifications/:id', requireAdminAuth, certificationsController.getCertificationById);
app.put('/api/admin/certifications/:id', requireAdminAuth, certificationsController.updateCertification);
app.delete('/api/admin/certifications/:id', requireAdminAuth, certificationsController.deleteCertification);
app.patch('/api/admin/certifications/:id/status', requireAdminAuth, certificationsController.updateStatus);
app.patch('/api/admin/certifications/reorder', requireAdminAuth, certificationsController.reorderCertifications);

// 9. Achievements CMS
app.get('/api/admin/achievements', requireAdminAuth, achievementsController.getAdminAchievements);
app.post('/api/admin/achievements', requireAdminAuth, achievementsController.createAchievement);
app.get('/api/admin/achievements/:id', requireAdminAuth, achievementsController.getAchievementById);
app.put('/api/admin/achievements/:id', requireAdminAuth, achievementsController.updateAchievement);
app.delete('/api/admin/achievements/:id', requireAdminAuth, achievementsController.deleteAchievement);
app.patch('/api/admin/achievements/:id/status', requireAdminAuth, achievementsController.updateStatus);
app.patch('/api/admin/achievements/reorder', requireAdminAuth, achievementsController.reorderAchievements);

// 10. Social Links CMS
app.get('/api/admin/social-links', requireAdminAuth, socialLinksController.getAdminSocialLinks);
app.post('/api/admin/social-links', requireAdminAuth, socialLinksController.createSocialLink);
app.get('/api/admin/social-links/:id', requireAdminAuth, socialLinksController.getSocialLinkById);
app.put('/api/admin/social-links/:id', requireAdminAuth, socialLinksController.updateSocialLink);
app.delete('/api/admin/social-links/:id', requireAdminAuth, socialLinksController.deleteSocialLink);
app.patch('/api/admin/social-links/:id/status', requireAdminAuth, socialLinksController.updateStatus);
app.patch('/api/admin/social-links/reorder', requireAdminAuth, socialLinksController.reorderSocialLinks);

// 11. Contact Settings CMS
app.get('/api/admin/contact', requireAdminAuth, contactController.getAdminContact);
app.put('/api/admin/contact', requireAdminAuth, contactController.updateContact);

// 12. Navigation CMS
app.get('/api/admin/navigation', requireAdminAuth, navigationController.getAdminNavigation);
app.post('/api/admin/navigation', requireAdminAuth, navigationController.createNavigationItem);
app.get('/api/admin/navigation/:id', requireAdminAuth, navigationController.getNavigationById);
app.put('/api/admin/navigation/:id', requireAdminAuth, navigationController.updateNavigationItem);
app.delete('/api/admin/navigation/:id', requireAdminAuth, navigationController.deleteNavigationItem);
app.patch('/api/admin/navigation/:id/status', requireAdminAuth, navigationController.updateStatus);
app.patch('/api/admin/navigation/reorder', requireAdminAuth, navigationController.reorderNavigation);

// 13. SEO CMS
app.get('/api/admin/seo', requireAdminAuth, getAdminSeo);
app.put('/api/admin/seo', requireAdminAuth, updateAdminSeo);
app.patch('/api/admin/seo', requireAdminAuth, updateAdminSeo);

// 14. Site Settings CMS
app.get('/api/admin/site-settings', requireAdminAuth, getAdminSiteSettings);
app.put('/api/admin/site-settings', requireAdminAuth, updateAdminSiteSettings);
app.patch('/api/admin/site-settings', requireAdminAuth, updateAdminSiteSettings);

// 15. Media Library CMS
app.get('/api/admin/media', requireAdminAuth, getAdminMediaList);
app.get('/api/admin/media/:id', requireAdminAuth, getAdminMediaById);
app.post('/api/admin/media/upload', requireAdminAuth, singleUploadMiddleware, uploadAdminMedia);
app.put('/api/admin/media/:id', requireAdminAuth, updateAdminMedia);
app.patch('/api/admin/media/:id', requireAdminAuth, updateAdminMedia);
app.patch('/api/admin/media/:id/status', requireAdminAuth, updateAdminMediaStatus);
app.patch('/api/admin/media/:id/visibility', requireAdminAuth, updateAdminMediaVisibility);
app.delete('/api/admin/media/:id', requireAdminAuth, deleteAdminMedia);

// 15. Publishing & Draft Management
app.get('/api/admin/publishing/summary', requireAdminAuth, getPublishingSummary);
app.get('/api/admin/publishing/audit-logs', requireAdminAuth, getAuditLogs);
app.post('/api/admin/publishing/publish-all', requireAdminAuth, sensitiveMutationLimiter, publishAllChanges);
app.post('/api/admin/publishing/discard-draft', requireAdminAuth, sensitiveMutationLimiter, discardDraftChanges);
app.post('/api/admin/publishing/publish/:entity/:id', requireAdminAuth, publishEntity);
app.get('/api/admin/publishing/preview', requireAdminAuth, getAdminPreviewData);

// 16. Resume Management CMS
app.get('/api/admin/resume', requireAdminAuth, resumeController.getAdminResumes);
app.post('/api/admin/resume', requireAdminAuth, singleResumeUploadMiddleware, resumeController.uploadResume);
app.get('/api/admin/resume/:id', requireAdminAuth, resumeController.getResumeById);
app.put('/api/admin/resume/:id', requireAdminAuth, resumeController.updateResume);
app.delete('/api/admin/resume/:id', requireAdminAuth, resumeController.deleteResume);
app.post('/api/admin/resume/:id/publish', requireAdminAuth, resumeController.publishResume);
app.post('/api/admin/resume/:id/archive', requireAdminAuth, resumeController.archiveResume);

import { leadsController } from './src/controllers/leadsController.js';

// Public Contact Form Submission Endpoint
app.post('/api/portfolio/contact/submit', publicApiRateLimiter, leadsController.submitPublicLead);

// Admin: Contact Submissions / Leads Management CMS
app.get('/api/admin/leads', requireAdminAuth, leadsController.getAdminLeads);
app.get('/api/admin/leads/unread-count', requireAdminAuth, leadsController.getUnreadCount);
app.get('/api/admin/leads/:id', requireAdminAuth, leadsController.getAdminLeadById);
app.put('/api/admin/leads/:id', requireAdminAuth, leadsController.updateAdminLead);
app.delete('/api/admin/leads/:id', requireAdminAuth, leadsController.deleteAdminLead);

// Serve Production Frontend SPA Build (dist) & Handle /admin Routing
const distPath = path.resolve(process.cwd(), 'dist');
const indexPath = path.resolve(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(404).send('404 Not Found - Frontend build (dist/index.html) missing. Please ensure "npm run build" is included in your Build Command.');
});

// Centralized Error Handler Middleware
app.use(errorHandler);

// Start Express Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Backend API] Express Server listening on http://localhost:${PORT}`);
  });
}

export default app;
