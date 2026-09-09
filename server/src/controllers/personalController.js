import { personalService } from '../services/personalService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const personalController = {
  async getAdminPersonal(req, res, next) {
    try {
      const data = await personalService.getAdminProfile();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updatePersonal(req, res, next) {
    try {
      const data = await personalService.updateProfile(req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Personal information saved successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async getPublicPersonal(req, res, next) {
    try {
      const data = await personalService.getPublicProfile();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
