import { resumeService } from '../services/resumeService.js';

export const resumeController = {
  // Admin Endpoints
  async getAdminResumes(req, res, next) {
    try {
      const list = await resumeService.getAdminResumes();
      const activeResume = list.find(r => r.isActive && r.status === 'PUBLISHED') || null;
      return res.json({
        success: true,
        summary: {
          totalResumes: list.length,
          activeResumeId: activeResume ? activeResume.id : null,
          hasActiveResume: !!activeResume
        },
        data: list
      });
    } catch (err) {
      next(err);
    }
  },

  async uploadResume(req, res, next) {
    try {
      const { title, versionLabel, publishNow, mediaId } = req.body || {};
      const file = req.file;

      const record = await resumeService.uploadResume({
        file,
        mediaId,
        title,
        versionLabel,
        publishNow: publishNow === 'true' || publishNow === true
      });

      return res.status(201).json({
        success: true,
        message: 'Resume PDF uploaded successfully.',
        data: record
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: err.message
        }
      });
    }
  },

  async getResumeById(req, res, next) {
    try {
      const data = await resumeService.getResumeById(req.params.id);
      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Resume record '${req.params.id}' not found.`
          }
        });
      }
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateResume(req, res, next) {
    try {
      const data = await resumeService.updateResume(req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Resume details updated successfully.',
        data
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err.message
        }
      });
    }
  },

  async publishResume(req, res, next) {
    try {
      const data = await resumeService.publishResume(req.params.id);
      return res.json({
        success: true,
        message: 'Resume published and set as active publicly.',
        data
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PUBLISH_FAILED',
          message: err.message
        }
      });
    }
  },

  async archiveResume(req, res, next) {
    try {
      const data = await resumeService.archiveResume(req.params.id);
      return res.json({
        success: true,
        message: 'Resume archived successfully.',
        data
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ARCHIVE_FAILED',
          message: err.message
        }
      });
    }
  },

  async deleteResume(req, res, next) {
    try {
      await resumeService.deleteResume(req.params.id);
      return res.json({
        success: true,
        message: 'Resume record deleted successfully.'
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: err.message
        }
      });
    }
  },

  // Public Endpoints
  async getPublicResume(req, res, next) {
    try {
      const resume = await resumeService.getPublicResume();
      return res.json({
        success: true,
        data: resume ? { resume } : { resume: null }
      });
    } catch (err) {
      next(err);
    }
  },

  async downloadPublicResume(req, res, next) {
    try {
      await resumeService.streamPublicResume(res);
    } catch (err) {
      next(err);
    }
  }
};
