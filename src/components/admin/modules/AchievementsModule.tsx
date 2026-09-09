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
  Trophy, 
  Calendar, 
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';
import { FormField } from '../ui/FormField';

export interface AdminAchievement {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  organization?: string | null;
  url?: string | null;
  mediaId?: string | null;
  order: number;
  enabled: boolean;
}

interface AchievementsModuleProps {
  achievements: AdminAchievement[];
  totalAchievements: number;
  enabledAchievements: number;
  onCreate: (data: Partial<AdminAchievement>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AdminAchievement>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export const AchievementsModule: React.FC<AchievementsModuleProps> = ({
  achievements,
  totalAchievements,
  enabledAchievements,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  onReorder,
  isSaving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminAchievement | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminAchievement | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);

  const filteredItems = achievements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.organization && a.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setOrganization('');
    setDate('');
    setUrl('');
    setDescription('');
    setEnabled(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminAchievement) => {
    setEditingItem(item);
    setTitle(item.title);
    setOrganization(item.organization || '');
    setDate(item.date || '');
    setUrl(item.url || '');
    setDescription(item.description || '');
    setEnabled(item.enabled);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!title.trim()) {
      setModalError('Achievement Title is required.');
      return;
    }
    if (url.trim()) {
      try {
        new URL(url.trim());
      } catch {
        setModalError('Achievement URL must be a valid URL.');
        return;
      }
    }

    const payload: Partial<AdminAchievement> = {
      title: title.trim(),
      organization: organization.trim() || null,
      date: date.trim() || null,
      url: url.trim() || null,
      description: description.trim() || null,
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
      setModalError(err instanceof Error ? err.message : 'Failed to save achievement');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= achievements.length) return;

    const updated = [...achievements];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    await onReorder(updated.map(a => a.id));
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl">
      
      {/* Header & Overview Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            HONORS & RECOGNITION CMS
          </span>
          <h2 className="text-xl font-black text-white">Achievements Management</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Total</span>
              <span className="text-xs font-bold text-white">{totalAchievements}</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Enabled</span>
              <span className="text-xs font-bold text-emerald-400">{enabledAchievements}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search achievement..."
              className="pl-9 pr-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue w-48"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Achievement</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl space-y-4 font-mono text-xs text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Achievement Record?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmItem.title}</span>?
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
                {editingItem ? 'Edit Achievement Record' : 'Add New Achievement'}
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
              <FormField label="Achievement Title" required>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Engineering Excellence Award"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Organization / Event">
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="ThirdRock Techkno"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                  />
                </FormField>

                <FormField label="Date (YYYY-MM)">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="2025-12"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-amber-400 font-bold"
                  />
                </FormField>
              </div>

              <FormField label="Verification / Detail Link URL (Optional)">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-mono"
                />
              </FormField>

              <FormField label="Description & Context (Optional)">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Recognized for architecting microservices with sub-50ms API latency..."
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
                    {isSaving ? 'Saving...' : 'Save Achievement'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Achievements List */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <Trophy className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm font-bold text-white">No achievements added yet</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Your resume does not currently list explicit awards. Click "+ Add Achievement" above to add new honors anytime.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-borderGlass">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bgVoid/40 px-3 rounded-2xl transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white">{item.title}</h3>
                    {item.organization && <p className="text-xs font-bold text-amber-400">{item.organization}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-accentCyan" />
                          <span>{item.date}</span>
                        </span>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accentBlue hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Detail Link</span>
                        </a>
                      )}
                    </div>
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
                    disabled={idx === filteredItems.length - 1 || isSaving}
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
