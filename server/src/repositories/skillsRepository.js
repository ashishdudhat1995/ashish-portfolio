import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const skillsRepository = {
  // ================= CATEGORY OPERATIONS =================

  async getAllAdminCategories() {
    return await prisma.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        skills: {
          orderBy: { order: 'asc' }
        }
      }
    });
  },

  async getPublicCategories() {
    return await prisma.skillCategory.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
      include: {
        skills: {
          where: { enabled: true },
          orderBy: { order: 'asc' }
        }
      }
    });
  },

  async getCategoryById(id) {
    return await prisma.skillCategory.findUnique({
      where: { id },
      include: {
        skills: {
          orderBy: { order: 'asc' }
        }
      }
    });
  },

  async createCategory(data) {
    const count = await prisma.skillCategory.count();
    const order = data.order !== undefined ? data.order : count + 1;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = data.id || `cat-${slug}`;

    return await prisma.skillCategory.create({
      data: {
        id,
        name: data.name,
        slug,
        description: data.description || null,
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
      }
    });
  },

  async updateCategory(id, data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return await prisma.skillCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined,
      }
    });
  },

  async deleteCategory(id, force = false) {
    const category = await prisma.skillCategory.findUnique({
      where: { id },
      include: { skills: true }
    });

    if (!category) return null;

    if (!force && category.skills && category.skills.length > 0) {
      throw new Error(`Cannot delete category "${category.name}" because it contains ${category.skills.length} skills. Delete or move the skills first.`);
    }

    await prisma.skillCategory.delete({ where: { id } });
    return await this.normalizeCategoryOrdering();
  },

  async updateCategoryStatus(id, enabled) {
    return await prisma.skillCategory.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderCategories(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.skillCategory.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeCategoryOrdering() {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { order: 'asc' }
    });
    const updates = categories.map((cat, idx) =>
      prisma.skillCategory.update({
        where: { id: cat.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  // ================= SKILL OPERATIONS =================

  async getSkillById(id) {
    return await prisma.skill.findUnique({
      where: { id }
    });
  },

  async createSkill(data) {
    const count = await prisma.skill.count({ where: { categoryId: data.categoryId } });
    const order = data.order !== undefined ? data.order : count + 1;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = data.id || `sk-${slug}-${Date.now()}`;

    return await prisma.skill.create({
      data: {
        id,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description || null,
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
      }
    });
  },

  async updateSkill(id, data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return await prisma.skill.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined,
      }
    });
  },

  async deleteSkill(id) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) return null;

    await prisma.skill.delete({ where: { id } });
    return await this.normalizeSkillOrdering(skill.categoryId);
  },

  async updateSkillStatus(id, enabled) {
    return await prisma.skill.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderSkills(categoryId, orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.skill.update({
        where: { id },
        data: { order: index + 1, categoryId }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeSkillOrdering(categoryId) {
    const skills = await prisma.skill.findMany({
      where: { categoryId },
      orderBy: { order: 'asc' }
    });
    const updates = skills.map((sk, idx) =>
      prisma.skill.update({
        where: { id: sk.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};
