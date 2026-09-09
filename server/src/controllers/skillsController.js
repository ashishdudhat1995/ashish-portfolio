import { skillsService } from '../services/skillsService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const skillsController = {
  // Public Endpoint
  async getPublicSkills(req, res, next) {
    try {
      const data = await skillsService.getPublicCategories();
      return res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  // Category Admin Endpoints
  async getAdminCategories(req, res, next) {
    try {
      const categories = await skillsService.getAdminCategories();
      const totalCategories = categories.length;
      const totalEnabledSkills = categories.reduce((acc, cat) => {
        return acc + (cat.skills ? cat.skills.filter(s => s.enabled).length : 0);
      }, 0);

      return res.json({
        success: true,
        summary: {
          totalCategories,
          totalEnabledSkills
        },
        data: categories
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryById(req, res, next) {
    try {
      const data = await skillsService.getCategoryById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createCategory(req, res, next) {
    try {
      const data = await skillsService.createCategory(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Skill category created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateCategory(req, res, next) {
    try {
      const data = await skillsService.updateCategory(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Skill category updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const force = req.query.force === 'true';
      await skillsService.deleteCategory(req.params.id, force);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Skill category deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateCategoryStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await skillsService.updateCategoryStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Category status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderCategories(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await skillsService.reorderCategories(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Categories reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  // Skill Admin Endpoints
  async getSkillById(req, res, next) {
    try {
      const data = await skillsService.getSkillById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createSkill(req, res, next) {
    try {
      const data = await skillsService.createSkill(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Skill created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateSkill(req, res, next) {
    try {
      const data = await skillsService.updateSkill(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Skill updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteSkill(req, res, next) {
    try {
      await skillsService.deleteSkill(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Skill deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateSkillStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await skillsService.updateSkillStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Skill status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderSkills(req, res, next) {
    try {
      const { categoryId, orderedIds } = req.body;
      await skillsService.reorderSkills(categoryId, orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Skills reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
