import React from 'react';
import { Star, MapPin, Package, MessageCircle, Share2, ShieldCheck, Heart } from 'lucide-react';
import { Listing, Seller } from '../types';
import ListingCard from './ListingCard';

interface MerchantStorefrontProps {
  seller: Seller;
  listings: Listing[];
  onListingClick: (id: string) => void;
  onBack: () => void;
}

export default function MerchantStorefront({ seller, listings, onListingClick, onBack }: MerchantStorefrontProps) {
  // Simple stats for mockup
  const activeListings = listings.filter(l => l.status === 'active');
  
  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      {/* Cover Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-orange-400 to-pink-500 relative">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-black/50 transition"
        >
          &larr; Back
        </button>
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-6 md:items-end">
          
          <div className="flex gap-4 items-end">
            <div className="w-24 h-24 rounded-2xl bg-orange-100 border-4 border-white shadow-md flex items-center justify-center text-4xl font-black text-orange-500 overflow-hidden shrink-0">
              {seller.avatar ? <img src={seller.avatar} alt="avatar" className="w-full h-full object-cover"/> : seller.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{seller.name}</h1>
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/> {seller.rating}/5</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Nairobi, KE</span>
              </div>
            </div>
          </div>

          <div className="flex-1"></div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition">
              <Share2 className="w-4 h-4"/> Share Store
            </button>
            <button className="flex-1 md:flex-none bg-[#25D366] hover:bg-[#1ebd5a] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition">
              <MessageCircle className="w-4 h-4"/> WhatsApp
            </button>
            <button className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition">
              <Heart className="w-4 h-4"/> Follow
            </button>
          </div>

        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mt-8 border-b border-gray-100 pb-4">
          <div className="text-center">
            <span className="block text-xl font-black text-gray-900">{activeListings.length}</span>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Products</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-black text-gray-900">4.8</span>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Reviews</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-black text-gray-900">126</span>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Followers</span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500"/> Store Inventory
          </h2>
          
          {activeListings.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-sm font-bold text-gray-500">No active products available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeListings.map(listing => (
                <ListingCard 
                  key={listing.id}
                  listing={listing}
                  onClick={() => onListingClick(listing.id)}
                  isFavorited={false}
                  onToggleFavorite={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
