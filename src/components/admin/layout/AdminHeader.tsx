import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, Lock, Menu, LogOut, ChevronDown } from 'lucide-react';
import { getNavItemByPath } from '../../../config/adminNavigation';

interface AdminHeaderProps {
  currentPath: string;
  adminUser?: { name: string; email: string; role?: string } | null;
  saveStatus?: string | null;
  onViewLive: () => void;
  onLogout: () => void;
  onOpenMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentPath,
  adminUser,
  saveStatus,
  onViewLive,
  onLogout,
  onOpenMobileSidebar
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeNav = getNavItemByPath(currentPath) || {
    label: 'CMS Dashboard',
    path: currentPath,
    category: 'Dashboard',
    description: 'System overview and CMS management.'
  };

  return (
    <header className="p-4 sm:p-6 bg-bgSurface/95 border-b border-borderGlass font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 z-10">
      
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-accentCyan text-[10px] font-bold uppercase tracking-wider mb-1">
            <Lock className="w-3 h-3" />
            <span>Admin</span>
            <span>/</span>
            <span className="text-gray-400">{activeNav.category}</span>
            <span>/</span>
            <span className="text-white">{activeNav.label}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            {activeNav.label}
          </h1>
        </div>
      </div>

      {/* Profile Menu & Header Actions */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        
        {saveStatus && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Live Site Preview */}
        <button
          type="button"
          onClick={onViewLive}
          className="px-3.5 py-2 rounded-xl bg-bgCard hover:bg-bgCardHover border border-borderGlass text-gray-200 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
        >
          <ExternalLink className="w-4 h-4 text-accentCyan" />
          <span className="hidden sm:inline">Live Site</span>
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="px-3 py-1.5 rounded-xl bg-bgVoid border border-borderGlass hover:border-accentBlue/40 text-gray-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-accentBlue/20 border border-accentBlue/40 flex items-center justify-center text-accentCyan font-bold text-[10px]">
              {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-white">
              {adminUser?.name || 'Ashishkumar Dudhat'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-bgCard border border-borderGlass shadow-2xl p-3 space-y-2 z-50">
              <div className="p-2 border-b border-borderGlass text-[11px]">
                <p className="font-bold text-white">{adminUser?.name || 'Ashishkumar Dudhat'}</p>
                <p className="text-gray-400 text-[10px] truncate">{adminUser?.email || 'dudhatashish1995@gmail.com'}</p>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-left flex items-center gap-2 text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
