import { useState } from 'react';
import { Save } from 'lucide-react';
import { DataTable, type ColumnDef } from '../ui/DataTable';
import { ConfirmDeleteModal } from '../ui/StateFeedback';

export interface BaseCMSItem {
  id: string;
  order?: number;
  enabled?: boolean;
  status?: string;
}

interface GenericListModuleProps<T extends BaseCMSItem> {
  moduleTitle: string;
  items: T[];
  columns: ColumnDef<T>[];
  onSave: (updated: T[]) => void;
  createDefaultItem: () => T;
  isSaving?: boolean;
  getItemTitle?: (item: T) => string;
}

export function GenericListModule<T extends BaseCMSItem>({
  moduleTitle,
  items,
  columns,
  onSave,
  createDefaultItem,
  isSaving,
  getItemTitle
}: GenericListModuleProps<T>) {
  const [list, setList] = useState<T[]>([...items]);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  const handleToggleEnabled = (target: T) => {
    const updated = list.map(item => item.id === target.id ? { ...item, enabled: item.enabled === false } : item);
    setList(updated);
    onSave(updated);
  };

  const handleReorderUp = (target: T) => {
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

  const handleReorderDown = (target: T) => {
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

  const handleAddNew = () => {
    const newItem = createDefaultItem();
    const updated = [newItem, ...list];
    setList(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      <DataTable
        title={moduleTitle}
        items={list}
        columns={columns}
        onDelete={(item) => setDeletingItem(item)}
        onToggleEnabled={handleToggleEnabled}
        onReorderUp={handleReorderUp}
        onReorderDown={handleReorderDown}
        onAddNew={handleAddNew}
        searchPlaceholder={`Search ${moduleTitle}...`}
      />

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => onSave(list)}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo transition-colors cursor-pointer flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : `Save ${moduleTitle}`}</span>
        </button>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        itemTitle={deletingItem ? (getItemTitle ? getItemTitle(deletingItem) : deletingItem.id) : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}
