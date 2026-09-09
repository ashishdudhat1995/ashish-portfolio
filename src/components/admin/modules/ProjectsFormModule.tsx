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
  Star,
  Link2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { FormField } from '../ui/FormField';
import { MediaPicker } from '../ui/MediaPicker';
import type { AdminProject } from './ProjectsListModule';
import type { MediaAsset } from '../../../types/portfolio';

interface ProjectsFormModuleProps {
  initialData?: AdminProject | null;
  onSave: (data: Partial<AdminProject>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const ProjectsFormModule: React.FC<ProjectsFormModuleProps> = ({
  initialData,
  onSave,
  onCancel,
  isSaving
}) => {
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [domain, setDomain] = useState(initialData?.domain || 'Healthcare & Medical Systems');
  const [category, setCategory] = useState(initialData?.category || 'Healthcare');
  const [startDate, setStartDate] = useState(initialData?.startDate || '2025-07');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [isCurrent, setIsCurrent] = useState(Boolean(initialData?.isCurrent));
  const [description, setDescription] = useState(initialData?.description || '');
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [enabled, setEnabled] = useState(initialData?.enabled !== undefined ? initialData.enabled : true);

  // Dynamic Lists
  const [highlights, setHighlights] = useState<Array<{ id?: string; text: string; order?: number; enabled?: boolean }>>(
    initialData?.highlights || [
      { text: 'Integrated cornerstone DICOM web library to extract and render ultrasound telemetry.' }
    ]
  );

  const [technologiesText, setTechnologiesText] = useState(
    Array.isArray(initialData?.technologies)
      ? initialData.technologies.map(t => typeof t === 'string' ? t : t.name).join(', ')
      : 'React.js, Redux, Node.js, Strapi, MySQL, AWS'
  );

  const [mediaList, setMediaList] = useState<Array<{ id?: string; url: string; alt?: string; type?: string }>>(
    initialData?.media || []
  );

  const [linksList, setLinksList] = useState<Array<{ id?: string; label: string; url: string; type?: string }>>(
    initialData?.links || []
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [newHighlightText, setNewHighlightText] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newLink, setNewLink] = useState({ label: '', url: '', type: 'demo' });
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleSelectProjectMedia = (media: MediaAsset) => {
    const mediaUrl = media.url || media.storageKey || (media.filename ? `/uploads/${media.filename}` : '');
    if (!mediaUrl) return;
    setMediaList(prev => [...prev, { url: mediaUrl, alt: media.altText || name || 'Project Media', type: 'IMAGE' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name || name.trim() === '') {
      setValidationError('Project Title (Name) is required.');
      return;
    }
    if (!subtitle || subtitle.trim() === '') {
      setValidationError('Project Subtitle is required.');
      return;
    }
    if (!description || description.trim() === '') {
      setValidationError('Project Description is required.');
      return;
    }
    if (!startDate || startDate.trim() === '') {
      setValidationError('Start Date is required.');
      return;
    }
    if (!isCurrent && (!endDate || endDate.trim() === '')) {
      setValidationError('End Date is required when project is not ongoing.');
      return;
    }
    if (startDate && endDate && !isCurrent && startDate > endDate) {
      setValidationError('Start Date cannot be after End Date.');
    }

    const techArray = technologiesText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map((t, idx) => ({ name: t, order: idx + 1, enabled: true }));

    const payload: Partial<AdminProject> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: name.trim(),
      subtitle: subtitle.trim(),
      domain: domain.trim(),
      category: category.trim(),
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent,
      description: description.trim(),
      featured,
      enabled,
      highlights: highlights.map((h, idx) => ({ text: h.text, order: idx + 1, enabled: true })),
      technologies: techArray,
      media: mediaList,
      links: linksList
    };

    try {
      await onSave(payload);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save project record.');
    }
  };

  // Highlights handlers
  const handleAddHighlight = () => {
    if (!newHighlightText.trim()) return;
    setHighlights([...highlights, { text: newHighlightText.trim(), order: highlights.length + 1, enabled: true }]);
    setNewHighlightText('');
  };

  const handleDeleteHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const handleMoveHighlight = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= highlights.length) return;
    const updated = [...highlights];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setHighlights(updated);
  };

  // Media handlers
  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) return;
    setMediaList([...mediaList, { url: newMediaUrl.trim(), alt: name, type: 'image' }]);
    setNewMediaUrl('');
  };

  const handleDeleteMedia = (idx: number) => {
    setMediaList(mediaList.filter((_, i) => i !== idx));
  };

  // Links handlers
  const handleAddLink = () => {
    if (!newLink.label.trim() || !newLink.url.trim()) return;
    setLinksList([...linksList, { label: newLink.label.trim(), url: newLink.url.trim(), type: newLink.type }]);
    setNewLink({ label: '', url: '', type: 'demo' });
  };

  const handleDeleteLink = (idx: number) => {
    setLinksList(linksList.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      
      {/* Header */}
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
              {isEditing ? 'EDIT CASE STUDY RECORD' : 'CREATE NEW PRODUCTION PROJECT'}
            </span>
            <h2 className="text-xl font-black text-white">
              {isEditing ? `Edit: ${initialData?.name}` : 'Add New Production Project'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFeatured(prev => !prev)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors flex items-center gap-1 ${
              featured ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-bgVoid border-borderGlass text-gray-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${featured ? 'fill-amber-400' : ''}`} />
            <span>{featured ? '★ Featured' : '☆ Not Featured'}</span>
          </button>

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
        
        {/* Core Information */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3">Project Metadata</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Project Title / Name" required>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ScanOFe – Fetal Diagnosis Platform"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none font-bold"
              />
            </FormField>

            <FormField label="Subtitle / Tagline" required>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Cloud Ultrasound & DICOM Diagnostic Platform"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none"
              />
            </FormField>

            <FormField label="Domain Focus">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Healthcare & Medical Systems"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Category Badge">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Healthcare"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Start Date (YYYY-MM)" required>
              <input
                type="text"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="2025-07"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-bold"
              />
            </FormField>

            <FormField label="End Date (YYYY-MM)">
              <input
                type="text"
                disabled={isCurrent}
                value={isCurrent ? 'Present' : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="2026-01"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white disabled:opacity-50"
              />
            </FormField>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4 rounded text-accentBlue focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-bold text-white">Ongoing Project (Displays "Present")</span>
          </label>

          <FormField label="Full Case Study Description" required>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cloud-based DICOM medical imaging and ultrasound diagnostic platform..."
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white resize-none font-sans"
            />
          </FormField>
        </div>

        {/* Dynamic Highlights List */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3">
            Key Architecture Highlights & Achievements
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newHighlightText}
              onChange={(e) => setNewHighlightText(e.target.value)}
              placeholder="Add key highlight or engineering achievement..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              className="px-4 py-2.5 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-1 hover:bg-accentIndigo cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Highlight</span>
            </button>
          </div>

          <div className="space-y-2">
            {highlights.map((h, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-bgVoid border border-borderGlass flex items-center justify-between gap-3">
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
                    onClick={() => handleDeleteHighlight(idx)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3">
            Technology Stack Tags
          </h3>

          <FormField label="Technologies (Comma-separated)">
            <input
              type="text"
              value={technologiesText}
              onChange={(e) => setTechnologiesText(e.target.value)}
              placeholder="React.js, Redux, Node.js, Strapi, MySQL, AWS"
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

        {/* Optional Media & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Media Section */}
          <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-borderGlass pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accentCyan" />
                <span>Project Media Assets</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan hover:bg-accentBlue/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload / Pick Image</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                placeholder="/assets/projects/scanofe.svg or image URL"
                className="flex-1 px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleAddMedia}
                className="px-3 py-2 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-1 hover:bg-accentIndigo cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mediaList.length === 0 ? (
                <div className="p-4 rounded-xl bg-bgVoid border border-dashed border-borderGlass text-center text-gray-500">
                  No images added yet. Click "Upload / Pick Image" above to add media.
                </div>
              ) : (
                mediaList.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-bgCard border border-borderGlass flex-shrink-0">
                        <img
                          src={m.url}
                          alt={m.alt || 'Project media'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="font-mono text-gray-300 truncate text-xs flex-1">{m.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(idx)}
                      className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg flex-shrink-0 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Links Section */}
          <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-borderGlass pb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>External Links (Optional)</span>
            </h3>

            <div className="space-y-2">
              <input
                type="text"
                value={newLink.label}
                onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Link Label (e.g. Live Demo)"
                className="w-full px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-2 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-1 hover:bg-accentIndigo cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {linksList.map((l, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{l.label}</span>
                    <span className="text-gray-400 font-mono block text-[10px]">{l.url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(idx)}
                    className="text-rose-400 hover:bg-rose-500/20 p-1 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
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
            <span>{isSaving ? 'Persisting to PostgreSQL...' : isEditing ? 'Save Changes' : 'Create Project Record'}</span>
          </button>
        </div>

      </form>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectProjectMedia}
        title="Select or Upload Project Image"
        filterType="IMAGE"
      />
    </div>
  );
};
