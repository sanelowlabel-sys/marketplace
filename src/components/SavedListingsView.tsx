import React from 'react';
import { Heart, Trash2, ArrowLeft, MessageSquare, ShoppingBag } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCard } from './ListingCard';

export const SavedListingsView: React.FC = () => {
  const { savedListingIds, listings, setCurrentView, startOrGetConversation } = useMarketplace();

  const savedListings = listings.filter(l => savedListingIds.includes(l.id));

  const totalValue = savedListings.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="border-b border-[#3a3a3a] pb-4 mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => setCurrentView('feed')}
            className="flex items-center gap-1 text-xs font-mono text-[#BE1E2F] hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Discovery Feed</span>
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Heart className="h-6 w-6 text-[#BE1E2F] fill-[#BE1E2F]" />
            <span>Saved Wishlist ({savedListings.length})</span>
          </h1>
        </div>

        {savedListings.length > 0 && (
          <div className="text-right">
            <span className="block text-[11px] font-mono uppercase text-white/50">Total Wishlist Value</span>
            <span className="font-['DM_Mono'] text-xl font-bold text-white">${totalValue.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Grid or Empty state */}
      {savedListings.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto my-12 space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a] text-white/40 mx-auto">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Saved Items Yet</h3>
          <p className="text-xs text-white/60">
            Click the heart icon on any marketplace listing card to bookmark it for quick access and price tracking.
          </p>
          <button
            onClick={() => setCurrentView('feed')}
            className="btn px-5 py-2 text-xs font-bold rounded-md inline-flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Explore Marketplace</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {savedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

    </div>
  );
};
