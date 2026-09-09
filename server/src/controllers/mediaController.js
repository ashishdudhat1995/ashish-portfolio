import { mediaService } from '../services/mediaService.js';

export const getAdminMediaList = async (req, res) => {
  try {
    const { page, limit, search, mediaType, status, visibility, sortBy, sortOrder } = req.query;
    const data = await mediaService.getAdminMediaList({
      page,
      limit,
      search,
      mediaType,
      status,
      visibility,
      sortBy,
      sortOrder
    });

    return res.status(200).json({
      success: true,
      data: data.items,
      pagination: data.pagination
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch media library.'
    });
  }
};

export const getAdminMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await mediaService.getMediaById(id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: media
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch media asset.'
    });
  }
};

export const uploadAdminMedia = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No media file provided in request.'
      });
    }

    const { altText, caption, description, visibility } = req.body || {};

    const media = await mediaService.uploadMedia({
      file,
      altText,
      caption,
      description,
      visibility
    });

    return res.status(201).json({
      success: true,
      message: 'Media uploaded and processed successfully.',
      data: media
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to upload media asset.'
    });
  }
};

export const updateAdminMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await mediaService.updateMediaMetadata(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Media metadata updated successfully.',
      data: updated
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      const errorMsg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errorMsg}`
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update media metadata.'
    });
  }
};

export const updateAdminMediaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.'
      });
    }

    const updated = await mediaService.updateMediaMetadata(id, { status });
    return res.status(200).json({
      success: true,
      message: 'Media status updated successfully.',
      data: updated
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update media status.'
    });
  }
};

export const updateAdminMediaVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;
    if (!visibility) {
      return res.status(400).json({
        success: false,
        message: 'Visibility is required.'
      });
    }

    const updated = await mediaService.updateMediaMetadata(id, { visibility });
    return res.status(200).json({
      success: true,
      message: 'Media visibility updated successfully.',
      data: updated
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update media visibility.'
    });
  }
};

export const deleteAdminMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';

    const result = await mediaService.deleteMediaItem(id, { force });
    return res.status(200).json({
      success: true,
      action: result.action,
      message: result.message,
      data: result.item || null
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to delete media asset.'
    });
  }
};

export const getPublicMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await mediaService.getPublicMedia(id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found or access restricted.'
      });
    }

    return res.status(200).json({
      success: true,
      data: media
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public media asset.'
    });
  }
};
