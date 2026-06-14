import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Search, Sparkles, Check, MapPin, 
  Activity, Award, ShieldCheck, Tag, Loader2, Info, ArrowUpRight, Smartphone, Coins, Landmark, X, Heart
} from "lucide-react";
import { Listing, ViewportMode, UserState } from "./types";
import Navbar from "./components/Navbar";
import ListingCard from "./components/ListingCard";
import ListingDetail from "./components/ListingDetail";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import CartModal from "./components/CartModal";
import ActivityTicker from "./components/ActivityTicker";

export default function App() {
  const [viewportMode, setViewportMode] = useState<ViewportMode>("web");

  // User Session Management Hooks
  const [currentUser, setCurrentUser] = useState<UserState | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // M-Pesa Deposit Dialog States
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>("30000");
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [depositPhone, setDepositPhone] = useState<string>("");
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);
  const [depositErrorMsg, setDepositErrorMsg] = useState<string | null>(null);

  // Load Cached User Session on mount
  useEffect(() => {
    const cached = localStorage.getItem("bidkona_user");
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (err) {
        console.error("Cached session restore failure", err);
      }
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("bidkona_user");
    setActiveTab("marketplace");
  };

  const handleAuthSuccess = (user: UserState) => {
    setCurrentUser(user);
    localStorage.setItem("bidkona_user", JSON.stringify(user));
    fetchListings(); // live sync ratings
  };

  const handleEscrowBalanceUpdate = (newBalance: number) => {
    if (currentUser) {
      const updated = { ...currentUser, balance: newBalance };
      setCurrentUser(updated);
      localStorage.setItem("bidkona_user", JSON.stringify(updated));
    }
  };

  const handleMpesaDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setDepositErrorMsg(null);
    setDepositSuccessMsg(null);

    const numericAmount = parseFloat(depositAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setDepositErrorMsg("Please enter a positive deposit value.");
      return;
    }

    setIsDepositing(true);
    try {
      const response = await fetch("/api/auth/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ amount: numericAmount })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Daraja API push error");
      }

      const updated = { ...currentUser, balance: data.balance };
      setCurrentUser(updated);
      localStorage.setItem("bidkona_user", JSON.stringify(updated));
      
      setDepositSuccessMsg(`M-Pesa STK push completed! KES ${numericAmount.toLocaleString()} credited to your escrow account.`);
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setDepositSuccessMsg(null);
      }, 1500);

    } catch (err: any) {
      setDepositErrorMsg(err.message || "Escrow deposit pipeline connection failure.");
    } finally {
      setIsDepositing(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"marketplace" | "post" | "admin">("marketplace");
  
  // Watchlist & Personal Favorites State
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);

  // Sync user watchlist whenever user session changes
  useEffect(() => {
    const key = currentUser ? `bidkona_watchlist_${currentUser.id}` : "bidkona_watchlist_guest";
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        setWatchlist([]);
      }
    } else {
      setWatchlist([]);
    }
  }, [currentUser?.id]);

  // Toggle listing on/off watchlist
  const handleToggleWatchlist = (listingId: string) => {
    const key = currentUser ? `bidkona_watchlist_${currentUser.id}` : "bidkona_watchlist_guest";
    setWatchlist((prev) => {
      let updated;
      if (prev.includes(listingId)) {
        updated = prev.filter((id) => id !== listingId);
      } else {
        updated = [...prev, listingId];
      }
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  
  // Filtering and Searching States
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Listing Form State
  const [formTitle, setFormTitle] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("Electronics");
  const [formCondition, setFormCondition] = useState<string>("Good");
  const [formLocation, setFormLocation] = useState<string>("Nairobi, Westlands");
  const [formStartingBid, setFormStartingBid] = useState<string>("");
  const [formReservePrice, setFormReservePrice] = useState<string>("");
  const [formDurationHours, setFormDurationHours] = useState<string>("24");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");

  // Post form AI Assist triggers
  const [isAiDrafting, setIsAiDrafting] = useState<boolean>(false);
  const [aiValuationText, setAiValuationText] = useState<string>("");
  const [showAiSuccessToast, setShowAiSuccessToast] = useState<boolean>(false);

  // General loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all active marketplace listings
  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/listings");
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error("Error connecting to fullstack API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Handle auto pre-generation of descriptions + optimal bid pricing guidance with Gemini
  const handleAiCopilotDraft = async () => {
    if (!formTitle.trim()) {
      alert("Please provide at least a title for the item first (e.g. 'Refurbished laptop') so our AI officer can analyze it.");
      return;
    }

    setIsAiDrafting(true);
    setAiValuationText("");

    try {
      // 1. Fetch AI compiled description
      const descRes = await fetch("/api/gemini/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          condition: formCondition,
          location: formLocation
        })
      });

      // 2. Fetch AI optimal pricing indexing
      const priceRes = await fetch("/api/gemini/evaluate-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          condition: formCondition
        })
      });

      if (descRes.ok && priceRes.ok) {
        const descData = await descRes.json();
        const priceData = await priceRes.json();

        setFormDescription(descData.description || "");
        
        if (priceData) {
          setFormStartingBid(priceData.recommendedStartingBid ? priceData.recommendedStartingBid.toString() : "");
          setFormReservePrice(priceData.recommendedStartingBid ? Math.floor(priceData.recommendedStartingBid * 1.15).toString() : "");
          setAiValuationText(`Estimated Kenyan New Retail: KES ${priceData.estimatedNewPrice?.toLocaleString()} | Recommended start: KES ${priceData.recommendedStartingBid?.toLocaleString()} | Escrow Fee: KES ${priceData.estimatedEscrowFee}`);
        }

        // Set matching product template image if empty
        if (!formImageUrl) {
          if (formCategory === "Electronics") {
            setFormImageUrl("https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80"); // apple watch mock
          } else if (formCategory === "Fashion") {
            setFormImageUrl("https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80"); // shirt mock
          } else if (formCategory === "Vehicles & Sports") {
            setFormImageUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80"); // bike mock
          } else {
            setFormImageUrl("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"); // generic camera
          }
        }

        setShowAiSuccessToast(true);
        setTimeout(() => setShowAiSuccessToast(false), 4500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Submit Listing creation handler
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!formTitle || !formStartingBid) {
      alert("Please provide at least a title and a starting bid amount.");
      return;
    }

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          category: formCategory,
          condition: formCondition,
          location: formLocation,
          startingBid: parseFloat(formStartingBid),
          reservePrice: formReservePrice ? parseFloat(formReservePrice) : undefined,
          durationHours: parseFloat(formDurationHours),
          imageUrl: formImageUrl || undefined
        })
      });

      if (response.ok) {
        // Reset state & load marketplace listings back
        setFormTitle("");
        setFormDescription("");
        setFormStartingBid("");
        setFormReservePrice("");
        setFormImageUrl("");
        setAiValuationText("");
        
        fetchListings();
        setActiveTab("marketplace");
        setSelectedListingId(null);
      } else {
        alert("Transaction failed to declare listing.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ["All", "Electronics", "Fashion", "Books & Hobbies", "Services", "Vehicles & Sports"];

  const filteredListings = listings.filter((l) => {
    const matchesCategory = 
      categoryFilter === "All" 
        ? true 
        : categoryFilter === "watchlist"
          ? watchlist.includes(l.id)
          : l.category === categoryFilter;
    const matchesKeyword = searchQuery === "" || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  // Master Render of content logic that applies to both desktop dashboard layout & mobile view
  const renderCoreContent = (isMobileBezel: boolean = false) => {
    if (selectedListingId) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          key="detail"
        >
          <ListingDetail 
            listingId={selectedListingId} 
            onBack={() => setSelectedListingId(null)} 
            onRefreshListings={fetchListings}
            currentUser={currentUser}
            onAuthRequired={() => setIsAuthModalOpen(true)}
            onUpdateUserBalance={handleEscrowBalanceUpdate}
            isFavorited={watchlist.includes(selectedListingId)}
            onToggleFavorite={() => handleToggleWatchlist(selectedListingId)}
          />
        </motion.div>
      );
    }

    switch (activeTab) {
      case "admin":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AdminPanel 
              currentUser={currentUser} 
              onRefreshListings={fetchListings}
            />
          </motion.div>
        );

      case "post":
        return (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-5">
              <Plus className="w-6 h-6 text-brand-primary" />
              <div>
                <h2 className="text-lg font-display font-bold text-gray-900">Post a Nairobi Recommerce Listing</h2>
                <p className="text-xs text-gray-400">Items/Services are published to the auction bid board instantly.</p>
              </div>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs tracking-normal text-gray-700">
              
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">1. Listing Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. HP EliteBook 840 G5 Core i7"
                    className="flex-1 px-3 py-2.5 bg-white border border-gray-200 focus:border-brand-primary rounded-xl font-semibold outline-hidden text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAiCopilotDraft}
                    disabled={isAiDrafting}
                    className="px-3 bg-linear-to-r from-indigo-600 to-violet-600 font-bold text-white rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 shrink-0 text-[10px]"
                    title="Let Gemini generate optimal price and write description automatically"
                  >
                    {isAiDrafting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Fills via AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showAiSuccessToast && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-2.5 rounded-lg flex items-center gap-1.5 animate-bounce">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Gemini Co-Pilot pricing completed!</span>
                    <span className="text-[10px] text-indigo-700 leading-none">{aiValuationText}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Books & Hobbies">Books & Hobbies</option>
                    <option value="Services">Services (Freelance/Gig)</option>
                    <option value="Vehicles & Sports">Vehicles & Sports</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Starting Bid (KES)</label>
                  <input
                    type="number"
                    value={formStartingBid}
                    onChange={(e) => setFormStartingBid(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Reserve Price (KES)</label>
                  <input
                    type="number"
                    value={formReservePrice}
                    onChange={(e) => setFormReservePrice(e.target.value)}
                    placeholder="30000"
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Pickup Location (Kenya)</label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm"
                  >
                    <option value="Nairobi, Westlands">Nairobi, Westlands</option>
                    <option value="Nairobi, Kilimani">Nairobi, Kilimani</option>
                    <option value="Mombasa, Nyali">Mombasa, Nyali</option>
                    <option value="Kisumu, Milimani">Kisumu, Milimani</option>
                    <option value="Eldoret, Central">Eldoret, Central</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Auction Duration</label>
                  <select
                    value={formDurationHours}
                    onChange={(e) => setFormDurationHours(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm"
                  >
                    <option value="0.5">30 Minutes (Demo-Speed)</option>
                    <option value="2">2 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours</option>
                    <option value="72">3 Days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Product Image URL (Optional)</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider block text-[10px] text-gray-500">Marketing Sales Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your items or services in detail..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gray-950 hover:bg-brand-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                Publish Auction securely
              </button>
            </form>
          </motion.div>
        );

      case "marketplace":
      default:
        return (
          <div className="space-y-6">
            
            {/* Category Filter panel */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
              
              {/* Category buttons tab */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none select-none items-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      categoryFilter === cat
                        ? "bg-gray-900 text-white shadow-xs"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                {/* Separator */}
                <span className="h-4 w-[1px] bg-gray-200 block shrink-0 mx-1"></span>

                {/* Watchlist Filter Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (categoryFilter === "watchlist") {
                      setCategoryFilter("All");
                    } else {
                      setCategoryFilter("watchlist");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 select-none cursor-pointer border ${
                    categoryFilter === "watchlist"
                      ? "bg-rose-50 border-rose-200 text-rose-600 shadow-xs"
                      : "bg-gray-50 hover:bg-rose-50/40 hover:border-rose-100/60 border-transparent text-gray-500 hover:text-rose-600"
                  }`}
                  title="Show only favorited auctions"
                >
                  <Heart className={`w-3.5 h-3.5 ${categoryFilter === "watchlist" ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>Watchlist ({watchlist.length})</span>
                </button>
              </div>

            </div>

            {/* Dynamic Grid Items display */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-2" />
                <p className="text-xs font-mono">Connecting to Peach Recommerce engine...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed text-gray-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No active auctions match your query.</p>
                <p className="text-xs text-gray-400 mt-1">Try another category, search term, or post a new auction yourself!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorited={watchlist.includes(listing.id)}
                    onToggleFavorite={() => handleToggleWatchlist(listing.id)}
                    onClick={() => setSelectedListingId(listing.id)}
                  />
                ))}
              </div>
            )}

            {/* Simulated Live Statistics board highlighting trading activity */}
            {!isMobileBezel && (
              <div className="bg-linear-to-b from-gray-900 to-indigo-950 p-6 rounded-3xl text-white md:flex md:items-center md:justify-between gap-6 shadow-xl border border-gray-800">
                <div className="max-w-md">
                  <span className="inline-block bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[10px] tracking-wider uppercase font-bold py-0.5 px-2.5 rounded-full mb-1">
                    Vanguard Security System
                  </span>
                  <h3 className="text-xl font-display font-bold">Safest Second-Hand Marketplace in Africa</h3>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed font-sans">
                    With M-Pesa automated STK push triggers, multi-rider logistics confirmation, and instant escrow funds release, fraud is physically impossible. That's why Peach is trusted nationwide.
                  </p>
                </div>
                <div className="mt-4 md:mt-0 grid grid-cols-2 gap-4 text-center shrink-0">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-lg font-mono font-bold text-orange-405 block">KES 224K</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Avg Nairobi Daily Payout</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-lg font-mono font-bold text-safaricom-light block">99.4%</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Merchant Trust Score</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        );
    }
  };

  // Find listings won by current user
  const cartCount = listings.filter(
    (l) => l.winnerId === currentUser?.id && l.status === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans flex flex-col justify-between">
      
      {/* Top Application Global Navbar */}
      <Navbar
        viewportMode={viewportMode}
        setViewportMode={(mode) => {
          setViewportMode(mode);
          // Auto reset to listings list upon layout shift for visual ease
          setSelectedListingId(null);
        }}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedListingId(null);
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenDepositModal={() => {
          if (currentUser) {
            setDepositPhone(currentUser.phone);
            setIsDepositModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenCartModal={() => setIsCartModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setSelectedListingId(null);
        }}
        cartCount={cartCount}
      />

      <ActivityTicker />

      {/* Main Container Switcher mapping to Web Platform vs Screen Boxed iPhone */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {viewportMode === "web" ? (
          // Web Desktop mode: Standard gorgeous full page responsive design
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {renderCoreContent()}
            </AnimatePresence>
          </div>
        ) : (
          // Mobile native mode: Render boxed inside high fidelity iPhone-like frame bezel
          <div className="flex flex-col items-center justify-center py-2 bg-radial from-gray-100 to-gray-200 rounded-3xl border border-gray-200/50 p-4 shadow-inner">
            <div className="text-center max-w-sm mb-4">
              <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">Dual Screen Presentation Mock</span>
              <h2 className="text-sm font-semibold text-gray-600 mt-0.5">Peach iOS/Android Live Bezels</h2>
              <p className="text-[10px] text-gray-400 leading-tight">Interact with the real-time mobile checkout environment and STK push simulators below.</p>
            </div>

            {/* Physical iPhone device mock design */}
            <div className="relative mx-auto border-gray-900 bg-gray-950 border-[12px] sm:border-[16px] rounded-[3.5rem] h-[780px] w-[360px] shadow-2xl overflow-hidden flex flex-col">
              
              {/* iPhone Notch display sensor bar */}
              <div className="absolute top-0 inset-x-0 h-8 bg-black z-50 flex items-center justify-between px-6 text-[10px] text-white">
                <span className="font-semibold text-gray-200">10:36</span>
                {/* Simulated Notch */}
                <div className="w-24 h-4 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mr-2"></div>
                  <div className="w-8 h-1 bg-gray-900 rounded-full"></div>
                </div>
                <div className="flex items-center gap-1 font-mono text-gray-300">
                  <span>5G</span>
                  <div className="flex gap-0.5 items-end h-2.5">
                    <span className="w-0.5 h-1 bg-white rounded-xs"></span>
                    <span className="w-0.5 h-1.5 bg-white rounded-xs"></span>
                    <span className="w-0.5 h-2 bg-white rounded-xs"></span>
                    <span className="w-0.5 h-2.5 bg-white rounded-xs"></span>
                  </div>
                  <div className="w-4.5 h-2.5 border border-white/65 rounded-xs p-0.5 flex items-center">
                    <div className="h-full w-3/4 bg-[#44B92C] rounded-2xs"></div>
                  </div>
                </div>
              </div>

              {/* iPhone App Screen Body scroll frame */}
              <div className="flex-1 overflow-y-auto bg-gray-50 pt-8 pb-4 scrollbar-none">
                
                {/* Mobile top mini-header */}
                <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded bg-brand-primary flex items-center justify-center text-white font-extrabold text-xs">P</div>
                    <span className="text-xs font-display font-extrabold text-brand-primary">Peach Mobile</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => { setActiveTab("marketplace"); setSelectedListingId(null); }}
                      className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${activeTab === "marketplace" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      Shop
                    </button>
                    <button 
                      onClick={() => { setActiveTab("post"); setSelectedListingId(null); }}
                      className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${activeTab === "post" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      Sell
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button 
                        onClick={() => { setActiveTab("admin"); setSelectedListingId(null); }}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${activeTab === "admin" ? "bg-amber-500 text-white" : "bg-gray-100 text-[#ea580c] font-extrabold border border-amber-200"}`}
                      >
                        Admin
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-3 py-3">
                  <AnimatePresence mode="wait">
                    {renderCoreContent(true)}
                  </AnimatePresence>
                </div>

              </div>

              {/* iOS screen home soft indicator line */}
              <div className="h-4 bg-black w-full flex items-center justify-center shrink-0 z-50">
                <div className="w-32 h-1 bg-white rounded-full"></div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Modern responsive simple footer */}
      <footer className="bg-white border-t border-gray-100 py-6 select-none mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center">
          <p className="text-xs text-gray-400 font-sans">
            &copy; 2026 Peach Inc. Powered by Safaricom Daraja API & Google Gemini AI. All rights reserved.
          </p>
          <div className="mt-2 sm:mt-0 flex justify-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-[10px]">
            <span>Nairobi</span>
            <span>&middot;</span>
            <span>Mombasa</span>
            <span>&middot;</span>
            <span>Kisumu</span>
            <span>&middot;</span>
            <span>Eldoret</span>
          </div>
        </div>
      </footer>

      {/* Slide-over User Logins & Signups Modal popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Safaricom M-Pesa wallet deposit portal */}
      {isDepositModalOpen && currentUser && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden w-full max-w-sm font-sans text-xs"
          >
            <div className="bg-[#44B92C] p-6 text-white text-center select-none relative">
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-1.5 rounded-full text-white transition-all outline-hidden border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Smartphone className="w-6 h-6 text-[#44B92C]" />
              </div>
              <h3 className="text-lg font-display font-extrabold">Simulated Safaricom STK Push</h3>
              <p className="text-xs text-white/90 mt-1">Directly fund your Peach Escrow wallet via M-Pesa.</p>
            </div>

            <form onSubmit={handleMpesaDepositSubmit} className="p-5 space-y-4">
              {depositErrorMsg && (
                <div className="bg-rose-50 text-rose-800 p-2.5 rounded-xl border border-rose-200 text-[11px] font-semibold">
                  {depositErrorMsg}
                </div>
              )}
              {depositSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-250 text-[11px] font-bold">
                  {depositSuccessMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase">Your Safaricom line</label>
                <input
                  type="text"
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  required
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm font-semibold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block uppercase">Deposit Amount (KES)</label>
                <select
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-brand-primary rounded-xl outline-hidden text-sm font-semibold text-gray-800"
                >
                  <option value="15000">KES 15,000</option>
                  <option value="30000">KES 30,000</option>
                  <option value="50000">KES 50,000</option>
                  <option value="100000">KES 100,000</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isDepositing}
                className="w-full py-2.5 bg-[#44B92C] hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Awaiting Safaricom Pin...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    Request STK Deposit Push
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dynamic Profile Drawer & Favorites Watchlist Portfolio Panel */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        listings={listings}
        watchlist={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
        onOpenDeposit={() => {
          if (currentUser) {
            setDepositPhone(currentUser.phone);
            setIsDepositModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onSelectListing={(id) => {
          setSelectedListingId(id);
        }}
      />

      {/* Dynamic Escrow Shopping Cart & active orders slide drawer */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        currentUser={currentUser}
        listings={listings}
        onSelectListing={(id) => {
          setSelectedListingId(id);
        }}
      />

    </div>
  );
}
