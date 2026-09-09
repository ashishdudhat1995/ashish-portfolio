import { PrismaClient } from '@prisma/client';
import { initialPortfolio } from '../data/initialPortfolio.js';

const prisma = new PrismaClient();

export const aboutRepository = {
  async getAbout() {
    try {
      return await prisma.about.findFirst({
        include: {
          highlights: {
            orderBy: { order: 'asc' }
          }
        }
      });
    } catch {
      return null;
    }
  },

  async upsertAbout(data) {
    try {
      const existing = await this.getAbout();
      if (existing) {
        if (data.version !== undefined && data.version !== existing.version) {
          throw new Error('Conflict: About section was updated elsewhere.');
        }

        const publishedDataSnapshot = existing.publishedData || (existing.status === 'PUBLISHED' ? JSON.parse(JSON.stringify(existing)) : null);
        const newStatus = data.status || 'DRAFT';

        return await prisma.about.update({
          where: { id: existing.id },
          data: {
            editorialHeading: data.editorialHeading ?? existing.editorialHeading,
            introduction: data.introduction !== undefined ? data.introduction : existing.introduction,
            domains: data.domains !== undefined ? data.domains : existing.domains,
            pillars: data.pillars !== undefined ? data.pillars : existing.pillars,
            enabled: data.enabled !== undefined ? data.enabled : existing.enabled,
            status: newStatus,
            publishedData: publishedDataSnapshot
          },
          include: {
            highlights: {
              orderBy: { order: 'asc' }
            }
          }
        });
      }

      return await prisma.about.create({
        data: {
          editorialHeading: data.editorialHeading || 'Engineering Scalable Digital Products with Architectural Depth & Precision.',
          introduction: data.introduction || initialPortfolio.about.introduction,
          domains: data.domains || initialPortfolio.about.domains,
          pillars: data.pillars || initialPortfolio.about.pillars,
          enabled: data.enabled !== undefined ? data.enabled : true,
          status: 'PUBLISHED',
          publishedAt: new Date()
        },
        include: {
          highlights: {
            orderBy: { order: 'asc' }
          }
        }
      });
    } catch (err) {
      throw new Error('Database error during about update: ' + err.message);
    }
  }
};
