import { aboutRepository } from '../repositories/aboutRepository.js';

export const aboutService = {
  async getAdminAbout() {
    let about = await aboutRepository.getAbout();
    if (!about) {
      about = await aboutRepository.upsertAbout({});
    }
    return about;
  },

  async getPublicAbout() {
    const about = await this.getAdminAbout();
    if (!about || !about.enabled) return null;

    let source = about;
    if (about.status === 'DRAFT' && about.publishedData) {
      source = typeof about.publishedData === 'string' ? JSON.parse(about.publishedData) : about.publishedData;
    }

    if (source.enabled === false) return null;

    const enabledHighlights = (source.highlights || [])
      .filter(h => h.enabled !== false)
      .sort((a, b) => a.order - b.order)
      .map(h => ({
        id: h.id,
        label: h.label,
        value: h.value,
        description: h.description,
        order: h.order
      }));

    const rawDomains = Array.isArray(source.domains) ? source.domains : [];
    const enabledDomains = rawDomains
      .filter(d => d.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const rawPillars = Array.isArray(source.pillars) ? source.pillars : [];
    const enabledPillars = rawPillars
      .filter(p => p.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      editorialHeading: source.editorialHeading,
      introduction: source.introduction,
      highlights: enabledHighlights,
      domains: enabledDomains,
      pillars: enabledPillars
    };
  },

  async updateAbout(data) {
    if (!data.editorialHeading || data.editorialHeading.trim() === '') {
      throw new Error('About Editorial Heading is required');
    }
    return await aboutRepository.upsertAbout(data);
  }
};
