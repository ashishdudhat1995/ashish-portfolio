import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { FormField } from '../ui/FormField';

interface HeroData {
  id?: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaTarget: string;
  secondaryCtaLabel: string;
  secondaryCtaTarget: string;
  enabled: boolean;
}

interface HeroModuleProps {
  data: HeroData;
  onSave: (data: HeroData) => Promise<void>;
  isSaving: boolean;
}

export const HeroModule: React.FC<HeroModuleProps> = ({ data: initialData, onSave, isSaving }) => {
  const [formData, setFormData] = useState<HeroData>(initialData);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof HeroData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.headline || formData.headline.trim() === '') {
      setValidationError('Headline is required');
      return;
    }
    if (!formData.description || formData.description.trim() === '') {
      setValidationError('Description is required');
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save hero content');
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 max-w-4xl font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between border-b border-borderGlass pb-4">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            HERO DYNAMIC CONTENT
          </span>
          <h3 className="text-xl font-bold text-white">Edit Hero Section</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Hero Visibility:</span>
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
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <FormField label="Eyebrow Badge">
            <input
              type="text"
              value={formData.eyebrow}
              onChange={(e) => handleChange('eyebrow', e.target.value)}
              placeholder="Senior Software Engineer & Lead Engineer"
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none"
            />
          </FormField>

          <FormField label="Headline (Name / Title)" required>
            <input
              type="text"
              required
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="ASHISHKUMAR DUDHAT"
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none font-bold"
            />
          </FormField>

        </div>

        <FormField label="Subheadline / Role Focus">
          <input
            type="text"
            value={formData.subheadline}
            onChange={(e) => handleChange('subheadline', e.target.value)}
            placeholder="Full Stack & Technical Leadership"
            className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none"
          />
        </FormField>

        <FormField label="Hero Description Narrative" required>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Building scalable, high-performance web applications & microservices across Fintech, Healthcare, and SaaS domains."
            className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none resize-none font-sans"
          />
        </FormField>

        {/* CTA Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-borderGlass/60">
          
          <div className="space-y-4 p-4 rounded-2xl bg-bgVoid border border-borderGlass">
            <span className="text-[10px] text-accentCyan font-bold uppercase block">PRIMARY CTA BUTTON</span>
            
            <FormField label="Label">
              <input
                type="text"
                value={formData.primaryCtaLabel}
                onChange={(e) => handleChange('primaryCtaLabel', e.target.value)}
                placeholder="Explore Projects"
                className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Target Anchor">
              <input
                type="text"
                value={formData.primaryCtaTarget}
                onChange={(e) => handleChange('primaryCtaTarget', e.target.value)}
                placeholder="#projects"
                className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white font-mono"
              />
            </FormField>
          </div>

          <div className="space-y-4 p-4 rounded-2xl bg-bgVoid border border-borderGlass">
            <span className="text-[10px] text-indigo-400 font-bold uppercase block">SECONDARY CTA BUTTON</span>
            
            <FormField label="Label">
              <input
                type="text"
                value={formData.secondaryCtaLabel}
                onChange={(e) => handleChange('secondaryCtaLabel', e.target.value)}
                placeholder="Initiate Contact"
                className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Target Anchor">
              <input
                type="text"
                value={formData.secondaryCtaTarget}
                onChange={(e) => handleChange('secondaryCtaTarget', e.target.value)}
                placeholder="#contact"
                className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white font-mono"
              />
            </FormField>
          </div>

        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold hover:shadow-glow-blue transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Persisting to PostgreSQL...' : 'Save Hero Section'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
