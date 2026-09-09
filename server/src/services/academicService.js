import { educationRepository, certificationsRepository, achievementsRepository } from '../repositories/academicRepository.js';

// ==================== EDUCATION SERVICE ====================

export const educationService = {
  async getAdminEducation(search) {
    return await educationRepository.getAllAdminEducation(search);
  },

  async getPublicEducation() {
    const raw = await educationRepository.getPublicEducation();
    return raw.map(edu => ({
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location,
      period: formatPeriod(edu.startDate, edu.endDate, edu.isCurrent),
      startDate: edu.startDate,
      endDate: edu.endDate,
      isCurrent: edu.isCurrent,
      description: edu.description || '',
      order: edu.order
    }));
  },

  async getEducationById(id) {
    const item = await educationRepository.getEducationById(id);
    if (!item) throw new Error(`Education record with ID "${id}" not found.`);
    return item;
  },

  async createEducation(data) {
    validateEducationData(data);
    return await educationRepository.createEducation(data);
  },

  async updateEducation(id, data) {
    validateEducationData(data);
    return await educationRepository.updateEducation(id, data);
  },

  async deleteEducation(id) {
    return await educationRepository.deleteEducation(id);
  },

  async updateStatus(id, enabled) {
    return await educationRepository.updateStatus(id, enabled);
  },

  async reorderEducation(orderedIds) {
    if (!Array.isArray(orderedIds)) throw new Error('orderedIds must be an array of Education IDs.');
    return await educationRepository.reorderEducation(orderedIds);
  }
};

// ==================== CERTIFICATIONS SERVICE ====================

export const certificationsService = {
  async getAdminCertifications(search) {
    return await certificationsRepository.getAllAdminCertifications(search);
  },

  async getPublicCertifications() {
    return await certificationsRepository.getPublicCertifications();
  },

  async getCertificationById(id) {
    const item = await certificationsRepository.getCertificationById(id);
    if (!item) throw new Error(`Certification record with ID "${id}" not found.`);
    return item;
  },

  async createCertification(data) {
    validateCertificationData(data);
    return await certificationsRepository.createCertification(data);
  },

  async updateCertification(id, data) {
    validateCertificationData(data);
    return await certificationsRepository.updateCertification(id, data);
  },

  async deleteCertification(id) {
    return await certificationsRepository.deleteCertification(id);
  },

  async updateStatus(id, enabled) {
    return await certificationsRepository.updateStatus(id, enabled);
  },

  async reorderCertifications(orderedIds) {
    if (!Array.isArray(orderedIds)) throw new Error('orderedIds must be an array of Certification IDs.');
    return await certificationsRepository.reorderCertifications(orderedIds);
  }
};

// ==================== ACHIEVEMENTS SERVICE ====================

export const achievementsService = {
  async getAdminAchievements(search) {
    return await achievementsRepository.getAllAdminAchievements(search);
  },

  async getPublicAchievements() {
    return await achievementsRepository.getPublicAchievements();
  },

  async getAchievementById(id) {
    const item = await achievementsRepository.getAchievementById(id);
    if (!item) throw new Error(`Achievement record with ID "${id}" not found.`);
    return item;
  },

  async createAchievement(data) {
    validateAchievementData(data);
    return await achievementsRepository.createAchievement(data);
  },

  async updateAchievement(id, data) {
    validateAchievementData(data);
    return await achievementsRepository.updateAchievement(id, data);
  },

  async deleteAchievement(id) {
    return await achievementsRepository.deleteAchievement(id);
  },

  async updateStatus(id, enabled) {
    return await achievementsRepository.updateStatus(id, enabled);
  },

  async reorderAchievements(orderedIds) {
    if (!Array.isArray(orderedIds)) throw new Error('orderedIds must be an array of Achievement IDs.');
    return await achievementsRepository.reorderAchievements(orderedIds);
  }
};

// ==================== VALIDATIONS & HELPERS ====================

function validateEducationData(data) {
  if (!data.degree || data.degree.trim() === '') {
    throw new Error('Degree / Program title is required.');
  }
  if (!data.institution || data.institution.trim() === '') {
    throw new Error('Institution name is required.');
  }
  if (!data.startDate || data.startDate.trim() === '') {
    throw new Error('Start Date is required.');
  }
  if (!data.isCurrent && (!data.endDate || data.endDate.trim() === '')) {
    throw new Error('End Date is required when education is not current.');
  }
  if (data.startDate && data.endDate && !data.isCurrent) {
    if (data.startDate > data.endDate) {
      throw new Error('Start Date cannot be after End Date.');
    }
  }
}

function validateCertificationData(data) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Certification Name is required.');
  }
  if (!data.issuer || data.issuer.trim() === '') {
    throw new Error('Issuing Organization is required.');
  }
  if (data.credentialUrl && data.credentialUrl.trim() !== '') {
    try {
      new URL(data.credentialUrl);
    } catch {
      throw new Error('Credential URL must be a valid URL.');
    }
  }
  if (data.issueDate && data.expirationDate) {
    if (data.issueDate > data.expirationDate) {
      throw new Error('Issue Date cannot be after Expiration Date.');
    }
  }
}

function validateAchievementData(data) {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Achievement Title is required.');
  }
  if (data.url && data.url.trim() !== '') {
    try {
      new URL(data.url);
    } catch {
      throw new Error('Achievement URL must be a valid URL.');
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
