import { heroRepository } from '../repositories/heroRepository.js';

export const heroService = {
  async getAdminHero() {
    let hero = await heroRepository.getHero();
    if (!hero) {
      hero = await heroRepository.upsertHero({});
    }
    return hero;
  },

  async getPublicHero() {
    const hero = await this.getAdminHero();
    if (!hero || !hero.enabled) return null;

    let source = hero;
    if (hero.status === 'DRAFT' && hero.publishedData) {
      source = typeof hero.publishedData === 'string' ? JSON.parse(hero.publishedData) : hero.publishedData;
    }

    if (source.enabled === false) return null;

    return {
      eyebrow: source.eyebrow,
      headline: source.headline,
      subheadline: source.subheadline,
      description: source.description,
      primaryCtaLabel: source.primaryCtaLabel,
      primaryCtaTarget: source.primaryCtaTarget,
      secondaryCtaLabel: source.secondaryCtaLabel,
      secondaryCtaTarget: source.secondaryCtaTarget
    };
  },

  async updateHero(data) {
    if (!data.headline || data.headline.trim() === '') {
      throw new Error('Hero Headline is required');
    }
    if (!data.description || data.description.trim() === '') {
      throw new Error('Hero Description is required');
    }

    return await heroRepository.upsertHero(data);
  }
};
