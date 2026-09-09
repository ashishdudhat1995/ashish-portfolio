import React, { useState } from 'react';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle,
  Heart
} from 'lucide-react';
import { FormField } from '../ui/FormField';
import type { ExperienceAdminItem } from './ExperienceListModule';

interface ExperienceFormModuleProps {
  initialData?: ExperienceAdminItem | null;
  onSave: (data: Partial<ExperienceAdminItem>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const ExperienceFormModule: React.FC<ExperienceFormModuleProps> = ({
  initialData,
  onSave,
  onCancel,
  isSaving
}) => {
  const isEditing = Boolean(initialData?.id);

  const [company, setCompany] = useState(initialData?.company || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '2025-07');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [isCurrent, setIsCurrent] = useState(Boolean(initialData?.isCurrent));
  const [location, setLocation] = useState(initialData?.location || 'Ahmedabad, Gujarat, India');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [isBreak, setIsBreak] = useState(Boolean(initialData?.isBreak));
  const [enabled, setEnabled] = useState(initialData?.enabled !== undefined ? initialData.enabled : true);

  // Dynamic Lists
  const [highlights, setHighlights] = useState<Array<{ id: string; text: string; order: number; enabled: boolean }>>(
    initialData?.highlights || [
      { id: 'h1', text: 'Architected microservices handling high concurrency', order: 1, enabled: true }
    ]
  );

  const [metrics, setMetrics] = useState<Array<{ id: string; label: string; value: string; description?: string }>>(
    initialData?.metrics || []
  );

  const [technologiesText, setTechnologiesText] = useState(
    Array.isArray(initialData?.technologies) ? initialData.technologies.join(', ') : ''
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [newBulletText, setNewBulletText] = useState('');
  const [newMetric, setNewMetric] = useState({ label: '', value: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!company || company.trim() === '') {
      setValidationError('Company Name is required.');
      return;
    }
    if (!role || role.trim() === '') {
      setValidationError('Role / Title is required.');
      return;
    }
    if (!startDate || startDate.trim() === '') {
      setValidationError('Start Date is required.');
      return;
    }
    if (!isCurrent && (!endDate || endDate.trim() === '')) {
      setValidationError('End Date is required when not current position.');
      return;
    }
    if (startDate && endDate && !isCurrent && startDate > endDate) {
      setValidationError('Start Date cannot be after End Date.');
      return;
    }

    const techArray = technologiesText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload: Partial<ExperienceAdminItem> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      company,
      role,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent,
      location,
      summary,
      highlights,
      metrics,
      technologies: techArray,
      isBreak,
      enabled
    };

    try {
      await onSave(payload);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save experience record.');
    }
  };

  // Highlights handlers
  const handleAddHighlight = () => {
    if (!newBulletText.trim()) return;
    const newItem = {
      id: `h_${Date.now()}`,
      text: newBulletText.trim(),
      order: highlights.length + 1,
      enabled: true
    };
    setHighlights([...highlights, newItem]);
    setNewBulletText('');
  };

  const handleDeleteHighlight = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  const handleMoveHighlight = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= highlights.length) return;
    const updated = [...highlights];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setHighlights(updated.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  // Metrics handlers
  const handleAddMetric = () => {
    if (!newMetric.label.trim() || !newMetric.value.trim()) return;
    const item = {
      id: `m_${Date.now()}`,
      label: newMetric.label.trim(),
      value: newMetric.value.trim(),
      description: newMetric.description.trim()
    };
    setMetrics([...metrics, item]);
    setNewMetric({ label: '', value: '', description: '' });
  };

  const handleDeleteMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-0.5">
              {isEditing ? 'EDIT EXPERIENCE RECORD' : 'CREATE NEW EXPERIENCE'}
            </span>
            <h2 className="text-xl font-black text-white">
              {isEditing ? `Edit: ${initialData?.role} @ ${initialData?.company}` : 'Add New Career Experience'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Visibility:</span>
          <button
            type="button"
            onClick={() => setEnabled(prev => !prev)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
              enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {enabled ? '● Enabled' : '● Disabled'}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Fields */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3">Company & Role Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Company Name" required>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ThirdRock Techkno LLP"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none font-bold"
              />
            </FormField>

            <FormField label="Role / Title" required>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Lead Engineer / Senior Software Engineer"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none font-bold"
              />
            </FormField>

            <FormField label="Start Date (YYYY-MM)" required>
              <input
                type="text"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="2025-07"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-bold focus:border-accentBlue focus:outline-none"
              />
            </FormField>

            <FormField label="End Date (YYYY-MM)">
              <input
                type="text"
                disabled={isCurrent}
                value={isCurrent ? 'Present' : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="2026-01"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white disabled:opacity-50 focus:border-accentBlue focus:outline-none"
              />
            </FormField>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="w-4 h-4 rounded text-accentBlue focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-white">Current Position (Displays "Present")</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBreak}
                onChange={(e) => setIsBreak(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Career Break / Transition Role</span>
              </span>
            </label>
          </div>

          <FormField label="Location">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ahmedabad, Gujarat, India"
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white"
            />
          </FormField>

          <FormField label="Executive Role Summary">
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Architecting scalable web applications across Fintech, Healthcare, and SaaS domains."
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white resize-none font-sans"
            />
          </FormField>
        </div>

        {/* Dynamic Responsibilities List */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3">
            Key Responsibilities & Bullet Points
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newBulletText}
              onChange={(e) => setNewBulletText(e.target.value)}
              placeholder="Add key engineering responsibility..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              className="px-4 py-2.5 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-1 hover:bg-accentIndigo cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2">
            {highlights.map((h, idx) => (
              <div key={h.id} className="p-3 rounded-xl bg-bgVoid border border-borderGlass flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle2 className="w-4 h-4 text-accentCyan flex-shrink-0" />
                  <span className="text-xs text-gray-200">{h.text}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveHighlight(idx, 'up')}
                    className="p-1.5 rounded-lg bg-bgCard text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === highlights.length - 1}
                    onClick={() => handleMoveHighlight(idx, 'down')}
                    className="p-1.5 rounded-lg bg-bgCard text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHighlight(h.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Achievements & Metrics */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3">
            Quantifiable Achievements & Key Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newMetric.value}
              onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Value (e.g. 40%)"
              className="px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-bold"
            />
            <input
              type="text"
              value={newMetric.label}
              onChange={(e) => setNewMetric(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Label (e.g. API Latency Boost)"
              className="px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newMetric.description}
                onChange={(e) => setNewMetric(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="flex-1 px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300"
              />
              <button
                type="button"
                onClick={handleAddMetric}
                className="px-3 py-2 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-1 hover:bg-accentIndigo cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {metrics.map((m) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center gap-3">
                <div>
                  <span className="font-bold text-accentCyan text-xs">{m.value}</span>
                  <span className="text-xs text-white font-bold ml-1.5">{m.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteMetric(m.id)}
                  className="text-gray-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies Stack */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3">
            Technology Stack Tags
          </h3>

          <FormField label="Technologies (Comma-separated tags)">
            <input
              type="text"
              value={technologiesText}
              onChange={(e) => setTechnologiesText(e.target.value)}
              placeholder="Node.js, React.js, Angular, TypeScript, AWS, Docker"
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white font-mono"
            />
          </FormField>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {technologiesText.split(',').map((t, idx) => {
              const tag = t.trim();
              if (!tag) return null;
              return (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-bgVoid border border-borderGlass text-xs text-accentCyan font-mono">
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-bgCard text-gray-300 hover:text-white font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold hover:shadow-glow-blue transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Persisting to PostgreSQL...' : isEditing ? 'Save Changes' : 'Create Experience Record'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
