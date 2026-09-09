import { projectsService } from '../services/projectsService.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const projectsController = {
  // Public Read-Only Endpoint
  async getPublicProjects(req, res, next) {
    try {
      const data = await projectsService.getPublicProjects();
      return res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

  // Admin Protected Endpoints
  async getAdminProjects(req, res, next) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const projects = await projectsService.getAdminProjects(search);

      const totalProjects = projects.length;
      const enabledProjects = projects.filter(p => p.enabled).length;
      const featuredProjects = projects.filter(p => p.featured).length;

      return res.json({
        success: true,
        summary: {
          totalProjects,
          enabledProjects,
          featuredProjects
        },
        data: projects
      });
    } catch (err) {
      next(err);
    }
  },

  async getProjectById(req, res, next) {
    try {
      const data = await projectsService.getProjectById(req.params.id);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  },

  async createProject(req, res, next) {
    try {
      const data = await projectsService.createProject(req.body);
      cacheService.invalidatePublicCache();
      return res.status(201).json({ success: true, message: 'Project created successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateProject(req, res, next) {
    try {
      const data = await projectsService.updateProject(req.params.id, req.body);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Project updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteProject(req, res, next) {
    try {
      await projectsService.deleteProject(req.params.id);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Project deleted successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { enabled } = req.body;
      const data = await projectsService.updateStatus(req.params.id, enabled);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Project status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateFeatured(req, res, next) {
    try {
      const { featured } = req.body;
      const data = await projectsService.updateFeatured(req.params.id, featured);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Project featured status updated successfully.', data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async reorderProjects(req, res, next) {
    try {
      const { orderedIds } = req.body;
      await projectsService.reorderProjects(orderedIds);
      cacheService.invalidatePublicCache();
      return res.json({ success: true, message: 'Projects reordered successfully.' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
