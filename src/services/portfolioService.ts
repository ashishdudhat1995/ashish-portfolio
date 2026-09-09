import { repository } from './portfolioRepository';
import { 
  fetchPublicPersonal,
  fetchPublicExperience, 
  fetchPublicSkills, 
  fetchPublicProjects, 
  fetchPublicEducation, 
  fetchPublicCertifications, 
  fetchPublicAchievements,
  fetchPublicSocialLinks,
  fetchPublicContact,
  fetchPublicNavigation,
  fetchPublicResume
} from './apiClient';
import type { 
  PortfolioData, 
  ExperienceItem, 
  ProjectItem, 
  SkillCategory, 
  EducationItem, 
  Certification, 
  Achievement, 
  SocialLink, 
  NavigationItem,
  MediaItem,
  SeoConfig,
  SiteSettings
} from '../types/portfolio';

export class PortfolioService {
  /**
   * Fetch full portfolio dataset for Admin CMS
   */
  async getFullPortfolio(): Promise<PortfolioData> {
    return await repository.getPortfolio();
  }

  /**
   * Fetch public Experience items from database API
   */
  async getPublicExperience(): Promise<ExperienceItem[]> {
    return await fetchPublicExperience();
  }

  /**
   * Fetch public Skill categories & skills from database API
   */
  async getPublicSkills(): Promise<SkillCategory[]> {
    const raw = await fetchPublicSkills();
    return raw.map((cat: any) => ({
      id: cat.slug || cat.id,
      title: cat.name || cat.title,
      subtitle: cat.subtitle || cat.description || '',
      description: cat.description || '',
      skills: (cat.skills || []).map((sk: any) => typeof sk === 'string' ? { name: sk } : {
        id: sk.id || sk.slug,
        name: sk.name || sk.title,
        description: sk.description || '',
        featured: Boolean(sk.featured || sk.isFeatured),
        awsComponents: sk.awsComponents || null
      }),
      order: cat.order || 1,
      enabled: cat.enabled !== false
    }));
  }

  /**
   * Fetch public Project items from database API
   */
  async getPublicProjects(): Promise<ProjectItem[]> {
    return await fetchPublicProjects();
  }

  /**
   * Fetch public Education items from database API
   */
  async getPublicEducation(): Promise<EducationItem[]> {
    const raw = await fetchPublicEducation();
    return raw.map((edu: any) => ({
      id: edu.id,
      degree: edu.degree,
      field: edu.field || edu.degree,
      institution: edu.institution,
      location: edu.location || 'Gujarat, India',
      period: edu.period || `${edu.startDate || '2013-06'} – ${edu.endDate || '2017-07'}`,
      startDate: edu.startDate,
      endDate: edu.endDate,
      isCurrent: Boolean(edu.isCurrent),
      description: edu.description || '',
      order: edu.order || 1,
      enabled: edu.enabled !== false
    }));
  }

  /**
   * Fetch public Certifications from database API
   */
  async getPublicCertifications(): Promise<Certification[]> {
    return await fetchPublicCertifications();
  }

  /**
   * Fetch public Achievements from database API
   */
  async getPublicAchievements(): Promise<Achievement[]> {
    return await fetchPublicAchievements();
  }

  /**
   * Fetch public Social Links from database API
   */
  async getPublicSocialLinks(): Promise<SocialLink[]> {
    const raw = await fetchPublicSocialLinks();
    return raw.map((soc: any) => ({
      id: soc.id,
      platform: soc.platform,
      label: soc.label,
      url: soc.url,
      iconName: soc.iconKey || soc.platform,
      order: soc.order || 1,
      enabled: soc.enabled !== false
    }));
  }

  /**
   * Fetch public Contact Configuration from database API
   */
  async getPublicContact() {
    return await fetchPublicContact();
  }

  /**
   * Fetch public Navigation items from database API
   */
  async getPublicNavigation(): Promise<NavigationItem[]> {
    const raw = await fetchPublicNavigation();
    return raw.map((nav: any) => ({
      id: nav.id,
      label: nav.label,
      target: nav.target,
      order: nav.order || 1,
      enabled: nav.enabled !== false
    }));
  }

  /**
   * Fetch sanitized portfolio data for public website:
   * Filters out items where enabled === false and sorts repeatable lists by order.
   */
  async getPublicPortfolio(): Promise<PortfolioData> {
    const [
      raw, 
      publicPersonal,
      publicExperience, 
      publicSkills, 
      publicProjects, 
      publicEducation, 
      publicCertifications, 
      publicAchievements,
      publicSocialLinks,
      publicNavigation,
      publicResume
    ] = await Promise.all([
      repository.getPortfolio(),
      fetchPublicPersonal(),
      this.getPublicExperience(),
      this.getPublicSkills(),
      this.getPublicProjects(),
      this.getPublicEducation(),
      this.getPublicCertifications(),
      this.getPublicAchievements(),
      this.getPublicSocialLinks(),
      this.getPublicNavigation(),
      fetchPublicResume()
    ]);

    const activePersonal = publicPersonal ? {
      ...raw.personal,
      ...publicPersonal,
      availabilityStatus: publicPersonal.availability || publicPersonal.availabilityStatus || raw.personal.availabilityStatus
    } : raw.personal;

    return {
      ...raw,
      personal: activePersonal,
      experience: publicExperience || [],
      skills: publicSkills || [],
      projects: publicProjects || [],
      education: publicEducation || [],
      certifications: publicCertifications || [],
      achievements: publicAchievements || [],
      socialLinks: publicSocialLinks || [],
      navigation: publicNavigation || [],
      resume: publicResume || null
    };
  }

  // Generic Update Section
  async updateSection<K extends keyof PortfolioData>(section: K, payload: PortfolioData[K], token?: string): Promise<boolean> {
    return await repository.saveSection(section, payload, token);
  }

  // Module Specific Helper Methods
  async updateExperience(items: ExperienceItem[], token?: string): Promise<boolean> {
    return this.updateSection('experience', items, token);
  }

  async updateProjects(items: ProjectItem[], token?: string): Promise<boolean> {
    return this.updateSection('projects', items, token);
  }

  async updateSkills(items: SkillCategory[], token?: string): Promise<boolean> {
    return this.updateSection('skills', items, token);
  }

  async updateEducation(items: EducationItem[], token?: string): Promise<boolean> {
    return this.updateSection('education', items, token);
  }

  async updateCertifications(items: Certification[], token?: string): Promise<boolean> {
    return this.updateSection('certifications', items, token);
  }

  async updateAchievements(items: Achievement[], token?: string): Promise<boolean> {
    return this.updateSection('achievements', items, token);
  }

  async updateSocialLinks(items: SocialLink[], token?: string): Promise<boolean> {
    return this.updateSection('socialLinks', items, token);
  }

  async updateNavigation(items: NavigationItem[], token?: string): Promise<boolean> {
    return this.updateSection('navigation', items, token);
  }

  async updateMedia(items: MediaItem[], token?: string): Promise<boolean> {
    return this.updateSection('media', items, token);
  }

  async updateSeo(seo: SeoConfig, token?: string): Promise<boolean> {
    return this.updateSection('seo', seo, token);
  }

  async updateSiteSettings(settings: SiteSettings, token?: string): Promise<boolean> {
    return this.updateSection('siteSettings', settings, token);
  }
}

export const portfolioService = new PortfolioService();
