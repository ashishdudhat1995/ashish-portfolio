import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Layers, 
  CheckCircle2, 
  X,
  CreditCard,
  Activity,
  Cloud,
  Cpu,
  Code2,
  ShieldCheck,
  Zap,
  Database,
  Server,
  Globe,
  Building,
  Briefcase,
  Award
} from 'lucide-react';
import { FormField } from '../ui/FormField';
import { ConfirmDeleteModal } from '../ui/StateFeedback';

export interface AboutHighlightData {
  id: string;
  label: string;
  value: string;
  description?: string | null;
  order: number;
  enabled: boolean;
}

export interface AboutDomainData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  highlights?: string[];
  order?: number;
  enabled?: boolean;
}

export interface AboutPillarData {
  id: string;
  text: string;
  order?: number;
  enabled?: boolean;
}

export interface AboutData {
  id?: string;
  editorialHeading: string;
  introduction: string[] | string;
  enabled: boolean;
  highlights: AboutHighlightData[];
  domains?: AboutDomainData[];
  pillars?: AboutPillarData[];
}

const DEFAULT_DOMAINS: AboutDomainData[] = [
  {
    id: 'domain-1',
    name: 'Fintech & Lending',
    tagline: 'High-Volume Transactions & Compliance',
    description: 'Engineered automated digital loan processing platforms supporting high-concurrency credit evaluation and PCI-compliant Razorpay payment gateway integrations.',
    icon: 'CreditCard',
    highlights: [
      'PCI-DSS compliant payment integration',
      'Automated credit scoring workflows',
      'Sub-15 min loan approval pipeline'
    ],
    order: 1,
    enabled: true
  },
  {
    id: 'domain-2',
    name: 'Healthcare & Diagnostics',
    tagline: 'Medical Telemetry & Real-Time Data',
    description: 'Built medical diagnostic platforms integrating DICOM ultrasound file parsing, real-time fetal growth charts, and WebSocket patient record management.',
    icon: 'Activity',
    highlights: [
      'Automated DICOM ultrasound file parsing',
      'Real-time WebSocket telemetry updates',
      'Role-based patient record security'
    ],
    order: 2,
    enabled: true
  },
  {
    id: 'domain-3',
    name: 'SaaS & Cloud Platforms',
    tagline: 'Multi-Tenant Workspaces & Microservices',
    description: 'Architected multi-tenant subscription project management systems with fine-grained Role-Based Access Control (RBAC) and scalable NestJS backend services.',
    icon: 'Cloud',
    highlights: [
      'Granular multi-tenant RBAC engine',
      'Modular NestJS dependency injection',
      'AWS EC2 Docker microservices'
    ],
    order: 3,
    enabled: true
  }
];

const DEFAULT_PILLARS: AboutPillarData[] = [
  { id: 'pillar-1', text: 'Scalable Microservices Architecture', order: 1, enabled: true },
  { id: 'pillar-2', text: 'High-Concurrency Payment Infrastructure', order: 2, enabled: true },
  { id: 'pillar-3', text: 'Agile Team Mentorship', order: 3, enabled: true }
];

const AVAILABLE_ICONS = [
  'CreditCard',
  'Activity',
  'Cloud',
  'Cpu',
  'Code2',
  'ShieldCheck',
  'Zap',
  'Database',
  'Server',
  'Globe',
  'Building',
  'Layers',
  'Briefcase'
];

const renderDomainIcon = (iconName: string) => {
  switch (iconName) {
    case 'CreditCard': return <CreditCard className="w-4 h-4 text-accentCyan" />;
    case 'Activity': return <Activity className="w-4 h-4 text-emerald-400" />;
    case 'Cloud': return <Cloud className="w-4 h-4 text-accentBlue" />;
    case 'Cpu': return <Cpu className="w-4 h-4 text-indigo-400" />;
    case 'Code2': return <Code2 className="w-4 h-4 text-accentCyan" />;
    case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
    case 'Database': return <Database className="w-4 h-4 text-accentCyan" />;
    case 'Server': return <Server className="w-4 h-4 text-accentBlue" />;
    case 'Globe': return <Globe className="w-4 h-4 text-accentCyan" />;
    case 'Building': return <Building className="w-4 h-4 text-indigo-400" />;
    case 'Briefcase': return <Briefcase className="w-4 h-4 text-emerald-400" />;
    default: return <Layers className="w-4 h-4 text-accentBlue" />;
  }
};

