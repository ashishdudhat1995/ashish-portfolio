import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  AlertTriangle, 
  BarChart3, 
  Globe 
} from 'lucide-react';
import type { SiteSettings } from '../../../types/portfolio';
import { FormField } from '../ui/FormField';

interface SiteSettingsModuleProps {
  data: SiteSettings;
  onSave: (payload: SiteSettings) => Promise<void>;
  isSaving: boolean;
}

export const SiteSettingsModule: React.FC<SiteSettingsModuleProps> = ({
  data: initialData,
  onSave,
  isSaving
}) => {
  const [formData, setFormData] = useState<SiteSettings>({
    siteName: initialData?.siteName || 'Ashishkumar Dudhat Portfolio',
    defaultTitle: initialData?.defaultTitle || 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
    defaultDescription: initialData?.defaultDescription || 'Senior Software Engineer & Lead Engineer specializing in full stack Web Applications, Microservices, and Cloud Architecture.',
    locale: initialData?.locale || 'en-US',
    timezone: initialData?.timezone || 'Asia/Kolkata',
    maintenanceMode: initialData?.maintenanceMode !== undefined ? initialData.maintenanceMode : false,
    analyticsProvider: initialData?.analyticsProvider || '',
    analyticsId: initialData?.analyticsId || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="space-y-8 font-mono text-xs max-w-4xl">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accentCyan text-[10px] uppercase font-bold tracking-widest mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>GLOBAL SYSTEM CONFIGURATION</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Site Settings & Operations</h2>
          <p className="text-gray-400 text-xs mt-1">
            Configure global website name, default metadata fallbacks, maintenance mode, and optional analytics integration.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Persisting...' : 'Save Site Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. General Site Configuration */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-borderGlass pb-4">
            <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">General Parameters</h3>
              <p className="text-[11px] text-gray-400">Website identity and default fallbacks</p>
            </div>
          </div>

          <div className="space-y-4">
            <FormField label="Site Name" required hint="Used in global branding and copyright headers">
              <input
                type="text"
                required
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                placeholder="Ashishkumar Dudhat Portfolio"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>

            <FormField label="Default Title Fallback" required>
              <input
                type="text"
                required
                value={formData.defaultTitle}
                onChange={(e) => setFormData({ ...formData, defaultTitle: e.target.value })}
                placeholder="ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>

            <FormField label="Default Description Fallback" required>
              <textarea
                required
                rows={3}
                value={formData.defaultDescription}
                onChange={(e) => setFormData({ ...formData, defaultDescription: e.target.value })}
                placeholder="Senior Software Engineer & Lead Engineer specializing in full stack Web Applications..."
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue resize-none"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Site Locale">
                <input
                  type="text"
                  value={formData.locale}
                  onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  placeholder="en-US"
                  className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                />
              </FormField>

              <FormField label="Timezone">
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="Asia/Kolkata"
                  className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* 2. Maintenance Mode Controls */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-borderGlass pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Maintenance Mode</h3>
                <p className="text-[11px] text-gray-400">Toggle public availability during system updates</p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-xs font-bold text-gray-300">
                {formData.maintenanceMode ? 'ENABLED (ACTIVE)' : 'DISABLED'}
              </span>
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </label>
          </div>

          {formData.maintenanceMode ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              <p className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Maintenance Mode is Currently Active</span>
              </p>
              <p className="text-gray-300 text-[11px]">
                A non-intrusive maintenance notice is visible on the public portfolio site. Authenticated Administrators retain 100% full access to the CMS dashboard.
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              The public portfolio website is operating normally. Authenticated administrators can toggle Maintenance Mode anytime.
            </p>
          )}
        </div>

        {/* 3. Optional Analytics Integration */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-borderGlass pb-4">
            <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Analytics Integration (Optional)</h3>
              <p className="text-[11px] text-gray-400">Optional analytics provider identifier</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Analytics Provider" hint="e.g. Google Analytics 4, Plausible, PostHog">
              <input
                type="text"
                value={formData.analyticsProvider || ''}
                onChange={(e) => setFormData({ ...formData, analyticsProvider: e.target.value })}
                placeholder="Google Analytics 4"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>

            <FormField label="Analytics Tracking ID" hint="Do NOT invent a fake tracking ID">
              <input
                type="text"
                value={formData.analyticsId || ''}
                onChange={(e) => setFormData({ ...formData, analyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-borderGlass">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Persisting Changes...' : 'Save Site Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
