import { PrismaClient } from '@prisma/client';
import { initialPortfolio } from '../data/initialPortfolio.js';

const prisma = new PrismaClient();

export const heroRepository = {
  async getHero() {
    try {
      return await prisma.hero.findFirst({
        orderBy: { createdAt: 'asc' }
      });
    } catch {
      return null;
    }
  },

  async getAllHeroStats() {
    try {
      return await prisma.heroStat.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' }
      });
    } catch {
      return [];
    }
  },

  async upsertHero(data) {
    try {
      const existing = await this.getHero();
      if (existing) {
        if (data.version !== undefined && data.version !== existing.version) {
          throw new Error('Conflict: Hero section was updated elsewhere.');
        }

        const publishedDataSnapshot = existing.publishedData || (existing.status === 'PUBLISHED' ? JSON.parse(JSON.stringify(existing)) : null);
        const newStatus = data.status || 'DRAFT';

        return await prisma.hero.update({
          where: { id: existing.id },
          data: {
            eyebrow: data.eyebrow ?? existing.eyebrow,
            headline: data.headline ?? existing.headline,
            subheadline: data.subheadline ?? existing.subheadline,
            description: data.description ?? existing.description,
            primaryCtaLabel: data.primaryCtaLabel ?? existing.primaryCtaLabel,
            primaryCtaTarget: data.primaryCtaTarget ?? existing.primaryCtaTarget,
            secondaryCtaLabel: data.secondaryCtaLabel ?? existing.secondaryCtaLabel,
            secondaryCtaTarget: data.secondaryCtaTarget ?? existing.secondaryCtaTarget,
            enabled: data.enabled !== undefined ? data.enabled : existing.enabled,
            status: newStatus,
            publishedData: publishedDataSnapshot
          }
        });
      }

      return await prisma.hero.create({
        data: {
          eyebrow: data.eyebrow || 'Senior Software Engineer & Lead Engineer',
          headline: data.headline || initialPortfolio.personal.name,
          subheadline: data.subheadline || 'Full Stack & Technical Leadership',
          description: data.description || 'Building scalable web applications.',
          primaryCtaLabel: data.primaryCtaLabel || 'Explore Projects',
          primaryCtaTarget: data.primaryCtaTarget || '#projects',
          secondaryCtaLabel: data.secondaryCtaLabel || 'Initiate Contact',
          secondaryCtaTarget: data.secondaryCtaTarget || '#contact',
          enabled: data.enabled !== undefined ? data.enabled : true,
          status: 'PUBLISHED',
          publishedAt: new Date()
        }
      });
    } catch (err) {
      throw new Error('Database error during hero update: ' + err.message);
    }
  }
};
