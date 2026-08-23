import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function DashboardLayout({ children, currentView, onNavigate }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-sans overflow-hidden text-gray-900">
      <Sidebar 
        currentView={currentView} 
        onNavigate={onNavigate} 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        <Topbar 
          currentView={currentView}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
