import { experienceRepository } from '../repositories/experienceRepository.js';

export const experienceService = {
  async getAdminExperiences(search) {
    return await experienceRepository.getAllAdminExperiences(search);
  },

  async getPublicExperiences() {
    const raw = await experienceRepository.getPublicExperiences();
    
    // Format dates & sanitize highlights/metrics/technologies for public UI
    return raw.map(exp => {
      const formattedPeriod = formatPeriod(exp.startDate, exp.endDate, exp.isCurrent);
      
      const highlights = Array.isArray(exp.highlights)
        ? exp.highlights.map(h => typeof h === 'string' ? h : (h?.text || h?.label || String(h)))
        : [];
      
      const metrics = Array.isArray(exp.metrics)
        ? exp.metrics.map(m => typeof m === 'string' ? m : (m?.value && m?.label ? `${m.value} - ${m.label}` : m?.label || m?.value || String(m)))
        : [];

      const technologies = Array.isArray(exp.technologies)
        ? exp.technologies.map(t => typeof t === 'string' ? t : (t?.name || String(t)))
        : [];

      return {
        id: exp.id,
        company: exp.company,
        role: exp.role,
        period: formattedPeriod,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        location: exp.location,
        summary: exp.summary,
        highlights,
        keyMetrics: metrics,
        metrics,
        technologies,
        isBreak: exp.isBreak,
        order: exp.order
      };
    });
  },

  async getExperienceById(id) {
    const exp = await experienceRepository.getExperienceById(id);
    if (!exp) {
      throw new Error(`Experience with ID "${id}" not found.`);
    }
    return exp;
  },

  async createExperience(data) {
    validateExperienceData(data);
    return await experienceRepository.createExperience(data);
  },

  async updateExperience(id, data) {
    validateExperienceData(data);
    return await experienceRepository.updateExperience(id, data);
  },

  async deleteExperience(id) {
    return await experienceRepository.deleteExperience(id);
  },

  async updateStatus(id, enabled) {
    return await experienceRepository.updateStatus(id, enabled);
  },

  async reorderExperiences(orderedIds) {
    if (!Array.isArray(orderedIds)) {
      throw new Error('orderedIds must be an array of Experience IDs.');
    }
    return await experienceRepository.reorderExperiences(orderedIds);
  }
};

function validateExperienceData(data) {
  if (!data.company || data.company.trim() === '') {
    throw new Error('Company name is required.');
  }
  if (!data.role || data.role.trim() === '') {
    throw new Error('Role title is required.');
  }
  if (!data.summary || data.summary.trim() === '') {
    throw new Error('Experience Summary is required.');
  }
  if (!data.startDate || data.startDate.trim() === '') {
    throw new Error('Start Date is required.');
  }
  if (!data.isCurrent && (!data.endDate || data.endDate.trim() === '')) {
    throw new Error('End Date is required when experience is not current.');
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
