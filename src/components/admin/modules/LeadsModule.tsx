import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Mail, 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';
import { 
  fetchAdminLeads, 
  updateAdminLead, 
  deleteAdminLead 
} from '../../../services/apiClient';
import { ConfirmDeleteModal } from '../ui/StateFeedback';

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'IN_PROGRESS' | 'REPLIED' | 'ARCHIVED';
  read: boolean;
  adminNotes?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  UNREAD: { label: 'Unread', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  READ: { label: 'Read', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  REPLIED: { label: 'Replied', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  ARCHIVED: { label: 'Archived', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' }
};

interface LeadsModuleProps {
  onUnreadCountChange?: (count: number) => void;
}

export const LeadsModule: React.FC<LeadsModuleProps> = ({ onUnreadCountChange }) => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal & Actions
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<LeadItem | null>(null);

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminLeads({
        status: statusFilter,
        search: searchQuery,
        page,
        limit: 20
      });

      setLeads(res.data || []);
      setUnreadCount(res.unreadCount || 0);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);

      if (onUnreadCountChange) {
        onUnreadCountChange(res.unreadCount || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact leads.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLeads();
  };

  const handleOpenLeadDetail = async (lead: LeadItem) => {
    setSelectedLead(lead);
    setAdminNotesInput(lead.adminNotes || '');

    if (lead.status === 'UNREAD') {
      try {
        const updated = await updateAdminLead(lead.id, { status: 'READ' });
        setSelectedLead(updated);
        setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
        const newUnread = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnread);
        if (onUnreadCountChange) onUnreadCountChange(newUnread);
      } catch {
        // Silently continue
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: LeadItem['status']) => {
    try {
      const updated = await updateAdminLead(id, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(updated);
      }
      // Re-fetch unread count
      const res = await fetchAdminLeads({ status: statusFilter, search: searchQuery, page });
      setUnreadCount(res.unreadCount || 0);
      if (onUnreadCountChange) onUnreadCountChange(res.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    try {
      const updated = await updateAdminLead(selectedLead.id, { adminNotes: adminNotesInput });
      setSelectedLead(updated);
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? updated : l));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save admin notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmLead) return;
    try {
      await deleteAdminLead(deleteConfirmLead.id);
      setLeads(prev => prev.filter(l => l.id !== deleteConfirmLead.id));
      if (selectedLead && selectedLead.id === deleteConfirmLead.id) {
        setSelectedLead(null);
      }
      setDeleteConfirmLead(null);
      loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'Date', 'IP Address'];
    const rows = leads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toLocaleString(),
      l.ipAddress || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contact_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-mono text-xs max-w-6xl">
      
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Inquiries</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between">
          <div>
            <p className="text-[10px] text-amber-400 uppercase font-bold tracking-widest">Unread Messages</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{unreadCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between">
          <div>
            <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest">In Progress</p>
            <p className="text-2xl font-extrabold text-purple-300 mt-1">
              {leads.filter(l => l.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between">
          <div>
            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Replied / Resolved</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {leads.filter(l => l.status === 'REPLIED').length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Leads Control Card */}
      <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-borderGlass pb-6">
          <div>
            <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
              CLIENT INQUIRIES & LEAD MANAGEMENT
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accentCyan" />
              Contact Leads ({totalCount})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className="px-3.5 py-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white font-bold flex items-center gap-2 disabled:opacity-30 cursor-pointer"
            >
              <Download className="w-4 h-4 text-accentCyan" />
              <span>Export CSV</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadLeads}
              className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white cursor-pointer"
              title="Refresh Leads"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'UNREAD', 'READ', 'IN_PROGRESS', 'REPLIED', 'ARCHIVED'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-accentBlue text-white shadow-glow-blue'
                    : 'bg-bgVoid border border-borderGlass text-gray-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All Leads' : (STATUS_BADGES[st]?.label || st)}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, subject..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:border-accentBlue focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Leads Table List */}
        <div className="divide-y divide-borderGlass">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-accentCyan" />
              <span>Fetching contact form leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-mono">
              No contact form submissions found matching your search.
            </div>
          ) : (
            leads.map((lead) => {
              const badge = STATUS_BADGES[lead.status] || STATUS_BADGES.UNREAD;

              return (
                <div
                  key={lead.id}
                  className={`py-4 px-4 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    lead.status === 'UNREAD'
                      ? 'bg-amber-500/5 border border-amber-500/20 shadow-md'
                      : 'hover:bg-bgVoid/40'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1 overflow-hidden">
                    {/* Unread Dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      {lead.status === 'UNREAD' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block animate-pulse" title="Unread Lead" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-600/40 block" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{lead.name}</span>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs font-mono text-accentCyan hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </a>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-200 truncate">
                        {lead.subject || 'No Subject'}
                      </p>
                      <p className="text-xs text-gray-400 font-sans line-clamp-1 max-w-3xl">
                        {lead.message}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 pt-1">
                        <span>Submitted: {new Date(lead.createdAt).toLocaleString()}</span>
                        {lead.ipAddress && <span>IP: {lead.ipAddress}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0">
                    {/* Status Dropdown */}
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-200 text-xs font-mono focus:border-accentBlue focus:outline-none"
                    >
                      <option value="UNREAD">Unread</option>
                      <option value="READ">Read</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REPLIED">Replied</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>

                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => handleOpenLeadDetail(lead)}
                      className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-accentCyan cursor-pointer"
                      title="View Full Lead Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmLead(lead)}
                      className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-borderGlass">
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Lead Detail Drawer Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-bgVoid/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-bgCard border border-accentBlue/40 p-8 space-y-6 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-borderGlass pb-4">
              <div>
                <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
                  LEAD INQUIRY DETAILS
                </span>
                <h3 className="text-xl font-bold text-white">{selectedLead.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl bg-bgVoid text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Meta Info */}
            <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Email Address</p>
                <a
                  href={`mailto:${selectedLead.email}?subject=Re: ${encodeURIComponent(selectedLead.subject || 'Portfolio Inquiry')}`}
                  className="text-sm font-bold text-accentCyan hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>{selectedLead.email}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Submitted Date</p>
                <p className="text-xs font-mono text-white mt-1">
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedLead.ipAddress && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">IP Address</p>
                  <p className="text-xs font-mono text-gray-300 mt-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-accentBlue" />
                    <span>{selectedLead.ipAddress}</span>
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Current Lead Status</p>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value as any)}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-bgCard border border-borderGlass text-accentCyan text-xs font-bold"
                >
                  <option value="UNREAD">Unread</option>
                  <option value="READ">Read</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REPLIED">Replied</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Subject & Full Message */}
            <div className="space-y-2">
              <label className="text-xs text-accentCyan uppercase font-bold block">Subject</label>
              <div className="p-3.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold text-sm">
                {selectedLead.subject || 'No Subject Provided'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-accentCyan uppercase font-bold block">Full Message Text</label>
              <div className="p-5 rounded-2xl bg-bgVoid border border-borderGlass text-gray-200 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                {selectedLead.message}
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div className="space-y-2 pt-2 border-t border-borderGlass">
              <div className="flex items-center justify-between">
                <label className="text-xs text-accentCyan uppercase font-bold block">
                  Admin Internal Notes & Follow-up History
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-3 py-1 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-1 hover:bg-accentIndigo cursor-pointer text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Add internal follow-up notes e.g. Scheduled intro call for Thursday 4 PM..."
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-gray-200 text-xs font-mono resize-none focus:border-accentBlue focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-borderGlass">
              <a
                href={`mailto:${selectedLead.email}?subject=Re: ${encodeURIComponent(selectedLead.subject || 'Portfolio Inquiry')}`}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Reply via Email Client</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirm Delete Lead Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmLead}
        itemTitle={deleteConfirmLead ? `${deleteConfirmLead.name} (${deleteConfirmLead.email})` : 'Contact Lead'}
        description="Deleting this lead inquiry will permanently remove it from your admin records."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmLead(null)}
      />

    </div>
  );
};
