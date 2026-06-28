import { ShieldAlert, Landmark, Smartphone, Monitor, Award, Compass, Sparkles, Plus, AlertCircle, LogOut, LogIn, Coins, ArrowUpRight, Heart, Search, ShoppingCart, User } from "lucide-react";
import { UserState } from "../types";

interface NavbarProps {
  activeTab: 'marketplace' | 'post' | 'admin' | 'merchant';
  setActiveTab: (tab: 'marketplace' | 'post' | 'admin' | 'merchant') => void;
  currentUser: UserState | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenDepositModal: () => void;
  onOpenProfileModal: () => void;
  onOpenCartModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenDepositModal,
  onOpenProfileModal,
  onOpenCartModal,
  searchQuery,
  setSearchQuery,
  cartCount
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 select-none">
      
      {/* Top micro banner */}
      <div className="bg-gray-900 text-white px-4 py-1.5 text-center text-xs flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#44B92C] animate-pulse"></span>
        <span className="font-mono text-gray-300 font-semibold text-[10px] sm:text-xs">
          PEACH MARKETPLACE — KENYA · Secure Escrow · M-Pesa Payments
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto py-3 md:h-18 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        
        {/* Left: Brand logo & navigational paths */}
        <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
          <div 
            onClick={() => {
              setActiveTab('marketplace');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform ring-2 ring-orange-200 overflow-hidden flex items-center justify-center">
              <img 
                src="/peachlogo.png" 
                alt="Peach" 
                className="w-full h-full object-cover scale-110" 
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-[#f97316] tracking-tight text-xl leading-none">
                Peach
              </span>
              <span className="text-gray-400 text-[10px] block leading-none font-mono tracking-wider uppercase font-semibold">
                Kenya Marketplace
              </span>
            </div>
          </div>

          {/* Desktop Nav tabs */}
          <nav className="hidden lg:flex gap-4 ml-6 pl-6 border-l border-gray-150">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`text-xs uppercase tracking-wider font-bold transition-colors ${
                activeTab === 'marketplace' ? "text-[#f97316]" : "text-gray-400 hover:text-gray-650"
              }`}
            >
              Explore Auctions
            </button>
            {currentUser?.role === 'seller' && (
              <button
                onClick={() => setActiveTab('post')}
                className={`text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1 ${
                  activeTab === 'post' ? "text-[#f97316]" : "text-gray-400 hover:text-gray-650"
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Post Listing
              </button>
            )}
            {currentUser?.role === 'seller' && (
              <button
                onClick={() => setActiveTab('merchant')}
                className={`text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'merchant' ? "text-[#f97316] font-extrabold" : "text-gray-400 hover:text-[#f97316]"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-orange-500" /> Merchant Hub
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1 ${
                  activeTab === 'admin' ? "text-amber-500 font-extrabold animate-pulse" : "text-gray-400 hover:text-amber-500"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Admin Control
              </button>
            )}
          </nav>
        </div>

        {/* Center: Wide Centralized Search Input Bar */}
        <div className="flex-1 max-w-2xl w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-450" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'marketplace') {
                setActiveTab('marketplace');
              }
            }}
            placeholder="Search iPhones, PS5, home furniture, camera accessories..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#f97316] focus:bg-white text-xs font-semibold rounded-full shadow-2xs outline-hidden focus:ring-1 focus:ring-[#f97316] transition-all placeholder-gray-400"
          />
        </div>

        {/* Right side Actions: Cart, Profile Account, Wallet details, Settings */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          
          {/* Cart Icon trigger and Indicator Badge */}
          <button
            type="button"
            onClick={onOpenCartModal}
            className="p-2.5 text-gray-500 hover:text-[#f97316] bg-gray-50 hover:bg-orange-50 border border-gray-150 rounded-xl relative transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Open Secure Escrow Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#f97316] text-white text-[9px] font-bold font-mono h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Profile and user credentials */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Wallet details */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <div className="text-left select-none">
                  <span className="text-[8px] text-emerald-700 uppercase font-mono font-extrabold leading-none block">Wallet</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-900 block leading-tight">
                    KES {currentUser.balance.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={onOpenDepositModal}
                  className="ml-1 bg-[#44B92C] hover:bg-emerald-700 text-white font-bold p-0.5 rounded-sm transition-colors cursor-pointer"
                  title="Simulate Safaricom M-Pesa STK Deposit"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* User Account Trigger Button */}
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 text-left hover:opacity-85 active:scale-95 transition-all outline-hidden cursor-pointer group bg-gray-50 hover:bg-gray-100/85 border border-gray-150 p-1 pr-2.5 rounded-xl"
                title="View secure profile & favorites tracker"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-gray-250 group-hover:border-[#f97316] transition-colors"
                />
                <div className="text-left">
                  <span className="text-[10px] font-bold text-gray-800 block max-w-[80px] truncate group-hover:text-[#f97316]">
                    Account
                  </span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block leading-none font-mono">
                    Profile
                  </span>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 text-gray-450 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 border border-gray-150 rounded-xl transition-all cursor-pointer"
                title="Log Out of Peach"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl border border-brand-primary text-brand-primary hover:bg-[#f97316] hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Account</span>
            </button>
          )}

          {/* Viewport setting layout controls removed */}

        </div>

      </div>

    </header>
  );
}
