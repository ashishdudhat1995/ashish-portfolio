import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory fallback array for dev environment if DB table is unpopulated
let inMemoryLeads = [
  {
    id: 'lead-sample-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@fintechventures.io',
    subject: 'Senior Full Stack Lead Position - Remote/Hybrid',
    message: 'Hi Ashish, We reviewed your portfolio and were very impressed with your payment gateway architecture and microservices leadership experience. We would love to discuss a Senior Lead Engineer opportunity with Fintech Ventures.',
    status: 'UNREAD',
    read: false,
    adminNotes: 'High priority lead from Fintech Ventures.',
    ipAddress: '198.51.100.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    repliedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 4),
    updatedAt: new Date(Date.now() - 3600000 * 4)
  },
  {
    id: 'lead-sample-2',
    name: 'Michael Chang',
    email: 'm.chang@healthtech-global.com',
    subject: 'Consulting: DICOM & Telehealth System Architecture',
    message: 'Hello Ashish, We are scaling our digital health telemetry platform and need expert guidance on HL7/FHIR microservices and WebSocket streaming. Are you available for technical consulting?',
    status: 'READ',
    read: true,
    adminNotes: 'Consulting inquiry. Follow up scheduled.',
    ipAddress: '203.0.113.88',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    repliedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 28),
    updatedAt: new Date(Date.now() - 3600000 * 12)
  }
];

export const leadsRepository = {
  async createLead(data) {
    try {
      const newLead = await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject || 'Direct Inquiry from Portfolio',
          message: data.message,
          status: 'UNREAD',
          read: false,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null
        }
      });
      return newLead;
    } catch {
      // Memory fallback if DB unavailable
      const fallbackLead = {
        id: `lead-${Date.now()}`,
        name: data.name,
        email: data.email,
        subject: data.subject || 'Direct Inquiry from Portfolio',
        message: data.message,
        status: 'UNREAD',
        read: false,
        adminNotes: null,
        ipAddress: data.ipAddress || '127.0.0.1',
        userAgent: data.userAgent || 'Web Browser Client',
        repliedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryLeads.unshift(fallbackLead);
      return fallbackLead;
    }
  },

  async getLeads({ status, search, page = 1, limit = 20 }) {
    try {
      const whereClause = {};
      if (status && status !== 'ALL') {
        whereClause.status = status;
      }
      if (search && search.trim()) {
        const query = search.trim();
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { subject: { contains: query, mode: 'insensitive' } },
          { message: { contains: query, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [data, total, unreadCount] = await Promise.all([
        prisma.contactMessage.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.contactMessage.count({ where: whereClause }),
        prisma.contactMessage.count({ where: { status: 'UNREAD' } })
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        },
        unreadCount
      };
    } catch {
      // Fallback in-memory query
      let filtered = [...inMemoryLeads];
      if (status && status !== 'ALL') {
        filtered = filtered.filter(l => l.status === status);
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(l => 
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.subject || '').toLowerCase().includes(q) ||
          l.message.toLowerCase().includes(q)
        );
      }

      const total = filtered.length;
      const skip = (page - 1) * limit;
      const sliced = filtered.slice(skip, skip + limit);
      const unreadCount = inMemoryLeads.filter(l => l.status === 'UNREAD').length;

      return {
        data: sliced,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1
        },
        unreadCount
      };
    }
  },

  async getLeadById(id) {
    try {
      const lead = await prisma.contactMessage.findUnique({
        where: { id }
      });

      if (!lead) {
        const memLead = inMemoryLeads.find(l => l.id === id);
        if (memLead && memLead.status === 'UNREAD') {
          memLead.status = 'READ';
          memLead.read = true;
        }
        return memLead || null;
      }

      if (lead.status === 'UNREAD') {
        return await prisma.contactMessage.update({
          where: { id },
          data: { status: 'READ', read: true }
        });
      }

      return lead;
    } catch {
      const lead = inMemoryLeads.find(l => l.id === id);
      if (lead && lead.status === 'UNREAD') {
        lead.status = 'READ';
        lead.read = true;
      }
      return lead || null;
    }
  },

  async updateLead(id, data) {
    try {
      const updateData = {};
      if (data.status) {
        updateData.status = data.status;
        updateData.read = data.status !== 'UNREAD';
      }
      if (data.adminNotes !== undefined) {
        updateData.adminNotes = data.adminNotes;
      }
      if (data.repliedAt !== undefined) {
        updateData.repliedAt = data.repliedAt;
      }

      return await prisma.contactMessage.update({
        where: { id },
        data: updateData
      });
    } catch {
      const idx = inMemoryLeads.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Lead not found.');
      if (data.status) {
        inMemoryLeads[idx].status = data.status;
        inMemoryLeads[idx].read = data.status !== 'UNREAD';
      }
      if (data.adminNotes !== undefined) {
        inMemoryLeads[idx].adminNotes = data.adminNotes;
      }
      if (data.repliedAt !== undefined) {
        inMemoryLeads[idx].repliedAt = data.repliedAt;
      }
      inMemoryLeads[idx].updatedAt = new Date();
      return inMemoryLeads[idx];
    }
  },

  async deleteLead(id) {
    try {
      await prisma.contactMessage.delete({
        where: { id }
      });
      return true;
    } catch {
      inMemoryLeads = inMemoryLeads.filter(l => l.id !== id);
      return true;
    }
  },

  async getUnreadCount() {
    try {
      return await prisma.contactMessage.count({
        where: { status: 'UNREAD' }
      });
    } catch {
      return inMemoryLeads.filter(l => l.status === 'UNREAD').length;
    }
  }
};
