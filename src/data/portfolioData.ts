import type { PortfolioData } from '../types/portfolio';

/**
 * Structural default shape for empty portfolio state.
 * Content MUST come from PostgreSQL database via public APIs.
 */
export const portfolioData: PortfolioData = {
  personal: {
    name: '',
    primaryRole: '',
    titles: [],
    tagline: '',
    email: '',
    phone: '',
    location: '',
    availabilityStatus: '',
    bio: [],
    photoUrl: '',
    yearsOfExperience: 0,
    domains: [],
    github: '',
    linkedin: '',
    resumeDownloadUrl: ''
  },
  heroStats: [],
  about: {
    editorialHeading: '',
    introduction: [],
    metrics: [],
    domains: [],
    technicalStrengths: []
  },
  experience: [],
  skills: [],
  projects: [],
  education: [],
  certifications: [],
  achievements: [],
  socialLinks: [],
  navigation: [],
  media: [],
  seo: {
    title: '',
    description: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: ''
  },
  siteSettings: {
    siteName: '',
    defaultTitle: '',
    defaultDescription: '',
    locale: 'en_US',
    timezone: 'UTC',
    maintenanceMode: false
  }
};
