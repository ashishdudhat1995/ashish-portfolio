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
  Compass, 
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';
import { FormField } from '../ui/FormField';

export interface AdminNavigationItem {
  id: string;
  label: string;
  target: string;
  type?: 'section' | 'external' | string;
  openInNewTab?: boolean;
  order: number;
  enabled: boolean;
}

interface NavigationModuleProps {
  items: AdminNavigationItem[];
  totalItems: number;
  enabledItems: number;
  onCreate: (data: Partial<AdminNavigationItem>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AdminNavigationItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export const NavigationModule: React.FC<NavigationModuleProps> = ({
  items,
  totalItems,
  enabledItems,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  onReorder,
  isSaving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminNavigationItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminNavigationItem | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [target, setTarget] = useState('');
  const [type, setType] = useState<'section' | 'external'>('section');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const filteredItems = items.filter(i =>
    i.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setLabel('');
    setTarget('#home');
    setType('section');
    setOpenInNewTab(false);
    setEnabled(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminNavigationItem) => {
    setEditingItem(item);
    setLabel(item.label);
    setTarget(item.target);
    setType((item.type as 'section' | 'external') || (item.target.startsWith('#') ? 'section' : 'external'));
    setOpenInNewTab(Boolean(item.openInNewTab));
    setEnabled(item.enabled);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!label.trim()) {
      setModalError('Navigation Label is required.');
      return;
    }
    if (!target.trim()) {
      setModalError('Target anchor or URL is required.');
      return;
    }

    const trimmedTarget = target.trim();
    // Validate target protocol & format
    if (trimmedTarget.toLowerCase().startsWith('javascript:') || trimmedTarget.toLowerCase().startsWith('data:') || trimmedTarget.toLowerCase().startsWith('vbscript:')) {
      setModalError('Unsafe protocol rejected. JavaScript or Data schemes are prohibited.');
      return;
    }

    if (type === 'section' && !trimmedTarget.startsWith('#') && !trimmedTarget.startsWith('/')) {
      setModalError('Section target anchor must start with "#" (e.g. #about).');
      return;
    }

    if (type === 'external') {
      try {
        const parsed = new URL(trimmedTarget);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setModalError('External URL target must use http or https protocol.');
          return;
        }
      } catch {
        setModalError('External URL target must be a valid HTTP or HTTPS URL.');
        return;
      }
    }

    const payload: Partial<AdminNavigationItem> = {
      label: label.trim(),
      target: trimmedTarget,
      type,
      openInNewTab: type === 'external' ? openInNewTab : false,
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
      setModalError(err instanceof Error ? err.message : 'Failed to save navigation item');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    await onReorder(updated.map(i => i.id));
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl">
      
      {/* Header & Summary Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            SINGLE-PAGE & EXTERNAL NAVIGATION CMS
          </span>
          <h2 className="text-xl font-black text-white">Header & Menu Navigation</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Compass className="w-4 h-4 text-accentCyan" />
            <div>
              <span className="text-[9px] text-gray-400 block">Total</span>
              <span className="text-xs font-bold text-white">{totalItems}</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Enabled</span>
              <span className="text-xs font-bold text-emerald-400">{enabledItems}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nav items..."
              className="pl-9 pr-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue w-48"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Nav Item</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl space-y-4 font-mono text-xs text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Navigation Item?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmItem.label}</span> ({deleteConfirmItem.target})?
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
                {editingItem ? 'Edit Navigation Item' : 'Add New Navigation Target'}
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
              <FormField label="Navigation Label" required>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Experience"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Link Type" required>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as 'section' | 'external';
                      setType(newType);
                      if (newType === 'section' && !target.startsWith('#')) {
                        setTarget('#' + label.toLowerCase().replace(/[^a-z0-9]+/g, ''));
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                  >
                    <option value="section">Section Anchor Link (#section)</option>
                    <option value="external">External Website URL (https://)</option>
                  </select>
                </FormField>

                <FormField label="Target Anchor or URL" required>
                  <input
                    type="text"
                    required
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={type === 'section' ? '#experience' : 'https://...'}
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-mono"
                  />
                </FormField>
              </div>

              {type === 'external' && (
                <div className="flex items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openInNewTab}
                      onChange={(e) => setOpenInNewTab(e.target.checked)}
                      className="w-4 h-4 rounded text-accentBlue"
                    />
                    <span className="text-white font-bold">Open link in new browser tab</span>
                  </label>
                </div>
              )}

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
                    {isSaving ? 'Saving...' : 'Save Navigation'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <Compass className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm font-bold text-white">No navigation items found</p>
            <p className="text-xs">Click "+ Add Nav Item" to create a new anchor target.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderGlass">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bgVoid/40 px-3 rounded-2xl transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl border border-accentBlue/30 bg-accentBlue/10 text-accentCyan flex-shrink-0 mt-0.5">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white">{item.label}</h3>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-accentCyan font-bold">{item.target}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 uppercase text-[10px]">{item.type || 'section'}</span>
                      {item.openInNewTab && (
                        <span className="text-accentBlue text-[10px] flex items-center gap-0.5">
                          <ExternalLink className="w-3 h-3" /> New Tab
                        </span>
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
