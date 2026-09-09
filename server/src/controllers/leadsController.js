import { leadsService } from '../services/leadsService.js';

export const leadsController = {
  // Public Contact Form Submission Endpoint
  async submitPublicLead(req, res, next) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const result = await leadsService.submitPublicLead({
        ...req.body,
        ipAddress,
        userAgent
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin: Get Paginated Leads with Filters
  async getAdminLeads(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const status = req.query.status || undefined;
      const search = req.query.search || undefined;

      const result = await leadsService.getAdminLeads({
        page,
        limit,
        status,
        search
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        unreadCount: result.unreadCount
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin: Get Single Lead Details
  async getAdminLeadById(req, res, next) {
    try {
      const lead = await leadsService.getAdminLeadById(req.params.id);
      res.json({
        success: true,
        data: lead
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin: Update Lead Status & Notes
  async updateAdminLead(req, res, next) {
    try {
      const updated = await leadsService.updateAdminLead(req.params.id, req.body);
      res.json({
        success: true,
        data: updated,
        message: 'Lead status updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin: Delete Lead
  async deleteAdminLead(req, res, next) {
    try {
      await leadsService.deleteAdminLead(req.params.id);
      res.json({
        success: true,
        message: 'Lead entry deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin: Get Unread Count for Badge
  async getUnreadCount(req, res, next) {
    try {
      const count = await leadsService.getUnreadCount();
      res.json({
        success: true,
        unreadCount: count
      });
    } catch (err) {
      next(err);
    }
  }
};
