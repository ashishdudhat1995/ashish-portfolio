import { aboutService } from '../services/aboutService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const aboutController = {
  async getAdminAbout(req, res, next) {
    try {
      const data = await aboutService.getAdminAbout();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateAbout(req, res, next) {
    try {
      const data = await aboutService.updateAbout(req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'About narrative saved successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async addHighlight(req, res, next) {
    try {
      const data = await aboutService.addHighlight(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'About highlight created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateHighlight(req, res, next) {
    try {
      const data = await aboutService.updateHighlight(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'About highlight updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteHighlight(req, res, next) {
    try {
      await aboutService.deleteHighlight(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'About highlight deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateHighlightStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await aboutService.updateHighlightStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Highlight status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderHighlights(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await aboutService.reorderHighlights(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Highlights reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async getPublicAbout(req, res, next) {
    try {
      const data = await aboutService.getPublicAbout();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
