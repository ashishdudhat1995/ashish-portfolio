import { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Calendar, 
  AlertCircle,
  FolderGit2
} from 'lucide-react';

export interface AdminProject {
  id: string;
  name: string;
  subtitle: string;
  domain: string;
  category: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description: string;
  featured: boolean;
  order: number;
  enabled: boolean;
  highlights?: Array<{ id?: string; text: string; order?: number; enabled?: boolean }>;
  technologies?: Array<{ id?: string; name: string; order?: number; enabled?: boolean }>;
  media?: Array<{ id?: string; url: string; alt?: string; caption?: string; type?: string }>;
  links?: Array<{ id?: string; label: string; url: string; type?: string }>;
}

interface ProjectsListModuleProps {
  projects: AdminProject[];
  totalProjects: number;
  enabledProjects: number;
  featuredProjects: number;
  onAddNew: () => void;
  onEdit: (project: AdminProject) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, enabled: boolean) => Promise<void>;
  onToggleFeatured: (id: string, featured: boolean) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export const ProjectsListModule: React.FC<ProjectsListModuleProps> = ({
  projects,
  totalProjects,
  enabledProjects,
  featuredProjects,
  onAddNew,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onReorder,
  isSaving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminProject | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    try {
      await onReorder(updated.map(p => p.id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reorder projects');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await onDelete(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const formatDisplayPeriod = (p: AdminProject) => {
    if (p.isCurrent) return `${p.startDate} – Present`;
    return `${p.startDate} – ${p.endDate || 'N/A'}`;
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-7xl">
      
      {/* Overview Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            PRODUCTION CASE STUDIES CMS
          </span>
          <h2 className="text-xl font-black text-white">Projects Management</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Metrics */}
          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-accentCyan" />
            <div>
              <span className="text-[9px] text-gray-400 block">Total</span>
              <span className="text-xs font-bold text-white">{totalProjects}</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Enabled</span>
              <span className="text-xs font-bold text-emerald-400">{enabledProjects}</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Featured</span>
              <span className="text-xs font-bold text-amber-400">{featuredProjects}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search project..."
              className="pl-9 pr-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:border-accentBlue focus:outline-none w-48 sm:w-56"
            />
          </div>

          {/* Quick Add */}
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Project</span>
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
            <h3 className="text-base font-bold text-white">Delete Production Project?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete project <span className="font-bold text-white">{deleteConfirmItem.name}</span>?
            </p>
            <p className="text-[11px] text-gray-500">This action will delete all associated highlights and technologies.</p>

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

      {/* Projects List */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <p className="text-sm font-bold text-white">No projects found</p>
            <p className="text-xs">Click "+ Add Project" above to create your first case study.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderGlass">
            {filteredProjects.map((p, idx) => (
              <div
                key={p.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bgVoid/40 px-3 rounded-2xl transition-colors"
              >
                {/* Info Column */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl border border-accentBlue/30 bg-accentBlue/10 text-accentCyan flex-shrink-0 mt-0.5">
                    <FolderGit2 className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-bgVoid border border-borderGlass text-accentCyan">
                        {p.domain}
                      </span>
                      {p.featured && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 font-bold">{p.subtitle}</p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-accentCyan" />
                        <span>{formatDisplayPeriod(p)}</span>
                      </span>
                      <span>• {(p.technologies || []).length} Tech Tags</span>
                      <span>• {(p.highlights || []).length} Highlights</span>
                    </div>

                    <p className="text-[11px] text-gray-400 line-clamp-2 max-w-2xl font-sans pt-1">
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  
                  {/* Featured Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(p.id, !p.featured)}
                    className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                      p.featured ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-bgVoid border-borderGlass text-gray-500'
                    }`}
                    title={p.featured ? 'Unmark Featured' : 'Mark as Featured'}
                  >
                    <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400' : ''}`} />
                  </button>

                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(p.id, !p.enabled)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      p.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {p.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{p.enabled ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={idx === 0 || isSaving}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={idx === filteredProjects.length - 1 || isSaving}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-accentCyan cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmItem(p)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete Project"
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
