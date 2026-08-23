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
    { id: 'products', label: 'Products' },
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

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search products, sellers..."
            className="bg-transparent text-sm outline-none text-gray-700 w-48"
          />
        </div>

        {/* Wallet chip */}
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5 cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black">KES</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase leading-none">Wallet</p>
            <p className="text-xs font-black text-orange-900 leading-none">KES 0</p>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer border-l pl-4 border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">Nova</p>
            <p className="text-xs text-gray-500">Merchant</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=150&h=150&fit=crop&crop=faces"
            alt="User"
            className="w-8 h-8 rounded-full border-2 border-orange-100 object-cover"
          />
        </div>
      </div>
    </header>
  );
}
