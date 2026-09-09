import { mediaRepository } from '../repositories/mediaRepository.js';
import { storageProvider } from '../storage/storageProvider.js';
import { validateFileMetadata, sanitizeSvgContent, extractDimensions } from '../utils/imageValidation.js';
import { z } from 'zod';

const updateMetadataSchema = z.object({
  altText: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'public', 'private']).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'active', 'archived']).optional()
});

export const mediaService = {
  /**
   * Upload file, sanitize if SVG, save to storage & DB
   */
  async uploadMedia({ file, altText, caption, description, visibility = 'PUBLIC' }) {
    // 1. Validate file metadata
    validateFileMetadata(file);

    let buffer = file.buffer;
    const mimeType = (file.mimetype || file.mimeType || '').toLowerCase();
    const originalFilename = file.originalname || file.originalFilename || 'media-upload';

    // 2. Sanitize SVG if SVG
    if (mimeType === 'image/svg+xml') {
      const rawText = buffer.toString('utf-8');
      const sanitizedSvg = sanitizeSvgContent(rawText);
      buffer = Buffer.from(sanitizedSvg, 'utf-8');
    }

    // 3. Extract dimensions
    const { width, height } = extractDimensions(buffer, mimeType);

    // 4. Determine media type
    let mediaType = 'IMAGE';
    if (mimeType.startsWith('video/')) mediaType = 'VIDEO';
    else if (mimeType.includes('pdf') || mimeType.includes('document')) mediaType = 'DOCUMENT';

    // 5. Save to physical storage
    let uploadResult;
    try {
      uploadResult = await storageProvider.uploadFile({
        buffer,
        originalFilename,
        mimeType
      });
    } catch (err) {
      throw new Error('Storage provider error: ' + err.message);
    }

    // 6. Save database record (Roll back storage if DB fails)
    try {
      const record = await mediaRepository.createMedia({
        filename: originalFilename,
        originalFilename,
        storageKey: uploadResult.storageKey,
        mimeType,
        mediaType,
        size: uploadResult.size,
        width,
        height,
        altText,
        caption,
        description,
        visibility: visibility.toUpperCase()
      });

      return {
        ...record,
        url: uploadResult.publicUrl
      };
    } catch (dbErr) {
      // Rollback physical file
      await storageProvider.deleteFile(uploadResult.storageKey).catch(() => {});
      throw new Error('Failed to create media database record: ' + dbErr.message);
    }
  },

  /**
   * Get admin media list with usage checks
   */
  async getAdminMediaList(params) {
    const res = await mediaRepository.getAdminMediaList(params);

    const itemsWithUrls = await Promise.all(res.items.map(async (item) => {
      const usage = await mediaRepository.checkMediaUsage(item.id);
      return {
        ...item,
        url: storageProvider.getPublicUrl(item.storageKey),
        usage
      };
    }));

    return {
      items: itemsWithUrls,
      pagination: res.pagination
    };
  },

  /**
   * Get single media item
   */
  async getMediaById(id) {
    const item = await mediaRepository.getMediaById(id);
    if (!item) return null;

    const usage = await mediaRepository.checkMediaUsage(id);

    return {
      ...item,
      url: storageProvider.getPublicUrl(item.storageKey),
      usage
    };
  },

  /**
   * Update media metadata
   */
  async updateMediaMetadata(id, data) {
    const validated = updateMetadataSchema.parse(data);
    const updated = await mediaRepository.updateMedia(id, validated);
    const usage = await mediaRepository.checkMediaUsage(id);

    return {
      ...updated,
      url: storageProvider.getPublicUrl(updated.storageKey),
      usage
    };
  },

  /**
   * Delete or archive media item cleanly with usage protection
   */
  async deleteMediaItem(id, { force = false } = {}) {
    const item = await mediaRepository.getMediaById(id);
    if (!item) {
      throw new Error('Media item not found.');
    }

    const usage = await mediaRepository.checkMediaUsage(id);

    if (usage.isReferenced && !force) {
      // Archive instead of hard delete to preserve public integrity for active references
      const archived = await mediaRepository.updateMedia(id, { status: 'ARCHIVED' });
      return {
        action: 'archived',
        message: `Media is currently in use by [${usage.references.join(', ')}]. Item has been set to ARCHIVED status instead of deleted.`,
        item: {
          ...archived,
          url: storageProvider.getPublicUrl(archived.storageKey),
          usage
        }
      };
    }

    // Unreferenced, inactive resume history, or force delete: remove from storage & DB
    await storageProvider.deleteFile(item.storageKey).catch(() => {});
    await mediaRepository.deleteMedia(id, { force });

    return {
      action: 'deleted',
      message: 'Media asset deleted successfully.'
    };
  },

  /**
   * Get public media by ID or storage key
   */
  async getPublicMedia(idOrKey) {
    let item = await mediaRepository.getMediaById(idOrKey);
    if (!item) {
      item = await mediaRepository.getMediaByStorageKey(idOrKey);
    }

    if (!item) return null;

    // Public access protection: check visibility and status
    if (item.visibility !== 'PUBLIC' || item.status !== 'ACTIVE') {
      return null;
    }

    return {
      id: item.id,
      filename: item.filename,
      mimeType: item.mimeType,
      mediaType: item.mediaType,
      size: item.size,
      width: item.width,
      height: item.height,
      altText: item.altText || item.filename,
      caption: item.caption,
      url: storageProvider.getPublicUrl(item.storageKey)
    };
  }
};
