import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onViewLive: () => void;
  onLogout: () => void;
  adminUser?: { name: string; email: string; role?: string } | null;
  saveStatus?: string | null;
  counts?: Record<string, number>;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  onViewLive,
  onLogout,
  adminUser,
  saveStatus,
  counts,
  children
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-bgVoid font-mono text-gray-100 flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        onViewLive={onViewLive}
        onLogout={onLogout}
        counts={counts}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main SaaS Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Bar */}
        <AdminHeader
          currentPath={currentPath}
          adminUser={adminUser}
          saveStatus={saveStatus}
          onViewLive={onViewLive}
          onLogout={onLogout}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-6">
          {children}
        </main>

      </div>

    </div>
  );
};
