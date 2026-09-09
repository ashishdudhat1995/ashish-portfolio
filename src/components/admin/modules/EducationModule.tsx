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
  GraduationCap,
  Calendar,
  MapPin,
  AlertCircle,
  X
} from 'lucide-react';
import { FormField } from '../ui/FormField';

export interface AdminEducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  period?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  order: number;
  enabled: boolean;
}

interface EducationModuleProps {
  items: AdminEducationItem[];
  totalRecords: number;
  enabledRecords: number;
  onCreate: (data: Partial<AdminEducationItem>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AdminEducationItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export const EducationModule: React.FC<EducationModuleProps> = ({
  items,
  totalRecords,
  enabledRecords,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  onReorder,
  isSaving
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminEducationItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminEducationItem | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form fields
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);

  const filteredItems = items.filter(e =>
    e.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setDegree('');
    setInstitution('');
    setLocation('Gujarat, India');
    setStartDate('2013-06');
    setEndDate('2017-07');
    setIsCurrent(false);
    setDescription('Comprehensive 4-year degree in Information Technology.');
    setEnabled(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminEducationItem) => {
    setEditingItem(item);
    setDegree(item.degree);
    setInstitution(item.institution);
    setLocation(item.location || 'Gujarat, India');
    setStartDate(item.startDate || '2013-06');
    setEndDate(item.endDate || '');
    setIsCurrent(Boolean(item.isCurrent));
    setDescription(item.description || '');
    setEnabled(item.enabled);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!degree.trim()) {
      setModalError('Degree / Program title is required.');
      return;
    }
    if (!institution.trim()) {
      setModalError('Institution name is required.');
      return;
    }
    if (!startDate.trim()) {
      setModalError('Start Date is required.');
      return;
    }
    if (!isCurrent && !endDate.trim()) {
      setModalError('End Date is required when program is completed.');
      return;
    }
    if (startDate && endDate && !isCurrent && startDate > endDate) {
      setModalError('Start Date cannot be after End Date.');
      return;
    }

    const payload: Partial<AdminEducationItem> = {
      degree: degree.trim(),
      institution: institution.trim(),
      location: location.trim(),
      startDate: startDate.trim(),
      endDate: isCurrent ? null : endDate.trim(),
      isCurrent,
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
      setModalError(err instanceof Error ? err.message : 'Failed to save education record');
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

  const formatPeriod = (item: AdminEducationItem) => {
    if (item.period) return item.period;
    if (item.isCurrent) return `${item.startDate} – Present`;
    return `${item.startDate} – ${item.endDate || 'N/A'}`;
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl">
      
      {/* Header & Overview Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            ACADEMIC CREDENTIALS CMS
          </span>
          <h2 className="text-xl font-black text-white">Education Milestones</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accentCyan" />
            <div>
              <span className="text-[9px] text-gray-400 block">Total</span>
              <span className="text-xs font-bold text-white">{totalRecords}</span>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[9px] text-gray-400 block">Enabled</span>
              <span className="text-xs font-bold text-emerald-400">{enabledRecords}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search education..."
              className="pl-9 pr-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue w-48"
            />
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Education</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bgVoid/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl space-y-4 font-mono text-xs text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Education Record?</h3>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmItem.degree}</span>?
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
          <div className="max-w-xl w-full p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-borderGlass pb-3">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Education Record' : 'Add New Education Milestone'}
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
              <FormField label="Degree / Program Title" required>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="Bachelor of Engineering – Information Technology (BE-IT)"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                />
              </FormField>

              <FormField label="Institution / University" required>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Saffrony Institute of Technology, Gujarat"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Location">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Gujarat, India"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                  />
                </FormField>

                <FormField label="Start Date (YYYY-MM)" required>
                  <input
                    type="text"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="2013-06"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-bold"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="End Date (YYYY-MM)">
                  <input
                    type="text"
                    disabled={isCurrent}
                    value={isCurrent ? 'Present' : endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="2017-07"
                    className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white disabled:opacity-50"
                  />
                </FormField>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCurrent}
                      onChange={(e) => setIsCurrent(e.target.checked)}
                      className="w-4 h-4 rounded text-accentBlue"
                    />
                    <span className="text-white font-bold">Currently Enrolled</span>
                  </label>
                </div>
              </div>

              <FormField label="Description / Context (Optional)">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Focus on Information Technology and Software Engineering..."
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
                    {isSaving ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education List */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <GraduationCap className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm font-bold text-white">No education records found</p>
            <p className="text-xs">Click "+ Add Education" to create your first entry.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderGlass">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bgVoid/40 px-3 rounded-2xl transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl border border-accentBlue/30 bg-accentBlue/10 text-accentCyan flex-shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white">{item.degree}</h3>
                    <p className="text-xs font-bold text-accentCyan">{item.institution}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-accentCyan" />
                        <span>{formatPeriod(item)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{item.location}</span>
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-gray-400 font-sans line-clamp-2 max-w-xl pt-1">
                        {item.description}
                      </p>
                    )}
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
