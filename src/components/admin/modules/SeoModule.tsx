import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Share2, 
  Twitter, 
  Save, 
  AlertCircle,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import type { SeoSettings, MediaItem } from '../../../types/portfolio';
import { FormField } from '../ui/FormField';

interface SeoModuleProps {
  data: SeoSettings;
  mediaList?: MediaItem[];
  onSave: (payload: SeoSettings) => Promise<void>;
  isSaving: boolean;
}

export const SeoModule: React.FC<SeoModuleProps> = ({
  data: initialData,
  mediaList = [],
  onSave,
  isSaving
}) => {
  const [formData, setFormData] = useState<SeoSettings>({
    title: initialData?.title || 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
    description: initialData?.description || 'Senior Software Engineer & Lead Engineer with 8+ years of experience architecting and scaling production web applications across MERN & MEAN full stack environments.',
    keywords: initialData?.keywords || '',
    canonicalUrl: initialData?.canonicalUrl || '',
    robotsIndex: initialData?.robotsIndex !== undefined ? initialData.robotsIndex : true,
    robotsFollow: initialData?.robotsFollow !== undefined ? initialData.robotsFollow : true,
    ogTitle: initialData?.ogTitle || '',
    ogDescription: initialData?.ogDescription || '',
    ogImageId: initialData?.ogImageId || '',
    twitterCard: initialData?.twitterCard || 'summary_large_image',
    twitterTitle: initialData?.twitterTitle || '',
    twitterDescription: initialData?.twitterDescription || '',
    twitterImageId: initialData?.twitterImageId || '',
    faviconMediaId: initialData?.faviconMediaId || '',
    structuredDataEnabled: initialData?.structuredDataEnabled !== undefined ? initialData.structuredDataEnabled : true,
    structuredDataJson: initialData?.structuredDataJson || ''
  });

  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);

  const handleJsonChange = (rawJson: string) => {
    setFormData(prev => ({ ...prev, structuredDataJson: rawJson }));
    if (!rawJson || rawJson.trim() === '') {
      setJsonValidationError(null);
      return;
    }
    try {
      JSON.parse(rawJson);
      setJsonValidationError(null);
    } catch (err) {
      setJsonValidationError(err instanceof Error ? err.message : 'Invalid JSON syntax');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.structuredDataEnabled && formData.structuredDataJson && formData.structuredDataJson.trim() !== '') {
      try {
        JSON.parse(formData.structuredDataJson);
      } catch {
        setJsonValidationError('Cannot save: Structured Data contains malformed JSON syntax.');
        return;
      }
    }

    await onSave(formData);
  };

  return (
    <div className="space-y-8 font-mono text-xs max-w-5xl">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accentCyan text-[10px] uppercase font-bold tracking-widest mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>GLOBAL METADATA ENGINE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">SEO & Social Graph Management</h2>
          <p className="text-gray-400 text-xs mt-1">
            Manage search engine indexing, Open Graph previews, Twitter Cards, and JSON-LD structured data.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || Boolean(jsonValidationError)}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Persisting...' : 'Save SEO Configuration'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. General Meta Tags */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-borderGlass pb-4">
            <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Page Metadata & Tags</h3>
              <p className="text-[11px] text-gray-400">Primary search engine listing parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            <FormField label="Page Title (<title>)" required hint="Derive from official name and title">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>

            <FormField label="Meta Description" required hint="Concise summary for search engine snippets">
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Senior Software Engineer & Lead Engineer with 8+ years of experience..."
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue resize-none"
              />
            </FormField>

            <FormField label="Meta Keywords (Comma separated)">
              <input
                type="text"
                value={formData.keywords || ''}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Senior Software Engineer, Technical Lead, Full Stack Developer, React, Node.js"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>
          </div>
        </div>

        {/* 2. Canonical URL & Indexing Directives */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-borderGlass pb-4">
            <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Canonical & Crawling Directives</h3>
              <p className="text-[11px] text-gray-400">Control search crawler access and canonical domain</p>
            </div>
          </div>

          <div className="space-y-4">
            <FormField 
              label="Canonical URL" 
              hint="Leave blank if production domain is not yet configured. Do NOT invent a fake domain."
            >
              <input
                type="url"
                value={formData.canonicalUrl || ''}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                placeholder="https://your-domain.com"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <label className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between cursor-pointer hover:border-accentBlue/40 transition-all">
                <div>
                  <span className="font-bold text-white block text-xs">Allow Search Indexing</span>
                  <span className="text-[10px] text-gray-400">Emits 'index' in robots meta tag</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.robotsIndex}
                  onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.checked })}
                  className="w-5 h-5 accent-accentBlue cursor-pointer"
                />
              </label>

              <label className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between cursor-pointer hover:border-accentBlue/40 transition-all">
                <div>
                  <span className="font-bold text-white block text-xs">Allow Link Following</span>
                  <span className="text-[10px] text-gray-400">Emits 'follow' in robots meta tag</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.robotsFollow}
                  onChange={(e) => setFormData({ ...formData, robotsFollow: e.target.checked })}
                  className="w-5 h-5 accent-accentBlue cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 3. Open Graph Metadata */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-borderGlass pb-4">
            <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Open Graph Protocol (Facebook, LinkedIn, Slack)</h3>
              <p className="text-[11px] text-gray-400">Rich preview cards when shared on social platforms</p>
            </div>
          </div>

          <div className="space-y-4">
            <FormField label="OG Title (og:title)" hint="Defaults to main Page Title if left empty">
              <input
                type="text"
                value={formData.ogTitle || ''}
                onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                placeholder="ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>

            <FormField label="OG Description (og:description)" hint="Defaults to main Meta Description if left empty">
              <textarea
                rows={2}
                value={formData.ogDescription || ''}
                onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                placeholder="Senior Software Engineer & Lead Engineer specializing in full stack MERN & MEAN applications..."
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue resize-none"
              />
            </FormField>

            <FormField label="OG Image Asset (og:image)" hint="Select from Media Reference Library or leave blank">
              <div className="flex items-center gap-3">
                {mediaList.length > 0 ? (
                  <select
                    value={formData.ogImageId || ''}
                    onChange={(e) => setFormData({ ...formData, ogImageId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                  >
                    <option value="">No Custom OG Image (Use default asset)</option>
                    {mediaList.map(m => (
                      <option key={m.id} value={m.id}>{m.title} ({m.url})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.ogImageId || ''}
                    onChange={(e) => setFormData({ ...formData, ogImageId: e.target.value })}
                    placeholder="/ashish-photo.jpg or asset path"
                    className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                  />
                )}
              </div>
            </FormField>
          </div>
        </div>

        {/* 4. Twitter / X Cards */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-borderGlass pb-4">
            <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
              <Twitter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Twitter / X Cards</h3>
              <p className="text-[11px] text-gray-400">Card formatting for Twitter / X sharing</p>
            </div>
          </div>

          <div className="space-y-4">
            <FormField label="Twitter Card Format (twitter:card)">
              <select
                value={formData.twitterCard}
                onChange={(e) => setFormData({ ...formData, twitterCard: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              >
                <option value="summary_large_image">summary_large_image (Large Image Card)</option>
                <option value="summary">summary (Standard Compact Card)</option>
                <option value="app">app (App Download Card)</option>
                <option value="player">player (Media Player Card)</option>
              </select>
            </FormField>

            <FormField label="Twitter Title (twitter:title)" hint="Defaults to OG Title or Page Title if empty">
              <input
                type="text"
                value={formData.twitterTitle || ''}
                onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
                placeholder="ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            </FormField>

            <FormField label="Twitter Description (twitter:description)">
              <textarea
                rows={2}
                value={formData.twitterDescription || ''}
                onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
                placeholder="Senior Software Engineer & Lead Engineer with 8+ years experience..."
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue resize-none"
              />
            </FormField>

            <FormField label="Twitter Image Asset (twitter:image)">
              {mediaList.length > 0 ? (
                <select
                  value={formData.twitterImageId || ''}
                  onChange={(e) => setFormData({ ...formData, twitterImageId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                >
                  <option value="">Same as OG Image / Default asset</option>
                  {mediaList.map(m => (
                    <option key={m.id} value={m.id}>{m.title} ({m.url})</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.twitterImageId || ''}
                  onChange={(e) => setFormData({ ...formData, twitterImageId: e.target.value })}
                  placeholder="/ashish-photo.jpg or asset path"
                  className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                />
              )}
            </FormField>
          </div>
        </div>

        {/* 5. Favicon Asset */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-borderGlass pb-4">
            <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Browser Favicon Asset</h3>
              <p className="text-[11px] text-gray-400">Browser tab icon asset reference</p>
            </div>
          </div>

          <FormField label="Favicon Asset Reference" hint="Select from Media Reference Library or leave blank to preserve browser default">
            {mediaList.length > 0 ? (
              <select
                value={formData.faviconMediaId || ''}
                onChange={(e) => setFormData({ ...formData, faviconMediaId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              >
                <option value="">Browser Default Favicon</option>
                {mediaList.map(m => (
                  <option key={m.id} value={m.id}>{m.title} ({m.url})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.faviconMediaId || ''}
                onChange={(e) => setFormData({ ...formData, faviconMediaId: e.target.value })}
                placeholder="/favicon.ico or asset path"
                className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
              />
            )}
          </FormField>
        </div>

        {/* 6. Structured Data / JSON-LD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-borderGlass pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Structured Data (JSON-LD)</h3>
                <p className="text-[11px] text-gray-400">Schema.org Person / Profile rich snippet metadata</p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-xs font-bold text-gray-300">Enable JSON-LD</span>
              <input
                type="checkbox"
                checked={formData.structuredDataEnabled}
                onChange={(e) => setFormData({ ...formData, structuredDataEnabled: e.target.checked })}
                className="w-5 h-5 accent-accentBlue cursor-pointer"
              />
            </label>
          </div>

          {formData.structuredDataEnabled && (
            <div className="space-y-4">
              {jsonValidationError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{jsonValidationError}</span>
                </div>
              )}

              <FormField 
                label="Schema.org JSON-LD Script Content" 
                hint="Must contain valid, well-formed JSON object. Will be safely injected inside <script type='application/ld+json'>"
              >
                <textarea
                  rows={10}
                  value={formData.structuredDataJson || ''}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Person",\n  "name": "Ashishkumar Dudhat"\n}`}
                  className="w-full p-4 rounded-xl bg-bgVoid border border-borderGlass font-mono text-xs text-accentCyan focus:outline-none focus:border-accentBlue"
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-borderGlass">
          <button
            type="submit"
            disabled={isSaving || Boolean(jsonValidationError)}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Persisting Changes...' : 'Save SEO Configuration'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
