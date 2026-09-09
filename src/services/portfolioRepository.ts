import type { PortfolioData } from '../types/portfolio';

const API_BASE_URL = 'http://localhost:5000/api';

const emptyPortfolioData: PortfolioData = {
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

export interface IPortfolioRepository {
  getPortfolio(): Promise<PortfolioData>;
  saveSection<T>(sectionName: keyof PortfolioData, payload: T, token?: string): Promise<boolean>;
}

export class PortfolioRepository implements IPortfolioRepository {
  private memoryCache: PortfolioData = JSON.parse(JSON.stringify(emptyPortfolioData));

  async getPortfolio(): Promise<PortfolioData> {
    try {
      const res = await fetch(`${API_BASE_URL}/portfolio`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.memoryCache = json.data;
          return this.memoryCache;
        }
      }
    } catch {
      // Fallback cleanly to empty structural repository cache if API is offline
    }
    return this.memoryCache;
  }

  async saveSection<T>(sectionName: keyof PortfolioData, payload: T, token?: string): Promise<boolean> {
    // Update local repository memory cache
    (this.memoryCache[sectionName] as unknown) = payload;

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/${String(sectionName)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    return true;
  }
}

export const repository = new PortfolioRepository();
