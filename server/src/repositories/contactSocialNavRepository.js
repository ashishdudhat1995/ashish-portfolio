import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== SOCIAL LINKS REPOSITORY ====================

export const socialLinksRepository = {
  async getAllAdminSocialLinks(search) {
    const where = search ? {
      OR: [
        { platform: { contains: search, mode: 'insensitive' } },
        { label: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    return await prisma.socialLink.findMany({
      where,
      orderBy: { order: 'asc' }
    });
  },

  async getPublicSocialLinks() {
    return await prisma.socialLink.findMany({
      where: {
        enabled: true,
        url: { not: '' }
      },
      orderBy: { order: 'asc' }
    });
  },

  async getSocialLinkById(id) {
    return await prisma.socialLink.findUnique({ where: { id } });
  },

  async createSocialLink(data) {
    const count = await prisma.socialLink.count();
    const order = data.order !== undefined ? data.order : count + 1;

    return await prisma.socialLink.create({
      data: {
        platform: data.platform,
        label: data.label,
        url: data.url,
        iconKey: data.iconKey || data.platform.toLowerCase(),
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
      }
    });
  },

  async updateSocialLink(id, data) {
    return await prisma.socialLink.update({
      where: { id },
      data: {
        platform: data.platform,
        label: data.label,
        url: data.url,
        iconKey: data.iconKey,
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined
      }
    });
  },

  async deleteSocialLink(id) {
    await prisma.socialLink.delete({ where: { id } });
    return await this.normalizeOrdering();
  },

  async updateStatus(id, enabled) {
    return await prisma.socialLink.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderSocialLinks(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.socialLink.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeOrdering() {
    const items = await prisma.socialLink.findMany({ orderBy: { order: 'asc' } });
    const updates = items.map((item, idx) =>
      prisma.socialLink.update({
        where: { id: item.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};

// ==================== CONTACT SETTINGS REPOSITORY ====================

export const contactSettingsRepository = {
  async getContactSettings() {
    let settings = await prisma.contactSettings.findUnique({
      where: { id: 'default-contact' }
    });

    if (!settings) {
      settings = await prisma.contactSettings.create({
        data: {
          id: 'default-contact',
          heading: "Let's Build Something Exceptional Together.",
          description: "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.",
          primaryCtaLabel: "Initiate Discussion",
          primaryCtaTarget: "#contact",
          enabled: true
        }
      });
    }

    return settings;
  },

  async updateContactSettings(data) {
    return await prisma.contactSettings.upsert({
      where: { id: 'default-contact' },
      update: {
        heading: data.heading,
        description: data.description,
        primaryCtaLabel: data.primaryCtaLabel,
        primaryCtaTarget: data.primaryCtaTarget,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
      },
      create: {
        id: 'default-contact',
        heading: data.heading || "Let's Build Something Exceptional Together.",
        description: data.description || "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.",
        primaryCtaLabel: data.primaryCtaLabel || "Initiate Discussion",
        primaryCtaTarget: data.primaryCtaTarget || "#contact",
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
      }
    });
  }
};

// ==================== NAVIGATION REPOSITORY ====================

export const navigationRepository = {
  async getAllAdminNavigation() {
    return await prisma.navigationItem.findMany({
      orderBy: { order: 'asc' }
    });
  },

  async getPublicNavigation() {
    return await prisma.navigationItem.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' }
    });
  },

  async getNavigationById(id) {
    return await prisma.navigationItem.findUnique({ where: { id } });
  },

  async createNavigationItem(data) {
    const count = await prisma.navigationItem.count();
    const order = data.order !== undefined ? data.order : count + 1;

    return await prisma.navigationItem.create({
      data: {
        label: data.label,
        target: data.target,
        type: data.type || 'section',
        openInNewTab: Boolean(data.openInNewTab),
        order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true
      }
    });
  },

  async updateNavigationItem(id, data) {
    return await prisma.navigationItem.update({
      where: { id },
      data: {
        label: data.label,
        target: data.target,
        type: data.type,
        openInNewTab: Boolean(data.openInNewTab),
        order: data.order,
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined
      }
    });
  },

  async deleteNavigationItem(id) {
    await prisma.navigationItem.delete({ where: { id } });
    return await this.normalizeOrdering();
  },

  async updateStatus(id, enabled) {
    return await prisma.navigationItem.update({
      where: { id },
      data: { enabled }
    });
  },

  async reorderNavigation(orderedIds) {
    const updates = orderedIds.map((id, index) =>
      prisma.navigationItem.update({
        where: { id },
        data: { order: index + 1 }
      })
    );
    return await prisma.$transaction(updates);
  },

  async normalizeOrdering() {
    const items = await prisma.navigationItem.findMany({ orderBy: { order: 'asc' } });
    const updates = items.map((item, idx) =>
      prisma.navigationItem.update({
        where: { id: item.id },
        data: { order: idx + 1 }
      })
    );
    return await prisma.$transaction(updates);
  }
};
