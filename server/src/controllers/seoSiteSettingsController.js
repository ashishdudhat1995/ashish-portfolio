import { seoService, siteSettingsService } from '../services/seoSiteSettingsService.js';
import { navigationService, contactService, socialLinksService } from '../services/contactSocialNavService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

// ==================== ADMIN SEO CONTROLLERS ====================

export const getAdminSeo = async (req, res) => {
  try {
    const data = await seoService.getAdminSeo();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch admin SEO settings.'
    });
  }
};

export const updateAdminSeo = async (req, res) => {
  try {
    const { structuredDataJson, canonicalUrl } = req.body || {};

    // Requirement 23: JSON-LD Syntax Validation
    if (structuredDataJson && typeof structuredDataJson === 'string' && structuredDataJson.trim() !== '') {
      try {
        JSON.parse(structuredDataJson);
      } catch {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_JSON_LD',
            message: 'The submitted structuredDataJson must be valid JSON-LD format.'
          }
        });
      }
    }

    // Requirement 21: URL Scheme Validation
    if (canonicalUrl && typeof canonicalUrl === 'string' && canonicalUrl.trim() !== '') {
      const lower = canonicalUrl.trim().toLowerCase();
      if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DANGEROUS_URL_SCHEME',
            message: 'Dangerous URL scheme rejected for canonicalUrl.'
          }
        });
      }
    }

    const data = await seoService.updateSeo(req.body);
    cacheService.invalidatePublicCache();
    return res.status(200).json({
      success: true,
      message: 'SEO settings saved successfully.',
      data
    });
  } catch (err) {
    if (err.name === 'ZodError' || err.issues || err.errors) {
      const issues = err.issues || err.errors || [];
      const errorMsg = issues.length > 0 ? issues.map(e => `${e.path?.join('.') || 'field'}: ${e.message}`).join(' | ') : err.message;
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errorMsg}`,
        errors: issues
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update SEO settings.'
    });
  }
};

// ==================== ADMIN SITE SETTINGS CONTROLLERS ====================

export const getAdminSiteSettings = async (req, res) => {
  try {
    const data = await siteSettingsService.getAdminSiteSettings();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch admin site settings.'
    });
  }
};

export const updateAdminSiteSettings = async (req, res) => {
  try {
    const data = await siteSettingsService.updateSiteSettings(req.body);
    cacheService.invalidatePublicCache();
    return res.status(200).json({
      success: true,
      message: 'Site settings saved successfully.',
      data
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      const errorMsg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errorMsg}`,
        errors: err.errors
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update site settings.'
    });
  }
};

// ==================== PUBLIC ENDPOINTS ====================

export const getPublicSeo = async (req, res) => {
  try {
    const data = await seoService.getPublicSeo();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public SEO metadata.'
    });
  }
};

export const getPublicSiteSettings = async (req, res) => {
  try {
    const data = await siteSettingsService.getPublicSiteSettings();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public site settings.'
    });
  }
};

export const getPublicSiteConfig = async (req, res) => {
  try {
    const [seo, siteSettings, navigation, contact, socialLinks] = await Promise.all([
      seoService.getPublicSeo(),
      siteSettingsService.getPublicSiteSettings(),
      navigationService.getPublicNavigation(),
      contactService.getPublicContact(),
      socialLinksService.getPublicSocialLinks()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        seo,
        siteSettings,
        navigation,
        contact,
        socialLinks
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch consolidated public site configuration.'
    });
  }
};
