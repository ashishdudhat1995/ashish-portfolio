import { socialLinksService, contactService, navigationService } from '../services/contactSocialNavService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

// ==================== SOCIAL LINKS CONTROLLER ====================

export const socialLinksController = {
  async getPublicSocialLinks(req, res, next) {
    try {
      const socialLinks = await socialLinksService.getPublicSocialLinks();
      return res.json({ success: true, count: socialLinks.length, socialLinks });
    } catch (err) {
      next(err);
    }
  },

  async getAdminSocialLinks(req, res, next) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const list = await socialLinksService.getAdminSocialLinks(search);
      return res.json({
        success: true,
        summary: {
          totalLinks: list.length,
          enabledLinks: list.filter(l => l.enabled).length
        },
        data: list
      });
    } catch (err) {
      next(err);
    }
  },

  async getSocialLinkById(req, res, next) {
    try {
      const data = await socialLinksService.getSocialLinkById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createSocialLink(req, res, next) {
    try {
      const data = await socialLinksService.createSocialLink(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Social link created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateSocialLink(req, res, next) {
    try {
      const data = await socialLinksService.updateSocialLink(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Social link updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteSocialLink(req, res, next) {
    try {
      await socialLinksService.deleteSocialLink(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Social link deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await socialLinksService.updateStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Social link status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderSocialLinks(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await socialLinksService.reorderSocialLinks(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Social links reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};

// ==================== CONTACT CONTROLLER ====================

export const contactController = {
  async getPublicContact(req, res, next) {
    try {
      const data = await contactService.getPublicContact();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAdminContact(req, res, next) {
    try {
      const data = await contactService.getAdminContact();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateContact(req, res, next) {
    try {
      const data = await contactService.updateContact(req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Contact information updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};

// ==================== NAVIGATION CONTROLLER ====================

export const navigationController = {
  async getPublicNavigation(req, res, next) {
    try {
      const items = await navigationService.getPublicNavigation();
      return res.json({ success: true, count: items.length, items });
    } catch (err) {
      next(err);
    }
  },

  async getAdminNavigation(req, res, next) {
    try {
      const items = await navigationService.getAdminNavigation();
      return res.json({
        success: true,
        summary: {
          totalItems: items.length,
          enabledItems: items.filter(i => i.enabled).length
        },
        items
      });
    } catch (err) {
      next(err);
    }
  },

  async getNavigationById(req, res, next) {
    try {
      const data = await navigationService.getNavigationById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createNavigationItem(req, res, next) {
    try {
      const data = await navigationService.createNavigationItem(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Navigation item created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateNavigationItem(req, res, next) {
    try {
      const data = await navigationService.updateNavigationItem(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Navigation item updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteNavigationItem(req, res, next) {
    try {
      await navigationService.deleteNavigationItem(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Navigation item deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await navigationService.updateStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Navigation item status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderNavigation(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await navigationService.reorderNavigation(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Navigation items reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
