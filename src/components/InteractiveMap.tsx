import React from 'react';
import { MapPin, ShieldCheck, Navigation } from 'lucide-react';
import { SAFE_EXCHANGE_PRESETS } from '../data/mockData';

interface InteractiveMapProps {
  center: [number, number]; // [lng, lat]
  radiusMiles?: number;
  locationName?: string;
  hideExact?: boolean;
  showSafeZones?: boolean;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  radiusMiles = 2,
  locationName = 'Pickup Area',
  hideExact = true,
  showSafeZones = true,
  className = 'h-52 w-full',
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] ${className}`}>
      {/* Dark Map Vector Grid Background */}
      <svg className="absolute inset-0 h-full w-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#444" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BE1E2F" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#BE1E2F" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Map Grid */}
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        
        {/* Simulated Roads */}
        <path d="M 0 60 Q 150 100 350 70 T 800 120" fill="none" stroke="#333" strokeWidth="4" />
        <path d="M 120 0 Q 140 180 200 300" fill="none" stroke="#383838" strokeWidth="3" />
        <path d="M 0 160 Q 220 140 500 200" fill="none" stroke="#2e2e2e" strokeWidth="3" />
        <path d="M 320 0 L 320 300" fill="none" stroke="#383838" strokeWidth="2.5" />
        <path d="M 0 240 L 800 240" fill="none" stroke="#333" strokeWidth="2" />
        
        {/* Approximate Radius Circle */}
        <circle cx="50%" cy="50%" r="65" fill="url(#map-glow)" stroke="#BE1E2F" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>

      {/* Center Marker */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex flex-col items-center">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#BE1E2F]/20 border border-[#BE1E2F] animate-pulse">
            <div className="w-4 h-4 rounded-full bg-[#BE1E2F] flex items-center justify-center shadow-lg shadow-[#BE1E2F]/50">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>
          {hideExact && (
            <span className="mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#1a1a1a]/90 text-white/80 border border-[#3a3a3a] backdrop-blur-sm shadow-md">
              Approximate Area (~{radiusMiles} mi radius)
            </span>
          )}
        </div>
      </div>

      {/* Safe Exchange Zones Callout Overlay */}
      {showSafeZones && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a1a1a]/90 border border-[#3a3a3a] text-[11px] text-white/90 backdrop-blur-sm shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Safe Exchange Verified Area</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#2b2b2b]/90 border border-[#3a3a3a] text-[10px] font-mono text-white/70">
            <Navigation className="w-3 h-3 text-[#BE1E2F]" />
            <span>{locationName}</span>
          </div>
        </div>
      )}

      {/* Bottom info badge */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/50 px-2 pointer-events-none">
        <span>Map data © SANE Dark Engine</span>
        <span className="font-mono">{center[1].toFixed(3)}°N, {Math.abs(center[0]).toFixed(3)}°W</span>
      </div>
    </div>
  );
};