interface AboutModuleProps {
  data: AboutData;
  onSaveAbout: (data: Partial<AboutData>) => Promise<void>;
  onAddHighlight: (highlight: Omit<AboutHighlightData, 'id'>) => Promise<void>;
  onUpdateHighlight: (id: string, highlight: Partial<AboutHighlightData>) => Promise<void>;
  onDeleteHighlight: (id: string) => Promise<void>;
  onToggleHighlightStatus: (id: string, enabled: boolean) => Promise<void>;
  onReorderHighlights: (orderedIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export const AboutModule: React.FC<AboutModuleProps> = ({
  data: initialData,
  onSaveAbout,
  onAddHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  onToggleHighlightStatus,
  onReorderHighlights,
  isSaving
}) => {
  const [editorialHeading, setEditorialHeading] = useState(initialData.editorialHeading || '');
  const [introductionText, setIntroductionText] = useState(
    Array.isArray(initialData.introduction)
      ? initialData.introduction.join('\n\n')
      : initialData.introduction || ''
  );
  const [highlights, setHighlights] = useState<AboutHighlightData[]>(initialData.highlights || []);
  const [domains, setDomains] = useState<AboutDomainData[]>(
    Array.isArray(initialData.domains) && initialData.domains.length > 0
      ? initialData.domains
      : DEFAULT_DOMAINS
  );
  const [pillars, setPillars] = useState<AboutPillarData[]>(
    Array.isArray(initialData.pillars) && initialData.pillars.length > 0
      ? initialData.pillars
      : DEFAULT_PILLARS
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Highlight Modal State
  const [editingHighlight, setEditingHighlight] = useState<AboutHighlightData | null>(null);
  const [isAddingHighlight, setIsAddingHighlight] = useState(false);
  const [highlightForm, setHighlightForm] = useState({ label: '', value: '', description: '' });
  const [deleteConfirmHighlight, setDeleteConfirmHighlight] = useState<AboutHighlightData | null>(null);

  // Domain Modal State
  const [editingDomain, setEditingDomain] = useState<AboutDomainData | null>(null);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [domainForm, setDomainForm] = useState({
    name: '',
    tagline: '',
    description: '',
    icon: 'CreditCard',
    highlights: [] as string[],
    enabled: true
  });
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [deleteConfirmDomain, setDeleteConfirmDomain] = useState<AboutDomainData | null>(null);

  // Pillar Modal State
  const [editingPillar, setEditingPillar] = useState<AboutPillarData | null>(null);
  const [isAddingPillar, setIsAddingPillar] = useState(false);
  const [pillarInputText, setPillarInputText] = useState('');
  const [deleteConfirmPillar, setDeleteConfirmPillar] = useState<AboutPillarData | null>(null);

  useEffect(() => {
    setEditorialHeading(initialData.editorialHeading || '');
    setIntroductionText(
      Array.isArray(initialData.introduction)
        ? initialData.introduction.join('\n\n')
        : initialData.introduction || ''
    );
    setHighlights(initialData.highlights || []);
    setDomains(
      Array.isArray(initialData.domains) && initialData.domains.length > 0
        ? initialData.domains
        : DEFAULT_DOMAINS
    );
    setPillars(
      Array.isArray(initialData.pillars) && initialData.pillars.length > 0
        ? initialData.pillars
        : DEFAULT_PILLARS
    );
  }, [initialData]);

  const handleSaveAboutNarrative = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!editorialHeading || editorialHeading.trim() === '') {
      setValidationError('Editorial Heading is required');
      return;
    }

    const paragraphs = introductionText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    try {
      await onSaveAbout({
        editorialHeading,
        introduction: paragraphs
      });
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save about narrative');
    }
  };

  const handleHighlightFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!highlightForm.label || highlightForm.label.trim() === '') {
      setValidationError('Highlight Label is required');
      return;
    }
    if (!highlightForm.value || highlightForm.value.trim() === '') {
      setValidationError('Highlight Value metric is required');
      return;
    }

