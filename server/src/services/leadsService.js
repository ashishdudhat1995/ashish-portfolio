import { leadsRepository } from '../repositories/leadsRepository.js';

export const leadsService = {
  async submitPublicLead(payload) {
    const { name, email, subject, message, ipAddress, userAgent } = payload || {};

    if (!name || !name.trim()) {
      throw new Error('Full Name is required');
    }
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address');
    }

    if (!message || !message.trim()) {
      throw new Error('Message content is required');
    }

    const created = await leadsRepository.createLead({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'Direct Inquiry from Portfolio',
      message: message.trim(),
      ipAddress,
      userAgent
    });

    return {
      success: true,
      message: 'Thank you! Your message has been received cleanly. I will get back to you shortly.',
      id: created.id
    };
  },

  async getAdminLeads(params) {
    return await leadsRepository.getLeads(params);
  },

  async getAdminLeadById(id) {
    if (!id) throw new Error('Lead ID is required');
    const lead = await leadsRepository.getLeadById(id);
    if (!lead) throw new Error('Lead not found');
    return lead;
  },

  async updateAdminLead(id, data) {
    if (!id) throw new Error('Lead ID is required');
    
    const validStatuses = ['UNREAD', 'READ', 'IN_PROGRESS', 'REPLIED', 'ARCHIVED'];
    if (data.status && !validStatuses.includes(data.status)) {
      throw new Error(`Invalid status '${data.status}'. Allowed: ${validStatuses.join(', ')}`);
    }

    return await leadsRepository.updateLead(id, data);
  },

  async deleteAdminLead(id) {
    if (!id) throw new Error('Lead ID is required');
    return await leadsRepository.deleteLead(id);
  },

  async getUnreadCount() {
    return await leadsRepository.getUnreadCount();
  }
};
