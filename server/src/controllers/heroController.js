import { heroService } from '../services/heroService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const heroController = {
  async getAdminHero(req, res, next) {
    try {
      const data = await heroService.getAdminHero();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateHero(req, res, next) {
    try {
      const data = await heroService.updateHero(req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Hero content saved successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async getPublicHero(req, res, next) {
    try {
      const data = await heroService.getPublicHero();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
