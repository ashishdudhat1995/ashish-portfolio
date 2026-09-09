import { PrismaClient } from '@prisma/client';
import { storageProvider } from '../storage/storageProvider.js';

const prisma = new PrismaClient();

export const resumeRepository = {
  /**
   * Fetch all resume records with media details
   */
  async getAllResumes() {
    return await prisma.resume.findMany({
      include: {
        media: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  /**
   * Fetch resume by ID
   */
  async getResumeById(id) {
    return await prisma.resume.findUnique({
      where: { id },
      include: {
        media: true
      }
    });
  },

  /**
   * Fetch single active published resume
   */
  async getActivePublishedResume() {
    return await prisma.resume.findFirst({
      where: {
        isActive: true,
        status: 'PUBLISHED'
      },
      include: {
        media: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
  },

  /**
   * Create new Resume record linked to Media
   */
  async createResume({ mediaId, title, versionLabel, status = 'DRAFT', isActive = false }) {
    return await prisma.resume.create({
      data: {
        mediaId,
        title: title || 'Ashishkumar Dudhat - Resume',
        versionLabel: versionLabel || null,
        status,
        isActive
      },
      include: {
        media: true
      }
    });
  },

  /**
   * Update Resume metadata
   */
  async updateResume(id, data) {
    const { title, versionLabel } = data;
    return await prisma.resume.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(versionLabel !== undefined && { versionLabel })
      },
      include: {
        media: true
      }
    });
  },

  /**
   * Publish & Activate target resume transactionally (deactivates previous active resume)
   */
  async publishResume(id) {
    return await prisma.$transaction(async (tx) => {
      // 1. Deactivate all currently active resumes
      await tx.resume.updateMany({
        where: {
          isActive: true
        },
        data: {
          isActive: false,
          status: 'ARCHIVED'
        }
      });

      // 2. Set target resume as PUBLISHED and ACTIVE
      const publishedResume = await tx.resume.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          isActive: true,
          publishedAt: new Date()
        },
        include: {
          media: true
        }
      });

      return publishedResume;
    });
  },

  /**
   * Archive target resume
   */
  async archiveResume(id) {
    const target = await this.getResumeById(id);
    if (!target) {
      throw new Error(`Resume with ID '${id}' not found.`);
    }

    if (target.isActive) {
      throw new Error('Cannot archive the currently active resume directly. Please activate another resume first.');
    }

    return await prisma.resume.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        isActive: false
      },
      include: {
        media: true
      }
    });
  },

  /**
   * Delete resume record cleanly and clean up associated media if unreferenced
   */
  async deleteResume(id) {
    const target = await this.getResumeById(id);
    if (!target) {
      throw new Error(`Resume with ID '${id}' not found.`);
    }

    // 1. Delete Resume record
    await prisma.resume.delete({
      where: { id }
    });

    // 2. Check if the associated Media record is referenced by any other resume or entity
    if (target.mediaId) {
      const otherResumesCount = await prisma.resume.count({
        where: { mediaId: target.mediaId }
      });

      if (otherResumesCount === 0 && target.media) {
        try {
          await prisma.media.delete({
            where: { id: target.mediaId }
          });
          await storageProvider.deleteFile(target.media.storageKey);
        } catch {
          // Storage cleanup errors handled gracefully
        }
      }
    }

    return true;
  }
};
