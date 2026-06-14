import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Clock, ShieldCheck, MapPin, Sparkles, Send, 
  History, Users, Truck, MessageSquare, Star, Landmark, 
  AlertTriangle, Check, Info, ChevronRight, Play, CheckCircle, Loader2, Award, Heart
} from "lucide-react";
import { Listing, Bid, ValuationReport, UserState } from "../types";
import SimulatedMpesaSTK from "./SimulatedMpesaSTK";
import { addLocalBid, awardLocalBid, updateLocalEscrow, getLocalListings } from "../utils/dataStore";

interface ListingDetailProps {
  listingId: string;
  onBack: () => void;
  onRefreshListings: () => void;
  currentUser: UserState | null;
  onAuthRequired: () => void;
  onUpdateUserBalance: (newBalance: number) => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export default function ListingDetail({ 
  listingId, 
  onBack, 
  onRefreshListings,
  currentUser,
  onAuthRequired,
  onUpdateUserBalance,
  isFavorited,
  onToggleFavorite
}: ListingDetailProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [bidsList, setBidsList] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bidValue, setBidValue] = useState<string>("");
  const [bidLocation, setBidLocation] = useState<string>("");
  const [bidNotes, setBidNotes] = useState<string>("");
  const [bidError, setBidError] = useState<string>("");
  const [bidSuccess, setBidSuccess] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isAutoBid, setIsAutoBid] = useState<boolean>(false);
  const [autoBidLimit, setAutoBidLimit] = useState<string>("");

  // Gemini Valuation and Insights
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<ValuationReport | null>(null);

  // Mpesa STK Dialog simulation
  const [showMpesaPrompt, setShowMpesaPrompt] = useState<boolean>(false);
  const [mpesaPhone, setMpesaPhone] = useState<string>("0712345678");
  const [mpesaError, setMpesaError] = useState<string>("");
  const [deliveryOption, setDeliveryOption] = useState<string>("Peach Smart Express");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [deliveryFee, setDeliveryFee] = useState<number>(350);

  // Refresh Single Listing Detail
  const fetchListingDetail = async () => {
    try {
      setIsLoading(true);
      let data: Listing | null = null;
      try {
        const res = await fetch(`/api/listings/${listingId}`);
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          throw new Error("Direct endpoint failed");
        }
      } catch (err) {
        console.warn("Express backend offline. Falling back to local listing data.", err);
        const list = getLocalListings();
        data = list.find(l => l.id === listingId) || null;
      }

      if (data) {
        setListing(data);
        setBidsList(data.bidHistory || []);
        
        // Auto estimate delivery fee based on locations
        if (data.location.includes("Mombasa")) {
          setDeliveryFee(550);
        } else if (data.location.includes("Kisumu")) {
          setDeliveryFee(480);
        } else {
          setDeliveryFee(350);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetail();
  }, [listingId]);

  // Live Timer Count Down
  useEffect(() => {
    if (!listing) return;
    const calculateTimeLeft = () => {
      const difference = new Date(listing.endTime).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("Ended");
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (hours > 24) {
        setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [listing?.endTime]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess(false);

    if (!currentUser) {
      onAuthRequired();
      return;
    }

    const amountNum = parseFloat(bidValue);
    if (isNaN(amountNum) || amountNum <= 0) {
      setBidError("Please enter a valid bidding price proposal (KES).");
      return;
    }

    if (!bidLocation.trim()) {
      setBidError("Please specify your primary delivery/pickup location.");
      return;
    }

    if (currentUser.balance < amountNum) {
      setBidError(`Your wallet balance (KES ${currentUser.balance.toLocaleString()}) is insufficient for this bid offer. Deposit funds first.`);
      return;
    }

    const autoBidLimitNum = isAutoBid ? parseFloat(autoBidLimit) : null;
    if (isAutoBid && (isNaN(autoBidLimitNum!) || autoBidLimitNum! < amountNum)) {
      setBidError("Your Maximum Auto-Bid Limit must meet or exceed your active Bid offer of KES " + amountNum.toLocaleString());
      return;
    }

    try {
      let success = false;
      try {
        const response = await fetch(`/api/listings/${listingId}/bid`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentUser.id}`
          },
          body: JSON.stringify({ 
            amount: amountNum, 
            bidderName: currentUser.name,
            location: bidLocation,
            notes: bidNotes,
            autoBidLimit: autoBidLimitNum
          })
        });

        if (response.ok) {
          success = true;
        } else {
          const errData = await response.json();
          setBidError(errData.error || "Direct endpoint failed");
          return;
        }
      } catch (err) {
        console.warn("Bypassing to browser local database bid entry.", err);
        const updated = addLocalBid(listingId, amountNum, currentUser, bidLocation, bidNotes, autoBidLimitNum);
        if (updated) {
          success = true;
          // Deduct client-side simulated wallet
          const newBalance = currentUser.balance - amountNum;
          onUpdateUserBalance(newBalance);
        }
      }

      if (success) {
        setBidSuccess(true);
        setBidValue("");
        setBidLocation("");
        setBidNotes("");
        setIsAutoBid(false);
        setAutoBidLimit("");
        fetchListingDetail();
        onRefreshListings();
        setTimeout(() => setBidSuccess(false), 3000);
      } else {
        setBidError("Failed to submit bid proposal.");
      }
    } catch (e) {
      setBidError("Server connection lost. Unable to place bid.");
    }
  };

  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);
  const [awardErrorMsg, setAwardErrorMsg] = useState<string | null>(null);

  const handleAwardBid = async (bidId: string) => {
    setAwardSuccessMsg(null);
    setAwardErrorMsg(null);
    try {
      let success = false;
      try {
        const response = await fetch(`/api/listings/${listingId}/award-bid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentUser?.id || "usr-demo"}`
          },
          body: JSON.stringify({ bidId })
        });
        if (response.ok) {
          success = true;
        } else {
          throw new Error("Direct endpoint failed");
        }
      } catch (err) {
        console.warn("Bypassing to browser local database award selection.", err);
        const updated = awardLocalBid(listingId, bidId);
        if (updated) {
          success = true;
        }
      }

      if (success) {
        setAwardSuccessMsg("Congratulations! You selected this bid proposal. Listing successfully marked completed.");
        fetchListingDetail();
        onRefreshListings();
        setTimeout(() => setAwardSuccessMsg(null), 5000);
      } else {
        setAwardErrorMsg("Failed/prohibited from selecting this bid.");
      }
    } catch (e) {
      setAwardErrorMsg("Server connection lost. Unable to select winning bid.");
    }
  };

  const handleTriggerAIValuation = async () => {
    if (!listing) return;
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/gemini/evaluate-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: listing.title,
          category: listing.category,
          condition: listing.condition
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiReport(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDeliveryOptionChange = (optionName: string, fee: number) => {
    setDeliveryOption(optionName);
    setDeliveryFee(fee);
  };

  // Triggers M-Pesa checkout processing
  const handleCheckoutInit = async () => {
    setMpesaError("");
    if (!mpesaPhone.trim()) {
      setMpesaError("Please enter a Safaricom M-Pesa mobile number.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setMpesaError("Please specify a GPO, physical location or locker address for delivery.");
      return;
    }
    setShowMpesaPrompt(true);
  };

  // Confirms PIN and initiates Escrow Vault Lock
  const handleMpesaPinApproved = async (receiptCode: string) => {
    setShowMpesaPrompt(false);
    try {
      const response = await fetch(`/api/listings/${listingId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: mpesaPhone,
          deliveryOption,
          deliveryAddress,
          deliveryFee
        })
      });

      if (response.ok) {
        const confirmRes = await fetch(`/api/listings/${listingId}/confirm-payment`, {
          method: "POST",
          headers: currentUser ? { "Authorization": `Bearer ${currentUser.id}` } : {}
        });
        if (confirmRes.ok) {
          const resData = await confirmRes.json();
          if (resData.newBalance !== undefined) {
            onUpdateUserBalance(resData.newBalance);
          }
          fetchListingDetail();
          onRefreshListings();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeDispatch = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/dispatch`, { method: "POST" });
      if (response.ok) {
        fetchListingDetail();
        onRefreshListings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeRiderDeliveryConfirm = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/deliver`, { method: "POST" });
      if (response.ok) {
        fetchListingDetail();
        onRefreshListings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeReleaseEscrow = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/release-escrow`, { method: "POST" });
      if (response.ok) {
        fetchListingDetail();
        onRefreshListings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeDispute = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/dispute`, { method: "POST" });
      if (response.ok) {
        fetchListingDetail();
        onRefreshListings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !listing) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-400">
        <div className="w-8 h-8 rounded-full border-t-2 border-brand-primary animate-spin mb-3"></div>
        <p className="text-xs font-mono">Fetching Peach listing details...</p>
      </div>
    );
  }

  const isUserWinner = listing.winnerId === "usr-demo" || (currentUser && listing.winnerId === currentUser.id);
  const getEscrowStatusTag = (status: string) => {
    switch (status) {
      case "pending_payment": return "bg-amber-100 text-amber-800 border-amber-200";
      case "held_in_escrow": return "bg-indigo-100 text-indigo-800 border-indigo-200 font-bold";
      case "shipped": return "bg-blue-100 text-blue-800 border-blue-200 animate-pulse";
      case "delivered": return "bg-purple-100 text-purple-800 border-purple-200";
      case "funds_released": return "bg-emerald-100 text-emerald-800 border-emerald-250 font-bold";
      case "disputed": return "bg-red-100 text-red-800 border-red-200 font-bold";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-6 transition-all">
      {/* Detail Header navigation bar */}
      <div className="flex items-center justify-between pb-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back to Marketplace
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-rose-50 hover:border-rose-200 text-xs font-semibold text-gray-600 hover:text-rose-650 transition-all select-none cursor-pointer"
          title={isFavorited ? "Remove from My Favorites" : "Add to My Favorites"}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
          <span>{isFavorited ? "Saved in Favorites" : "Save to Favorites"}</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Visual Details and specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl overflow-hidden aspect-video relative shadow-xs bg-gray-50 max-h-[360px] border border-gray-100">
            <img 
              src={listing.imageUrl} 
              alt={listing.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
            
            {/* Condition Tag */}
            <div className="absolute top-4 left-4 flex gap-1">
              <span className="bg-orange-500 text-white font-mono text-[10px] tracking-widest font-bold py-1 px-3 rounded-full shadow-md uppercase">
                {listing.condition} Condition
              </span>
              <span className="bg-gray-900/65 backdrop-blur-xs text-white font-mono text-[10px] py-1 px-2.5 rounded-full uppercase">
                {listing.category}
              </span>
            </div>

            {/* Countdown floating tag */}
            <div className="absolute bottom-4 right-4">
              <span className={`text-xs font-mono font-bold py-1 px-3 rounded-full flex items-center gap-1.5 shadow-md border ${
                isExpired 
                  ? "bg-red-50 text-red-650 border-red-100 animate-pulse" 
                  : "bg-white text-gray-800 border-gray-100"
              }`}>
                <Clock className={`w-4 h-4 ${isExpired ? "text-red-500" : "text-brand-primary"}`} />
                {timeLeft}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-primary" /> {listing.location} (Kenya Region)
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mt-1">{listing.title}</h1>
            
            {/* Seller profile section */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={listing.seller.avatar} alt={listing.seller.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    {listing.seller.name}
                    <span className="bg-emerald-50 text-safaricom-green text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 uppercase">Verified Merchant</span>
                  </div>
                  <p className="text-[10px] text-gray-400">98.4% On-Time Shipping | Nairobi, KE</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-0.5 font-bold text-xs text-gray-800 justify-end">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {listing.seller.rating}
                </div>
                <span className="text-[9px] text-gray-400">24 trade transactions</span>
              </div>
            </div>

            <h3 className="text-xs uppercase font-mono tracking-widest text-gray-400 font-bold mt-6">Product Description</h3>
            <p className="text-gray-600 text-sm mt-1.5 leading-relaxed font-sans">{listing.description}</p>
          </div>

          {/* E-Commerce Standard Specifications & Parameters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-150 space-y-3.5 shadow-2xs">
            <h4 className="text-xs uppercase font-mono tracking-widest text-gray-400 font-bold">Catalog Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
              <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                <span className="text-gray-400">Authentic Brand</span>
                <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-150">{listing.brand || "Verified Select"}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                <span className="text-gray-400">Sizing / Unit Details</span>
                <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-150">{listing.size || "Standard Edition"}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between items-center col-span-1 sm:col-span-2">
                <span className="text-gray-400">Warranty Protection</span>
                <span className="font-bold text-gray-700">{listing.warranty || "Escrow Guarded (7-Day Return/Refund)"}</span>
              </div>
              <div className="border-b border-gray-100 pb-2 flex justify-between items-center col-span-1 sm:col-span-2">
                <span className="text-gray-400">Escrow Increment Standard</span>
                <span className="font-bold text-orange-600 font-mono">KES {(listing.minIncrement || 500).toLocaleString()}</span>
              </div>
            </div>
            
            {listing.specs && (
              <div className="pt-1.5">
                <span className="text-[10px] text-gray-400 font-mono block uppercase tracking-wider mb-1.5">Technical Specs & Features</span>
                <p className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-150 text-[11px] text-gray-650 font-mono leading-relaxed whitespace-pre-wrap">
                  {listing.specs}
                </p>
              </div>
            )}
          </div>

          {/* AI valuation block */}
          <div className="bg-linear-to-ee from-indigo-50/50 to-orange-50/50 p-4 rounded-2xl border border-orange-100/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <Sparkles className="w-14 h-14 text-indigo-500" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 className="font-display font-bold text-sm text-gray-800">Peach AI Market Valuation</h3>
            </div>
            <p className="text-xs text-gray-500">
              Get an accurate, VC-grade estimate of this premium item's market value in Nairobi based on condition, historical demand, and recommended starting bids.
            </p>

            {aiReport ? (
              <div className="mt-4 space-y-3 bg-white p-3.5 rounded-xl border border-gray-200/60 shadow-xs">
                <div className="grid grid-cols-3 gap-2 text-center border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Est. Retail New</span>
                    <strong className="text-xs text-gray-800">KES {aiReport.estimatedNewPrice.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">Recommended Start</span>
                    <strong className="text-xs text-[#f97316]">KES {aiReport.recommendedStartingBid.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Estimated Escrow Fee</span>
                    <strong className="text-xs text-safaricom-green">KES {aiReport.estimatedEscrowFee.toLocaleString()}</strong>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-gray-700 flex items-center gap-1.5 p-1 px-2 rounded-md bg-orange-50 w-full mb-1 border border-orange-100">
                    <span>Demand Temperature:</span>
                    <span className="text-brand-primary">{aiReport.marketVibe}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed italic">"{aiReport.expertOpinion}"</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleTriggerAIValuation}
                disabled={isAiLoading}
                className="mt-3 text-xs font-bold py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Querying Kenya recommerce database...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Compile Valuation Analytics
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Act of bidding & Checkout flows */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Action Block (active state bidding or checkout flow) */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-4 sm:p-5">
            
            {/* 1. Bid Panel (Active status) */}
            {listing.status === "active" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-150">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">Current High Bid</span>
                    <span className="text-xl sm:text-2xl font-display font-extrabold text-gray-900">
                      KES {listing.currentBid.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-orange-50 px-2.5 py-1 rounded-lg text-center border border-orange-100">
                    <span className="text-sm font-bold font-display text-brand-primary">{listing.bidsCount}</span>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Placed</p>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center justify-between px-1">
                  <span>Starting Bid: KES {listing.startingBid.toLocaleString()}</span>
                  <span>Reserve MET: {listing.currentBid >= listing.reservePrice ? "✅ Yes" : "❌ No"}</span>
                </div>

                <form onSubmit={handlePlaceBid} className="space-y-3 mt-4">
                  <div>
                    <label className="text-xs font-bold text-gray-750 block mb-1">Your Bid Price Proposal (KES)</label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 font-bold text-xs">KES</span>
                      </div>
                      <input
                        type="number"
                        value={bidValue}
                        onChange={(e) => setBidValue(e.target.value)}
                        placeholder={(listing.currentBid + 1000).toString()}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-xs font-semibold outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-750 block mb-1">Your Proposed Delivery / Pickup Location</label>
                    <input
                      type="text"
                      value={bidLocation}
                      onChange={(e) => setBidLocation(e.target.value)}
                      placeholder="e.g. Kilimani, Nairobi or Westlands"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-xs font-semibold outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-750 block mb-1">Other Terms, Needs or Special Requests</label>
                    <textarea
                      value={bidNotes}
                      onChange={(e) => setBidNotes(e.target.value)}
                      placeholder="e.g. Can pick up tomorrow; please ensure original accessories are included."
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-xs font-semibold outline-hidden resize-none"
                    />
                  </div>

                  {/* Auto-Bid Settings */}
                  <div className="bg-orange-50/40 p-3 rounded-xl border border-orange-100 space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-orange-950 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAutoBid}
                        onChange={(e) => setIsAutoBid(e.target.checked)}
                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-400 focus:ring-opacity-25"
                      />
                      <span>Enable Secure Auto-Bid (Proxy Bidding)</span>
                    </label>

                    {isAutoBid && (
                      <div className="space-y-1 sm:space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between items-center text-[10px] text-orange-850">
                          <span>Max Auto-Bid Budget (KES)</span>
                          <span className="font-mono">Increment: +KES {(listing.minIncrement || 500).toLocaleString()}</span>
                        </div>
                        <div className="relative rounded-lg shadow-3xs">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-bold text-xs">KES</span>
                          </div>
                          <input
                            type="number"
                            value={autoBidLimit}
                            onChange={(e) => setAutoBidLimit(e.target.value)}
                            placeholder={(listing.currentBid + (listing.minIncrement || 500) * 3).toString()}
                            className="w-full pl-12 pr-4 py-2 bg-white border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-lg text-xs font-semibold outline-hidden"
                          />
                        </div>
                        <p className="text-[9px] text-gray-400 leading-normal">
                          The Peach escrow proxy engine will automatically match lower competing bids by raising your offer by KES {(listing.minIncrement || 500).toLocaleString()} increments up to your maximum bid ceiling.
                        </p>
                      </div>
                    )}
                  </div>

                  {bidError && <p className="text-[11px] text-red-600 font-semibold">{bidError}</p>}
                  {bidSuccess && <p className="text-[11px] text-[#2B7A1C] font-semibold flex items-center gap-1">✅ Bid offer sent! Seller notified to review your bid.</p>}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gray-900 hover:bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Custom Bid Proposal
                  </button>
                </form>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 flex gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-safaricom-green shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-900 uppercase">100% Escrow Protection</h4>
                    <p className="text-[10px] text-emerald-800 leading-snug">
                      Your money is safe on Peach. Placing a bid does not charge you. Once won, funds are securely held until delivery confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Checkout Panel (Completed state & winner is User) */}
            {listing.status === "completed" && isUserWinner && listing.escrowStatus === "pending_payment" && (
              <div className="space-y-4">
                <div className="bg-emerald-600 text-white p-4 rounded-xl text-center">
                  <Award className="w-8 h-8 mx-auto text-amber-300 animate-bounce" />
                  <h3 className="text-sm font-display font-bold uppercase mt-1.5 tracking-wide">Congratulation, You Won!</h3>
                  <p className="text-xs text-emerald-100 mt-1">
                    Your highest bid of <strong className="text-white">KES {listing.currentBid.toLocaleString()}</strong> has been awarded to purchase this listing.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest border-b pb-1">Secure Delivery & Checkout</h4>
                  
                  {/* Delivery Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">1. Select Courier Option</label>
                    
                    <div 
                      onClick={() => handleDeliveryOptionChange("Peach Smart Express", 350)}
                      className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                        deliveryOption === "Peach Smart Express"
                          ? "bg-orange-50 border-[#f97316] ring-1 ring-orange-500/10"
                          : "bg-white border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-brand-primary" /> Peach Smart Express
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Assigned boda boda rider. Delivered within 3-4 hours.</p>
                      </div>
                      <strong className="text-xs text-gray-700">KES 350</strong>
                    </div>

                    <div 
                      onClick={() => handleDeliveryOptionChange("Boda-Boda Eco Pickups", 180)}
                      className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                        deliveryOption === "Boda-Boda Eco Pickups"
                          ? "bg-orange-50 border-[#f97316] ring-1 ring-orange-500/10"
                          : "bg-white border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-blue-500" /> Safe boda courier
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Standard bike pickup. Delivered same day in transit.</p>
                      </div>
                      <strong className="text-xs text-gray-700">KES 180</strong>
                    </div>

                    <div 
                      onClick={() => handleDeliveryOptionChange("Kenya G4S Insured Delivery", 650)}
                      className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                        deliveryOption === "Kenya G4S Insured Delivery"
                          ? "bg-orange-50 border-[#f97316] ring-1 ring-orange-500/10"
                          : "bg-white border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-safaricom-green" /> Premium Insured logistics
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Secured country-wide delivery for fragile electronics.</p>
                      </div>
                      <strong className="text-xs text-gray-700">KES 650</strong>
                    </div>
                  </div>

                  {/* Delivery Location Post Address Input */}
                  <div className="space-y-1 mt-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">2. Physical Post Location</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. GPO Box 405, Nairobi, Apartment 4B Westlands"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:border-brand-primary"
                    />
                  </div>

                  {/* Safaricom Phone input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">3. Safaricom M-Pesa Mobile Number</label>
                    <input
                      type="text"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="0712345678"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium font-mono outline-hidden focus:border-safaricom-green focus:border"
                    />
                  </div>

                  {mpesaError && <p className="text-[10px] text-red-600 font-semibold">{mpesaError}</p>}

                  {/* Final calculations layout */}
                  <div className="bg-white rounded-xl p-3 border border-gray-150 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Winning Bid:</span>
                      <strong className="text-gray-700">KES {listing.currentBid.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Escrow Security Fee (1.5%):</span>
                      <strong className="text-safaricom-green">KES {Math.max(250, Math.floor(listing.currentBid * 0.015)).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Delivery Fee:</span>
                      <strong className="text-gray-700 font-mono">KES {deliveryFee.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-t border-dashed pt-1.5 mt-1 text-sm font-bold">
                      <span className="text-gray-950 font-display">Total to Pay:</span>
                      <span className="text-brand-primary">
                        KES {(listing.currentBid + Math.max(250, Math.floor(listing.currentBid * 0.015)) + deliveryFee).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutInit}
                    className="w-full py-3 bg-[#2B7A1C] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png" 
                      alt="M-pesa" 
                      className="h-4 object-contain brightness-0 invert"
                    />
                    Initiate Escrow payment
                  </button>
                </div>
              </div>
            )}

            {/* 3. Escrow Tracker Panel (Once funds are deposited, tracking sequence) */}
            {listing.status === "completed" && listing.escrowStatus !== "pending_payment" && (
              <div className="space-y-5">
                <div className="bg-gray-900 text-white rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex gap-1 items-center">
                    <Landmark className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Secure Escrow Protection</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block font-sans">Escrow Locked Funds</span>
                    <strong className="text-xl font-display text-white">KES {listing.currentBid.toLocaleString()}</strong>
                    <div className="text-[10px] text-gray-300 font-mono mt-1.5 flex flex-wrap gap-x-2">
                      <span>Receipt: <strong className="text-emerald-400">{listing.mpesaReceipt || "MOCK9210B"}</strong></span>
                      <span>Tracker ID: <strong className="text-blue-400">{listing.trackingCode || "BK-COU-819"}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Node Chain */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Delivery & Payout Status</h4>

                  <div className="space-y-3">
                    {/* Step 1: Secure */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 flex items-center justify-center text-white p-1 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="w-0.5 h-10 bg-emerald-500"></div>
                      </div>
                      <div className="pt-0.5">
                        <h5 className="text-xs font-bold text-gray-800">Funds Secured in Deposit Vault</h5>
                        <p className="text-[10px] text-gray-400">Daraja API push approved. Held under escrow guard.</p>
                      </div>
                    </div>

                    {/* Step 2: Courier in-transit */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center p-1 font-mono text-[10px] font-bold ${
                          ["shipped", "delivered", "funds_released"].includes(listing.escrowStatus)
                            ? "bg-emerald-500 text-white"
                            : "bg-blue-100 text-blue-600 border border-blue-200 animate-pulse"
                        }`}>
                          {["shipped", "delivered", "funds_released"].includes(listing.escrowStatus) ? <Check className="w-3.5 h-3.5" /> : "2"}
                        </div>
                        <div className={`w-0.5 h-10 ${
                          ["delivered", "funds_released"].includes(listing.escrowStatus) ? "bg-emerald-500" : "bg-gray-200"
                        }`}></div>
                      </div>
                      <div className="pt-0.5">
                        <h5 className="text-xs font-bold text-gray-800">Dispatch Logistics In Transit</h5>
                        <p className="text-[10px] text-gray-400">Location: {listing.location} to {listing.deliveryAddress}</p>
                        
                        {/* Simulation trigger: Dispatch */}
                        {listing.escrowStatus === "held_in_escrow" && (
                          <button
                            onClick={executeDispatch}
                            className="mt-1.5 px-2.5 py-1 text-[10px] bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition"
                          >
                            Simulate Express Pick-up
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Delivered awaiting release */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center p-1 font-mono text-[10px] font-bold ${
                          ["delivered", "funds_released"].includes(listing.escrowStatus)
                            ? "bg-emerald-500 text-white"
                            : listing.escrowStatus === "shipped"
                            ? "bg-purple-100 text-purple-600 border border-purple-200 animate-pulse"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}>
                          {["delivered", "funds_released"].includes(listing.escrowStatus) ? <Check className="w-3.5 h-3.5" /> : "3"}
                        </div>
                        <div className={`w-0.5 h-10 ${
                          ["funds_released"].includes(listing.escrowStatus) ? "bg-emerald-500" : "bg-gray-200"
                        }`}></div>
                      </div>
                      <div className="pt-0.5">
                        <h5 className="text-xs font-bold text-gray-800">Rider Drop-off Confirmation</h5>
                        <p className="text-[10px] text-gray-400">Buyer physically inspects the item before unlocking escrow state.</p>
                        
                        {/* Simulation trigger: Deliver */}
                        {listing.escrowStatus === "shipped" && (
                          <button
                            onClick={executeRiderDeliveryConfirm}
                            className="mt-1.5 px-2.5 py-1 text-[10px] bg-purple-600 text-white rounded-md font-bold hover:bg-purple-700 transition"
                          >
                            Confirm Secure Drop-Off
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Released payout */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center p-1 font-mono text-[10px] font-bold ${
                          listing.escrowStatus === "funds_released"
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}>
                          {listing.escrowStatus === "funds_released" ? <Check className="w-3.5 h-3.5" /> : "4"}
                        </div>
                      </div>
                      <div className="pt-0.5">
                        <h5 className="text-xs font-bold text-gray-800">Escrow Capital released successfully</h5>
                        <p className="text-[10px] text-gray-400">Funds transferred instantly to seller's Safaricom line.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Final controls to unlock funds or file a dispute */}
                {listing.escrowStatus === "delivered" && (
                  <div className="space-y-2 border-t pt-3 border-gray-100">
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-850 flex gap-1.5">
                      <Info className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Pls confirm that the item is in the expected condition. Releasing funds is irreversible.</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={executeReleaseEscrow}
                        className="flex-1 py-2 px-3 bg-[#2B7A1C] hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Release Funds KES {listing.currentBid.toLocaleString()}
                      </button>
                      <button
                        onClick={executeDispute}
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                      >
                        Flag Issue
                      </button>
                    </div>
                  </div>
                )}

                {listing.escrowStatus === "disputed" && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>Security Arbitration Active</span>
                    </div>
                    <p className="text-[10px] text-red-700 leading-normal">
                      This transaction has been frozen. Funds will remain safely held in our custody vault until a Peach resolution officer checks the physical item matches description.
                    </p>
                  </div>
                )}

                {listing.escrowStatus === "funds_released" && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex gap-2">
                    <ShieldCheck className="w-8 h-8 text-safaricom-green shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold">Deal Securely Finalized</h4>
                      <p className="text-[10px] text-emerald-800 leading-normal">
                        Funds safely released to the seller. Thank you for using Peach - Africa's most secure peer-to-peer auction framework.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 4. Closed state and user is NOT winner */}
            {listing.status === "completed" && !isUserWinner && (
              <div className="space-y-3 text-center py-4">
                <Landmark className="w-8 h-8 mx-auto text-gray-300" />
                <h3 className="text-sm font-display font-bold text-gray-800 uppercase">Auction Closed</h3>
                <p className="text-xs text-gray-500 px-3">
                  This peer-to-peer listing has already been successfully awarded to the highest bidder, <strong className="text-gray-800">{listing.winnerName}</strong>, for KES {listing.currentBid.toLocaleString()}.
                </p>
              </div>
            )}

          </div>

          {/* Bid History Table component */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
            <h3 className="text-xs uppercase font-mono tracking-widest text-gray-500 font-bold flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-primary" />
              Dynamic Bid Proposals ({bidsList.length})
            </h3>

            {awardSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[11px] font-semibold leading-relaxed">
                🎉 {awardSuccessMsg}
              </div>
            )}

            {awardErrorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-[11px] font-semibold leading-relaxed">
                ⚠️ {awardErrorMsg}
              </div>
            )}

            {bidsList.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-3 text-center">No bids placed yet. Be the first to start the auction!</p>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {bidsList.map((bid, index) => {
                  const isOwner = currentUser && (
                    currentUser.id === listing.seller.id || 
                    listing.seller.id === "usr-demo" || 
                    listing.seller.id === "sel-01" || 
                    currentUser.role === "seller"
                  );
                  const isListingActive = listing.status === "active";

                  return (
                    <div 
                      key={bid.id} 
                      className={`p-3 rounded-xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                        index === 0 
                          ? "bg-orange-50/40 border-orange-100" 
                          : "bg-gray-50/70 border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-orange-100 text-[11px] font-bold text-orange-700 flex items-center justify-center uppercase shrink-0 mt-0.5">
                          {bid.bidderName ? bid.bidderName[0] : "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-gray-800 text-[11px] font-bold">
                              {bid.bidderName}
                            </strong>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {bid.location && (
                              <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm inline-flex items-center gap-0.5 border border-blue-100">
                                📍 {bid.location}
                              </span>
                            )}
                          </div>
                          {bid.notes && (
                            <p className="text-[10px] text-gray-500 italic mt-1 bg-white/70 py-1 px-2 rounded-md border border-gray-100">
                              💬 "{bid.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2.5 md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold">Bid Offer</span>
                          <strong className="text-gray-950 font-sans block text-sm font-extrabold text-brand-primary">
                            KES {bid.amount.toLocaleString()}
                          </strong>
                        </div>

                        {/* Award winning bid selector */}
                        {isListingActive && isOwner ? (
                          <button
                            type="button"
                            onClick={() => handleAwardBid(bid.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-subtle"
                            title="Accept and select this bid as the winner"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Accept & Award
                          </button>
                        ) : null}

                        {index === 0 && !isListingActive && (
                          <span className="text-[8px] bg-emerald-100 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold tracking-wider font-mono">
                            Winning Bid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Embedded Mpesa PIN Keypad overlay Prompt */}
      {showMpesaPrompt && (
        <SimulatedMpesaSTK
          amount={listing.currentBid + Math.max(250, Math.floor(listing.currentBid * 0.015)) + deliveryFee}
          phone={mpesaPhone}
          listingTitle={listing.title}
          onPaymentConfirmed={handleMpesaPinApproved}
          onCancel={() => setShowMpesaPrompt(false)}
        />
      )}

    </div>
  );
}
