import React, { useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Eye, 
  DollarSign, 
  ShieldCheck,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCategory, ListingCondition, ListingImage } from '../types';
import { InteractiveMap } from './InteractiveMap';

const SAMPLE_PHOTO_PRESETS = [
  { label: 'MacBook / Tech', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Camera / Gear', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80' },
  { label: 'Chair / Furniture', url: 'https://images.unsplash.com/photo-1580481077195-c3a9a3224977?w=800&auto=format&fit=crop&q=80' },
  { label: 'Jacket / Apparel', url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80' },
  { label: 'Guitar / Audio', url: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bicycle / Sports', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80' },
];

export const CreateListingWizard: React.FC = () => {
  const { addListing, setCurrentView, viewListingDetail, userLocation, currentUser } = useMarketplace();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'
  ]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Electronics');
  const [condition, setCondition] = useState<ListingCondition>('Like New');
  const [description, setDescription] = useState('');
  
  // Location & Privacy
  const [address, setAddress] = useState('Market St & 4th St');
  const [city, setCity] = useState(userLocation.city || 'San Francisco');
  const [state, setState] = useState(userLocation.state || 'CA');
  const [zip, setZip] = useState(userLocation.zip || '94103');
  const [hideExact, setHideExact] = useState(true);
  const [radiusMiles, setRadiusMiles] = useState(2.5);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);

  // Handle image upload from file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addPresetImage = (url: string) => {
    setImages(prev => [...prev, url]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const makePrimaryImage = (index: number) => {
    setImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handlePublish = () => {
    setIsPublishing(true);

    const formattedImages: ListingImage[] = images.map((url, index) => ({
      id: `img_${Date.now()}_${index}`,
      listing_id: '',
      image_url: url,
      display_order: index,
    }));

    setTimeout(() => {
      const newListing = addListing({
        title: title || 'Untitled Marketplace Item',
        description: description || 'No description provided.',
        price: parseFloat(price) || 0,
        category,
        condition,
        status: 'active',
        location_geojson: {
          type: 'Point',
          coordinates: [userLocation.lng || -122.4194, userLocation.lat || 37.7749],
          address,
          city,
          state,
          zip,
          hide_exact: hideExact,
          radius_miles: radiusMiles,
        },
        images: formattedImages,
      });

      setIsPublishing(false);
      setPublishedListingId(newListing.id);
      viewListingDetail(newListing.id);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-4xl py-6 px-4 sm:px-6">
      
      {/* Wizard Header & Progress Bar */}
      <div className="border-b border-[#3a3a3a] pb-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#BE1E2F]">Listing Creation Wizard</span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Create New Listing</h1>
          </div>
          <button
            onClick={() => setCurrentView('feed')}
            className="text-xs font-mono text-white/50 hover:text-white"
          >
            Exit to Marketplace ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          {[
            { num: 1, title: '1. Media Upload' },
            { num: 2, title: '2. Item Details' },
            { num: 3, title: '3. Location & Privacy' },
            { num: 4, title: '4. Live Preview' },
          ].map((s) => (
            <div key={s.num} className="space-y-1.5">
              <div className={`h-1.5 rounded-full transition-all ${
                currentStep >= s.num ? 'bg-[#BE1E2F]' : 'bg-[#333333]'
              }`} />
              <p className={`text-[11px] font-mono uppercase ${
                currentStep === s.num ? 'text-white font-bold' : 'text-white/40'
              }`}>
                {s.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: MEDIA UPLOAD */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-white mb-1">Upload Item Photos</h2>
            <p className="text-xs text-white/60 mb-4">
              Add high-quality photos from multiple angles. The first photo will be used as the primary cover photo in feed results.
            </p>

            {/* Drag and Drop Zone */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#3a3a3a] rounded-lg p-8 hover:border-[#BE1E2F] hover:bg-[#222222] transition-all cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a] text-[#BE1E2F] mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-white">Click or drag photos here to upload</p>
              <p className="text-xs text-white/40 mt-1">Supports PNG, JPG, WebP up to 10MB each</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Quick Demo Photo Presets */}
            <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
              <span className="block text-xs font-mono uppercase text-white/50 mb-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#BE1E2F]" />
                <span>Or pick from instant sample item photos:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => addPresetImage(preset.url)}
                    className="flex items-center gap-1.5 rounded border border-[#3a3a3a] bg-[#1a1a1a] px-2.5 py-1.5 text-xs text-white/80 hover:border-[#BE1E2F] hover:text-white"
                  >
                    <Plus className="h-3 w-3 text-[#BE1E2F]" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded Images List */}
            {images.length > 0 && (
              <div className="mt-6 space-y-2">
                <span className="text-xs font-mono uppercase text-white/60">
                  Uploaded Photos ({images.length}) • Click photo to make primary cover
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`group relative aspect-[4/3] rounded-lg overflow-hidden border ${
                        idx === 0 ? 'border-[#BE1E2F] ring-2 ring-[#BE1E2F]/40' : 'border-[#3a3a3a]'
                      } bg-black`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded bg-[#BE1E2F] px-1.5 py-0.5 text-[10px] font-mono text-white">
                          PRIMARY COVER
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => makePrimaryImage(idx)}
                            className="rounded bg-white/20 p-1 text-white hover:bg-[#BE1E2F] text-[10px] font-mono px-2"
                            title="Make Primary"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="rounded bg-rose-600/80 p-1.5 text-white hover:bg-rose-700"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={images.length === 0}
              onClick={() => setCurrentStep(2)}
              className="btn px-6 py-2.5 text-xs font-bold rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <span>Next: Item Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ITEM DETAILS */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-semibold text-white mb-2">Item Specifications & Pricing</h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Listing Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones (Midnight Blue)"
                className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:border-[#BE1E2F] focus:outline-none"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ListingCategory)}
                  className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2.5 text-xs text-white focus:border-[#BE1E2F] focus:outline-none"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Home Goods">Home Goods</option>
                  <option value="Free Stuff">Free Stuff ($0)</option>
                  <option value="Musical Instruments">Musical Instruments</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Collectibles">Collectibles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ListingCondition)}
                  className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2.5 text-xs text-white focus:border-[#BE1E2F] focus:outline-none"
                >
                  <option value="New">New (Unopened / Boxed)</option>
                  <option value="Like New">Like New (Flawless condition)</option>
                  <option value="Good">Good (Minor cosmetic wear)</option>
                  <option value="Fair">Fair (Fully functional with signs of use)</option>
                </select>
              </div>
            </div>

            {/* Price (DM Mono) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  Asking Price ($ USD) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPrice('0');
                    setCategory('Free Stuff');
                  }}
                  className="text-[11px] font-mono text-emerald-400 hover:underline"
                >
                  Set as Free ($0)
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-mono text-white/50">$</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] py-2.5 pl-8 pr-3 font-mono text-sm text-white placeholder-white/30 focus:border-[#BE1E2F] focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Description & Included Accessories
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include purchase date, battery health, original accessories, receipt status, and reason for selling..."
                className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#BE1E2F] focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-secondary px-5 py-2.5 text-xs rounded-md flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Photos</span>
            </button>
            <button
              type="button"
              disabled={!title.trim()}
              onClick={() => setCurrentStep(3)}
              className="btn px-6 py-2.5 text-xs font-bold rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <span>Next: Location & Privacy</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION & PRIVACY */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="card p-6 space-y-5">
            <h2 className="text-base font-semibold text-white mb-1">Pickup Location & Safety Radius</h2>
            <p className="text-xs text-white/60">
              Protect your privacy. When enabled, prospective buyers will only see an approximate radius circle rather than your exact residential street address.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Privacy Shield: Hide exact street address
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Display approximate neighborhood circle (~{radiusMiles} mi radius) on public map.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={hideExact}
                onChange={(e) => setHideExact(e.target.checked)}
                className="h-5 w-5 accent-[#BE1E2F] cursor-pointer"
              />
            </div>

            {/* Interactive Vector Map Radius Preview */}
            <div>
              <span className="block text-xs font-mono uppercase text-white/60 mb-2">
                Public Map Preview (What buyers see)
              </span>
              <InteractiveMap
                center={[userLocation.lng || -122.4194, userLocation.lat || 37.7749]}
                radiusMiles={radiusMiles}
                locationName={`${city}, ${state}`}
                hideExact={hideExact}
                className="h-48 w-full"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-secondary px-5 py-2.5 text-xs rounded-md flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Details</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="btn px-6 py-2.5 text-xs font-bold rounded-md flex items-center gap-2"
            >
              <span>Next: Live Preview</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PREVIEW & PUBLISH */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-3 mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#BE1E2F]">Review Before Live</span>
                <h2 className="text-base font-semibold text-white">Listing Final Preview</h2>
              </div>
              <span className="rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/30">
                Ready to Publish
              </span>
            </div>

            {/* Mock Listing Card in Feed Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Media Preview (7 cols) */}
              <div className="md:col-span-7 aspect-[4/3] rounded-lg overflow-hidden bg-black border border-[#3a3a3a]">
                <img
                  src={images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info Preview (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="font-['DM_Mono'] text-3xl font-bold text-white">
                    {price === '0' || category === 'Free Stuff' ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      `$${parseFloat(price || '0').toLocaleString()}`
                    )}
                  </div>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#333] text-white/80">
                    {condition}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{title || 'Untitled Listing'}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <MapPin className="h-3.5 w-3.5 text-[#BE1E2F]" />
                  <span>{city}, {state} ({zip})</span>
                </div>

                <p className="text-xs text-white/70 whitespace-pre-line border-t border-[#3a3a3a] pt-2">
                  {description || 'No description provided.'}
                </p>

                <div className="rounded-md border border-[#3a3a3a] bg-[#1a1a1a] p-3 flex items-center gap-2.5">
                  <img src={currentUser.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-[#BE1E2F]" />
                  <div>
                    <p className="text-xs font-semibold text-white">{currentUser.full_name}</p>
                    <p className="text-[10px] text-white/50 font-mono">Seller • ★ {currentUser.rating}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn-secondary px-5 py-2.5 text-xs rounded-md flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublish}
              className="btn px-8 py-3 text-sm font-bold rounded-md shadow-xl shadow-[#BE1E2F]/30 flex items-center gap-2"
            >
              {isPublishing ? (
                <span>Publishing to Marketplace...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Publish Listing Live</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
