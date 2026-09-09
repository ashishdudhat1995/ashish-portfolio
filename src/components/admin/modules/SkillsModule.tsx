import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Layers, 
  Code2, 
  AlertCircle,
  FolderPlus,
  CheckCircle2,
  X
} from 'lucide-react';

import { ConfirmDeleteModal } from '../ui/StateFeedback';

export interface AdminSkill {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  enabled: boolean;
}

export interface AdminSkillCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  enabled: boolean;
  skills: AdminSkill[];
}

interface SkillsModuleProps {
  categories: AdminSkillCategory[];
  totalCategories: number;
  totalEnabledSkills: number;
  onCreateCategory: (data: { name: string; description?: string }) => Promise<void>;
  onUpdateCategory: (id: string, data: { name: string; description?: string }) => Promise<void>;
  onDeleteCategory: (id: string, force?: boolean) => Promise<void>;
  onToggleCategoryStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorderCategories: (orderedIds: string[]) => Promise<void>;

  onCreateSkill: (data: { categoryId: string; name: string; description?: string }) => Promise<void>;
  onUpdateSkill: (id: string, data: { categoryId: string; name: string; description?: string }) => Promise<void>;
  onDeleteSkill: (id: string) => Promise<void>;
  onToggleSkillStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorderSkills: (categoryId: string, orderedIds: string[]) => Promise<void>;

  isSaving: boolean;
}

