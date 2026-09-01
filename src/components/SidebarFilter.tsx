import React from 'react';
import { 
  Laptop, 
  Car, 
  Shirt, 
  Armchair, 
  Gift, 
  Music, 
  Bike, 
  Gem, 
  Layers, 
  RotateCcw, 
  DollarSign, 
  SlidersHorizontal,
  ArrowUpDown,
  Compass
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCategory, ListingCondition } from '../types';

const CATEGORY_ITEMS: { label: ListingCategory | 'All'; icon: React.FC<{ className?: string }> }[] = [
  { label: 'All', icon: Layers },
  { label: 'Electronics', icon: Laptop },
  { label: 'Vehicles', icon: Car },
  { label: 'Apparel', icon: Shirt },
  { label: 'Home Goods', icon: Armchair },
  { label: 'Free Stuff', icon: Gift },
  { label: 'Musical Instruments', icon: Music },
  { label: 'Sports & Outdoors', icon: Bike },
  { label: 'Collectibles', icon: Gem },
];

const CONDITION_ITEMS: (ListingCondition | 'All')[] = ['All', 'New', 'Like New', 'Good', 'Fair'];

const PRICE_PRESETS = [
  { label: 'Under $50', min: '', max: '50' },
  { label: '$50 - $200', min: '50', max: '200' },
  { label: '$200 - $1,000', min: '200', max: '1000' },
  { label: '$1,000+', min: '1000', max: '' },
];

export const SidebarFilter: React.FC = () => {
  const { filters, setFilters, resetFilters, listings, userLocation } = useMarketplace();

  // Calculate count per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: listings.length };
    listings.forEach(l => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return counts;
  }, [listings]);

  const handleCategoryClick = (cat: ListingCategory | 'All') => {
    setFilters(prev => ({ ...prev, category: cat }));
  };

  const handleConditionClick = (cond: ListingCondition | 'All') => {
    setFilters(prev => ({ ...prev, condition: cond }));
  };

  const isFiltered = 
    filters.query !== '' || 
    filters.category !== 'All' || 
    filters.minPrice !== '' || 
    filters.maxPrice !== '' || 
    filters.condition !== 'All' ||
    filters.status !== 'active';

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#BE1E2F]" />
          <h2 className="text-sm font-['Hammersmith_One'] uppercase tracking-wider text-white">Filters</h2>
        </div>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-mono text-[#BE1E2F] hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Sort By Selector */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#BE1E2F]" />
          <span>Sort Feed By</span>
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          className="w-full rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3 py-2 text-xs text-white focus:border-[#BE1E2F] focus:outline-none"
        >
          <option value="newest">Newest Listings First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="distance">Distance: Nearest First</option>
          <option value="popular">Most Popular & Saved</option>
        </select>
      </div>

      {/* Categories Tree */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center justify-between">
          <span>Categories</span>
          <span className="text-[10px] text-white/40">{listings.length} Items</span>
        </label>
        <div className="space-y-1">
          {CATEGORY_ITEMS.map(({ label, icon: Icon }) => {
            const isSelected = filters.category === label;
            const count = categoryCounts[label] || 0;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleCategoryClick(label)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition-all ${
                  isSelected
                    ? 'bg-[#BE1E2F] text-white font-medium shadow-sm shadow-[#BE1E2F]/20'
                    : 'text-white/80 hover:bg-[#2b2b2b] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-[#BE1E2F]'}`} />
                  <span className="truncate">{label}</span>
                </div>
                <span className={`font-mono text-[11px] ${isSelected ? 'text-white/90' : 'text-white/40'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter (DM Mono) */}
      <div className="border-t border-[#3a3a3a] pt-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2.5 flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-[#BE1E2F]" />
          <span>Price Range ($)</span>
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-[10px] font-mono text-white/40 mb-1">MIN PRICE</span>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs text-white/40 font-mono">$</span>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full rounded-md border border-[#3a3a3a] bg-[#2b2b2b] py-1.5 pl-6 pr-2 text-xs font-mono text-white placeholder-white/30 focus:border-[#BE1E2F] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <span className="block text-[10px] font-mono text-white/40 mb-1">MAX PRICE</span>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs text-white/40 font-mono">$</span>
              <input
                type="number"
                min={0}
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full rounded-md border border-[#3a3a3a] bg-[#2b2b2b] py-1.5 pl-6 pr-2 text-xs font-mono text-white placeholder-white/30 focus:border-[#BE1E2F] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Price Range Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => {
            const isSelected = filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }));
                  } else {
                    setFilters(prev => ({ ...prev, minPrice: preset.min, maxPrice: preset.max }));
                  }
                }}
                className={`rounded px-2 py-1 text-[10px] font-mono transition-all ${
                  isSelected
                    ? 'bg-[#BE1E2F] text-white'
                    : 'border border-[#3a3a3a] bg-[#222] text-white/70 hover:border-[#666] hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distance / Radius Filter */}
      <div className="border-t border-[#3a3a3a] pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-[#BE1E2F]" />
            <span>Radius Limit</span>
          </label>
          <span className="text-xs font-mono text-[#BE1E2F] font-semibold">
            ≤ {filters.radiusMiles} mi
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={100}
          value={filters.radiusMiles}
          onChange={(e) => setFilters(prev => ({ ...prev, radiusMiles: parseInt(e.target.value, 10) }))}
          className="w-full accent-[#BE1E2F] h-1.5 bg-[#3a3a3a] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-mono text-white/40 mt-1">
          <span>2 mi</span>
          <span>Around {userLocation.city}</span>
          <span>100 mi</span>
        </div>
      </div>

      {/* Condition Filter */}
      <div className="border-t border-[#3a3a3a] pt-4">
        <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
          Condition
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CONDITION_ITEMS.map((cond) => {
            const isSelected = filters.condition === cond;
            return (
              <button
                key={cond}
                type="button"
                onClick={() => handleConditionClick(cond)}
                className={`rounded-md px-2.5 py-1 text-xs transition-all ${
                  isSelected
                    ? 'bg-[#BE1E2F] text-white font-medium shadow-sm shadow-[#BE1E2F]/20'
                    : 'border border-[#3a3a3a] bg-[#2b2b2b] text-white/70 hover:border-[#666] hover:text-white'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free Stuff Quick Toggle */}
      <div className="border-t border-[#3a3a3a] pt-4">
        <button
          type="button"
          onClick={() => {
            if (filters.category === 'Free Stuff') {
              setFilters(prev => ({ ...prev, category: 'All' }));
            } else {
              setFilters(prev => ({ ...prev, category: 'Free Stuff' }));
            }
          }}
          className={`flex w-full items-center justify-between rounded-md border p-2.5 text-xs transition-all ${
            filters.category === 'Free Stuff'
              ? 'border-[#BE1E2F] bg-[#BE1E2F]/15 text-white'
              : 'border-[#3a3a3a] bg-[#222222] text-white/80 hover:border-[#555]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">Free Items Only</span>
          </div>
          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 font-bold">
            $0.00
          </span>
        </button>
      </div>

    </aside>
  );
};
