import React, { useState } from "react";
import { motion } from "motion/react";
import { X, ShoppingCart, ArrowUpRight, ShieldCheck, Truck, Clock, Coins, CheckCircle, Info } from "lucide-react";
import { UserState, Listing } from "../types";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserState | null;
  listings: Listing[];
  onSelectListing: (id: string) => void;
}

export default function CartModal({
  isOpen,
  onClose,
  currentUser,
  listings,
  onSelectListing
}: CartModalProps) {
  if (!isOpen) return null;

  const [activeCartTab, setActiveCartTab] = useState<"won" | "bids">("won");

  // Determine items won by user
  const wonListings = listings.filter(
    (l) => l.winnerId === currentUser?.id && l.status === "completed"
  );

  // Determine current active listings where user is leading/participating in bids
  // In our simulated state, the bidder "You (Mock Investor)" has usr-demo or bidded on them.
  // Let's treat bidder "You (Mock Investor)" or current user's bids.
  const activeBidsListings = listings.filter(
    (l) => l.status === "active" && l.winnerId === currentUser?.id
  );

  const getStatusBadge = (listing: Listing) => {
    switch (listing.escrowStatus) {
      case "pending_payment":
        return (
          <span className="bg-amber-100 text-amber-850 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Awaiting M-Pesa Pay
          </span>
        );
      case "held_in_escrow":
        return (
          <span className="bg-[#44B92C]/10 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Held in Escrow
          </span>
        );
      case "shipped":
        return (
          <span className="bg-sky-100 text-sky-850 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3 text-sky-600" />
            Shipped (In Transit)
          </span>
        );
      case "delivered":
        return (
          <span className="bg-emerald-100 text-emerald-850 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case "funds_released":
        return (
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Completed
          </span>
        );
      case "disputed":
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ⚠️ Disputed
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Escrow Status: {listing.escrowStatus}
          </span>
        );
    }
  };

  const currentTabListings = activeCartTab === "won" ? wonListings : activeBidsListings;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-end z-50">
      {/* Dark Backdrop click trigger */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Slide Out Panel Drawer */}
      <motion.div
        initial={{ x: "100%", opacity: 0.95 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10"
      >
        {/* Header Block */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white select-none">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-display font-bold uppercase tracking-wider">My Escrow Cart</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer border-0 outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle buttons */}
        <div className="bg-gray-50 border-b border-gray-100 p-2 flex gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveCartTab("won")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCartTab === "won"
                ? "bg-white text-gray-900 shadow-xs border border-gray-150"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Won {wonListings.length > 0 && `(${wonListings.length})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCartTab("bids")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCartTab === "bids"
                ? "bg-white text-gray-900 shadow-xs border border-gray-150"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Bidding Count {activeBidsListings.length > 0 && `(${activeBidsListings.length})`}</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5">
          {currentUser ? (
            <div className="space-y-4">
              {currentTabListings.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/40 rounded-2xl border border-dashed border-gray-200 text-gray-400 p-5 mt-2">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-semibold text-gray-750">
                    {activeCartTab === "won" ? "No won auctions yet!" : "No active bids right now."}
                  </p>
                  <p className="text-[10px] text-gray-450 mt-1 max-w-xs mx-auto leading-normal">
                    {activeCartTab === "won"
                      ? "When an auction timer expires and you are the highest bidder, the item is auto-awarded to you and appears here in your secured M-Pesa Cart."
                      : "Place a bid on any active item in the marketplace feed. You can review your leading positions and real-time outbids right here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTabListings.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        onSelectListing(l.id);
                        onClose();
                      }}
                      className="p-3 bg-white rounded-xl border border-gray-150 hover:border-orange-200 shadow-2xs hover:shadow-sm transition-all flex gap-3 text-left cursor-pointer group relative"
                    >
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 shrink-0"
                      />

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#f97316] transition-colors truncate block">
                            {l.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                            KES {l.currentBid.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2">
                          {getStatusBadge(l)}
                          <span className="text-[9px] text-[#f97316] font-bold flex items-center gap-0.5 group-hover:underline">
                            Open Details <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 space-y-4">
              <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto" />
              <div>
                <p className="text-xs font-bold text-gray-750">Secure Cart Unavailable</p>
                <p className="text-[10px] text-gray-450 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  Please sign up or log in to track your active won auctions, manage secure escrow payments through Daraja M-Pesa STK, and track shipping.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Escrow Shield Trust Seal */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-emerald-700 select-none">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-wider font-extrabold text-emerald-800 uppercase">
            Safaricom M-Pesa Escrow Lock Active
          </span>
        </div>
      </motion.div>
    </div>
  );
}
