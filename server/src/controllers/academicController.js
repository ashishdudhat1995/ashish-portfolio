import { educationService, certificationsService, achievementsService } from '../services/academicService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

// ==================== EDUCATION CONTROLLER ====================

export const educationController = {
  async getPublicEducation(req, res, next) {
    try {
      const data = await educationService.getPublicEducation();
      return res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  async getAdminEducation(req, res, next) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const list = await educationService.getAdminEducation(search);
      return res.json({
        success: true,
        summary: {
          totalEducation: list.length,
          enabledEducation: list.filter(e => e.enabled).length
        },
        data: list
      });
    } catch (err) {
      next(err);
    }
  },

  async getEducationById(req, res, next) {
    try {
      const data = await educationService.getEducationById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createEducation(req, res, next) {
    try {
      const data = await educationService.createEducation(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Education record created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateEducation(req, res, next) {
    try {
      const data = await educationService.updateEducation(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Education record updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteEducation(req, res, next) {
    try {
      await educationService.deleteEducation(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Education record deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await educationService.updateStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Education status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderEducation(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await educationService.reorderEducation(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Education records reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};

// ==================== CERTIFICATIONS CONTROLLER ====================

export const certificationsController = {
  async getPublicCertifications(req, res, next) {
    try {
      const data = await certificationsService.getPublicCertifications();
      return res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  async getAdminCertifications(req, res, next) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const list = await certificationsService.getAdminCertifications(search);
      return res.json({
        success: true,
        summary: {
          totalCertifications: list.length,
          enabledCertifications: list.filter(c => c.enabled).length
        },
        data: list
      });
    } catch (err) {
      next(err);
    }
  },

  async getCertificationById(req, res, next) {
    try {
      const data = await certificationsService.getCertificationById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createCertification(req, res, next) {
    try {
      const data = await certificationsService.createCertification(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Certification record created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateCertification(req, res, next) {
    try {
      const data = await certificationsService.updateCertification(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Certification record updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteCertification(req, res, next) {
    try {
      await certificationsService.deleteCertification(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Certification record deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await certificationsService.updateStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Certification status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderCertifications(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await certificationsService.reorderCertifications(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Certifications reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};

// ==================== ACHIEVEMENTS CONTROLLER ====================

export const achievementsController = {
  async getPublicAchievements(req, res, next) {
    try {
      const data = await achievementsService.getPublicAchievements();
      return res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  async getAdminAchievements(req, res, next) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const list = await achievementsService.getAdminAchievements(search);
      return res.json({
        success: true,
        summary: {
          totalAchievements: list.length,
          enabledAchievements: list.filter(a => a.enabled).length
        },
        data: list
      });
    } catch (err) {
      next(err);
    }
  },

  async getAchievementById(req, res, next) {
    try {
      const data = await achievementsService.getAchievementById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createAchievement(req, res, next) {
    try {
      const data = await achievementsService.createAchievement(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Achievement record created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateAchievement(req, res, next) {
    try {
      const data = await achievementsService.updateAchievement(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Achievement record updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteAchievement(req, res, next) {
    try {
      await achievementsService.deleteAchievement(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Achievement record deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await achievementsService.updateStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Achievement status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderAchievements(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await achievementsService.reorderAchievements(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Achievements reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
