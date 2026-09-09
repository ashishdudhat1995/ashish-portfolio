import { skillsRepository } from '../repositories/skillsRepository.js';

export const skillsService = {
  // Category Service Methods
  async getAdminCategories() {
    return await skillsRepository.getAllAdminCategories();
  },

  async getPublicCategories() {
    const rawCategories = await skillsRepository.getPublicCategories();
    return rawCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      status: cat.status,
      skills: (cat.skills || []).map(sk => ({
        id: sk.id,
        name: sk.name,
        slug: sk.slug,
        description: sk.description,
        featured: sk.isFeatured,
        isFeatured: sk.isFeatured,
        awsComponents: sk.awsComponents,
        order: sk.order,
        status: sk.status
      }))
    }));
  },

  async getCategoryById(id) {
    const cat = await skillsRepository.getCategoryById(id);
    if (!cat) {
      throw new Error(`Skill category with ID "${id}" not found.`);
    }
    return cat;
  },

  async createCategory(data) {
    validateCategoryData(data);
    return await skillsRepository.createCategory(data);
  },

  async updateCategory(id, data) {
    validateCategoryData(data);
    return await skillsRepository.updateCategory(id, data);
  },

  async deleteCategory(id, force = false) {
    return await skillsRepository.deleteCategory(id, force);
  },

  async updateCategoryStatus(id, enabled) {
    return await skillsRepository.updateCategoryStatus(id, enabled);
  },

  async reorderCategories(orderedIds) {
    if (!Array.isArray(orderedIds)) {
      throw new Error('orderedIds must be an array of Category IDs.');
    }
    return await skillsRepository.reorderCategories(orderedIds);
  },

  // Skill Service Methods
  async getSkillById(id) {
    const sk = await skillsRepository.getSkillById(id);
    if (!sk) {
      throw new Error(`Skill with ID "${id}" not found.`);
    }
    return sk;
  },

  async createSkill(data) {
    validateSkillData(data);
    return await skillsRepository.createSkill(data);
  },

  async updateSkill(id, data) {
    validateSkillData(data);
    return await skillsRepository.updateSkill(id, data);
  },

  async deleteSkill(id) {
    return await skillsRepository.deleteSkill(id);
  },

  async updateSkillStatus(id, enabled) {
    return await skillsRepository.updateSkillStatus(id, enabled);
  },

  async reorderSkills(categoryId, orderedIds) {
    if (!categoryId || !Array.isArray(orderedIds)) {
      throw new Error('categoryId and orderedIds array are required.');
    }
    return await skillsRepository.reorderSkills(categoryId, orderedIds);
  }
};

function validateCategoryData(data) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Category Name is required.');
  }
}

function validateSkillData(data) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Skill Name is required.');
  }
  if (!data.categoryId || data.categoryId.trim() === '') {
    throw new Error('Skill must belong to a valid Category.');
  }
}
