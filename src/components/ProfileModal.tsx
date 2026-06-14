import React from "react";
import { motion } from "motion/react";
import { X, User, Phone, Shield, Coins, Heart, Trash2, ArrowUpRight, Award, MapPin } from "lucide-react";
import { UserState, Listing } from "../types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserState | null;
  listings: Listing[];
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  onOpenDeposit: () => void;
  onSelectListing: (id: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  listings,
  watchlist,
  onToggleWatchlist,
  onOpenDeposit,
  onSelectListing
}: ProfileModalProps) {
  if (!isOpen) return null;

  // Resolve actually favorited listing details
  const favoritedListings = listings.filter((l) => watchlist.includes(l.id));

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
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-display font-bold uppercase tracking-wider">My Peach Profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer border-0 outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {currentUser ? (
            <div className="space-y-6">
              {/* Profile Details Card */}
              <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full border-2 border-orange-200 shadow-sm"
                />
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-display font-bold text-gray-950 truncate block">
                      {currentUser.name}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm capitalize">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" /> {currentUser.phone}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    ID: {currentUser.id}
                  </p>
                </div>
              </div>

              {/* Wallet and Trust stats */}
              <div className="bg-[#44B92C]/10 border border-[#44B92C]/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#44B92C] text-white rounded-xl">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                      Secure Escrow Balance
                    </span>
                    <span className="text-base font-mono font-extrabold text-gray-900 block">
                      KES {currentUser.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="px-3 py-1.5 bg-[#44B92C] hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Deposit
                </button>
              </div>

              {/* My Favorites (Watchlist) section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      My Favorites ({favoritedListings.length})
                    </h4>
                  </div>
                  {favoritedListings.length > 0 && (
                    <span className="text-[10px] font-mono text-gray-400">
                      Instantly Saved
                    </span>
                  )}
                </div>

                {favoritedListings.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed text-gray-400 p-4">
                    <Heart className="w-7 h-7 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-semibold text-gray-600">No favorited items yet.</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                      Tap the heart icon on any product or service listing to keep track of live auctions and escrow opportunities here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                    {favoritedListings.map((l) => (
                      <div
                        key={l.id}
                        className="p-2 bg-white rounded-xl border border-gray-100 hover:border-orange-200 transition-all flex gap-3 relative group"
                      >
                        {/* Miniature product image */}
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover bg-gray-50 shrink-0"
                        />

                        {/* Text descriptions */}
                        <div className="flex-1 min-w-0 text-left self-center">
                          <h5 className="font-semibold text-xs text-gray-900 truncate block">
                            {l.title}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-450">
                            <span className="bg-orange-50 font-semibold px-1 rounded-sm text-[#f97316]">
                              {l.condition}
                            </span>
                            <span>&bull;</span>
                            <span className="text-gray-500 font-bold">
                              KES {l.currentBid.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Quick action triggers */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectListing(l.id);
                              onClose();
                            }}
                            className="p-1.5 hover:bg-orange-50 hover:text-[#f97316] text-gray-400 rounded-lg transition-colors cursor-pointer"
                            title="Go to Live Details"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleWatchlist(l.id)}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-500 text-gray-400 rounded-lg transition-colors cursor-pointer"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-450 space-y-4">
              <Shield className="w-10 h-10 text-gray-300 mx-auto" />
              <div>
                <p className="text-sm font-bold text-gray-700">No Profile Session Active</p>
                <p className="text-xs text-gray-450 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  Please click the "Sign Up & Bid" button on the navigation bar to sign in, configure your Daraja M-Pesa phone number, and unlock favorites tracking.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner presentation line */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center select-none">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">
            PEACH ESCROW TRUST ASSURED SECURITY
          </span>
        </div>
      </motion.div>
    </div>
  );
}
