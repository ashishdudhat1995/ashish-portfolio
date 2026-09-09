import { seoSettingsRepository, siteSettingsRepository } from '../repositories/seoSiteSettingsRepository.js';
import { z } from 'zod';

// ==================== ZOD SCHEMAS ====================

const seoSettingsSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long.').max(150, 'Title must not exceed 150 characters.'),
  description: z.string().min(10, 'Meta description must be at least 10 characters long.').max(300, 'Meta description must not exceed 300 characters.'),
  keywords: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      const parsed = new URL(val.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Canonical URL must be a valid HTTP or HTTPS URL.'),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImageId: z.string().optional().nullable(),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
  twitterTitle: z.string().optional().nullable(),
  twitterDescription: z.string().optional().nullable(),
  twitterImageId: z.string().optional().nullable(),
  faviconMediaId: z.string().optional().nullable(),
  structuredDataEnabled: z.boolean().default(false),
  structuredDataJson: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      JSON.parse(val.trim());
      return true;
    } catch {
      return false;
    }
  }, 'Structured Data / JSON-LD must contain valid, well-formed JSON.')
});

const siteSettingsSchema = z.object({
  siteName: z.string().min(2, 'Site Name must be at least 2 characters long.'),
  defaultTitle: z.string().min(2, 'Default Title must be at least 2 characters long.'),
  defaultDescription: z.string().min(10, 'Default Description must be at least 10 characters long.'),
  locale: z.string().default('en-US'),
  timezone: z.string().default('Asia/Kolkata'),
  maintenanceMode: z.boolean().default(false),
  analyticsProvider: z.string().optional().nullable(),
  analyticsId: z.string().optional().nullable()
});

// ==================== SEO SERVICE ====================

export const seoService = {
  async getAdminSeo() {
    return await seoSettingsRepository.getSeoSettings();
  },

  async getPublicSeo() {
    const raw = await seoSettingsRepository.getSeoSettings();

    let source = raw;
    if (raw.status === 'DRAFT' && raw.publishedData) {
      source = typeof raw.publishedData === 'string' ? JSON.parse(raw.publishedData) : raw.publishedData;
    }

    // Construct dynamic robots string
    const robots = `${source.robotsIndex ? 'index' : 'noindex'}, ${source.robotsFollow ? 'follow' : 'nofollow'}`;

    return {
      title: source.title,
      description: source.description,
      keywords: source.keywords || '',
      canonicalUrl: source.canonicalUrl || null,
      robots,
      robotsIndex: source.robotsIndex,
      robotsFollow: source.robotsFollow,
      ogTitle: source.ogTitle || source.title,
      ogDescription: source.ogDescription || source.description,
      ogImageId: source.ogImageId || null,
      twitterCard: source.twitterCard || 'summary_large_image',
      twitterTitle: source.twitterTitle || source.title,
      twitterDescription: source.twitterDescription || source.description,
      twitterImageId: source.twitterImageId || null,
      faviconMediaId: source.faviconMediaId || null,
      structuredDataEnabled: source.structuredDataEnabled,
      structuredDataJson: source.structuredDataEnabled && source.structuredDataJson ? source.structuredDataJson : null
    };
  },

  async updateSeo(data) {
    const validated = seoSettingsSchema.parse(data);
    return await seoSettingsRepository.updateSeoSettings(validated);
  }
};

// ==================== SITE SETTINGS SERVICE ====================

export const siteSettingsService = {
  async getAdminSiteSettings() {
    return await siteSettingsRepository.getSiteSettings();
  },

  async getPublicSiteSettings() {
    const raw = await siteSettingsRepository.getSiteSettings();

    let source = raw;
    if (raw.status === 'DRAFT' && raw.publishedData) {
      source = typeof raw.publishedData === 'string' ? JSON.parse(raw.publishedData) : raw.publishedData;
    }

    return {
      siteName: source.siteName,
      defaultTitle: source.defaultTitle,
      defaultDescription: source.defaultDescription,
      locale: source.locale,
      timezone: source.timezone,
      maintenanceMode: source.maintenanceMode,
      analyticsProvider: source.analyticsProvider,
      analyticsId: source.analyticsId
    };
  },

  async updateSiteSettings(data) {
    const validated = siteSettingsSchema.parse(data);
    return await siteSettingsRepository.updateSiteSettings(validated);
  }
};