export const SkillsModule: React.FC<SkillsModuleProps> = ({
  categories,
  totalCategories,
  totalEnabledSkills,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onToggleCategoryStatus,
  onReorderCategories,
  onCreateSkill,
  onUpdateSkill,
  onDeleteSkill,
  onToggleSkillStatus,
  onReorderSkills,
  isSaving
}) => {
  // Modal States
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category?: AdminSkillCategory | null }>({ open: false });
  const [skillModal, setSkillModal] = useState<{ open: boolean; skill?: AdminSkill | null; categoryId?: string }>({ open: false });
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<AdminSkillCategory | null>(null);
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState<AdminSkill | null>(null);

  // Form Inputs
  const [catNameInput, setCatNameInput] = useState('');
  const [catDescInput, setCatDescInput] = useState('');

  const [skillNameInput, setSkillNameInput] = useState('');
  const [skillCatIdInput, setSkillCatIdInput] = useState('');
  const [skillDescInput, setSkillDescInput] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Category Modal Handlers
  const handleOpenCategoryModal = (cat?: AdminSkillCategory) => {
    setErrorMsg(null);
    if (cat) {
      setCatNameInput(cat.name);
      setCatDescInput(cat.description || '');
      setCategoryModal({ open: true, category: cat });
    } else {
      setCatNameInput('');
      setCatDescInput('');
      setCategoryModal({ open: true, category: null });
    }
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!catNameInput.trim()) {
      setErrorMsg('Category Name is required.');
      return;
    }

    try {
      if (categoryModal.category) {
        await onUpdateCategory(categoryModal.category.id, { name: catNameInput.trim(), description: catDescInput.trim() });
      } else {
        await onCreateCategory({ name: catNameInput.trim(), description: catDescInput.trim() });
      }
      setCategoryModal({ open: false });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  // Skill Modal Handlers
  const handleOpenSkillModal = (categoryId: string, skill?: AdminSkill) => {
    setErrorMsg(null);
    setSkillCatIdInput(categoryId);
    if (skill) {
      setSkillNameInput(skill.name);
      setSkillDescInput(skill.description || '');
      setSkillModal({ open: true, skill, categoryId });
    } else {
      setSkillNameInput('');
      setSkillDescInput('');
      setSkillModal({ open: true, skill: null, categoryId });
    }
  };

  const handleSkillFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!skillNameInput.trim()) {
      setErrorMsg('Skill Name is required.');
      return;
    }

    try {
      if (skillModal.skill) {
        await onUpdateSkill(skillModal.skill.id, {
          categoryId: skillCatIdInput,
          name: skillNameInput.trim(),
          description: skillDescInput.trim()
        });
      } else {
        await onCreateSkill({
          categoryId: skillCatIdInput,
          name: skillNameInput.trim(),
          description: skillDescInput.trim()
        });
      }
      setSkillModal({ open: false });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save skill');
    }
  };

  // Reordering Handlers
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    try {
      await onReorderCategories(updated.map(c => c.id));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reorder categories');
    }
  };

  const handleMoveSkill = async (category: AdminSkillCategory, index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= category.skills.length) return;

    const updatedSkills = [...category.skills];
    const temp = updatedSkills[index];
    updatedSkills[index] = updatedSkills[newIdx];
    updatedSkills[newIdx] = temp;

    try {
      await onReorderSkills(category.id, updatedSkills.map(s => s.id));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reorder skills');
    }
  };

  const handleConfirmDeleteCategory = async (force = false) => {
    if (!deleteConfirmCategory) return;
    try {
      await onDeleteCategory(deleteConfirmCategory.id, force);
      setDeleteConfirmCategory(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-7xl">
      
      {/* Overview Cards & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block">
            TECHNOLOGY ECOSYSTEM CMS
          </span>
          <h2 className="text-xl font-black text-white">Skills Topology Management</h2>
          <p className="text-gray-400 text-[11px]">
            Organize resume technologies into relational categories. Controls both category & skill visibility on public timeline.
          </p>
        </div>

        {/* Dynamic Metric Badges & Action */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-2xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Layers className="w-4 h-4 text-accentCyan" />
            <div>
              <span className="text-[9px] text-gray-400 uppercase block">Categories</span>
              <span className="text-sm font-bold text-white">{totalCategories}</span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-400 uppercase block">Enabled Skills</span>
              <span className="text-sm font-bold text-emerald-400">{totalEnabledSkills}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCategoryModal()}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Add Category</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category Modal */}
      {categoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-borderGlass pb-3">
              <h3 className="text-base font-bold text-white">
                {categoryModal.category ? 'Edit Skill Category' : 'Create New Skill Category'}
              </h3>
              <button type="button" onClick={() => setCategoryModal({ open: false })} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCategoryFormSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  placeholder="e.g. Cloud & DevOps"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold focus:border-accentBlue focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={catDescInput}
                  onChange={(e) => setCatDescInput(e.target.value)}
                  placeholder="AWS & GCP infrastructure, containerization..."
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ open: false })}
                  className="px-4 py-2 rounded-xl bg-bgVoid text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : categoryModal.category ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Modal */}
      {skillModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-borderGlass pb-3">
              <h3 className="text-base font-bold text-white">
                {skillModal.skill ? 'Edit Technology Skill' : 'Add Skill to Category'}
              </h3>
              <button type="button" onClick={() => setSkillModal({ open: false })} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSkillFormSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Target Category *</label>
                <select
                  value={skillCatIdInput}
                  onChange={(e) => setSkillCatIdInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-bold focus:border-accentBlue focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={skillNameInput}
                  onChange={(e) => setSkillNameInput(e.target.value)}
                  placeholder="e.g. TypeScript"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold focus:border-accentBlue focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={skillDescInput}
                  onChange={(e) => setSkillDescInput(e.target.value)}
                  placeholder="Strict static typing & interfaces"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSkillModal({ open: false })}
                  className="px-4 py-2 rounded-xl bg-bgVoid text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : skillModal.skill ? 'Save Skill' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Skill Category?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete category <span className="font-bold text-white">{deleteConfirmCategory.name}</span>?
            </p>
            {deleteConfirmCategory.skills && deleteConfirmCategory.skills.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] text-left">
                ⚠️ Warning: This category contains <span className="font-bold">{deleteConfirmCategory.skills.length} skills</span> ({deleteConfirmCategory.skills.map(s => s.name).join(', ')}).
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCategory(null)}
                className="px-4 py-2 rounded-xl bg-bgVoid text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteCategory(true)}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 cursor-pointer"
              >
                Confirm Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Category & Skills Accordion List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="p-12 rounded-3xl bg-bgCard border border-borderGlass text-center text-gray-400">
            <p className="font-bold text-white text-sm">No skill categories configured</p>
            <p className="text-xs">Click "+ Add Category" above to seed your first skill group.</p>
          </div>
        ) : (
          categories.map((cat, cIdx) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4 transition-all"
            >
              {/* Category Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderGlass/60 pb-4">
                
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    cat.enabled ? 'bg-accentBlue/10 border-accentBlue/30 text-accentCyan' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-white">{cat.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-bgVoid border border-borderGlass text-gray-400">
                        {cat.skills ? cat.skills.length : 0} skills
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-gray-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>

                {/* Category Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  
                  {/* Category Status */}
                  <button
                    type="button"
                    onClick={() => onToggleCategoryStatus(cat.id, !cat.enabled)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      cat.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {cat.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{cat.enabled ? 'Category Enabled' : 'Category Disabled'}</span>
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={cIdx === 0 || isSaving}
                    onClick={() => handleMoveCategory(cIdx, 'up')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Category Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={cIdx === categories.length - 1 || isSaving}
                    onClick={() => handleMoveCategory(cIdx, 'down')}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move Category Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit Category */}
                  <button
                    type="button"
                    onClick={() => handleOpenCategoryModal(cat)}
                    className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-accentCyan cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Category */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmCategory(cat)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Add Skill Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenSkillModal(cat.id)}
                    className="px-3 py-2 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan hover:bg-accentBlue/20 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>

              {/* Skills Chips Grid */}
              <div className="pt-2">
                {!cat.skills || cat.skills.length === 0 ? (
                  <p className="text-gray-500 text-xs italic py-2">No skills in this category yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cat.skills.map((sk, sIdx) => (
                      <div
                        key={sk.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                          sk.enabled 
                            ? 'bg-bgVoid/80 border-borderGlass text-white' 
                            : 'bg-rose-500/5 border-rose-500/20 text-rose-300 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${sk.enabled ? 'text-emerald-400' : 'text-rose-400'}`} />
                          <div className="truncate">
                            <span className="font-bold text-xs truncate block">{sk.name}</span>
                            {sk.description && (
                              <span className="text-[10px] text-gray-400 truncate block">{sk.description}</span>
                            )}
                          </div>
                        </div>

                        {/* Skill Micro Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Enable/Disable */}
                          <button
                            type="button"
                            onClick={() => onToggleSkillStatus(sk.id, !sk.enabled)}
                            className="p-1 rounded-lg text-gray-400 hover:text-white"
                            title={sk.enabled ? 'Disable Skill' : 'Enable Skill'}
                          >
                            {sk.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                          </button>

                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => handleMoveSkill(cat, sIdx, 'up')}
                            className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={sIdx === cat.skills.length - 1}
                            onClick={() => handleMoveSkill(cat, sIdx, 'down')}
                            className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Skill */}
                          <button
                            type="button"
                            onClick={() => handleOpenSkillModal(cat.id, sk)}
                            className="p-1 rounded-lg text-gray-400 hover:text-accentCyan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Skill */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmSkill(sk)}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                            title="Delete Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Delete Skill Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmSkill}
        itemTitle={deleteConfirmSkill?.name || 'Skill'}
        onConfirm={async () => {
          if (!deleteConfirmSkill) return;
          await onDeleteSkill(deleteConfirmSkill.id);
          setDeleteConfirmSkill(null);
        }}
        onCancel={() => setDeleteConfirmSkill(null)}
      />

    </div>
  );
};
