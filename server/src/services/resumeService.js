import { resumeRepository } from '../repositories/resumeRepository.js';
import { mediaService } from './mediaService.js';
import { storageProvider } from '../storage/storageProvider.js';
import { cacheService } from '../middleware/cacheMiddleware.js';

export const resumeService = {
  /**
   * Process uploaded PDF file or select existing Media record, create Resume records
   */
  async uploadResume({ file, mediaId, title, versionLabel, publishNow = false }) {
    let mediaRecord;

    if (mediaId && String(mediaId).trim() !== '') {
      mediaRecord = await mediaService.getMediaById(mediaId);
      if (!mediaRecord) {
        throw new Error('Selected media asset not found in Media Library.');
      }
      const mime = (mediaRecord.mimeType || '').toLowerCase();
      if (mime !== 'application/pdf' && mediaRecord.mediaType !== 'DOCUMENT') {
        throw new Error('Selected media asset must be a valid PDF document.');
      }
    } else if (file) {
      const tempTitle = (title && title.trim()) || 'Ashishkumar Dudhat - Resume';
      mediaRecord = await mediaService.uploadMedia({
        file,
        altText: tempTitle,
        caption: versionLabel ? `Version ${versionLabel}` : 'PDF Resume',
        description: 'Official Curriculum Vitae',
        visibility: 'PUBLIC'
      });
    } else {
      throw new Error('A valid PDF resume file or an existing Media asset is required.');
    }

    const resumeTitle = (title && title.trim()) || mediaRecord.originalFilename || mediaRecord.filename || 'Ashishkumar Dudhat - Resume';

    // Create Resume entity linked to Media record
    let resumeRecord = await resumeRepository.createResume({
      mediaId: mediaRecord.id,
      title: resumeTitle,
      versionLabel: versionLabel ? versionLabel.trim() : null,
      status: publishNow ? 'PUBLISHED' : 'DRAFT',
      isActive: false
    });

    // If publishNow requested, publish & set active transactionally
    if (publishNow) {
      resumeRecord = await resumeRepository.publishResume(resumeRecord.id);
    }

    cacheService.invalidatePublicCache();
    return resumeRecord;
  },

  /**
   * Get all resumes for Admin CMS
   */
  async getAdminResumes() {
    return await resumeRepository.getAllResumes();
  },

  /**
   * Get resume by ID
   */
  async getResumeById(id) {
    return await resumeRepository.getResumeById(id);
  },

  /**
   * Update resume metadata
   */
  async updateResume(id, data) {
    const updated = await resumeRepository.updateResume(id, data);
    cacheService.invalidatePublicCache();
    return updated;
  },

  /**
   * Publish and activate resume transactionally
   */
  async publishResume(id) {
    const target = await resumeRepository.getResumeById(id);
    if (!target) {
      throw new Error(`Resume with ID '${id}' not found.`);
    }

    const published = await resumeRepository.publishResume(id);
    cacheService.invalidatePublicCache();
    return published;
  },

  /**
   * Archive resume
   */
  async archiveResume(id) {
    const archived = await resumeRepository.archiveResume(id);
    cacheService.invalidatePublicCache();
    return archived;
  },

  /**
   * Delete unused resume
   */
  async deleteResume(id) {
    const deleted = await resumeRepository.deleteResume(id);
    cacheService.invalidatePublicCache();
    return deleted;
  },

  /**
   * Get sanitized public metadata of active resume
   */
  async getPublicResume() {
    const active = await resumeRepository.getActivePublishedResume();
    if (!active || !active.media) {
      return null;
    }

    return {
      id: active.id,
      title: active.title,
      versionLabel: active.versionLabel,
      filename: active.media.originalFilename || active.media.filename,
      size: active.media.size,
      mimeType: active.media.mimeType,
      publishedAt: active.publishedAt || active.createdAt,
      downloadUrl: '/api/portfolio/resume/download'
    };
  },

  /**
   * Stream active resume PDF file to client
   */
  async streamPublicResume(res) {
    const active = await resumeRepository.getActivePublishedResume();
    if (!active || !active.media) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESUME_NOT_FOUND',
          message: 'No published resume is currently available for download.'
        }
      });
    }

    const storageKey = active.media.storageKey;
    if (!storageProvider.fileExists(storageKey)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Resume PDF file is missing from storage.'
        }
      });
    }

    // Format safe download filename
    const safeBaseName = (active.title || 'Ashishkumar-Dudhat-Resume')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    const downloadFilename = safeBaseName.endsWith('.pdf') ? safeBaseName : `${safeBaseName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', active.media.size);
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    const stream = storageProvider.getFileStream(storageKey);
    stream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'STREAM_ERROR',
            message: 'Failed to stream resume PDF file.'
          }
        });
      }
    });

    stream.pipe(res);
  }
};
