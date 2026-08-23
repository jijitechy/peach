import React from 'react';
import {
  LayoutDashboard, Package, Sparkles, Megaphone, ShoppingCart,
  Users, BarChart3, Wallet, Settings
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ currentView, onNavigate, isMobileOpen, onCloseMobile }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'studio', label: 'AI Ads Studio', icon: Sparkles },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0F19] text-gray-400 flex flex-col transition-transform duration-300 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex-shrink-0`}>
        
        {/* Logo */}
        <div className="h-16 flex items-center px-6 mb-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center text-xl bg-indigo-100 text-[#5D5FEF] font-black rounded-xl border border-indigo-200 shadow-sm">A</div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none tracking-wide">AddSell</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Kenya Marketplace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar pb-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onCloseMobile(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === item.id 
                  ? 'bg-[#5D5FEF] text-white shadow-lg shadow-indigo-900/20' 
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-gray-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom User Area - Optional, mostly moved to topbar */}
      </div>
    </>
  );
}
