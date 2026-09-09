export interface AdminNavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  category: 'Dashboard' | 'Content' | 'Website' | 'Media' | 'System';
  description?: string;
}

export const adminNavigation: AdminNavItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    iconName: 'LayoutDashboard',
    category: 'Dashboard',
    description: 'System overview, status indicators, dynamic database metrics, and quick actions.'
  },

  // Content Modules
  {
    id: 'personal',
    label: 'Personal Information',
    path: '/admin/personal',
    iconName: 'User',
    category: 'Content',
    description: 'Manage personal identity, role title, email, phone, location, and bio.'
  },
  {
    id: 'resume',
    label: 'Resume',
    path: '/admin/resume',
    iconName: 'FileText',
    category: 'Content',
    description: 'Upload, manage, publish, replace, and archive your official PDF curriculum vitae.'
  },
  {
    id: 'hero',
    label: 'Hero Stats',
    path: '/admin/hero',
    iconName: 'Sparkles',
    category: 'Content',
    description: 'Manage quantitative hero highlight cards.'
  },
  {
    id: 'about',
    label: 'About',
    path: '/admin/about',
    iconName: 'Info',
    category: 'Content',
    description: 'Manage editorial narrative, introduction paragraphs, and domain focus cards.'
  },
  {
    id: 'experience',
    label: 'Experience',
    path: '/admin/experience',
    iconName: 'Briefcase',
    category: 'Content',
    description: 'Manage career roles, company timelines, and family care transition notes.'
  },
  {
    id: 'skills',
    label: 'Skills',
    path: '/admin/skills',
    iconName: 'Code2',
    category: 'Content',
    description: 'Manage 9 technical skill categories, components, and proficiency tags.'
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/admin/projects',
    iconName: 'FolderGit2',
    category: 'Content',
    description: 'Manage 6 production case studies, tech stack layers, and SVG mockups.'
  },
  {
    id: 'education',
    label: 'Education',
    path: '/admin/education',
    iconName: 'GraduationCap',
    category: 'Content',
    description: 'Manage BE-IT degree details, academic milestones, and location.'
  },
  {
    id: 'certifications',
    label: 'Certifications',
    path: '/admin/certifications',
    iconName: 'Award',
    category: 'Content',
    description: 'Manage professional accreditations and credentials.'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    path: '/admin/achievements',
    iconName: 'Trophy',
    category: 'Content',
    description: 'Manage quantifiable career achievements and performance metrics.'
  },
  {
    id: 'social-links',
    label: 'Social Links',
    path: '/admin/social-links',
    iconName: 'Share2',
    category: 'Content',
    description: 'Manage GitHub, LinkedIn, Email, and Phone contact links.'
  },
  {
    id: 'contact',
    label: 'Contact Inbox',
    path: '/admin/contact',
    iconName: 'Mail',
    category: 'Content',
    description: 'Review direct contact form submissions stored in the PostgreSQL database.'
  },

  // Website Configuration
  {
    id: 'navigation',
    label: 'Navigation',
    path: '/admin/navigation',
    iconName: 'Compass',
    category: 'Website',
    description: 'Manage website target anchor links, ordering, and navigation visibility.'
  },
  {
    id: 'seo',
    label: 'SEO & Metadata',
    path: '/admin/seo',
    iconName: 'Search',
    category: 'Website',
    description: 'Manage meta titles, descriptions, OpenGraph tags, and search keywords.'
  },
  {
    id: 'publishing',
    label: 'Publishing & Drafts',
    path: '/admin/publishing',
    iconName: 'Send',
    category: 'Website',
    description: 'Manage draft changes, global transactional publishing, validation, and audit logs.'
  },
  {
    id: 'settings',
    label: 'Site Settings',
    path: '/admin/settings',
    iconName: 'Settings',
    category: 'Website',
    description: 'Manage global site configuration, branding, logo, and maintenance status.'
  },

  // Media Library
  {
    id: 'media',
    label: 'Media Library',
    path: '/admin/media',
    iconName: 'Image',
    category: 'Media',
    description: 'Manage profile photos, project architectural diagrams, and asset references.'
  },

  // System Settings
  {
    id: 'profile',
    label: 'Admin Profile',
    path: '/admin/profile',
    iconName: 'UserCheck',
    category: 'System',
    description: 'Manage administrator profile credentials and security settings.'
  }
];

export function getNavItemByPath(path: string): AdminNavItem | undefined {
  return adminNavigation.find(item => path.startsWith(item.path));
}
