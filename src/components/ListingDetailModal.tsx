import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { InteractiveMap } from './InteractiveMap';

interface ListingDetailModalProps {
  listingId: string;
  onClose: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listingId, onClose }) => {
  const { 
    getListingById, 
    currentUser, 
    toggleSaveListing, 
    isListingSaved, 
    startOrGetConversation,
    sendMessage,
    updateListingStatus,
    deleteListing
  } = useMarketplace();

  const listing = getListingById(listingId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [customOfferAmount, setCustomOfferAmount] = useState('');
  const [quickMessageText, setQuickMessageText] = useState('Hi! Is this item still available?');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!listing) return null;

  const isSaved = isListingSaved(listing.id);
  const isOwner = currentUser.id === listing.seller_id;
  const seller = listing.seller;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessageText.trim()) return;
    const convId = startOrGetConversation(listing.id);
    if (convId) {
      sendMessage(convId, quickMessageText.trim());
    }
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customOfferAmount);
    if (isNaN(amount) || amount <= 0) return;
    const convId = startOrGetConversation(listing.id);
    if (convId) {
      sendMessage(convId, `I would like to offer $${amount.toLocaleString()} for this item.`, {
        isOffer: true,
        offerAmount: amount,
      });
      setIsOfferModalOpen(false);
      setCustomOfferAmount('');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative my-6 w-full max-w-5xl rounded-xl border border-[#3a3a3a] bg-[#222222] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-[#3a3a3a] bg-[#1a1a1a] px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#2b2b2b] px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-white/80 border border-[#3a3a3a]">
              {listing.category}
            </span>
            <span className="rounded bg-[#BE1E2F]/20 px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-[#BE1E2F] border border-[#BE1E2F]/40">
              {listing.condition}
            </span>
            {listing.status === 'sold' && (
              <span className="rounded bg-rose-900/80 px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-white border border-rose-500">
                Marked as Sold
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3 py-1.5 text-xs text-white hover:bg-[#333] transition-colors"
              title="Share listing link"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggleSaveListing(listing.id)}
              className={`flex items-center gap-1 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3 py-1.5 text-xs transition-colors ${
                isSaved ? 'text-[#BE1E2F] border-[#BE1E2F]/40' : 'text-white hover:bg-[#333]'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-[#BE1E2F]' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-md border border-[#3a3a3a] bg-[#2b2b2b] p-1.5 text-white/70 hover:bg-[#BE1E2F] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          
          {/* Left: Media Gallery & Lightbox (7 cols) */}
          <div className="lg:col-span-7 bg-[#191919] p-4 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#3a3a3a]">
            <div>
              {/* Main Image Display */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#3a3a3a] bg-black">
                <img
                  src={listing.images[activeImageIndex]?.image_url}
                  alt={listing.title}
                  className="h-full w-full object-contain"
                />

                {/* Lightbox trigger */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 right-3 rounded-md bg-black/70 p-2 text-white/80 hover:text-white backdrop-blur-sm border border-white/10"
                  title="Expand Fullscreen Lightbox"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Prev / Next Image Navigation */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-[#BE1E2F] transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-[#BE1E2F] transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {listing.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#BE1E2F] ring-2 ring-[#BE1E2F]/40'
                          : 'border-[#3a3a3a] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Location & Safe Pickup Map */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#BE1E2F]" />
                  <span>Pickup Location & Safe Trade Zone</span>
                </span>
                <span className="text-xs text-white/60 font-mono">
                  {listing.location_geojson.city}, {listing.location_geojson.state} ({listing.location_geojson.zip})
                </span>
              </div>
              <InteractiveMap
                center={listing.location_geojson.coordinates}
                radiusMiles={listing.location_geojson.radius_miles || 2.5}
                locationName={`${listing.location_geojson.address || listing.location_geojson.city}`}
                hideExact={listing.location_geojson.hide_exact}
                className="h-44 w-full"
              />
            </div>
          </div>

          {/* Right: Listing Info, Seller Profile, and Chat Action (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-6 bg-[#222222]">
            
            {/* Title & Price */}
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-['DM_Mono'] text-3xl font-bold text-white tracking-tight">
                  {listing.price === 0 ? (
                    <span className="text-emerald-400 font-extrabold">FREE</span>
                  ) : (
                    `$${listing.price.toLocaleString()}`
                  )}
                </div>
                <span className="font-mono text-xs text-white/50 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {listing.views_count || 12} views
                </span>
              </div>

              <h1 className="mt-2 text-xl font-bold text-white leading-snug">
                {listing.title}
              </h1>

              {/* Description */}
              <div className="mt-4 border-t border-[#3a3a3a] pt-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">Description</h3>
                <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Seller Profile Summary */}
            {seller && (
              <div className="rounded-lg border border-[#3a3a3a] bg-[#2b2b2b] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Seller Information</span>
                  <div className="flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Identity Verified</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={seller.avatar_url}
                      alt={seller.full_name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-[#BE1E2F]"
                    />
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-[#2b2b2b]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-white truncate">{seller.full_name}</h4>
                      {isOwner && (
                        <span className="rounded bg-[#BE1E2F] px-1.5 py-0.2 text-[10px] font-mono text-white">YOU</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                      <span className="flex items-center gap-1 font-mono text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {seller.rating} ({seller.review_count} reviews)
                      </span>
                      <span>•</span>
                      <span>Member since {seller.member_since}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#3a3a3a] pt-2.5 text-[11px] font-mono text-white/60">
                  <div>
                    <span className="text-white/40 block">Response Rate:</span>
                    <span className="text-white font-medium">{seller.response_rate}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Response Time:</span>
                    <span className="text-white font-medium">{seller.response_time}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions: Direct Chat Box & Make an Offer OR Seller Management */}
            {!isOwner ? (
              <div className="space-y-3 border-t border-[#3a3a3a] pt-4">
                
                {/* Instant Message Box */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center justify-between">
                    <span>Direct Message to Seller</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Seller Online
                    </span>
                  </label>

                  <form onSubmit={handleSendDirectMessage} className="space-y-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {[
                        'Is this still available?',
                        'Can I pick up today?',
                        'What is the lowest price?',
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setQuickMessageText(prompt)}
                          className="shrink-0 rounded bg-[#2b2b2b] px-2 py-1 text-[11px] text-white/80 border border-[#3a3a3a] hover:border-[#BE1E2F] hover:text-white transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={quickMessageText}
                        onChange={(e) => setQuickMessageText(e.target.value)}
                        placeholder="Send message to seller..."
                        className="flex-1 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#BE1E2F] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="btn px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Make an Offer Button */}
                {listing.price > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(true)}
                    className="btn-secondary w-full py-2.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 border border-[#3a3a3a]"
                  >
                    <DollarSign className="h-4 w-4 text-[#BE1E2F]" />
                    <span>Make an Offer</span>
                  </button>
                )}
              </div>
            ) : (
              /* Seller Management Controls */
              <div className="space-y-2.5 border-t border-[#3a3a3a] pt-4">
                <p className="text-xs font-mono uppercase tracking-wider text-white/60 mb-2">Listing Management (Owner)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateListingStatus(listing.id, listing.status === 'sold' ? 'active' : 'sold')}
                    className={`py-2 text-xs font-mono uppercase font-bold rounded-md border transition-all ${
                      listing.status === 'sold'
                        ? 'border-emerald-600 bg-emerald-900/30 text-emerald-300'
                        : 'border-[#3a3a3a] bg-[#2b2b2b] text-white hover:border-[#666]'
                    }`}
                  >
                    {listing.status === 'sold' ? 'Re-activate Listing' : 'Mark as Sold'}
                  </button>
                  <button
                    onClick={() => updateListingStatus(listing.id, listing.status === 'pending' ? 'active' : 'pending')}
                    className={`py-2 text-xs font-mono uppercase font-bold rounded-md border transition-all ${
                      listing.status === 'pending'
                        ? 'border-amber-600 bg-amber-900/30 text-amber-300'
                        : 'border-[#3a3a3a] bg-[#2b2b2b] text-white hover:border-[#666]'
                    }`}
                  >
                    {listing.status === 'pending' ? 'Remove Pending' : 'Mark Pending'}
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this listing?')) {
                      deleteListing(listing.id);
                    }
                  }}
                  className="w-full py-2 text-xs font-mono uppercase text-rose-400 hover:text-rose-300 rounded border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 transition-colors"
                >
                  Delete Listing
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Lightbox Fullscreen Modal */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={listing.images[activeImageIndex]?.image_url}
              alt=""
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}

        {/* Make an Offer Dialog */}
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-[#3a3a3a] bg-[#222222] p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#BE1E2F]" />
                  <h3 className="text-sm font-semibold text-white">Make an Offer to Seller</h3>
                </div>
                <button onClick={() => setIsOfferModalOpen(false)} className="text-white/50 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSendOffer} className="mt-4 space-y-4">
                <div>
                  <span className="block text-xs font-mono text-white/50 mb-1">Listed Price:</span>
                  <span className="font-mono text-lg font-bold text-white">${listing.price.toLocaleString()}</span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Your Offer Amount ($)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono text-white/50">$</span>
                    <input
                      type="number"
                      min={1}
                      max={listing.price * 2}
                      step={5}
                      value={customOfferAmount}
                      onChange={(e) => setCustomOfferAmount(e.target.value)}
                      placeholder={Math.round(listing.price * 0.9).toString()}
                      className="w-full rounded-md border border-[#3a3a3a] bg-[#2b2b2b] py-2 pl-7 pr-3 font-mono text-base text-white focus:border-[#BE1E2F] focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {[0.85, 0.9, 0.95].map((pct) => {
                    const presetVal = Math.round(listing.price * pct);
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setCustomOfferAmount(presetVal.toString())}
                        className="flex-1 rounded border border-[#3a3a3a] bg-[#2b2b2b] py-1 text-[11px] font-mono text-white/80 hover:border-[#BE1E2F] hover:text-white"
                      >
                        ${presetVal} ({pct * 100}%)
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 border-t border-[#3a3a3a] pt-3">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="flex-1 rounded-md border border-[#3a3a3a] py-2 text-xs text-white/70 hover:bg-[#333]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn flex-1 py-2 text-xs font-bold rounded-md"
                  >
                    Submit Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
