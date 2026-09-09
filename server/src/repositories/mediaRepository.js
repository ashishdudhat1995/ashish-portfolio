import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const mediaRepository = {
  /**
   * Create a new Media record
   */
  async createMedia(data) {
    try {
      return await prisma.media.create({
        data: {
          filename: data.filename,
          originalFilename: data.originalFilename,
          storageKey: data.storageKey,
          mimeType: data.mimeType,
          mediaType: data.mediaType || 'IMAGE',
          size: data.size,
          width: data.width || null,
          height: data.height || null,
          altText: data.altText?.trim() || null,
          caption: data.caption?.trim() || null,
          description: data.description?.trim() || null,
          visibility: data.visibility || 'PUBLIC',
          status: data.status || 'ACTIVE'
        }
      });
    } catch (err) {
      throw new Error('Database error creating media record: ' + err.message);
    }
  },

  /**
   * Get media record by ID
   */
  async getMediaById(id) {
    try {
      return await prisma.media.findUnique({
        where: { id }
      });
    } catch (err) {
      throw new Error('Database error fetching media: ' + err.message);
    }
  },

  /**
   * Get media record by storage key
   */
  async getMediaByStorageKey(storageKey) {
    try {
      return await prisma.media.findUnique({
        where: { storageKey }
      });
    } catch (err) {
      throw new Error('Database error fetching media by key: ' + err.message);
    }
  },

  /**
   * Paginated, searchable, filterable admin media list
   */
  async getAdminMediaList({
    page = 1,
    limit = 24,
    search = '',
    mediaType = null,
    status = null,
    visibility = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }) {
    try {
      const take = Math.max(1, Math.min(100, Number(limit)));
      const skip = (Math.max(1, Number(page)) - 1) * take;

      const where = {};

      if (search && search.trim() !== '') {
        const query = search.trim();
        where.OR = [
          { filename: { contains: query, mode: 'insensitive' } },
          { originalFilename: { contains: query, mode: 'insensitive' } },
          { altText: { contains: query, mode: 'insensitive' } },
          { caption: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ];
      }

      if (mediaType) {
        where.mediaType = mediaType.toUpperCase();
      }

      if (status) {
        where.status = status.toUpperCase();
      }

      if (visibility) {
        where.visibility = visibility.toUpperCase();
      }

      const [totalItems, items] = await Promise.all([
        prisma.media.count({ where }),
        prisma.media.findMany({
          where,
          take,
          skip,
          orderBy: {
            [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc'
          }
        })
      ]);

      const totalPages = Math.ceil(totalItems / take) || 1;

      return {
        items,
        pagination: {
          totalItems,
          totalPages,
          currentPage: Math.max(1, Number(page)),
          pageSize: take
        }
      };
    } catch (err) {
      throw new Error('Database error fetching media list: ' + err.message);
    }
  },

  /**
   * Update media metadata
   */
  async updateMedia(id, data) {
    try {
      return await prisma.media.update({
        where: { id },
        data: {
          ...(data.altText !== undefined && { altText: data.altText }),
          ...(data.caption !== undefined && { caption: data.caption }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.visibility !== undefined && { visibility: data.visibility }),
          ...(data.status !== undefined && { status: data.status })
        }
      });
    } catch (err) {
      throw new Error('Database error updating media metadata: ' + err.message);
    }
  },

  /**
   * Delete media record cleanly with constraint safety
   */
  async deleteMedia(id, { force = false } = {}) {
    if (force) {
      // Force delete: clean up all referencing resume records (active and inactive)
      await prisma.resume.deleteMany({
        where: { mediaId: id }
      });
    } else {
      // Standard delete: check if attached to active published resume
      const activeResume = await prisma.resume.findFirst({
        where: {
          mediaId: id,
          isActive: true,
          status: 'PUBLISHED'
        }
      });

      if (activeResume) {
        throw new Error(`Cannot delete this media asset because it is currently attached to your Active Published Resume ('${activeResume.title}'). Use force delete or delete the active resume first.`);
      }

      // Clean up inactive draft/archived resume history referencing this media
      await prisma.resume.deleteMany({
        where: {
          mediaId: id,
          isActive: false
        }
      });
    }

    // Check remaining usage for other entities (Personal, SEO, Projects)
    const usage = await this.checkMediaUsage(id);
    if (usage.isReferenced && !force) {
      throw new Error(`Cannot delete media asset because it is currently referenced in [${usage.references.join(', ')}]. Please delete or replace the referencing content first.`);
    }

    try {
      return await prisma.media.delete({
        where: { id }
      });
    } catch (err) {
      if (err.code === 'P2003' || (err.message && err.message.includes('Foreign key constraint'))) {
        if (force) {
          await prisma.resume.deleteMany({ where: { mediaId: id } });
          return await prisma.media.delete({ where: { id } });
        }
        throw new Error('Cannot delete this media asset because it is referenced by another record (e.g. Project or Personal profile). Please remove the reference first.');
      }
      throw new Error('Database error deleting media: ' + err.message);
    }
  },

  /**
   * Check whether media item is currently referenced anywhere in the CMS database
   */
  async checkMediaUsage(id) {
    try {
      const references = [];
      const media = await prisma.media.findUnique({ where: { id } });
      if (!media) return { isReferenced: false, references: [] };

      const keyOrId = [media.id, media.storageKey, `/uploads/${media.storageKey}`];

      // 1. Personal Profile
      const personal = await prisma.personalInformation.findFirst({
        where: {
          profileImageId: { in: keyOrId }
        }
      });
      if (personal) references.push('Personal Profile Image');

      // 2. SEO Settings
      const seo = await prisma.seoSettings.findFirst({
        where: {
          OR: [
            { ogImageId: { in: keyOrId } },
            { twitterImageId: { in: keyOrId } },
            { faviconMediaId: { in: keyOrId } }
          ]
        }
      });
      if (seo) references.push('SEO & OpenGraph Meta Images');

      // 3. Projects
      const projects = await prisma.project.findMany();
      for (const p of projects) {
        if (p.images && Array.isArray(p.images)) {
          const hasRef = p.images.some(img => keyOrId.includes(String(img)));
          if (hasRef) {
            references.push(`Project: ${p.name}`);
          }
        }
      }

      // 4. Resumes (Only report active published resume as an active blocking reference)
      const resumes = await prisma.resume.findMany({
        where: { mediaId: id }
      });
      if (resumes.length > 0) {
        const activeRes = resumes.find(r => r.isActive && r.status === 'PUBLISHED');
        if (activeRes) {
          references.push(`Active Published Resume (${activeRes.title})`);
        }
      }

      return {
        isReferenced: references.length > 0,
        references
      };
    } catch (err) {
      return { isReferenced: false, references: [] };
    }
  }
};