    try {
      if (editingHighlight) {
        await onUpdateHighlight(editingHighlight.id, {
          label: highlightForm.label,
          value: highlightForm.value,
          description: highlightForm.description
        });
      } else {
        await onAddHighlight({
          label: highlightForm.label,
          value: highlightForm.value,
          description: highlightForm.description,
          order: highlights.length + 1,
          enabled: true
        });
      }
      setIsAddingHighlight(false);
      setEditingHighlight(null);
      setHighlightForm({ label: '', value: '', description: '' });
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save highlight');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= highlights.length) return;

    const updated = [...highlights];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    setHighlights(updated);
    const orderedIds = updated.map(h => h.id);
    await onReorderHighlights(orderedIds);
  };

  // Core Industry Domains Handlers
  const handleDomainFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!domainForm.name.trim()) {
      setValidationError('Domain Name is required.');
      return;
    }
    if (!domainForm.tagline.trim()) {
      setValidationError('Domain Tagline is required.');
      return;
    }

    try {
      let updated: AboutDomainData[];
      if (editingDomain) {
        updated = domains.map(d => 
          d.id === editingDomain.id
            ? {
                ...d,
                name: domainForm.name.trim(),
                tagline: domainForm.tagline.trim(),
                description: domainForm.description.trim(),
                icon: domainForm.icon,
                highlights: domainForm.highlights,
                enabled: domainForm.enabled
              }
            : d
        );
      } else {
        const newDomain: AboutDomainData = {
          id: `domain-${Date.now()}`,
          name: domainForm.name.trim(),
          tagline: domainForm.tagline.trim(),
          description: domainForm.description.trim(),
          icon: domainForm.icon,
          highlights: domainForm.highlights,
          order: domains.length + 1,
          enabled: domainForm.enabled
        };
        updated = [...domains, newDomain];
      }

      setDomains(updated);
      await onSaveAbout({ domains: updated });
      setIsAddingDomain(false);
      setEditingDomain(null);
      setDomainForm({
        name: '',
        tagline: '',
        description: '',
        icon: 'CreditCard',
        highlights: [],
        enabled: true
      });
      setNewHighlightInput('');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save industry domain.');
    }
  };

  const handleToggleDomainStatus = async (domainId: string, enabled: boolean) => {
    const updated = domains.map(d => d.id === domainId ? { ...d, enabled } : d);
    setDomains(updated);
    await onSaveAbout({ domains: updated });
  };

  const handleMoveDomain = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= domains.length) return;

    const updated = [...domains];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    const ordered = updated.map((d, i) => ({ ...d, order: i + 1 }));
    setDomains(ordered);
    await onSaveAbout({ domains: ordered });
  };

  const handleConfirmDeleteDomain = async () => {
    if (!deleteConfirmDomain) return;
    const updated = domains.filter(d => d.id !== deleteConfirmDomain.id);
    setDomains(updated);
    await onSaveAbout({ domains: updated });
    setDeleteConfirmDomain(null);
  };

  const handleAddBulletHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setDomainForm(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlightInput.trim()]
    }));
    setNewHighlightInput('');
  };

  const handleRemoveBulletHighlight = (index: number) => {
    setDomainForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  // Engineering Pillars Handlers
  const handlePillarFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!pillarInputText.trim()) {
      setValidationError('Pillar Badge Text is required.');
      return;
    }

    try {
      let updated: AboutPillarData[];
      if (editingPillar) {
        updated = pillars.map(p => 
          p.id === editingPillar.id
            ? { ...p, text: pillarInputText.trim() }
            : p
        );
      } else {
        const newPillar: AboutPillarData = {
          id: `pillar-${Date.now()}`,
          text: pillarInputText.trim(),
          order: pillars.length + 1,
          enabled: true
        };
        updated = [...pillars, newPillar];
      }

      setPillars(updated);
      await onSaveAbout({ pillars: updated });
      setIsAddingPillar(false);
      setEditingPillar(null);
      setPillarInputText('');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to save engineering pillar.');
    }
  };

  const handleTogglePillarStatus = async (pillarId: string, enabled: boolean) => {
    const updated = pillars.map(p => p.id === pillarId ? { ...p, enabled } : p);
    setPillars(updated);
    await onSaveAbout({ pillars: updated });
  };

  const handleMovePillar = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= pillars.length) return;

    const updated = [...pillars];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    const ordered = updated.map((p, i) => ({ ...p, order: i + 1 }));
    setPillars(ordered);
    await onSaveAbout({ pillars: ordered });
  };

  const handleConfirmDeletePillar = async () => {
    if (!deleteConfirmPillar) return;
    const updated = pillars.filter(p => p.id !== deleteConfirmPillar.id);
    setPillars(updated);
    await onSaveAbout({ pillars: updated });
    setDeleteConfirmPillar(null);
  };

  return (
    <div className="space-y-8 font-mono text-xs max-w-5xl">
      
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 1. EDITORIAL NARRATIVE FORM */}
      <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-borderGlass pb-4">
          <div>
            <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
              ABOUT NARRATIVE & PHILOSOPHY
            </span>
            <h3 className="text-xl font-bold text-white">Editorial Narrative</h3>
          </div>
        </div>

        <form onSubmit={handleSaveAboutNarrative} className="space-y-5">
          <FormField label="Editorial Section Heading" required>
            <input
              type="text"
              required
              value={editorialHeading}
              onChange={(e) => setEditorialHeading(e.target.value)}
              placeholder="Engineering Scalable Digital Products with Architectural Depth & Precision."
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none font-bold"
            />
          </FormField>

          <FormField label="Introduction Narrative Paragraphs (Separate paragraphs with blank lines)" required>
            <textarea
              rows={5}
              required
              value={introductionText}
              onChange={(e) => setIntroductionText(e.target.value)}
              placeholder="Over 8+ years as a Senior Software Engineer..."
              className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:border-accentBlue focus:outline-none resize-none font-sans leading-relaxed"
            />
          </FormField>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold hover:shadow-glow-blue transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Persisting to PostgreSQL...' : 'Save Narrative'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. KEY ENGINEERING PILLARS MANAGER */}
      <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderGlass pb-4">
          <div>
            <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
              HERO PHILOSOPHY & CORE BADGES
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-accentCyan" />
              Engineering Pillars ({pillars.filter(p => p.enabled !== false).length}/{pillars.length} Active)
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingPillar(null);
              setPillarInputText('');
              setIsAddingPillar(true);
            }}
            className="px-4 py-2 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Engineering Pillar</span>
          </button>
        </div>

        {/* Pillar Form */}
        {(isAddingPillar || editingPillar) && (
          <div className="p-6 rounded-2xl bg-bgVoid border border-accentBlue/40 space-y-4 animate-fadeIn">
            <h4 className="text-sm font-bold text-white">
              {editingPillar ? `Edit Pillar: ${editingPillar.text}` : 'Create New Engineering Pillar Badge'}
            </h4>
            <form onSubmit={handlePillarFormSubmit} className="space-y-4">
              <FormField label="Pillar Badge Title" required hint="e.g. Scalable Microservices Architecture">
                <input
                  type="text"
                  required
                  value={pillarInputText}
                  onChange={(e) => setPillarInputText(e.target.value)}
                  placeholder="e.g. High-Concurrency Payment Infrastructure"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-bold"
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPillar(false);
                    setEditingPillar(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-bgCard text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo"
                >
                  {editingPillar ? 'Update Pillar' : 'Save Pillar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pillars List */}
        <div className="divide-y divide-borderGlass">
          {pillars.length === 0 ? (
            <p className="py-6 text-center text-gray-500">No engineering pillars configured. Click "+ Add Engineering Pillar" above.</p>
          ) : (
            pillars.map((p, idx) => (
              <div key={p.id || idx} className="py-4 flex items-center justify-between gap-4 hover:bg-bgVoid/30 px-3 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-bgVoid border border-borderGlass flex items-center justify-center font-bold text-accentCyan text-[11px]">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accentCyan flex-shrink-0" />
                    <span className="text-sm font-bold text-white">{p.text}</span>
                    {p.enabled === false && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] uppercase font-bold">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => handleTogglePillarStatus(p.id, !(p.enabled !== false))}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      p.enabled !== false ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                    title={p.enabled !== false ? 'Enabled - Visible on public site' : 'Disabled - Hidden from public site'}
                  >
                    {p.enabled !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMovePillar(idx, 'up')}
                    className="p-2 rounded-lg bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={idx === pillars.length - 1}
                    onClick={() => handleMovePillar(idx, 'down')}
                    className="p-2 rounded-lg bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPillar(p);
                      setPillarInputText(p.text);
                      setIsAddingPillar(false);
                    }}
                    className="p-2 rounded-lg bg-bgVoid border border-borderGlass text-gray-400 hover:text-accentCyan cursor-pointer"
                    title="Edit Pillar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmPillar(p)}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete Pillar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. DYNAMIC ABOUT HIGHLIGHTS MANAGER */}
      <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-borderGlass pb-4">
          <div>
            <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
              DYNAMIC METRICS & HIGHLIGHTS
            </span>
            <h3 className="text-xl font-bold text-white">About Highlights (Order ASC)</h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingHighlight(null);
              setHighlightForm({ label: '', value: '', description: '' });
              setIsAddingHighlight(true);
            }}
            className="px-4 py-2 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Highlight</span>
          </button>
        </div>

        {/* Modal/Inline Form */}
        {(isAddingHighlight || editingHighlight) && (
          <div className="p-6 rounded-2xl bg-bgVoid border border-accentBlue/40 space-y-4 animate-fadeIn">
            <h4 className="text-sm font-bold text-white">
              {editingHighlight ? 'Edit Highlight Entry' : 'Create New Highlight Metric'}
            </h4>
            <form onSubmit={handleHighlightFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Value Metric (e.g. 8+, 40%, 30%)" required>
                  <input
                    type="text"
                    required
                    value={highlightForm.value}
                    onChange={(e) => setHighlightForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="40%"
                    className="w-full px-3 py-2 rounded-xl bg-bgCard border border-borderGlass text-accentCyan font-bold"
                  />
                </FormField>

                <FormField label="Label Title" required>
                  <input
                    type="text"
                    required
                    value={highlightForm.label}
                    onChange={(e) => setHighlightForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="API Response Boost"
                    className="w-full px-3 py-2 rounded-xl bg-bgCard border border-borderGlass text-white font-bold"
                  />
                </FormField>
              </div>

              <FormField label="Sublabel / Description">
                <input
                  type="text"
                  value={highlightForm.description || ''}
                  onChange={(e) => setHighlightForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Latency Drop via Indexing & Redis"
                  className="w-full px-3 py-2 rounded-xl bg-bgCard border border-borderGlass text-gray-300"
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingHighlight(false);
                    setEditingHighlight(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-bgCard text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo"
                >
                  Save Highlight
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Highlights Table */}
        <div className="divide-y divide-borderGlass">
          {highlights.length === 0 ? (
            <p className="py-6 text-center text-gray-500">No highlights configured. Click "+ Add Highlight" above.</p>
          ) : (
            highlights.map((h, idx) => (
              <div key={h.id} className="py-4 flex items-center justify-between gap-4 hover:bg-bgVoid/30 px-3 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-bgVoid border border-borderGlass flex items-center justify-center font-bold text-accentCyan text-[11px]">
                    {h.order}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-accentCyan">{h.value}</span>
                      <span className="text-sm font-bold text-white">{h.label}</span>
                    </div>
                    {h.description && <p className="text-[11px] text-gray-400">{h.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleHighlightStatus(h.id, !h.enabled)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      h.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                    title={h.enabled ? 'Enabled - Visible on public site' : 'Disabled - Hidden from public site'}
                  >
                    {h.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Reorder Up */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-2 rounded-lg bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    disabled={idx === highlights.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-2 rounded-lg bg-bgVoid border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHighlight(h);
                      setHighlightForm({ label: h.label, value: h.value, description: h.description || '' });
                      setIsAddingHighlight(false);
                    }}
                    className="p-2 rounded-lg bg-bgVoid border border-borderGlass text-gray-400 hover:text-accentCyan cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmHighlight(h)}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete Highlight"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* 4. CORE INDUSTRY DOMAINS MANAGER */}
      <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderGlass pb-4">
          <div>
            <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
              WEBSITE INDUSTRY SECTORS & DOMAIN EXPERTISE
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-accentCyan" />
              Core Industry Domains ({domains.filter(d => d.enabled !== false).length}/{domains.length} Active)
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingDomain(null);
              setDomainForm({
                name: '',
                tagline: '',
                description: '',
                icon: 'CreditCard',
                highlights: [],
                enabled: true
              });
              setNewHighlightInput('');
              setIsAddingDomain(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 hover:shadow-glow-blue cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Industry Domain</span>
          </button>
        </div>

        {/* Create/Edit Domain Modal Form */}
        {(isAddingDomain || editingDomain) && (
          <div className="p-6 rounded-2xl bg-bgVoid border border-accentBlue/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-borderGlass pb-2">
              <h4 className="text-sm font-bold text-white">
                {editingDomain ? `Edit Domain: ${editingDomain.name}` : 'Create New Industry Domain'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsAddingDomain(false);
                  setEditingDomain(null);
                }}
                className="p-1 rounded bg-bgCard text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDomainFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Industry Domain Name" required hint="e.g. Fintech & Lending">
                  <input
                    type="text"
                    required
                    value={domainForm.name}
                    onChange={(e) => setDomainForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Fintech & High-Frequency Trading"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white font-bold"
                  />
                </FormField>

                <FormField label="Icon Symbol">
                  <select
                    value={domainForm.icon}
                    onChange={(e) => setDomainForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-accentCyan font-bold"
                  >
                    {AVAILABLE_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Tagline / Subheading" required hint="e.g. High-Volume Transactions & Compliance">
                <input
                  type="text"
                  required
                  value={domainForm.tagline}
                  onChange={(e) => setDomainForm(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. PCI-DSS Compliant Payment Infrastructure"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-white"
                />
              </FormField>

              <FormField label="Domain Description Overview" required>
                <textarea
                  rows={3}
                  required
                  value={domainForm.description}
                  onChange={(e) => setDomainForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your engineering impact and work in this domain..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgCard border border-borderGlass text-gray-200 resize-none font-sans text-xs"
                />
              </FormField>

              {/* Bullet Highlights Manager */}
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold block">
                  Key Technical Highlights / Bullet Points
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBulletHighlight();
                      }
                    }}
                    placeholder="Add bullet highlight (e.g. Sub-100ms Gateway Latency)"
                    className="flex-1 px-3 py-2 rounded-xl bg-bgCard border border-borderGlass text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddBulletHighlight}
                    className="px-3.5 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {domainForm.highlights && domainForm.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {domainForm.highlights.map((bullet, bIdx) => (
                      <span key={bIdx} className="px-3 py-1 rounded-full bg-accentBlue/10 border border-accentBlue/30 text-accentCyan text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{bullet}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBulletHighlight(bIdx)}
                          className="hover:text-rose-400 text-gray-400 ml-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={domainForm.enabled !== false}
                    onChange={(e) => setDomainForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 rounded bg-bgVoid border-borderGlass text-accentBlue focus:ring-accentBlue"
                  />
                  <span>Show & Publish on Website</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-borderGlass">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingDomain(false);
                    setEditingDomain(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-bgCard text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo"
                >
                  {editingDomain ? 'Update Industry Domain' : 'Create Industry Domain'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Domains Cards List */}
        <div className="space-y-4">
          {domains.length === 0 ? (
            <p className="py-6 text-center text-gray-500">No industry domains created. Click "+ Add Industry Domain" above.</p>
          ) : (
            domains.map((dom, idx) => (
              <div
                key={dom.id || idx}
                className="p-5 rounded-2xl bg-bgVoid/60 border border-borderGlass hover:border-accentBlue/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-bgCard border border-borderGlass flex items-center justify-center font-bold text-accentCyan text-xs flex-shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="p-1.5 rounded-lg bg-accentBlue/20 border border-accentBlue/30 text-accentCyan font-bold text-xs flex items-center justify-center">
                        {renderDomainIcon(dom.icon)}
                      </span>
                      <h4 className="text-base font-bold text-white">{dom.name}</h4>
                      {dom.enabled === false && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] uppercase font-bold">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-accentCyan">{dom.tagline}</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans max-w-2xl">{dom.description}</p>

                    {/* Highlights bullet tags */}
                    {dom.highlights && dom.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {dom.highlights.map((hItem, hIdx) => (
                          <span key={hIdx} className="px-2.5 py-0.5 rounded-full bg-bgCard border border-borderGlass text-[10px] text-gray-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-accentCyan" />
                            <span>{hItem}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Status Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleDomainStatus(dom.id, !(dom.enabled !== false))}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      dom.enabled !== false ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                    title={dom.enabled !== false ? 'Enabled - Visible on public site' : 'Disabled - Hidden from public site'}
                  >
                    {dom.enabled !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveDomain(idx, 'up')}
                    className="p-2 rounded-lg bg-bgCard border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={idx === domains.length - 1}
                    onClick={() => handleMoveDomain(idx, 'down')}
                    className="p-2 rounded-lg bg-bgCard border border-borderGlass text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDomain(dom);
                      setDomainForm({
                        name: dom.name,
                        tagline: dom.tagline,
                        description: dom.description,
                        icon: dom.icon || 'CreditCard',
                        highlights: dom.highlights || [],
                        enabled: dom.enabled !== false
                      });
                      setNewHighlightInput('');
                      setIsAddingDomain(false);
                    }}
                    className="p-2 rounded-lg bg-bgCard border border-borderGlass text-gray-400 hover:text-accentCyan cursor-pointer"
                    title="Edit Domain"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmDomain(dom)}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete Domain"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm Delete Highlight Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmHighlight}
        itemTitle={deleteConfirmHighlight ? `${deleteConfirmHighlight.value} ${deleteConfirmHighlight.label}` : 'Highlight'}
        onConfirm={async () => {
          if (!deleteConfirmHighlight) return;
          await onDeleteHighlight(deleteConfirmHighlight.id);
          setDeleteConfirmHighlight(null);
        }}
        onCancel={() => setDeleteConfirmHighlight(null)}
      />

      {/* Confirm Delete Domain Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmDomain}
        itemTitle={deleteConfirmDomain ? deleteConfirmDomain.name : 'Industry Domain'}
        description="Deleting this industry domain will remove it from your website's Core Industry Domains section."
        onConfirm={handleConfirmDeleteDomain}
        onCancel={() => setDeleteConfirmDomain(null)}
      />

      {/* Confirm Delete Pillar Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmPillar}
        itemTitle={deleteConfirmPillar ? deleteConfirmPillar.text : 'Engineering Pillar'}
        description="Deleting this engineering pillar badge will remove it from your website's Architectural Philosophy section."
        onConfirm={handleConfirmDeletePillar}
        onCancel={() => setDeleteConfirmPillar(null)}
      />

    </div>
  );
};
