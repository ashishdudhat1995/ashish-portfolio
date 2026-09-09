import React from 'react';
import { 
  LayoutDashboard, 
  User, 
  Sparkles, 
  Info, 
  Briefcase, 
  Code2, 
  FolderGit2, 
  GraduationCap, 
  Award, 
  Trophy, 
  Share2, 
  Mail, 
  Compass, 
  Search, 
  Send,
  Settings, 
  Image as ImageIcon, 
  UserCheck,
  Terminal,
  FileText,
  Database,
  Eye,
  LogOut,
  X
} from 'lucide-react';
import { adminNavigation } from '../../../config/adminNavigation';

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onViewLive: () => void;
  onLogout: () => void;
  counts?: Record<string, number>;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPath,
  onNavigate,
  onViewLive,
  onLogout,
  counts = {},
  isMobileOpen = false,
  onCloseMobile
}) => {
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-4 h-4" />;
      case 'User': return <User className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Info': return <Info className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Code2': return <Code2 className="w-4 h-4" />;
      case 'FolderGit2': return <FolderGit2 className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Trophy': return <Trophy className="w-4 h-4" />;
      case 'Share2': return <Share2 className="w-4 h-4" />;
      case 'Mail': return <Mail className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Search': return <Search className="w-4 h-4" />;
      case 'Send': return <Send className="w-4 h-4" />;
      case 'Settings': return <Settings className="w-4 h-4" />;
      case 'Image': return <ImageIcon className="w-4 h-4" />;
      case 'UserCheck': return <UserCheck className="w-4 h-4" />;
      default: return <Terminal className="w-4 h-4" />;
    }
  };

  const categories = ['Dashboard', 'Content', 'Website', 'Media', 'System'] as const;

  const sidebarContent = (
    <div className="flex flex-col h-full font-mono text-xs p-5 bg-bgSurface/95 border-r border-borderGlass overflow-hidden">
      
      {/* Top Fixed Header Branding & DB Status */}
      <div className="flex-shrink-0 space-y-4 pb-4 border-b border-borderGlass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">Ashishkumar D.</p>
              <span className="text-[10px] text-accentCyan uppercase tracking-wider">SaaS Admin CMS</span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-bgVoid text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-3 rounded-xl bg-bgVoid border border-borderGlass text-[10px] space-y-1">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL Active</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Middle Scrollable Navigation Options */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {categories.map((cat) => {
          const items = adminNavigation.filter(item => item.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest px-2 mb-1">
                {cat}:
              </p>
              {items.map((item) => {
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                const count = counts[item.id];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.path);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer text-[11px] ${
                      isActive 
                        ? 'bg-accentBlue text-white font-bold shadow-glow-blue' 
                        : 'text-gray-400 hover:bg-bgCard hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {renderIcon(item.iconName)}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {count !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isActive ? 'bg-bgVoid text-white' : 'bg-bgVoid text-gray-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Fixed Footer Actions */}
      <div className="flex-shrink-0 space-y-2 pt-4 border-t border-borderGlass">
        <button
          type="button"
          onClick={onViewLive}
          className="w-full p-2.5 rounded-xl bg-bgCard hover:bg-bgCardHover border border-borderGlass text-gray-300 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
        >
          <Eye className="w-3.5 h-3.5 text-accentCyan" />
          <span>View Public Portfolio</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout CMS</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 z-20 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-bgVoid/80 backdrop-blur-md"
          />
          <div className="relative w-64 max-w-full bg-bgSurface z-10 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
