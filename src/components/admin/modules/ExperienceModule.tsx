import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { ExperienceItem } from '../../../types/portfolio';
import { DataTable, type ColumnDef } from '../ui/DataTable';
import { ConfirmDeleteModal } from '../ui/StateFeedback';
import { FormField } from '../ui/FormField';

interface ExperienceModuleProps {
  items: ExperienceItem[];
  onSave: (updatedItems: ExperienceItem[]) => void;
  isSaving?: boolean;
}

export const ExperienceModule: React.FC<ExperienceModuleProps> = ({ items, onSave, isSaving }) => {
  const [list, setList] = useState<ExperienceItem[]>([...items]);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ExperienceItem | null>(null);

  const columns: ColumnDef<ExperienceItem>[] = [
    {
      header: 'Company / Role',
      accessor: (item) => (
        <div>
          <span className="font-bold text-white block">{item.company}</span>
          <span className="text-accentCyan text-[11px]">{item.role}</span>
        </div>
      )
    },
    {
      header: 'Period',
      accessor: (item) => <span className="text-gray-400">{item.period}</span>
    },
    {
      header: 'Type',
      accessor: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] ${
          item.isBreak ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-bgVoid text-gray-300'
        }`}>
          {item.isBreak ? 'Career Break' : 'Production Role'}
        </span>
      )
    }
  ];

  const handleToggleEnabled = (target: ExperienceItem) => {
    const updated = list.map(item => item.id === target.id ? { ...item, enabled: item.enabled === false } : item);
    setList(updated);
    onSave(updated);
  };

  const handleReorderUp = (target: ExperienceItem) => {
    const idx = list.findIndex(i => i.id === target.id);
    if (idx > 0) {
      const copy = [...list];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      const reordered = copy.map((item, index) => ({ ...item, order: index + 1 }));
      setList(reordered);
      onSave(reordered);
    }
  };

  const handleReorderDown = (target: ExperienceItem) => {
    const idx = list.findIndex(i => i.id === target.id);
    if (idx < list.length - 1) {
      const copy = [...list];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      const reordered = copy.map((item, index) => ({ ...item, order: index + 1 }));
      setList(reordered);
      onSave(reordered);
    }
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    const updated = list.filter(item => item.id !== deletingItem.id);
    setList(updated);
    onSave(updated);
    setDeletingItem(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const exists = list.some(i => i.id === editingItem.id);
    let updated: ExperienceItem[];

    if (exists) {
      updated = list.map(i => i.id === editingItem.id ? editingItem : i);
    } else {
      updated = [editingItem, ...list];
    }

    setList(updated);
    onSave(updated);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem({
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Software Engineer',
      location: 'Ahmedabad, India',
      period: '2026 – Present',
      startDate: '2026',
      endDate: 'Present',
      summary: 'Architected scalable services.',
      highlights: ['Delivered features'],
      technologies: ['Node.js', 'React.js'],
      order: list.length + 1,
      enabled: true,
      status: 'published'
    });
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      
      <DataTable
        title="Career Experience & Transition Roles"
        items={list}
        columns={columns}
        onEdit={(item) => setEditingItem({ ...item })}
        onDelete={(item) => setDeletingItem(item)}
        onToggleEnabled={handleToggleEnabled}
        onReorderUp={handleReorderUp}
        onReorderDown={handleReorderDown}
        onAddNew={handleAddNew}
        searchPlaceholder="Search roles or companies..."
      />

      {/* EDIT / CREATE FORM DRAWER / MODAL */}
      {editingItem && (
        <form onSubmit={handleSaveForm} className="p-8 rounded-3xl bg-bgCard border border-accentBlue/40 space-y-5 shadow-2xl">
          <h4 className="text-base font-bold text-white border-b border-borderGlass pb-3">
            {list.some(i => i.id === editingItem.id) ? `Edit Role: ${editingItem.company}` : 'Create New Experience Role'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company Name" required>
              <input
                type="text"
                required
                value={editingItem.company}
                onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Role Title" required>
              <input
                type="text"
                required
                value={editingItem.role}
                onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Period" required>
              <input
                type="text"
                required
                value={editingItem.period}
                onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Location" required>
              <input
                type="text"
                required
                value={editingItem.location}
                onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>
          </div>

          <FormField label="Summary Narrative" required>
            <textarea
              rows={3}
              required
              value={editingItem.summary}
              onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white resize-none"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderGlass">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-5 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Role'}</span>
            </button>
          </div>
        </form>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        itemTitle={deletingItem?.company || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />

    </div>
  );
};
