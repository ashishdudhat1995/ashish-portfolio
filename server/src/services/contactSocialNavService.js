import { socialLinksRepository, contactSettingsRepository, navigationRepository } from '../repositories/contactSocialNavRepository.js';
import { personalRepository } from '../repositories/personalRepository.js';
import { z } from 'zod';

// ==================== ZOD SCHEMAS ====================

const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required.'),
  label: z.string().min(1, 'Label is required.'),
  url: z.string().min(1, 'URL is required.').refine((val) => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'URL must be a valid HTTP or HTTPS URL.'),
  iconKey: z.string().optional(),
  order: z.number().optional(),
  enabled: z.boolean().optional()
});

const navigationSchema = z.object({
  label: z.string().min(1, 'Navigation Label is required.'),
  target: z.string().min(1, 'Target anchor or URL is required.').refine((val) => {
    const trimmed = val.trim();
    if (trimmed.startsWith('#')) return true; // Valid section anchor
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true; // Relative path
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Target must be a valid section anchor (e.g. #about) or valid HTTP/HTTPS URL.'),
  type: z.enum(['section', 'external']).optional(),
  openInNewTab: z.boolean().optional(),
  order: z.number().optional(),
  enabled: z.boolean().optional()
});

// ==================== SOCIAL LINKS SERVICE ====================

export const socialLinksService = {
  async getAdminSocialLinks(search) {
    return await socialLinksRepository.getAllAdminSocialLinks(search);
  },

  async getPublicSocialLinks() {
    try {
      const raw = await socialLinksRepository.getPublicSocialLinks();
      return raw.map(link => ({
        id: link.id,
        platform: link.platform,
        label: link.label,
        url: link.url,
        iconKey: link.iconKey || link.platform.toLowerCase(),
        order: link.order
      }));
    } catch {
      return [
        { id: '1', platform: 'GitHub', label: 'GitHub Profile', url: 'https://github.com/ashishdudhat1995', iconKey: 'github', order: 1 },
        { id: '2', platform: 'LinkedIn', label: 'LinkedIn Profile', url: 'https://linkedin.com/in/ashishdudhat', iconKey: 'linkedin', order: 2 },
        { id: '3', platform: 'Email', label: 'Direct Email', url: 'mailto:dudhatashish1995@gmail.com', iconKey: 'email', order: 3 },
        { id: '4', platform: 'Phone', label: 'Direct Call', url: 'tel:+917600908370', iconKey: 'phone', order: 4 }
      ];
    }
  },

  async getSocialLinkById(id) {
    const item = await socialLinksRepository.getSocialLinkById(id);
    if (!item) throw new Error(`Social Link with ID "${id}" not found.`);
    return item;
  },

  async createSocialLink(data) {
    const validated = socialLinkSchema.parse(data);
    return await socialLinksRepository.createSocialLink(validated);
  },

  async updateSocialLink(id, data) {
    const validated = socialLinkSchema.parse(data);
    return await socialLinksRepository.updateSocialLink(id, validated);
  },

  async deleteSocialLink(id) {
    return await socialLinksRepository.deleteSocialLink(id);
  },

  async updateStatus(id, enabled) {
    return await socialLinksRepository.updateStatus(id, enabled);
  },

  async reorderSocialLinks(orderedIds) {
    if (!Array.isArray(orderedIds)) throw new Error('orderedIds must be an array of Social Link IDs.');
    return await socialLinksRepository.reorderSocialLinks(orderedIds);
  }
};

// ==================== CONTACT SETTINGS SERVICE ====================

export const contactService = {
  /**
   * Get merged Admin Contact view (Canonical Personal Info + Presentation Settings)
   */
  async getAdminContact() {
    const [personal, settings] = await Promise.all([
      personalRepository.getPrimaryProfile(),
      contactSettingsRepository.getContactSettings()
    ]);

    return {
      personal: {
        fullName: personal?.fullName || 'Ashishkumar Dudhat',
        professionalTitle: personal?.professionalTitle || 'Senior Software Engineer | Lead Engineer | Full Stack Developer',
        email: personal?.email || 'dudhatashish1995@gmail.com',
        phone: personal?.phone || '+91 7600908370',
        location: personal?.location || 'Ahmedabad, Gujarat',
        availability: personal?.availability || 'Available to rejoin immediately'
      },
      presentation: settings
    };
  },

  /**
   * Get Public Contact response (Merged safe public fields)
   */
  async getPublicContact() {
    try {
      const [personal, settings] = await Promise.all([
        personalRepository.getPrimaryProfile(),
        contactSettingsRepository.getContactSettings()
      ]);

      return {
        enabled: settings ? settings.enabled : true,
        heading: settings?.heading || "Let's Build Something Exceptional Together.",
        description: settings?.description || "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.",
        primaryCtaLabel: settings?.primaryCtaLabel || "Initiate Discussion",
        primaryCtaTarget: settings?.primaryCtaTarget || "#contact",
        contactInfo: {
          name: personal?.fullName || 'Ashishkumar Dudhat',
          title: personal?.professionalTitle || 'Senior Software Engineer | Lead Engineer | Full Stack Developer',
          email: personal?.email || 'dudhatashish1995@gmail.com',
          phone: personal?.phone || '+91 7600908370',
          location: personal?.location || 'Ahmedabad, Gujarat',
          availability: personal?.availability || 'Available to rejoin immediately'
        }
      };
    } catch {
      return {
        enabled: true,
        heading: "Let's Build Something Exceptional Together.",
        description: "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.",
        primaryCtaLabel: "Initiate Discussion",
        primaryCtaTarget: "#contact",
        contactInfo: {
          name: 'Ashishkumar Dudhat',
          title: 'Senior Software Engineer | Lead Engineer | Full Stack Developer',
          email: 'dudhatashish1995@gmail.com',
          phone: '+91 7600908370',
          location: 'Ahmedabad, Gujarat',
          availability: 'Available to rejoin immediately'
        }
      };
    }
  },

  /**
   * Update Contact Settings presentation parameters & option to update Canonical Personal Contact Info
   */
  async updateContact(data) {
    const presentationPayload = {
      heading: data.heading,
      description: data.description,
      primaryCtaLabel: data.primaryCtaLabel,
      primaryCtaTarget: data.primaryCtaTarget,
      enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
    };

    const updatedSettings = await contactSettingsRepository.updateContactSettings(presentationPayload);

    // If personal info fields were provided, update canonical PersonalInformation record
    if (data.email || data.phone || data.location || data.availability) {
      await personalRepository.upsertPrimaryProfile({
        email: data.email,
        phone: data.phone,
        location: data.location,
        availability: data.availability
      });
    }

    return await this.getAdminContact();
  }
};

// ==================== NAVIGATION SERVICE ====================

export const navigationService = {
  async getAdminNavigation() {
    return await navigationRepository.getAllAdminNavigation();
  },

  async getPublicNavigation() {
    try {
      const raw = await navigationRepository.getPublicNavigation();
      return raw.map(item => ({
        id: item.id,
        label: item.label,
        target: item.target,
        type: item.type,
        openInNewTab: item.openInNewTab,
        order: item.order
      }));
    } catch {
      return [
        { id: '1', label: 'About', target: '#about', type: 'section', openInNewTab: false, order: 1 },
        { id: '2', label: 'Experience', target: '#experience', type: 'section', openInNewTab: false, order: 2 },
        { id: '3', label: 'Skills', target: '#skills', type: 'section', openInNewTab: false, order: 3 },
        { id: '4', label: 'Projects', target: '#projects', type: 'section', openInNewTab: false, order: 4 },
        { id: '5', label: 'Education', target: '#education', type: 'section', openInNewTab: false, order: 5 },
        { id: '6', label: 'Contact', target: '#contact', type: 'section', openInNewTab: false, order: 6 }
      ];
    }
  },

  async getNavigationById(id) {
    const item = await navigationRepository.getNavigationById(id);
    if (!item) throw new Error(`Navigation Item with ID "${id}" not found.`);
    return item;
  },

  async createNavigationItem(data) {
    const validated = navigationSchema.parse(data);
    return await navigationRepository.createNavigationItem(validated);
  },

  async updateNavigationItem(id, data) {
    const validated = navigationSchema.parse(data);
    return await navigationRepository.updateNavigationItem(id, validated);
  },

  async deleteNavigationItem(id) {
    return await navigationRepository.deleteNavigationItem(id);
  },

  async updateStatus(id, enabled) {
    return await navigationRepository.updateStatus(id, enabled);
  },

  async reorderNavigation(orderedIds) {
    if (!Array.isArray(orderedIds)) throw new Error('orderedIds must be an array of Navigation Item IDs.');
    return await navigationRepository.reorderNavigation(orderedIds);
  }
};
