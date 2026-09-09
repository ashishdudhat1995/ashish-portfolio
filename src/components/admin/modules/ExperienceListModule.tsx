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
  Heart, 
  Briefcase, 
  Calendar, 
  MapPin,
  AlertCircle
} from 'lucide-react';

export interface ExperienceAdminItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  location: string;
  summary: string;
  highlights: any[];
  metrics?: any[];
  technologies: string[];
  isBreak: boolean;
  order: number;
  enabled: boolean;
}

interface ExperienceListModuleProps {
  items: ExperienceAdminItem[];
  onAddNew: () => void;
  onEdit: (item: ExperienceAdminItem) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export const ExperienceListModule: React.FC<ExperienceListModuleProps> = ({
  items,
  onAddNew,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  isSaving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ExperienceAdminItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredItems = items.filter(item => 
    item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    const orderedIds = updated.map(item => item.id);
    try {
      await onReorder(orderedIds);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reorder experiences');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await onDelete(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  };

  const formatDisplayPeriod = (item: ExperienceAdminItem) => {
    if (item.isCurrent) return `${item.startDate} – Present`;
    return `${item.startDate} – ${item.endDate || 'N/A'}`;
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-7xl">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            CAREER TIMELINE CMS
          </span>
          <h2 className="text-xl font-black text-white">Experience Management</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company or role..."
              className="pl-9 pr-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:border-accentBlue focus:outline-none w-56 sm:w-64"
            />
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Experience</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl space-y-4 font-mono text-xs text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Experience Record?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmItem.role}</span> at <span className="font-bold text-accentCyan">{deleteConfirmItem.company}</span>?
            </p>
            <p className="text-[11px] text-gray-500">This action cannot be undone and will update timeline ordering.</p>

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
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop & Mobile Responsive List */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <p className="text-sm font-bold text-white">No experience entries found</p>
            <p className="text-xs">Click "+ Add Experience" above to create your first entry.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderGlass">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bgVoid/40 px-3 rounded-2xl transition-colors"
              >
                {/* Info Column */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                    item.isBreak 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                      : 'bg-accentBlue/10 border-accentBlue/30 text-accentCyan'
                  }`}>
                    {item.isBreak ? <Heart className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{item.role}</span>
                      <span className="text-xs font-bold text-accentCyan">@ {item.company}</span>
                      {item.isBreak && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          Career Break
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-accentCyan" />
                        <span>{formatDisplayPeriod(item)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span>{item.location}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 line-clamp-2 max-w-2xl font-sans pt-1">
                      {item.summary}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(item.technologies || []).slice(0, 5).map((tech, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-bgVoid border border-borderGlass text-[9px] text-gray-400">
                          {tech}
                        </span>
                      ))}
                      {(item.technologies || []).length > 5 && (
                        <span className="px-1.5 py-0.5 text-[9px] text-gray-500">
                          +{(item.technologies || []).length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  
                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id, !item.enabled)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      item.enabled 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{item.enabled ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={idx === 0 || isSaving}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Up in Timeline"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={idx === filteredItems.length - 1 || isSaving}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Down in Timeline"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-accentCyan cursor-pointer"
                    title="Edit Experience"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmItem(item)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete Experience"
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
