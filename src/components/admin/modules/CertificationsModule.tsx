import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Award, 
  Calendar, 
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';
import { FormField } from '../ui/FormField';

export interface AdminCertification {
  id: string;
  name: string;
  issuer: string;
  credentialId?: string | null;
  credentialUrl?: string | null;
  issueDate?: string | null;
  expirationDate?: string | null;
  description?: string | null;
  mediaId?: string | null;
  order: number;
  enabled: boolean;
}

interface CertificationsModuleProps {
  certifications: AdminCertification[];
  totalCertifications: number;
  enabledCertifications: number;
  onCreate: (data: Partial<AdminCertification>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AdminCertification>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export const CertificationsModule: React.FC<CertificationsModuleProps> = ({
  certifications,
  totalCertifications,
  enabledCertifications,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  onReorder,
  isSaving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<AdminCertification | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminCertification | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);

  const filteredCerts = certifications.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCert(null);
    setName('');
    setIssuer('');
    setCredentialId('');
    setCredentialUrl('');
    setIssueDate('');
    setExpirationDate('');
    setDescription('');
    setEnabled(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cert: AdminCertification) => {
    setEditingCert(cert);
    setName(cert.name);
    setIssuer(cert.issuer);
    setCredentialId(cert.credentialId || '');
    setCredentialUrl(cert.credentialUrl || '');
    setIssueDate(cert.issueDate || '');
    setExpirationDate(cert.expirationDate || '');
    setDescription(cert.description || '');
    setEnabled(cert.enabled);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim()) {
      setModalError('Certification Name is required.');
      return;
    }
    if (!issuer.trim()) {
      setModalError('Issuing Organization is required.');
      return;
    }
    if (credentialUrl.trim()) {
      try {
        new URL(credentialUrl.trim());
      } catch {
        setModalError('Credential URL must be a valid URL.');
        return;
      }
    }

    const payload: Partial<AdminCertification> = {
      name: name.trim(),
      issuer: issuer.trim(),
      credentialId: credentialId.trim() || null,
      credentialUrl: credentialUrl.trim() || null,
      issueDate: issueDate.trim() || null,
      expirationDate: expirationDate.trim() || null,
      description: description.trim() || null,
      enabled
    };

    try {
      if (editingCert) {
        await onUpdate(editingCert.id, payload);
      } else {
        await onCreate(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to save certification');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= certifications.length) return;

    const updated = [...certifications];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    await onReorder(updated.map(c => c.id));
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl">
      
      {/* Header & Overview Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            PROFESSIONAL CREDENTIALS CMS
          </span>
          <h2 className="text-xl font-black text-white">Certifications Management</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Award className="w-4 h-4 text-accentCyan" />
            <div>
              <span className="text-[9px] text-gray-400 block">Total</span>
              <span className="text-xs font-bold text-white">{totalCertifications}</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Enabled</span>
              <span className="text-xs font-bold text-emerald-400">{enabledCertifications}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search certification..."
              className="pl-9 pr-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue w-48"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Certification</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl space-y-4 font-mono text-xs text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Certification Record?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmItem.name}</span>?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl bg-bgVoid text-gray-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDelete(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-borderGlass pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCert ? 'Edit Certification Record' : 'Add New Professional Certification'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-bgVoid text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <FormField label="Certification Name" required>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="AWS Certified Solutions Architect"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                />
              </FormField>

              <FormField label="Issuing Organization" required>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="Amazon Web Services (AWS)"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Credential ID (Optional)">
                  <input
                    type="text"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    placeholder="AWS-123456"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-mono"
                  />
                </FormField>

                <FormField label="Credential URL (Optional)">
                  <input
                    type="text"
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-mono"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Issue Date (YYYY-MM)">
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    placeholder="2024-05"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan"
                  />
                </FormField>

                <FormField label="Expiration Date (YYYY-MM)">
                  <input
                    type="text"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    placeholder="2027-05"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                  />
                </FormField>
              </div>

              <FormField label="Description / Skills Covered (Optional)">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Demonstrated architectural design in AWS Cloud..."
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-sans resize-none"
                />
              </FormField>

              <div className="flex items-center justify-between pt-3 border-t border-borderGlass">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-400"
                  />
                  <span className="text-gray-300">Publicly Enabled</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-bgVoid text-gray-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Certification'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certifications List */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        {filteredCerts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <Award className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm font-bold text-white">No certifications added yet</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Your resume does not currently list explicit certifications. Click "+ Add Certification" above to add new verified credentials anytime.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-borderGlass">
            {filteredCerts.map((cert, idx) => (
              <div key={cert.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bgVoid/40 px-3 rounded-2xl transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl border border-accentBlue/30 bg-accentBlue/10 text-accentCyan flex-shrink-0 mt-0.5">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white">{cert.name}</h3>
                    <p className="text-xs font-bold text-accentCyan">{cert.issuer}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      {cert.issueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-accentCyan" />
                          <span>Issued: {cert.issueDate}</span>
                        </span>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accentBlue hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Verify Credential</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(cert.id, !cert.enabled)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      cert.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {cert.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{cert.enabled ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={idx === 0 || isSaving}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === filteredCerts.length - 1 || isSaving}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(cert)}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-accentCyan cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmItem(cert)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
