import { experienceService } from '../services/experienceService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const experienceController = {
  async getAdminExperiences(req, res, next) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const data = await experienceService.getAdminExperiences(search);
      return res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  async getPublicExperiences(req, res, next) {
    try {
      const data = await experienceService.getPublicExperiences();
      return res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  async getExperienceById(req, res, next) {
    try {
      const data = await experienceService.getExperienceById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createExperience(req, res, next) {
    try {
      const data = await experienceService.createExperience(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Experience record created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateExperience(req, res, next) {
    try {
      const data = await experienceService.updateExperience(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Experience record updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteExperience(req, res, next) {
    try {
      await experienceService.deleteExperience(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Experience record deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await experienceService.updateStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Experience status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderExperiences(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await experienceService.reorderExperiences(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Experience items reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
