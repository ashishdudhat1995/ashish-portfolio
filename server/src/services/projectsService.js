import { projectsRepository } from '../repositories/projectsRepository.js';

export const projectsService = {
  async getAdminProjects(search) {
    return await projectsRepository.getAllAdminProjects(search);
  },

  async getPublicProjects() {
    const raw = await projectsRepository.getPublicProjects();
    
    // Format period & transform child arrays for public UI compatibility
    return raw.map(proj => {
      const formattedPeriod = formatPeriod(proj.startDate, proj.endDate, proj.isCurrent);
      const highlightsStrings = (proj.highlights || []).map(h => typeof h === 'string' ? h : h.text);
      const techStrings = (proj.technologies || []).map(t => typeof t === 'string' ? t : t.name);
      const imageStrings = (proj.media || []).map(m => typeof m === 'string' ? m : m.url);

      return {
        id: proj.id,
        name: proj.name,
        subtitle: proj.subtitle,
        domain: proj.domain,
        category: proj.category,
        period: formattedPeriod,
        description: proj.description,
        capabilities: highlightsStrings,
        highlights: highlightsStrings,
        technologies: techStrings,
        architecturePoints: highlightsStrings.slice(0, 3),
        impact: highlightsStrings.slice(0, 2),
        featured: proj.featured,
        images: imageStrings,
        order: proj.order,
        links: (proj.links || []).map(l => ({ label: l.label, url: l.url, type: l.type }))
      };
    });
  },

  async getProjectById(id) {
    const proj = await projectsRepository.getProjectById(id);
    if (!proj) {
      throw new Error(`Project with ID "${id}" not found.`);
    }
    return proj;
  },

  async createProject(data) {
    validateProjectData(data);
    return await projectsRepository.createProject(data);
  },

  async updateProject(id, data) {
    validateProjectData(data);
    return await projectsRepository.updateProject(id, data);
  },

  async deleteProject(id) {
    return await projectsRepository.deleteProject(id);
  },

  async updateStatus(id, enabled) {
    return await projectsRepository.updateStatus(id, enabled);
  },

  async updateFeatured(id, featured) {
    return await projectsRepository.updateFeatured(id, featured);
  },

  async reorderProjects(orderedIds) {
    if (!Array.isArray(orderedIds)) {
      throw new Error('orderedIds must be an array of Project IDs.');
    }
    return await projectsRepository.reorderProjects(orderedIds);
  }
};

function validateProjectData(data) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Project Title (Name) is required.');
  }
  if (!data.description || data.description.trim() === '') {
    throw new Error('Project Description is required.');
  }
  if (!data.startDate || data.startDate.trim() === '') {
    throw new Error('Start Date is required.');
  }
  if (!data.isCurrent && (!data.endDate || data.endDate.trim() === '')) {
    throw new Error('End Date is required when project is not ongoing.');
  }
  if (data.startDate && data.endDate && !data.isCurrent) {
    if (data.startDate > data.endDate) {
      throw new Error('Start Date cannot be after End Date.');
    }
  }
}

function formatPeriod(startDate, endDate, isCurrent) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const parseMonth = (str) => {
    if (!str) return '';
    const [year, month] = str.split('-');
    if (!year || !month) return str;
    const mIdx = parseInt(month, 10) - 1;
    return `${months[mIdx] || month} ${year}`;
  };

  const startFormatted = parseMonth(startDate);
  if (isCurrent) return `${startFormatted} – Present`;
  const endFormatted = parseMonth(endDate);
  return `${startFormatted} – ${endFormatted}`;
}
