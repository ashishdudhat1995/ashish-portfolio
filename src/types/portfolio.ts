export interface PersonalData {
  name: string;
  titles: string[];
  primaryRole: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  bio: string[];
  photoUrl: string;
  yearsOfExperience: number;
  domains: string[];
  github: string;
  linkedin: string;
  resumeDownloadUrl: string;
  availabilityStatus: string;
}

export interface HeroStat {
  id?: string;
  label: string;
  value: string;
  description: string;
  iconName?: string;
  order?: number;
  enabled?: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  startDate: string;
  endDate: string;
  isCurrentRole?: boolean;
  isBreak?: boolean;
  progressionLevel?: string;
  summary: string;
  highlights: string[];
  technologies: string[];
  keyMetrics?: string[];
  leadershipHighlights?: string[];
  order?: number;
  enabled?: boolean;
  status?: 'draft' | 'published';
}

export interface TechStackByLayer {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  cloud?: string[];
  architecture?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  title?: string;
  subtitle: string;
  domain: string;
  category: 'Healthcare' | 'Fintech' | 'SaaS' | 'Enterprise' | 'Networking' | 'Web3 / Realtime';
  period: string;
  description: string;
  capabilities: string[];
  highlights?: string[];
  technologies: string[];
  techStackByLayer?: TechStackByLayer;
  architecturePoints: string[];
  impact?: string[];
  featured: boolean;
  images: string[];
  liveUrl?: string;
  githubUrl?: string;
  order?: number;
  enabled?: boolean;
  status?: 'draft' | 'published';
}

export interface SkillItem {
  id?: string;
  name: string;
  category: string;
  description?: string;
  featured?: boolean;
  awsComponents?: string[];
  order?: number;
  enabled?: boolean;
}

export interface SkillCategory {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  skills: SkillItem[];
  order?: number;
  enabled?: boolean;
  status?: 'draft' | 'published';
}

export interface EducationItem {
  id: string;
  degree: string;
  field?: string;
  institution: string;
  location: string;
  period: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string;
  highlights?: (string | { text?: string })[];
  order?: number;
  enabled?: boolean;
  status?: 'draft' | 'published';
}

export interface Certification {
  id: string;
  name?: string;
  title?: string;
  issuer: string;
  credentialId?: string | null;
  credentialUrl?: string;
  issueDate?: string;
  expirationDate?: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  order?: number;
  enabled?: boolean;
  status?: 'draft' | 'published';
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  url?: string;
  metric?: string;
  date?: string;
  order?: number;
  enabled?: boolean;
  status?: 'draft' | 'published';
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconName: string;
  label: string;
  order?: number;
  enabled?: boolean;
}

export interface AboutMetric {
  id?: string;
  label: string;
  value: string;
  sublabel?: string;
}

export interface AboutDomain {
  name?: string;
  title?: string;
  tagline?: string;
  description: string;
  icon?: string;
  highlights: string[];
}

export interface AboutSectionData {
  title?: string;
  subtitle?: string;
  editorialHeading: string;
  introduction: string[];
  metrics: AboutMetric[];
  domains: AboutDomain[];
  technicalStrengths?: unknown[];
}

export interface NavigationItem {
  id: string;
  label: string;
  target: string;
  order?: number;
  enabled?: boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document' | 'svg' | string;
  url: string;
  alt: string;
  title: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  size: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  description?: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'ACTIVE' | 'ARCHIVED';
  url: string;
  createdAt: string;
  updatedAt: string;
  usage?: {
    isReferenced: boolean;
    references: string[];
  };
}

export interface MediaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublishValidationError {
  entity: string;
  field: string;
  message: string;
}

export interface DraftEntityItem {
  entity: string;
  name: string;
  id?: string;
  updatedAt?: string;
}

export interface PublishingSummary {
  isFullyPublished: boolean;
  totalDrafts: number;
  draftEntities: DraftEntityItem[];
  lastPublishedAt?: string | null;
  publishedVersion: number;
  draftVersion: number;
}

export interface AdminAuditLog {
  id: string;
  adminUserId?: string | null;
  adminEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface SeoSettings {
  id?: string;
  title: string;
  description: string;
  keywords?: string | null;
  canonicalUrl?: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageId?: string | null;
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageId?: string | null;
  faviconMediaId?: string | null;
  structuredDataEnabled: boolean;
  structuredDataJson?: string | null;
}

export interface PublicSeoSettings {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string | null;
  robots: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageId: string | null;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageId: string | null;
  faviconMediaId: string | null;
  structuredDataEnabled: boolean;
  structuredDataJson: string | null;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  locale: string;
  timezone: string;
  maintenanceMode: boolean;
  analyticsProvider?: string | null;
  analyticsId?: string | null;
}

export interface PublicSiteSettings {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  locale: string;
  timezone: string;
  maintenanceMode: boolean;
  analyticsProvider: string | null;
  analyticsId: string | null;
}

export interface PublicSiteConfig {
  seo: PublicSeoSettings;
  siteSettings: PublicSiteSettings;
  navigation: NavigationItem[];
  contact: unknown;
  socialLinks: SocialLink[];
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface PublicResume {
  id: string;
  title: string;
  versionLabel?: string | null;
  filename: string;
  size: number;
  mimeType?: string;
  publishedAt?: string;
  downloadUrl: string;
}

export interface AdminResumeItem {
  id: string;
  mediaId: string;
  title: string;
  versionLabel?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  media?: {
    id: string;
    filename: string;
    originalFilename: string;
    storageKey: string;
    mimeType: string;
    size: number;
  };
}

export interface PortfolioData {
  personal: PersonalData;
  heroStats: HeroStat[];
  about: AboutSectionData;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  education: EducationItem[];
  certifications: Certification[];
  achievements: Achievement[];
  socialLinks: SocialLink[];
  navigation: NavigationItem[];
  media: MediaItem[];
  seo: SeoConfig;
  siteSettings: SiteSettings;
  resume?: PublicResume | null;
}
