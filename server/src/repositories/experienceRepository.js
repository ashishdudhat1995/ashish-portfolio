import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const experienceRepository = {
  async getAllAdminExperiences(search) {
    try {
      const where = search ? {
        OR: [
          { company: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      return await prisma.experienceItem.findMany({
        where,
        orderBy: { order: 'asc' }
      });
    } catch {
      return [];
    }
  },

  async getPublicExperiences() {
    try {
      return await prisma.experienceItem.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' }
      });
    } catch {
      return [];
    }
  },

  async getExperienceById(id) {
    try {
      return await prisma.experienceItem.findUnique({
        where: { id }
      });
    } catch {
      return null;
    }
  },

  async createExperience(data) {
    const count = await prisma.experienceItem.count();
    const order = data.order !== undefined ? data.order : count + 1;
    const id = data.id || data.company.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    return await prisma.experienceItem.create({
      data: {
        id,
        company: data.company,
        role: data.role,
        startDate: data.startDate || '2025-07',
        endDate: data.isCurrent ? null : (data.endDate || null),
        isCurrent: Boolean(data.isCurrent),
        location: data.location || 'Ahmedabad, India',
        summary: data.summary || '',
        highlights: data.highlights || [],
        metrics: data.metrics || [],
        technologies: data.technologies || [],
        isBreak: Boolean(data.isBreak),
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
      }
    });
  },

  async updateExperience(id, data) {
    return await prisma.experienceItem.update({
      where: { id },
      data: {
        company: data.company,
        role: data.role,
        startDate: data.startDate,
        endDate: data.isCurrent ? null : data.endDate,
        isCurrent: Boolean(data.isCurrent),
        location: data.location,
        summary: data.summary,
        highlights: data.highlights,
        metrics: data.metrics,
        technologies: data.technologies,
        isBreak: Boolean(data.isBreak),
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined,
      }
    });
  },

  async deleteExperience(id) {
    await prisma.experienceItem.delete({ where: { id } });
    return await this.normalizeOrdering();
  },

  async updateStatus(id, enabled) {
    return await prisma.experienceItem.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderExperiences(orderedIds) {
    const updates = orderedIds.map((id, index) => 
      prisma.experienceItem.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeOrdering() {
    const items = await prisma.experienceItem.findMany({
      orderBy: { order: 'asc' }
    });
    const updates = items.map((item, idx) => 
      prisma.experienceItem.update({
        where: { id: item.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};
