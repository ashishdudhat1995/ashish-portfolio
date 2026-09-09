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
  Share2, 
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';
import { FormField } from '../ui/FormField';

export interface AdminSocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  iconKey?: string;
  order: number;
  enabled: boolean;
}

interface SocialLinksModuleProps {
  links: AdminSocialLink[];
  totalLinks: number;
  enabledLinks: number;
  onCreate: (data: Partial<AdminSocialLink>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AdminSocialLink>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

const PLATFORM_OPTIONS = [
  'LinkedIn',
  'GitHub',
  'X',
  'Instagram',
  'Facebook',
  'YouTube',
  'Website',
  'Other'
];

export const SocialLinksModule: React.FC<SocialLinksModuleProps> = ({
  links,
  totalLinks,
  enabledLinks,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  onReorder,
  isSaving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminSocialLink | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminSocialLink | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [platform, setPlatform] = useState('LinkedIn');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [iconKey, setIconKey] = useState('');
  const [enabled, setEnabled] = useState(true);

  const filteredLinks = links.filter(l =>
    l.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setPlatform('LinkedIn');
    setLabel('linkedin.com/in/ashishkumar-dudhat');
    setUrl('https://linkedin.com/in/ashishkumar-dudhat');
    setIconKey('linkedin');
    setEnabled(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminSocialLink) => {
    setEditingItem(item);
    setPlatform(item.platform);
    setLabel(item.label);
    setUrl(item.url);
    setIconKey(item.iconKey || item.platform.toLowerCase());
    setEnabled(item.enabled);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!platform.trim()) {
      setModalError('Platform is required.');
      return;
    }
    if (!label.trim()) {
      setModalError('Label is required.');
      return;
    }
    if (!url.trim()) {
      setModalError('URL is required.');
      return;
    }
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setModalError('URL must use http or https protocol.');
        return;
      }
    } catch {
      setModalError('URL must be a valid HTTP or HTTPS URL.');
      return;
    }

    const payload: Partial<AdminSocialLink> = {
      platform: platform.trim(),
      label: label.trim(),
      url: url.trim(),
      iconKey: iconKey.trim() || platform.toLowerCase(),
      enabled
    };

    try {
      if (editingItem) {
        await onUpdate(editingItem.id, payload);
      } else {
        await onCreate(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to save social link');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= links.length) return;

    const updated = [...links];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    await onReorder(updated.map(l => l.id));
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl">
      
      {/* Header & Summary Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            EXTERNAL PROFILES CMS
          </span>
          <h2 className="text-xl font-black text-white">Social & Network Links</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Share2 className="w-4 h-4 text-accentCyan" />
            <div>
              <span className="text-[9px] text-gray-400 block">Total</span>
              <span className="text-xs font-bold text-white">{totalLinks}</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Enabled</span>
              <span className="text-xs font-bold text-emerald-400">{enabledLinks}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search links..."
              className="pl-9 pr-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue w-48"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Social Link</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl space-y-4 font-mono text-xs text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Social Link?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmItem.platform}</span> ({deleteConfirmItem.label})?
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
                {editingItem ? 'Edit Social Link' : 'Add New Social Profile Link'}
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
              <FormField label="Platform" required>
                <select
                  value={platform}
                  onChange={(e) => {
                    setPlatform(e.target.value);
                    if (!iconKey) setIconKey(e.target.value.toLowerCase());
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                >
                  {PLATFORM_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Label (Display Name / Username)" required>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="linkedin.com/in/ashishkumar-dudhat"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                />
              </FormField>

              <FormField label="Target Profile URL (HTTPS)" required>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/ashishkumar-dudhat"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-mono"
                />
              </FormField>

              <FormField label="Icon Key / System Asset Key (Optional)">
                <input
                  type="text"
                  value={iconKey}
                  onChange={(e) => setIconKey(e.target.value)}
                  placeholder="linkedin, github, twitter, globe..."
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 font-mono"
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
                    {isSaving ? 'Saving...' : 'Save Social Link'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Links List */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        {filteredLinks.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <Share2 className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm font-bold text-white">No social links configured</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Click "+ Add Social Link" above to add verified profiles cleanly. Missing or unconfigured links will not render on the public site.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-borderGlass">
            {filteredLinks.map((item, idx) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bgVoid/40 px-3 rounded-2xl transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl border border-accentBlue/30 bg-accentBlue/10 text-accentCyan flex-shrink-0 mt-0.5">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white">{item.platform}</h3>
                    <p className="text-xs font-bold text-accentCyan">{item.label}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-gray-400 font-mono hover:underline flex items-center gap-1"
                    >
                      <span>{item.url}</span>
                      <ExternalLink className="w-3 h-3 text-accentBlue" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id, !item.enabled)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      item.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{item.enabled ? 'Enabled' : 'Disabled'}</span>
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
                    disabled={idx === filteredLinks.length - 1 || isSaving}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-accentCyan cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmItem(item)}
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
