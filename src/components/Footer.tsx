import React from 'react';
import { Database, ShieldCheck, Zap, RotateCcw, Heart, MessageSquare } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const Footer: React.FC = () => {
  const { setCurrentView, resetDatabaseToSeed } = useMarketplace();

  const handleResetData = () => {
    if (window.confirm('Reset all marketplace listings and chat threads back to default seed data?')) {
      resetDatabaseToSeed();
    }
  };

  return (
    <footer className="border-t border-[#3a3a3a] bg-[#161616] mt-16 text-xs text-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#BE1E2F] text-white font-['Hammersmith_One'] font-bold text-sm">
                S
              </div>
              <span className="font-['Hammersmith_One'] text-base uppercase tracking-wider text-white">
                SANE<span className="text-[#BE1E2F]">.</span>MARKET
              </span>
            </div>
            <p className="text-xs text-white/50 max-w-md leading-relaxed">
              High-performance, dark-mode Peer-to-Peer marketplace with radius discovery, verified Safe Exchange Zones, in-app offer negotiation, and Supabase PostgreSQL architecture.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Supabase Realtime Sync
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[11px] font-mono text-white/50">
                PostGIS Radius Enabled
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">
              Platform Views
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentView('feed')} className="hover:text-white transition-colors">
                  Browse Discovery Feed
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('create_listing')} className="hover:text-white transition-colors">
                  Sell Item (Listing Wizard)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('chat')} className="hover:text-white transition-colors">
                  In-App Chat & Offers
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('saved')} className="hover:text-white transition-colors">
                  Saved Items Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('sql_schema')} className="text-[#BE1E2F] hover:underline font-mono">
                  Supabase SQL Schema & RLS
                </button>
              </li>
            </ul>
          </div>

          {/* Developer Tools */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">
              Testing & Demo State
            </h4>
            <div className="space-y-2">
              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 rounded border border-[#3a3a3a] bg-[#222222] px-3 py-2 text-xs text-white/80 hover:bg-[#333] hover:text-white transition-colors w-full"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#BE1E2F]" />
                <span>Reset Demo Seed Data</span>
              </button>
              <p className="text-[10px] text-white/40 leading-normal">
                Restores original sample items, active buyer/seller profiles, and test chat conversations in localStorage.
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-[#2e2e2e] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-white/40">
          <p>© 2026 SANE Market Systems. Designed with Exo, Hammersmith One & DM Mono.</p>
          <div className="flex items-center gap-4">
            <span>Color Palette: #BE1E2F / #2b2b2b / #1a1a1a</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
