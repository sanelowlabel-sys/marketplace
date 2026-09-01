import React, { useState } from 'react';
import { MapPin, X, Check, Navigation, Sliders, Globe } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { LOCATION_PRESETS } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';

export const LocationModal: React.FC = () => {
  const { 
    userLocation, 
    setUserLocation, 
    isLocationModalOpen, 
    setIsLocationModalOpen,
    filters,
    setFilters
  } = useMarketplace();

  const [selectedCity, setSelectedCity] = useState(userLocation.city);
  const [customZip, setCustomZip] = useState(userLocation.zip);
  const [radius, setRadius] = useState(userLocation.radius_miles || 15);
  const [activePreset, setActivePreset] = useState(
    LOCATION_PRESETS.find(p => p.city.toLowerCase() === userLocation.city.toLowerCase()) || LOCATION_PRESETS[0]
  );

  if (!isLocationModalOpen) return null;

  const handleApply = () => {
    const updatedLocation = {
      ...activePreset,
      city: selectedCity || activePreset.city,
      zip: customZip || activePreset.zip,
      radius_miles: radius,
    };
    setUserLocation(updatedLocation);
    setFilters(prev => ({ ...prev, radiusMiles: radius }));
    setIsLocationModalOpen(false);
  };

  const handleSelectPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    setActivePreset(preset);
    setSelectedCity(preset.city);
    setCustomZip(preset.zip);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const userPreset = {
            city: 'My GPS Location',
            state: 'Nearby',
            zip: 'Current',
            lat,
            lng,
          };
          setActivePreset(userPreset);
          setSelectedCity('My GPS Location');
          setCustomZip('Nearby');
        },
        () => {
          // Fallback to default
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-xl border border-[#3a3a3a] bg-[#222222] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#BE1E2F]/20 text-[#BE1E2F]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">Select Location & Radius</h2>
              <p className="text-xs text-white/50">Filter listings within your local physical trade zone</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="rounded-lg p-1.5 text-white/50 hover:bg-[#333] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          
          {/* Quick Preset Pills */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
              Popular Market Hubs
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_PRESETS.map((p) => {
                const isSelected = activePreset.city === p.city;
                return (
                  <button
                    key={p.city}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#BE1E2F] text-white shadow-sm shadow-[#BE1E2F]/30'
                        : 'border border-[#3a3a3a] bg-[#2b2b2b] text-white/80 hover:border-[#666] hover:text-white'
                    }`}
                  >
                    {p.city}, {p.state}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom City & Zip Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#BE1E2F] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                value={customZip}
                onChange={(e) => setCustomZip(e.target.value)}
                placeholder="94103"
                className="w-full rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3 py-2 text-xs font-mono text-white placeholder-white/40 focus:border-[#BE1E2F] focus:outline-none"
              />
            </div>
          </div>

          {/* Radius Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-white/60">
                Search Radius
              </span>
              <span className="font-mono text-sm font-bold text-[#BE1E2F]">
                Within {radius} miles
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={100}
              step={1}
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              className="w-full accent-[#BE1E2F] h-2 bg-[#3a3a3a] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1">
              <span>2 mi</span>
              <span>15 mi (Standard)</span>
              <span>50 mi</span>
              <span>100 mi</span>
            </div>
          </div>

          {/* Interactive Radius Map Preview */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
              Pickup & Radius Coverage Area
            </label>
            <InteractiveMap
              center={[activePreset.lng, activePreset.lat]}
              radiusMiles={radius}
              locationName={`${selectedCity || activePreset.city}`}
              className="h-40 w-full"
            />
          </div>

          {/* GPS Auto-detect option */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] py-2 text-xs font-medium text-white/80 hover:bg-[#333] hover:text-white transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-[#BE1E2F]" />
            <span>Use Current Device GPS Location</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#3a3a3a] pt-4">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            className="rounded-md border border-[#3a3a3a] bg-transparent px-4 py-2 text-xs font-semibold text-white/70 hover:bg-[#333] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn px-5 py-2 text-xs font-bold rounded-md shadow-lg shadow-[#BE1E2F]/20"
          >
            Apply Location
          </button>
        </div>
      </div>
    </div>
  );
};
