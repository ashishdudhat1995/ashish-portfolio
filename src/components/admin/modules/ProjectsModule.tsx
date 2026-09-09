import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { ProjectItem } from '../../../types/portfolio';
import { DataTable, type ColumnDef } from '../ui/DataTable';
import { ConfirmDeleteModal } from '../ui/StateFeedback';
import { FormField } from '../ui/FormField';

interface ProjectsModuleProps {
  items: ProjectItem[];
  onSave: (updatedItems: ProjectItem[]) => void;
  isSaving?: boolean;
}

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({ items, onSave, isSaving }) => {
  const [list, setList] = useState<ProjectItem[]>([...items]);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ProjectItem | null>(null);

  const columns: ColumnDef<ProjectItem>[] = [
    {
      header: 'Project Name',
      accessor: (item) => (
        <div>
          <span className="font-bold text-white block">{item.name}</span>
          <span className="text-accentBlue text-[11px]">{item.subtitle}</span>
        </div>
      )
    },
    {
      header: 'Category / Domain',
      accessor: (item) => (
        <span className="px-2 py-0.5 rounded bg-bgVoid border border-borderGlass text-accentCyan text-[11px]">
          {item.category} • {item.domain}
        </span>
      )
    },
    {
      header: 'Period',
      accessor: (item) => <span className="text-gray-400">{item.period}</span>
    }
  ];

  const handleToggleEnabled = (target: ProjectItem) => {
    const updated = list.map(item => item.id === target.id ? { ...item, enabled: item.enabled === false } : item);
    setList(updated);
    onSave(updated);
  };

  const handleReorderUp = (target: ProjectItem) => {
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

  const handleReorderDown = (target: ProjectItem) => {
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
    let updated: ProjectItem[];

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
      id: `proj-${Date.now()}`,
      name: 'New Case Study',
      subtitle: 'Scalable Platform Architecture',
      domain: 'SaaS',
      category: 'SaaS',
      period: '2025 – Present',
      description: 'Built high-throughput platform.',
      capabilities: ['Feature delivery'],
      technologies: ['React.js', 'Node.js'],
      architecturePoints: ['Microservices'],
      featured: false,
      images: ['/assets/projects/pm-saas.svg'],
      order: list.length + 1,
      enabled: true,
      status: 'published'
    });
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      
      <DataTable
        title="Production Case Studies"
        items={list}
        columns={columns}
        onEdit={(item) => setEditingItem({ ...item })}
        onDelete={(item) => setDeletingItem(item)}
        onToggleEnabled={handleToggleEnabled}
        onReorderUp={handleReorderUp}
        onReorderDown={handleReorderDown}
        onAddNew={handleAddNew}
        searchPlaceholder="Search case studies..."
      />

      {editingItem && (
        <form onSubmit={handleSaveForm} className="p-8 rounded-3xl bg-bgCard border border-accentBlue/40 space-y-5 shadow-2xl">
          <h4 className="text-base font-bold text-white border-b border-borderGlass pb-3">
            {list.some(i => i.id === editingItem.id) ? `Edit Case Study: ${editingItem.name}` : 'Create New Production Case Study'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Project Name" required>
              <input
                type="text"
                required
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Subtitle" required>
              <input
                type="text"
                required
                value={editingItem.subtitle}
                onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>
          </div>

          <FormField label="Description" required>
            <textarea
              rows={3}
              required
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
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
              <span>{isSaving ? 'Saving...' : 'Save Case Study'}</span>
            </button>
          </div>
        </form>
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        itemTitle={deletingItem?.name || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />

    </div>
  );
};
