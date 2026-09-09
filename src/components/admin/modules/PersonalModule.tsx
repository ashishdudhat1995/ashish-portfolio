import React, { useState, useEffect } from 'react';
import { Save, Upload, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { FormField } from '../ui/FormField';
import { MediaPicker } from '../ui/MediaPicker';
import type { MediaAsset } from '../../../types/portfolio';

interface PersonalData {
  id?: string;
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  profileImageId?: string;
  enabled: boolean;
}

interface PersonalModuleProps {
  data: PersonalData;
  onSave: (data: PersonalData) => Promise<void>;
  isSaving: boolean;
}

const DEFAULT_AVAILABILITY = 'Available to Join Immediately';

const PRESET_AVAILABILITIES = [
  'Available to Join Immediately',
  'Available in 15 Days (Short Notice)',
  'Available in 30 Days (Notice Period)',
  'Available in 60 Days (Notice Period)',
  'Available in 90 Days (Notice Period)',
  'Available for Full-time & Remote Leadership Roles',
  'Currently Employed / Open to Selected Opportunities'
];

export const PersonalModule: React.FC<PersonalModuleProps> = ({ data: initialData, onSave, isSaving }) => {
  const [formData, setFormData] = useState<PersonalData>(() => ({
    ...initialData,
    availability: initialData?.availability || DEFAULT_AVAILABILITY
  }));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    const activeAvail = initialData?.availability || DEFAULT_AVAILABILITY;
    setFormData({
      ...initialData,
      availability: activeAvail
    });
  }, [initialData]);

  const handleChange = (field: keyof PersonalData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError(null);
  };

  const handleSelectMedia = (media: MediaAsset) => {
    const imageUrl = media.url || media.storageKey || (media.filename ? `/uploads/${media.filename}` : '');
    handleChange('profileImageId', imageUrl);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName || formData.fullName.trim() === '') {
      setValidationError('Full Name is required');
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError('A valid Email address is required');
      return;
    }
    if (!formData.professionalTitle || formData.professionalTitle.trim() === '') {
      setValidationError('Professional Title is required');
      return;
    }

    const payload = {
      ...formData,
      availability: formData.availability || DEFAULT_AVAILABILITY
    };

    try {
      await onSave(payload);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save personal information');
    }
  };

  const currentProfileImg = formData.profileImageId || '';

  return (
    <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 max-w-4xl font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between border-b border-borderGlass pb-4">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            SINGLE PRIMARY PROFILE
          </span>
          <h3 className="text-xl font-bold text-white">Edit Personal Information</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Profile Status:</span>
          <button
            type="button"
            onClick={() => handleChange('enabled', !formData.enabled)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
              formData.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {formData.enabled ? '● Enabled' : '● Disabled'}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="ASHISHKUMAR DUDHAT"
            className="w-full px-4 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-mono focus:border-accentBlue focus:outline-none"
            required
          />
        </FormField>

        <FormField label="Professional Title">
          <input
            type="text"
            value={formData.professionalTitle}
            onChange={(e) => handleChange('professionalTitle', e.target.value)}
            placeholder="Senior Software Engineer | Lead Engineer | Full Stack Developer"
            className="w-full px-4 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-mono focus:border-accentBlue focus:outline-none"
            required
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Primary Email">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="dudhatashish1995@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-mono focus:border-accentBlue focus:outline-none"
              required
            />
          </FormField>

          <FormField label="Contact Phone">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 7600908370"
              className="w-full px-4 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-mono focus:border-accentBlue focus:outline-none"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Geographic Location">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ahmedabad, Gujarat"
              className="w-full px-4 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-mono focus:border-accentBlue focus:outline-none"
            />
          </FormField>

          <FormField label="Availability Status">
            <select
              value={formData.availability}
              onChange={(e) => handleChange('availability', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-mono focus:border-accentBlue focus:outline-none"
            >
              {PRESET_AVAILABILITIES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Profile Image Management */}
        <div className="p-4 rounded-2xl bg-bgVoid/80 border border-borderGlass space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accentCyan" />
              <span>Profile Image Management</span>
            </span>
            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan hover:bg-accentBlue/30 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Choose from Media Library</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            {/* Live Profile Image Preview */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-accentCyan/40 bg-bgCard flex-shrink-0 shadow-lg group flex items-center justify-center">
              {currentProfileImg ? (
                <img
                  src={currentProfileImg}
                  alt="Profile Preview"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accentBlue/30 to-accentCyan/20 flex items-center justify-center font-bold text-2xl text-accentCyan">
                  AD
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-white font-bold text-center px-1">Live Preview</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 w-full">
              <FormField label="Profile Image URL / Path">
                <input
                  type="text"
                  value={formData.profileImageId || ''}
                  onChange={(e) => handleChange('profileImageId', e.target.value)}
                  placeholder="Select from Media Library or paste image URL"
                  className="w-full px-4 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-mono focus:border-accentBlue focus:outline-none"
                />
              </FormField>

              {formData.profileImageId && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('profileImageId', '')}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Image / Use Default Avatar View</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold hover:shadow-glow-blue transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Persisting to PostgreSQL...' : 'Save Personal Information'}</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        title="Select or Upload Profile Image"
        filterType="IMAGE"
      />
    </div>
  );
};
