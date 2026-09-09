import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const projectsRepository = {
  async getAllAdminProjects(search) {
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    return await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' }
    });
  },

  async getPublicProjects() {
    return await prisma.project.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' }
    });
  },

  async getProjectById(id) {
    return await prisma.project.findUnique({
      where: { id }
    });
  },

  async createProject(data) {
    const count = await prisma.project.count();
    const order = data.order !== undefined ? data.order : count + 1;
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    return await prisma.project.create({
      data: {
        id,
        name: data.name,
        title: data.title || data.name,
        subtitle: data.subtitle || '',
        domain: data.domain || 'Software Engineering',
        category: data.category || 'Web Application',
        period: data.period || '2024 - 2025',
        description: data.description || '',
        capabilities: data.capabilities || [],
        highlights: data.highlights || [],
        technologies: data.technologies || [],
        techStackByLayer: data.techStackByLayer || null,
        architecturePoints: data.architecturePoints || [],
        impact: data.impact || [],
        featured: Boolean(data.featured),
        images: data.images || [],
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
        status: data.status || 'published'
      }
    });
  },

  async updateProject(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.domain !== undefined) updateData.domain = data.domain;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.capabilities !== undefined) updateData.capabilities = data.capabilities;
    if (data.highlights !== undefined) updateData.highlights = data.highlights;
    if (data.technologies !== undefined) updateData.technologies = data.technologies;
    if (data.techStackByLayer !== undefined) updateData.techStackByLayer = data.techStackByLayer;
    if (data.architecturePoints !== undefined) updateData.architecturePoints = data.architecturePoints;
    if (data.impact !== undefined) updateData.impact = data.impact;
    if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
    if (data.images !== undefined) updateData.images = data.images;
    if (data.liveUrl !== undefined) updateData.liveUrl = data.liveUrl || null;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl || null;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.enabled !== undefined) updateData.enabled = Boolean(data.enabled);
    if (data.status !== undefined) updateData.status = data.status;

    return await prisma.project.update({
      where: { id },
      data: updateData
    });
  },

  async deleteProject(id) {
    await prisma.project.delete({ where: { id } });
    return await this.normalizeOrdering();
  },

  async updateStatus(id, enabled) {
    return await prisma.project.update({
      where: { id },
      data: { enabled }
    });
  },

  async updateFeatured(id, featured) {
    return await prisma.project.update({
      where: { id },
      data: { featured }
    });
  },

  async reorderProjects(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeOrdering() {
    const items = await prisma.project.findMany({
      orderBy: { order: 'asc' }
    });
    const updates = items.map((item, idx) =>
      prisma.project.update({
        where: { id: item.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};
