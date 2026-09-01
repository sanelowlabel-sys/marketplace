import React from 'react';
import { 
  MapPin, 
  Sparkles, 
  Layers, 
  PlusCircle, 
  Search, 
  RotateCcw, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { SidebarFilter } from './SidebarFilter';
import { ListingCard } from './ListingCard';
import { ListingCategory } from '../types';

const POPULAR_CATEGORY_CHIPS: { label: ListingCategory | 'All'; icon: string }[] = [
  { label: 'All', icon: '🔥' },
  { label: 'Electronics', icon: '💻' },
  { label: 'Vehicles', icon: '🚗' },
  { label: 'Apparel', icon: '🧥' },
  { label: 'Home Goods', icon: '🛋️' },
  { label: 'Free Stuff', icon: '🎁' },
  { label: 'Musical Instruments', icon: '🎸' },
  { label: 'Sports & Outdoors', icon: '🚴' },
  { label: 'Collectibles', icon: '💎' },
];

export const BrowseFeed: React.FC = () => {
  const { 
    filteredListings, 
    filters, 
    setFilters, 
    resetFilters, 
    userLocation, 
    setIsLocationModalOpen,
    setCurrentView 
  } = useMarketplace();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Category Pills Slider (Top Bar) */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {POPULAR_CATEGORY_CHIPS.map((chip) => {
          const isSelected = filters.category === chip.label;
          return (
            <button
              key={chip.label}
              onClick={() => setFilters(prev => ({ ...prev, category: chip.label }))}
              className={`flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#BE1E2F] text-white shadow-md shadow-[#BE1E2F]/30 scale-105'
                  : 'border border-[#3a3a3a] bg-[#2b2b2b] text-white/80 hover:border-[#666] hover:text-white'
              }`}
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid & Filter Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters */}
        <SidebarFilter />

        {/* Product Feed Grid */}
        <main className="flex-1 w-full space-y-4">
          
          {/* Feed Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#3a3a3a] bg-[#222222] px-4 py-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-white">
                {filteredListings.length} {filteredListings.length === 1 ? 'Listing' : 'Listings'}
              </span>
              <span className="text-white/40">•</span>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1 text-[#BE1E2F] hover:text-white transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Within {filters.radiusMiles} mi of {userLocation.city}</span>
              </button>
            </div>

            {/* Active search query tag */}
            {filters.query && (
              <div className="flex items-center gap-1.5 rounded bg-[#2b2b2b] px-2.5 py-1 text-[11px] font-mono text-white/80 border border-[#3a3a3a]">
                <span>Query: "{filters.query}"</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                  className="text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="card p-12 text-center space-y-4 my-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a] text-white/40 mx-auto">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No items found matching your filters</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Try widening your search radius, removing price bounds, or clearing specific keyword filters.
              </p>
              <button
                onClick={resetFilters}
                className="btn px-4 py-2 text-xs font-bold rounded-md inline-flex items-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};
