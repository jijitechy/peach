import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Tag, 
  Barcode, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  Coins, 
  Activity, 
  FileText, 
  AlertCircle, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Inbox,
  Sparkles
} from 'lucide-react';
import { UserState, Listing } from '../types';
import { getLocalListings, saveLocalListings } from '../utils/dataStore';

interface MerchantHubProps {
  currentUser: UserState | null;
  onRefreshListings: () => void;
  onPostNewTabTrigger: () => void;
}

export default function MerchantHub({ currentUser, onRefreshListings, onPostNewTabTrigger }: MerchantHubProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'orders' | 'verification'>('listings');
  
  // Action states
  const [trackingCodeInput, setTrackingCodeInput] = useState<{ [key: string]: string }>({});
  const [submittingActionId, setSubmittingActionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Boost Listing State
  const [boostListingId, setBoostListingId] = useState<string | null>(null);
  const [boostDuration, setBoostDuration] = useState<number>(3); // days
  const boostCostPerDay = 500; // Localized/base cost per day


  useEffect(() => {
    fetchMerchantData();
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchMerchantData = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch from Express API
      const response = await fetch('/api/listings');
      if (response.ok) {
        const data = await response.json();
        // Filter listings where listing.seller.id === currentUser.id
        if (currentUser) {
          const sellerItems = data.filter((l: any) => l.seller && l.seller.id === currentUser.id);
          setListings(sellerItems);
        }
      } else {
        throw new Error('Express API failed');
      }
    } catch (err) {
      console.warn("Using local database backup to fetch seller catalog products.", err);
      // Fallback
      const local = getLocalListings();
      if (currentUser) {
        const sellerItems = local.filter(l => l.seller && l.seller.id === currentUser.id);
        setListings(sellerItems);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper code to automatically generate realistic merchant SKU identifiers
  const generateSKU = (l: Listing) => {
    const catCode = (l.category || "GEN").substring(0, 4).toUpperCase();
    const cleanId = l.id.replace("lst-", "").substring(0, 4).toUpperCase();
    return `PCH-${catCode}-${cleanId || "888X"}`;
  };

  // Handle action to Ship an item and record tracking details
  const handleMarkShipped = async (listingId: string) => {
    const inputCode = trackingCodeInput[listingId] || "";
    if (!inputCode.trim()) {
      alert("Please provide the courier tracking code or delivery note details.");
      return;
    }

    setSubmittingActionId(listingId);
    try {
      // Try backend endpoint first
      const response = await fetch(`/api/listings/${listingId}/escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'shipped',
          trackingCode: inputCode
        })
      });

      if (response.ok) {
        showToast("Order status updated! courier tracking code published.");
        fetchMerchantData();
        onRefreshListings();
      } else {
        throw new Error("Endpoint failed");
      }
    } catch (err) {
      // Client-side local persistence backup
      console.warn("Express server unavailable. Marking shipped locally.", err);
      const all = getLocalListings();
      const idx = all.findIndex(l => l.id === listingId);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          escrowStatus: 'shipped',
          trackingCode: inputCode
        };
        saveLocalListings(all);
        showToast("Shipped! Local peer-to-peer tracking details saved.");
        fetchMerchantData();
        onRefreshListings();
      }
    } finally {
      setSubmittingActionId(null);
    }
  };

  // Mark Listing Out of Stock (Completed/Cancelled if no active bids)
  const handleMarkFinished = async (listingId: string, statusType: 'completed' | 'cancelled') => {
    if (!confirm(`Are you sure you want to mark this item as ${statusType}?`)) {
      return;
    }
    setSubmittingActionId(listingId);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/delete`, {
        method: 'POST'
      });
      if (response.ok) {
        showToast(`Listing is now marked as deleted/resolved.`);
        fetchMerchantData();
        onRefreshListings();
      } else {
        throw new Error("Direct delete failed");
      }
    } catch (err) {
      console.warn("Performing fallback clean stock update.", err);
      const all = getLocalListings();
      const idx = all.findIndex(l => l.id === listingId);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          status: statusType
        };
        saveLocalListings(all);
        showToast(`Stock updated: Item marked as ${statusType}`);
        fetchMerchantData();
        onRefreshListings();
      }
    } finally {
      setSubmittingActionId(null);
    }
  };

  const handleBoostListing = async () => {
    if (!boostListingId) return;
    setSubmittingActionId('boost');
    const cost = boostDuration * boostCostPerDay;
    try {
      const response = await fetch(`/api/listings/${boostListingId}/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cost, durationDays: boostDuration })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Boost failed.");
        return;
      }
      showToast(`Campaign Live! Boosted for ${boostDuration} days.`);
      fetchMerchantData();
      onRefreshListings();
    } catch (err) {
      alert("Network error processing boost.");
    } finally {
      setSubmittingActionId(null);
      setBoostListingId(null);
    }
  };

  if (!currentUser || currentUser.role !== 'seller') {
    return (
      <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-auto border border-gray-100 shadow-2xs font-sans">
        <AlertCircle className="w-12 h-12 text-[#f97316] mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-900 leading-tight">Merchant Access Denied</h3>
        <p className="text-xs text-gray-400 mt-2">
          Your account is registered as a buyer/bidder profile. Please register or sign in using a verified seller account credentials.
        </p>
      </div>
    );
  }

  // Derived variables / Computed stats for Jumia/Alibaba interface style
  const totalPostings = listings.length;
  const activePostings = listings.filter(l => l.status === 'active');
  const inventoryValue = listings.reduce((sum, current) => sum + (current.currentBid || current.startingBid || 0), 0);
  
  // Pending orders
  const orders = listings.filter(l => l.winnerId || l.escrowStatus !== 'none');
  const pendingOrders = orders.filter(l => l.escrowStatus !== 'funds_released' && l.status !== 'cancelled');
  const pendingEscrowRevenue = orders
    .filter(l => l.escrowStatus !== 'none' && l.escrowStatus !== 'funds_released')
    .reduce((sum, current) => sum + (current.currentBid || 0), 0);

  const completedSalesCount = orders.filter(l => l.escrowStatus === 'funds_released').length;
  const releasedEarnings = orders
    .filter(l => l.escrowStatus === 'funds_released')
    .reduce((sum, current) => sum + (current.currentBid || 0), 0);

  // Filter listings block
  const searchedListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          generateSKU(l).toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && l.status === 'active';
    if (filterStatus === 'completed') return matchesSearch && l.status === 'completed';
    if (filterStatus === 'pending_escrow') return matchesSearch && l.escrowStatus !== 'none' && l.escrowStatus !== 'funds_released';
    if (filterStatus === 'outofstock') return matchesSearch && (l.status === 'completed' || l.status === 'cancelled');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Alert Indicator */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-gray-800 animate-slideUp">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Seller Bio / Corporate Branding Header */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md select-none">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Activity className="w-48 h-48 rotate-12" />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#f97316] flex items-center justify-center font-display font-black text-2xl text-white shadow-md shadow-orange-500/10">
              {currentUser.shopName ? currentUser.shopName.charAt(0).toUpperCase() : currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-display text-white tracking-tight leading-none">
                  {currentUser.shopName || `${currentUser.name}'s Shop`}
                </h1>
                <span className="bg-[#ea580c] text-white text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Verified Merchant
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                KRA PIN: <strong className="font-mono text-gray-200">{currentUser.kraPin || "A009187654Z"}</strong> | ID Card: <strong className="font-mono text-gray-200">{currentUser.nationalId || "33441122"}</strong>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onPostNewTabTrigger}
              className="bg-[#f97316] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Post SKU Stock
            </button>
          </div>
        </div>

        {/* Real-time Business Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 border-t border-gray-700/60 pt-5">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Catalog SKUs</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-white">{totalPostings}</span>
              <span className="text-[9px] text-gray-400">Total Items</span>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Asset Inventory</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-orange-400">KES {inventoryValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Locked Escrow</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-amber-300">KES {pendingEscrowRevenue.toLocaleString()}</span>
              <span className="text-[9px] text-gray-400">({pendingOrders.length} pending)</span>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Released Earning</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-emerald-400">KES {releasedEarnings.toLocaleString()}</span>
              <span className="text-[9px] text-gray-400">({completedSalesCount} orders)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Portals Tab Toggles */}
      <div className="flex border-b border-gray-150 select-none pb-0.5">
        <button
          onClick={() => setActiveSubTab('listings')}
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-0.5 ${
            activeSubTab === 'listings' 
              ? 'border-[#f97316] text-[#f97316]' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Package className="w-4 h-4" /> SKU Storefront ({searchedListings.length})
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-0.5 relative ${
            activeSubTab === 'orders' 
              ? 'border-[#f97316] text-[#f97316]' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> Escrow Sales Orders
            {pendingOrders.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-mono font-bold h-4 px-1 rounded-full flex items-center justify-center shrink-0">
                {pendingOrders.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* RENDER listings sub-tab */}
      {activeSubTab === 'listings' && (
        <div className="space-y-4">
          
          {/* Filters shelf */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-150">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by SKU Code, item title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-hidden focus:border-orange-400 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              {['all', 'active', 'completed', 'outofstock'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border capitalize transition-all ${
                    filterStatus === st 
                      ? 'bg-gray-900 border-gray-900 text-white' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {st === 'all' ? 'Show All' : st === 'outofstock' ? 'Out of stock' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table / Grid list */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-150">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-2.5"></div>
              <p className="text-xs text-gray-400">Loading catalog inventory...</p>
            </div>
          ) : searchedListings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-150 p-6">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold leading-none">No matched SKUs in stock</p>
              <p className="text-[10px] text-gray-400 mt-1">Try broadening your keyword search or post your first item above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {searchedListings.map((l) => {
                const sku = generateSKU(l);
                const isOut = l.status === 'completed' || l.status === 'cancelled';
                
                return (
                  <div key={l.id} className="bg-white p-4 rounded-2xl border border-gray-150 hover:border-gray-300 transition-all shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={l.imageUrl} 
                        alt={l.title} 
                        className="w-12 h-12 rounded-xl object-cover border border-gray-150 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-400 font-mono font-extrabold bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded leading-none block">
                            SKU: {sku}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${
                            l.status === 'active' 
                              ? 'bg-green-50 text-green-700 border border-green-100' 
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {l.status === 'active' ? 'In Stock / Live' : 'Out of Stock'}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-800 mt-1 leading-snug">{l.title}</h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 capitalize">Category: {l.category} • Location: {l.location}</p>
                      </div>
                    </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right font-mono">
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Current Bid/Ask</span>
                        <span className="text-xs font-extrabold text-gray-900 block">KES {l.currentBid.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-400 block">Start: KES {l.startingBid.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {l.status === 'active' ? (
                          <>
                            <button
                              onClick={() => handleMarkFinished(l.id, 'completed')}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                            >
                              Out of Stock
                            </button>
                            {l.isBoosted ? (
                              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Boosted
                              </span>
                            ) : (
                              <button
                                onClick={() => setBoostListingId(l.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                Boost Listing
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">Archived</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER orders sub-tab */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-xs text-amber-900 leading-normal">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Peach Safe Escrow Order Processing Standard</p>
              <p className="text-[11px] text-amber-850 mt-1">
                Kenyan peer-to-peer sellers receive funds instantly as soon as: (1) courier tracking details are uploaded, (2) items are dispatched to the buyer, and (3) the buyer confirms physical receipt of the package or the 3-day hold window lapses.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-150 p-6">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-550 font-bold leading-none">No orders recorded yet</p>
              <p className="text-[10px] text-gray-400 mt-1">When buyers bid and win your items, purchase orders will pop up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const sku = generateSKU(o);
                const isHandling = submittingActionId === o.id;

                return (
                  <div key={o.id} className="bg-white rounded-2xl border border-gray-150 shadow-3xs overflow-hidden">
                    
                    {/* Header bar of order */}
                    <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <Barcode className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-mono">ORDER REF: <strong className="text-gray-800">{o.id.toUpperCase()}</strong></span>
                        <span className="h-3 w-[1px] bg-gray-200"></span>
                        <span className="text-[10px] text-orange-700 font-mono font-bold">SKU: {sku}</span>
                      </div>
                      
                      <div>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          o.escrowStatus === 'funds_released' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                            : o.escrowStatus === 'held_in_escrow'
                              ? 'bg-amber-50 text-amber-800 border border-amber-100'
                              : o.escrowStatus === 'pending_payment'
                                ? 'bg-orange-50 text-orange-850 border border-orange-150'
                                : o.escrowStatus === 'shipped'
                                  ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]'
                                  : 'bg-gray-100 text-gray-600'
                        }`}>
                          {o.escrowStatus === 'none' ? 'Bidding Ended (Pending Escrow)' : o.escrowStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Product details */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Product Information</h4>
                        <div className="flex gap-3">
                          <img 
                            src={o.imageUrl} 
                            alt={o.title} 
                            className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-800 leading-tight">{o.title}</p>
                            <p className="text-[10px] text-gray-500 mt-1">Sale Price: <span className="font-mono font-bold text-[#f97316]">KES {o.currentBid.toLocaleString()}</span></p>
                            <p className="text-[9px] text-gray-400">Winning Bidder: {o.winnerName || "Guest User"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Shipping information details */}
                      <div className="space-y-2 border-t md:border-t-0 md:border-x border-gray-100 pt-3 md:pt-0 md:px-5">
                        <h4 className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Shipping Dispatch Address</h4>
                        {o.deliveryAddress ? (
                          <div className="space-y-1 text-xs">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate font-semibold">{o.deliveryAddress}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-650">
                              <Phone className="absolute left-0 top-0 w-0 h-0 text-transparent shrink-0" />
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-semibold">{o.mpesaPhone || "No contact phone"}</span>
                            </span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">Waiting for winning buyer to provide their delivery details.</p>
                        )}
                      </div>

                      {/* Escrow processing triggers section */}
                      <div className="space-y-2 pt-3 md:pt-0">
                        <h4 className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Escrow Actions Console</h4>
                        
                        {o.escrowStatus === 'pending_payment' && (
                          <p className="text-[10px] text-amber-700 leading-normal bg-orange-50/50 p-2.5 rounded-xl border border-orange-100 font-medium">
                            Waiting for bidder to perform M-Pesa push transactions to lock Peach's Safe Escrow.
                          </p>
                        )}

                        {o.escrowStatus === 'held_in_escrow' && (
                          <div className="space-y-2">
                            <p className="text-[9.5px] text-[#2b6cb0] leading-snug bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                              👍 Funds secured in Escrow! Dispatch item and input courier/G4S/Wells Fargo tracking code below to release code verification.
                            </p>
                            <div className="flex gap-1.5 shrink-0">
                              <input
                                type="text"
                                placeholder="courier tracking code..."
                                value={trackingCodeInput[o.id] || ""}
                                onChange={(e) => setTrackingCodeInput({
                                  ...trackingCodeInput,
                                  [o.id]: e.target.value
                                })}
                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden focus:border-blue-400 focus:bg-white"
                              />
                              <button
                                onClick={() => handleMarkShipped(o.id)}
                                disabled={isHandling}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                              >
                                {isHandling ? "Saving..." : "Ship"}
                              </button>
                            </div>
                          </div>
                        )}

                        {o.escrowStatus === 'shipped' && (
                          <div className="space-y-1.5 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                            <p className="text-[9.5px] text-sky-850">
                              Courier Tracking: <strong className="font-mono text-sky-900">{o.trackingCode || "N/A"}</strong>
                            </p>
                            <p className="text-[9px] text-gray-400 leading-normal">
                              The cargo is currently in dispatch. Escrow funds will automatically clear when the buyer clicks "Confirm Physical Receipt" or when G4S validates transit.
                            </p>
                          </div>
                        )}

                        {o.escrowStatus === 'funds_released' && (
                          <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 text-emerald-800 leading-tight">
                            <span className="font-bold text-[10px] block mb-0.5 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Payment Disbursed
                            </span>
                            <p className="text-[9px] leading-normal">
                              Funds of KES {o.currentBid.toLocaleString()} successfully credited to your main Kenya Recommerce merchant wallet balance!
                            </p>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
    </div>
      )}

      {/* Boost Modal */}
      {boostListingId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Boost Campaign</h3>
                <p className="text-[10px] text-gray-400">Powered by Meta Ads integration</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5">Select Duration</label>
                <select 
                  value={boostDuration}
                  onChange={(e) => setBoostDuration(parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-hidden focus:border-orange-400"
                >
                  <option value={1}>1 Day (Quick Boost)</option>
                  <option value={3}>3 Days (Recommended)</option>
                  <option value={7}>7 Days (Max Exposure)</option>
                </select>
              </div>
              
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3 flex justify-between items-center">
                <span className="text-xs text-orange-900 font-bold">Total Cost:</span>
                <span className="text-lg text-orange-600 font-black">KES {(boostDuration * boostCostPerDay).toLocaleString()}</span>
              </div>
              
              <div className="text-[9px] text-gray-400 leading-normal text-center px-2">
                This amount will be deducted from your merchant wallet. We'll automatically build and publish a Meta Ads campaign for your item.
              </div>
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setBoostListingId(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBoostListing}
                  disabled={submittingActionId === 'boost'}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingActionId === 'boost' ? 'Processing...' : 'Pay & Launch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
