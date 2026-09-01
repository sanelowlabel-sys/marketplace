import React from 'react';
import { Heart, MapPin, Clock, ShieldCheck, Eye } from 'lucide-react';
import { Listing } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { toggleSaveListing, isListingSaved, viewListingDetail } = useMarketplace();
  const saved = isListingSaved(listing.id);

  // Format relative time
  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const primaryImage = listing.images[0]?.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';

  return (
    <div 
      onClick={() => viewListingDetail(listing.id)}
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#3a3a3a] bg-[#2b2b2b] transition-all duration-200 hover:-translate-y-1 hover:border-[#BE1E2F]/60 hover:shadow-xl hover:shadow-black/40 flex flex-col"
    >
      {/* Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1f1f1f]">
        <img
          src={primaryImage}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-[#1a1a1a]/90 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-white/90 border border-[#3a3a3a] backdrop-blur-sm">
              {listing.condition}
            </span>
            {listing.status === 'sold' && (
              <span className="rounded bg-rose-900/90 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-white border border-rose-600 backdrop-blur-sm">
                SOLD
              </span>
            )}
            {listing.status === 'pending' && (
              <span className="rounded bg-amber-900/90 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-amber-200 border border-amber-600 backdrop-blur-sm">
                PENDING
              </span>
            )}
          </div>

          {/* Bookmark Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveListing(listing.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a]/80 text-white/80 border border-[#3a3a3a] backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            title={saved ? 'Remove from Saved' : 'Save to Wishlist'}
          >
            <Heart className={`h-4 w-4 transition-colors ${saved ? 'text-[#BE1E2F] fill-[#BE1E2F]' : 'text-white'}`} />
          </button>
        </div>

        {/* Category Pill on bottom image */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-[10px] text-white/75 font-mono">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
            {listing.category}
          </span>
          {listing.images.length > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
              +{listing.images.length - 1} photos
            </span>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
        
        {/* Title & Price */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-['DM_Mono'] text-lg font-bold text-white tracking-tight">
              {listing.price === 0 ? (
                <span className="text-emerald-400 font-extrabold">FREE</span>
              ) : (
                `$${listing.price.toLocaleString()}`
              )}
            </span>
            <span className="font-['DM_Mono'] text-[11px] text-white/45 shrink-0 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getRelativeTime(listing.created_at)}
            </span>
          </div>

          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-snug">
            {listing.title}
          </h3>
        </div>

        {/* Location & Seller Footer */}
        <div className="border-t border-[#3a3a3a] pt-2.5 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-[#BE1E2F] shrink-0" />
            <span className="truncate">{listing.location_geojson.city}, {listing.location_geojson.state}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-white/40 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/80" />
            <span>Verified</span>
          </div>
        </div>

      </div>
    </div>
  );
};
