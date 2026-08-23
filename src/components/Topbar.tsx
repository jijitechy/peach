import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Topbar({ onOpenMobileSidebar, currentView, onNavigate }: TopbarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'studio', label: 'AI Ads Studio' },
    { id: 'campaigns', label: 'Campaigns' },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-30">
      <div className="flex items-center gap-4 h-full">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden text-gray-500 hover:text-gray-900"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-6 h-full items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`text-sm font-bold h-full border-b-2 transition-all ${
                currentView === tab.id
                  ? 'border-[#FF6B35] text-[#FF6B35]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search ads, campaigns..."
            className="bg-transparent text-sm outline-none text-gray-700 w-44"
          />
        </div>

        {/* Notifications */}
        <button className="text-gray-400 hover:text-gray-600 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B35] rounded-full border border-white"></span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer border-l pl-4 border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-sm select-none">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
