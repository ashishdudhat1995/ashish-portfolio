import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seoSettingsRepository = {
  /**
   * Get singleton SeoSettings record or create default if missing
   */
  async getSeoSettings() {
    try {
      let record = await prisma.seoSettings.findUnique({
        where: { id: 'default-seo' }
      });

      if (!record) {
        record = await prisma.seoSettings.create({
          data: {
            id: 'default-seo',
            title: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
            description: 'Senior Software Engineer & Lead Engineer with 8+ years of experience architecting and scaling production web applications across MERN & MEAN full stack environments.',
            keywords: 'Senior Software Engineer, Technical Lead, Full Stack Developer, React, Node.js, TypeScript, PostgreSQL, Angular, MERN, Microservices',
            robotsIndex: true,
            robotsFollow: true,
            twitterCard: 'summary_large_image',
            structuredDataEnabled: true,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            structuredDataJson: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Ashishkumar Dudhat",
              "jobTitle": "Senior Software Engineer & Lead Engineer",
              "sameAs": [
                "https://github.com/ashishkumar-dudhat",
                "https://linkedin.com/in/ashishkumar-dudhat"
              ]
            }, null, 2)
          }
        });
      }

      return record;
    } catch (err) {
      throw new Error('Database error fetching SEO settings: ' + err.message);
    }
  },

  /**
   * Upsert singleton SeoSettings record
   */
  async updateSeoSettings(data) {
    try {
      const existing = await this.getSeoSettings();
      const publishedDataSnapshot = existing.publishedData || (existing.status === 'PUBLISHED' ? JSON.parse(JSON.stringify(existing)) : null);
      const newStatus = data.status || 'DRAFT';

      return await prisma.seoSettings.upsert({
        where: { id: 'default-seo' },
        update: {
          title: data.title,
          description: data.description,
          keywords: data.keywords !== undefined ? data.keywords : null,
          canonicalUrl: data.canonicalUrl !== undefined ? (data.canonicalUrl?.trim() || null) : null,
          robotsIndex: data.robotsIndex !== undefined ? Boolean(data.robotsIndex) : true,
          robotsFollow: data.robotsFollow !== undefined ? Boolean(data.robotsFollow) : true,
          ogTitle: data.ogTitle !== undefined ? (data.ogTitle?.trim() || null) : null,
          ogDescription: data.ogDescription !== undefined ? (data.ogDescription?.trim() || null) : null,
          ogImageId: data.ogImageId !== undefined ? (data.ogImageId?.trim() || null) : null,
          twitterCard: data.twitterCard || 'summary_large_image',
          twitterTitle: data.twitterTitle !== undefined ? (data.twitterTitle?.trim() || null) : null,
          twitterDescription: data.twitterDescription !== undefined ? (data.twitterDescription?.trim() || null) : null,
          twitterImageId: data.twitterImageId !== undefined ? (data.twitterImageId?.trim() || null) : null,
          faviconMediaId: data.faviconMediaId !== undefined ? (data.faviconMediaId?.trim() || null) : null,
          structuredDataEnabled: data.structuredDataEnabled !== undefined ? Boolean(data.structuredDataEnabled) : false,
          structuredDataJson: data.structuredDataJson !== undefined ? (data.structuredDataJson?.trim() || null) : null,
          status: newStatus,
          publishedData: publishedDataSnapshot
        },
        create: {
          id: 'default-seo',
          title: data.title || 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
          description: data.description || 'Senior Software Engineer & Lead Engineer specializing in full stack MERN & MEAN applications.',
          keywords: data.keywords || null,
          canonicalUrl: data.canonicalUrl?.trim() || null,
          robotsIndex: data.robotsIndex !== undefined ? Boolean(data.robotsIndex) : true,
          robotsFollow: data.robotsFollow !== undefined ? Boolean(data.robotsFollow) : true,
          ogTitle: data.ogTitle?.trim() || null,
          ogDescription: data.ogDescription?.trim() || null,
          ogImageId: data.ogImageId?.trim() || null,
          twitterCard: data.twitterCard || 'summary_large_image',
          twitterTitle: data.twitterTitle?.trim() || null,
          twitterDescription: data.twitterDescription?.trim() || null,
          twitterImageId: data.twitterImageId?.trim() || null,
          faviconMediaId: data.faviconMediaId?.trim() || null,
          structuredDataEnabled: data.structuredDataEnabled !== undefined ? Boolean(data.structuredDataEnabled) : false,
          structuredDataJson: data.structuredDataJson?.trim() || null,
          status: 'PUBLISHED',
          publishedAt: new Date()
        }
      });
    } catch (err) {
      throw new Error('Database error updating SEO settings: ' + err.message);
    }
  }
};

export const siteSettingsRepository = {
  /**
   * Get singleton SiteSettings record or create default if missing
   */
  async getSiteSettings() {
    try {
      let record = await prisma.siteSettings.findUnique({
        where: { id: 'default-site-settings' }
      });

      if (!record) {
        record = await prisma.siteSettings.create({
          data: {
            id: 'default-site-settings',
            siteName: 'Ashishkumar Dudhat Portfolio',
            defaultTitle: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
            defaultDescription: 'Senior Software Engineer & Lead Engineer specializing in full stack Web Applications, Microservices, and Cloud Architecture.',
            locale: 'en-US',
            timezone: 'Asia/Kolkata',
            maintenanceMode: false,
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        });
      }

      return record;
    } catch (err) {
      throw new Error('Database error fetching site settings: ' + err.message);
    }
  },

  /**
   * Upsert singleton SiteSettings record
   */
  async updateSiteSettings(data) {
    try {
      const existing = await this.getSiteSettings();
      const publishedDataSnapshot = existing.publishedData || (existing.status === 'PUBLISHED' ? JSON.parse(JSON.stringify(existing)) : null);
      const newStatus = data.status || 'DRAFT';

      return await prisma.siteSettings.upsert({
        where: { id: 'default-site-settings' },
        update: {
          siteName: data.siteName,
          defaultTitle: data.defaultTitle,
          defaultDescription: data.defaultDescription,
          locale: data.locale || 'en-US',
          timezone: data.timezone || 'Asia/Kolkata',
          maintenanceMode: data.maintenanceMode !== undefined ? Boolean(data.maintenanceMode) : false,
          analyticsProvider: data.analyticsProvider !== undefined ? (data.analyticsProvider?.trim() || null) : null,
          analyticsId: data.analyticsId !== undefined ? (data.analyticsId?.trim() || null) : null,
          status: newStatus,
          publishedData: publishedDataSnapshot
        },
        create: {
          id: 'default-site-settings',
          siteName: data.siteName || 'Ashishkumar Dudhat Portfolio',
          defaultTitle: data.defaultTitle || 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
          defaultDescription: data.defaultDescription || 'Senior Software Engineer & Lead Engineer specializing in full stack Web Applications, Microservices, and Cloud Architecture.',
          locale: data.locale || 'en-US',
          timezone: data.timezone || 'Asia/Kolkata',
          maintenanceMode: data.maintenanceMode !== undefined ? Boolean(data.maintenanceMode) : false,
          analyticsProvider: data.analyticsProvider?.trim() || null,
          analyticsId: data.analyticsId?.trim() || null,
          status: 'PUBLISHED',
          publishedAt: new Date()
        }
      });
    } catch (err) {
      throw new Error('Database error updating site settings: ' + err.message);
    }
  }
};
