import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Activity, 
  ArrowRight, 
  RefreshCw,
  AlertCircle,
  Search,
  Settings
} from 'lucide-react';
import { fetchDashboardSummary, checkWebsiteHealth } from '../../../services/apiClient';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';

interface DashboardViewProps {
  onNavigate: (moduleKey: string) => void;
  adminName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, adminName = 'Ashish' }) => {
  const [summaryData, setSummaryData] = useState<{
    counts: Record<string, number>;
    completeness: Array<{ key: string; title: string; status: string; count: number }>;
    seoStatus?: {
      seoConfigured: boolean;
      canonicalConfigured: boolean;
      ogImageConfigured: boolean;
      faviconConfigured: boolean;
      structuredDataEnabled: boolean;
      maintenanceMode: boolean;
    };
  } | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [health, summary] = await Promise.all([
        checkWebsiteHealth(),
        fetchDashboardSummary()
      ]);

      setIsOnline(health.online);
      if (summary) {
        setSummaryData(summary);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isError) {
    return (
      <div className="p-12 rounded-3xl bg-bgCard border border-rose-500/40 text-center font-mono text-xs space-y-4 max-w-xl mx-auto my-8">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Unable to load dashboard data</h3>
        <p className="text-gray-400">Could not retrieve dynamic database metrics from the API backend.</p>
        <button
          type="button"
          onClick={loadDashboard}
          className="px-5 py-2.5 rounded-xl bg-accentBlue text-white font-bold inline-flex items-center gap-2 hover:bg-accentIndigo cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const counts = summaryData?.counts || {
    experience: 0,
    projects: 0,
    skills: 0,
    education: 0,
    certifications: 0,
    achievements: 0,
    socialLinks: 0,
    media: 0
  };

  const seoStatus = summaryData?.seoStatus || {
    seoConfigured: true,
    canonicalConfigured: false,
    ogImageConfigured: false,
    faviconConfigured: false,
    structuredDataEnabled: true,
    maintenanceMode: false
  };

  return (
    <div className="space-y-8 font-mono text-xs max-w-7xl">
      
      {/* 1. WELCOME BANNER & WEBSITE STATUS CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Area */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-r from-bgCard via-bgSurface to-bgCard border border-borderGlass shadow-2xl space-y-3 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-accentBlue/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block">
            PRODUCTION CMS DASHBOARD
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {adminName}
          </h2>
          <p className="text-gray-400 leading-relaxed text-xs max-w-xl font-sans">
            Manage your portfolio content, projects, experience, skills, SEO metadata, and site settings from one place.
          </p>
        </div>

        {/* Website Status Card */}
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              WEBSITE STATUS
            </span>
            <StatusBadge status={isOnline ? 'Online' : 'Unavailable'} type="online" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-bgVoid border border-borderGlass text-accentCyan">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Public Portfolio</p>
              <p className="text-[11px] text-gray-500">
                {seoStatus.maintenanceMode 
                  ? 'Maintenance Mode Active' 
                  : (isOnline ? 'Serving live visitors' : 'Backend API disconnected')}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 2. DYNAMIC CONTENT OVERVIEW STAT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Dynamic Content Metrics</h3>
          <span className="text-[10px] text-gray-500">Real-time database records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Experience Roles"
            value={counts.experience}
            iconName="Briefcase"
            subtitle="Production timeline & break"
            isLoading={isLoading}
            onClick={() => onNavigate('experience')}
          />
          <StatCard
            label="Production Projects"
            value={counts.projects}
            iconName="Layers"
            subtitle="Case studies & SVG mockups"
            isLoading={isLoading}
            onClick={() => onNavigate('projects')}
          />
          <StatCard
            label="Skills Categories"
            value={counts.skills}
            iconName="Terminal"
            subtitle="Technical stack topology"
            isLoading={isLoading}
            onClick={() => onNavigate('skills')}
          />
          <StatCard
            label="Academic Education"
            value={counts.education}
            iconName="GraduationCap"
            subtitle="Degree milestones"
            isLoading={isLoading}
            onClick={() => onNavigate('education')}
          />
          <StatCard
            label="Certifications"
            value={counts.certifications}
            iconName="Award"
            subtitle="Accreditations & licenses"
            isLoading={isLoading}
            onClick={() => onNavigate('certifications')}
          />
          <StatCard
            label="Key Achievements"
            value={counts.achievements}
            iconName="Trophy"
            subtitle="Quantifiable impact"
            isLoading={isLoading}
            onClick={() => onNavigate('achievements')}
          />
          <StatCard
            label="Social Links"
            value={counts.socialLinks}
            iconName="Share2"
            subtitle="Public contact profiles"
            isLoading={isLoading}
            onClick={() => onNavigate('socialLinks')}
          />
          <StatCard
            label="Media Library"
            value={counts.media || 0}
            iconName="Image"
            subtitle={counts.media > 0 ? `${counts.mediaImages || 0} Photos, ${counts.mediaDocs || 0} Documents` : 'No media uploaded'}
            isLoading={isLoading}
            onClick={() => onNavigate('media')}
          />
          <StatCard
            label="PDF Resume"
            value={counts.resume || 0}
            iconName="Briefcase"
            subtitle="Official curriculum vitae"
            isLoading={isLoading}
            onClick={() => onNavigate('resume')}
          />
        </div>
      </div>

      {/* 3. SEO & SITE SETTINGS STATUS CARD */}
      <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-borderGlass pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accentBlue/10 text-accentCyan">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SEO & Site Settings Status</h3>
              <p className="text-gray-400 text-[11px]">Real-time database configuration tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('seo')}
              className="px-4 py-2 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan font-bold text-xs hover:bg-accentBlue hover:text-white transition-all cursor-pointer"
            >
              Edit SEO
            </button>
            <button
              type="button"
              onClick={() => onNavigate('site-settings')}
              className="px-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 font-bold text-xs hover:text-white transition-all cursor-pointer"
            >
              Edit Site Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between">
            <span className="text-gray-400">SEO Metadata:</span>
            <span className={`font-bold ${seoStatus.seoConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
              {seoStatus.seoConfigured ? 'Configured' : 'Not configured'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between">
            <span className="text-gray-400">Canonical URL:</span>
            <span className={`font-bold ${seoStatus.canonicalConfigured ? 'text-emerald-400' : 'text-gray-500'}`}>
              {seoStatus.canonicalConfigured ? 'Configured' : 'Not configured'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between">
            <span className="text-gray-400">OG Image:</span>
            <span className={`font-bold ${seoStatus.ogImageConfigured ? 'text-emerald-400' : 'text-gray-500'}`}>
              {seoStatus.ogImageConfigured ? 'Configured' : 'Not configured'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between">
            <span className="text-gray-400">Favicon Asset:</span>
            <span className={`font-bold ${seoStatus.faviconConfigured ? 'text-emerald-400' : 'text-gray-500'}`}>
              {seoStatus.faviconConfigured ? 'Configured' : 'Browser Default'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between">
            <span className="text-gray-400">Structured Data (JSON-LD):</span>
            <span className={`font-bold ${seoStatus.structuredDataEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
              {seoStatus.structuredDataEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between">
            <span className="text-gray-400">Maintenance Mode:</span>
            <span className={`font-bold ${seoStatus.maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`}>
              {seoStatus.maintenanceMode ? 'ENABLED (ACTIVE)' : 'Disabled (Normal)'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS & CONTENT COMPLETENESS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Content Completeness Table (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-borderGlass pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Content Completeness</h3>
              <p className="text-gray-400 text-[11px]">Configuration status across major portfolio modules</p>
            </div>
          </div>

          <div className="divide-y divide-borderGlass/60">
            {(summaryData?.completeness || []).map((item) => (
              <div
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className="py-3 flex items-center justify-between hover:bg-bgVoid/40 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <span className="font-bold text-white text-xs">{item.title}</span>
                <StatusBadge status={item.status} type="completeness" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activity (1 col) */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('seo')}
                className="w-full p-3 rounded-xl bg-bgVoid hover:bg-accentBlue/20 border border-borderGlass hover:border-accentBlue/40 text-gray-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-accentCyan" />
                  <span>Edit SEO Settings</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('site-settings')}
                className="w-full p-3 rounded-xl bg-bgVoid hover:bg-accentBlue/20 border border-borderGlass hover:border-accentBlue/40 text-gray-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-accentBlue" />
                  <span>Edit Site Settings</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('experience')}
                className="w-full p-3 rounded-xl bg-bgVoid hover:bg-accentBlue/20 border border-borderGlass hover:border-accentBlue/40 text-gray-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+ Add Experience</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('projects')}
                className="w-full p-3 rounded-xl bg-bgVoid hover:bg-accentBlue/20 border border-borderGlass hover:border-accentBlue/40 text-gray-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>+ Add Project</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Recent Activity</h3>
              <Activity className="w-4 h-4 text-gray-500" />
            </div>
            <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass text-center text-gray-400 text-xs">
              No recent activity
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
