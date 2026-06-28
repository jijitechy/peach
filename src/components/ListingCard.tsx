import React, { useState, useEffect } from "react";
import { Clock, Tag, MessageSquare, Shield, Star, MapPin, Award, Heart } from "lucide-react";
import { Listing } from "../types";

interface ListingCardProps {
  key?: string | number;
  listing: Listing;
  onClick: () => void;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export default function ListingCard({ listing, onClick, isFavorited, onToggleFavorite }: ListingCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (listing.isAd) {
      setTimeLeft("Featured Campaign");
      setIsExpired(false);
      return;
    }
    if (listing.allowBidding === false) {
      setTimeLeft("Buy Now ⚡");
      setIsExpired(false);
      return;
    }
    const calculateTimeLeft = () => {
      const difference = new Date(listing.endTime).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("Ended");
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 65);

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
  }, [listing.endTime, listing.isAd, listing.allowBidding]);

  const getConditionColor = (cond: string) => {
    switch (cond.toLowerCase()) {
      case "new": return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/25";
      case "like new": return "bg-teal-500/10 text-teal-600 border border-teal-500/25";
      case "good": return "bg-orange-500/10 text-orange-600 border border-orange-500/25";
      default: return "bg-blue-500/10 text-blue-600 border border-blue-500/25";
    }
  };

  const isUserWinner = listing.winnerId === "usr-demo" && isExpired;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group bg-white rounded-2xl border transition-all overflow-hidden relative flex flex-col justify-between ${
        isUserWinner 
          ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg trust-card scale-[1.01]" 
          : "border-gray-100 hover:border-orange-200 hover:shadow-xl shadow-xs"
      }`}
    >
      {/* Visual Header Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        {listing.videoUrl && isHovered ? (
          <video 
            src={listing.videoUrl} 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={listing.imageUrl} 
            alt={listing.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {listing.videoUrl && !isHovered && (
          <div className="absolute inset-0 bg-black/15 flex items-center justify-center transition-opacity hover:opacity-100 pointer-events-none">
            <div className="bg-orange-600/90 text-white rounded-full p-2 animate-pulse shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] font-bold tracking-widest uppercase py-0.5 px-1.5 rounded-md">
              Hover to Play Video Ad
            </span>
          </div>
        )}

        {/* Heart Favorite toggle button overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-500 hover:text-rose-500 p-2 rounded-full shadow-md transition-all active:scale-90 select-none group/heart cursor-pointer"
          title={isFavorited ? "Remove from My Favorites" : "Add to My Favorites"}
        >
          <Heart 
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isFavorited 
                ? "text-rose-500 fill-rose-500 scale-110" 
                : "text-gray-405 group-hover/heart:scale-110"
            }`} 
          />
        </button>
        
        {/* Badge status overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {listing.isAd ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-xs uppercase">
              {listing.videoUrl ? "🎥 Video Sponsor" : "Sponsor Ad"}
            </span>
          ) : (
            <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full ${getConditionColor(listing.condition)}`}>
              {listing.condition}
            </span>
          )}
          <span className="bg-gray-900/75 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> {listing.category}
          </span>
        </div>

        {/* Live timer overlay */}
        <div className="absolute bottom-3 right-3">
          <span className={`text-[10px] sm:text-xs font-mono font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border ${
            isExpired 
              ? "bg-red-50 text-red-650 border-red-200" 
              : listing.allowBidding === false
              ? "bg-[#2563eb] text-white border-blue-500"
              : "bg-white text-gray-800 border-gray-100"
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isExpired ? "text-red-500 animate-pulse" : listing.allowBidding === false ? "text-white" : "text-brand-primary"}`} />
            {timeLeft}
          </span>
        </div>

        {/* Award Banner overlay */}
        {isUserWinner && (
          <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-center">
            <Award className="w-9 h-9 text-amber-400 mb-1" />
            <span className="text-white text-sm font-display font-semibold">You Won this Deal!</span>
            <span className="text-emerald-250 text-[10px] max-w-[200px] mt-0.5 leading-tight font-sans">
              Peach security Escrow payment is active for checkout.
            </span>
          </div>
        )}
      </div>

      {/* Description Metrics */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
            <MapPin className="w-3 h-3 text-brand-primary" /> {listing.location}
          </div>
          <h3 className="font-display font-semibold text-gray-800 mt-1 leading-snug group-hover:text-brand-primary transition-colors text-sm sm:text-base line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {listing.isAd ? (
          <div className="mt-4 pt-3 border-t border-gray-50 text-left">
            <span className="text-[10px] font-sans text-orange-600 block uppercase tracking-wider font-extrabold">{listing.adTagline || "Sponsored Corporate Deal"}</span>
            <span className="text-xs text-gray-400">{listing.videoUrl ? "🎥 Premium Video Brand Campaign Deal." : "Exclusive campaign hosted safely on Peach. Click for details."}</span>
          </div>
        ) : listing.allowBidding === false ? (
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sans text-gray-400 block uppercase tracking-wider font-semibold">Immediate Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-sans font-extrabold text-[#2563eb]">KES</span>
                <span className="text-base sm:text-lg font-display font-bold text-gray-900">{listing.startingBid.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-blue-700 inline-block uppercase">
                ⚡ Buy Instantly
              </span>
              <span className="text-[9px] text-[#2B7A1C] block mt-1 font-bold">
                100% Escrow safe
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-sans text-gray-400 block uppercase tracking-wider font-semibold">Highest Bid</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-sans font-extrabold text-[#f97316]">KES</span>
                <span className="text-base sm:text-lg font-display font-bold text-gray-900">{listing.currentBid.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 inline-block uppercase">
                {listing.bidsCount} {listing.bidsCount === 1 ? 'Bid' : 'Bids'}
              </span>
              <span className="text-[9px] text-gray-400 block mt-1 font-sans">
                Reserve: KES {listing.reservePrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Action Controls */}
      <div className="px-4 pb-4">
        {listing.isAd ? (
          <button 
            onClick={onClick}
            className="w-full py-2.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{listing.videoUrl ? "🎥 Watch Promo Video Campaign" : "Learn More & Explore Deal"}</span>
          </button>
        ) : isUserWinner ? (
          <button 
            onClick={onClick}
            className="w-full py-2.5 bg-[#2B7A1C] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-amber-300" />
            Proceed to Escrow Checkout
          </button>
        ) : listing.allowBidding === false ? (
          <button 
            onClick={onClick}
            className="w-full py-2.5 text-xs font-bold rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointerActive"
          >
            <Shield className="w-3.5 h-3.5 text-blue-200" />
            Buy Directly with M-Pesa
          </button>
        ) : (
          <button 
            onClick={onClick}
            className={`w-full py-2.5 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isExpired
                ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                : "bg-gray-900 hover:bg-brand-primary text-white"
            }`}
          >
            {isExpired ? "View Auction Log" : "Place Bid / Valuation"}
          </button>
        )}
      </div>

      {/* Seller Mini Profile footer */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <img src={listing.seller.avatar} alt={listing.seller.name} className="w-4.5 h-4.5 rounded-full object-cover" />
          <span className="font-medium truncate max-w-[100px]">{listing.seller.name}</span>
        </div>
        <div className="flex items-center gap-0.5 font-semibold text-gray-700">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {listing.seller.rating}
        </div>
      </div>
    </div>
  );
}
