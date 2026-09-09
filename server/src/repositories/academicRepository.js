import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== EDUCATION REPOSITORY ====================

export const educationRepository = {
  async getAllAdminEducation(search) {
    const where = search ? {
      OR: [
        { degree: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    return await prisma.academicEducation.findMany({
      where,
      orderBy: { order: 'asc' }
    });
  },

  async getPublicEducation() {
    return await prisma.academicEducation.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' }
    });
  },

  async getEducationById(id) {
    return await prisma.academicEducation.findUnique({
      where: { id }
    });
  },

  async createEducation(data) {
    const count = await prisma.academicEducation.count();
    const order = data.order !== undefined ? data.order : count + 1;

    return await prisma.academicEducation.create({
      data: {
        degree: data.degree,
        field: data.field || data.degree,
        institution: data.institution,
        location: data.location || 'Gujarat, India',
        period: data.period || `${data.startDate || '2013-06'} – ${data.endDate || '2017-07'}`,
        startDate: data.startDate || '2013-06',
        endDate: data.isCurrent ? null : (data.endDate || null),
        isCurrent: Boolean(data.isCurrent),
        description: data.description || null,
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
      }
    });
  },

  async updateEducation(id, data) {
    return await prisma.academicEducation.update({
      where: { id },
      data: {
        degree: data.degree,
        field: data.field,
        institution: data.institution,
        location: data.location,
        period: data.period,
        startDate: data.startDate,
        endDate: data.isCurrent ? null : data.endDate,
        isCurrent: Boolean(data.isCurrent),
        description: data.description,
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined
      }
    });
  },

  async deleteEducation(id) {
    await prisma.academicEducation.delete({ where: { id } });
    return await this.normalizeOrdering();
  },

  async updateStatus(id, enabled) {
    return await prisma.academicEducation.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderEducation(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.academicEducation.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeOrdering() {
    const items = await prisma.academicEducation.findMany({
      orderBy: { order: 'asc' }
    });
    const updates = items.map((item, idx) =>
      prisma.academicEducation.update({
        where: { id: item.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};

// ==================== CERTIFICATIONS REPOSITORY ====================

export const certificationsRepository = {
  async getAllAdminCertifications(search) {
    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { issuer: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    return await prisma.professionalCertification.findMany({
      where,
      orderBy: { order: 'asc' }
    });
  },

  async getPublicCertifications() {
    return await prisma.professionalCertification.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' }
    });
  },

  async getCertificationById(id) {
    return await prisma.professionalCertification.findUnique({
      where: { id }
    });
  },

  async createCertification(data) {
    const count = await prisma.professionalCertification.count();
    const order = data.order !== undefined ? data.order : count + 1;

    return await prisma.professionalCertification.create({
      data: {
        title: data.title || data.name,
        issuer: data.issuer,
        credentialId: data.credentialId || null,
        credentialUrl: data.credentialUrl || null,
        issueDate: data.issueDate || null,
        expirationDate: data.expirationDate || null,
        description: data.description || null,
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
      }
    });
  },

  async updateCertification(id, data) {
    return await prisma.professionalCertification.update({
      where: { id },
      data: {
        title: data.title || data.name,
        issuer: data.issuer,
        credentialId: data.credentialId,
        credentialUrl: data.credentialUrl,
        issueDate: data.issueDate,
        expirationDate: data.expirationDate,
        description: data.description,
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined
      }
    });
  },

  async deleteCertification(id) {
    await prisma.professionalCertification.delete({ where: { id } });
    return await this.normalizeOrdering();
  },

  async updateStatus(id, enabled) {
    return await prisma.professionalCertification.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderCertifications(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.professionalCertification.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeOrdering() {
    const items = await prisma.professionalCertification.findMany({
      orderBy: { order: 'asc' }
    });
    const updates = items.map((item, idx) =>
      prisma.professionalCertification.update({
        where: { id: item.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};

// ==================== ACHIEVEMENTS REPOSITORY ====================

export const achievementsRepository = {
  async getAllAdminAchievements(search) {
    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    return await prisma.achievement.findMany({
      where,
      orderBy: { order: 'asc' }
    });
  },

  async getPublicAchievements() {
    return await prisma.achievement.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' }
    });
  },

  async getAchievementById(id) {
    return await prisma.achievement.findUnique({
      where: { id }
    });
  },

  async createAchievement(data) {
    const count = await prisma.achievement.count();
    const order = data.order !== undefined ? data.order : count + 1;

    return await prisma.achievement.create({
      data: {
        title: data.title,
        description: data.description || null,
        date: data.date || null,
        organization: data.organization || null,
        url: data.url || null,
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
      }
    });
  },

  async updateAchievement(id, data) {
    return await prisma.achievement.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        organization: data.organization,
        url: data.url,
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined
      }
    });
  },

  async deleteAchievement(id) {
    await prisma.achievement.delete({ where: { id } });
    return await this.normalizeOrdering();
  },

  async updateStatus(id, enabled) {
    return await prisma.achievement.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderAchievements(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.achievement.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeOrdering() {
    const items = await prisma.achievement.findMany({
      orderBy: { order: 'asc' }
    });
    const updates = items.map((item, idx) =>
      prisma.achievement.update({
        where: { id: item.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};
