import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  MessageSquare, 
  Heart, 
  Database, 
  User, 
  ChevronDown, 
  Check, 
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    availableUsers, 
    setCurrentUserById,
    filters, 
    setFilters, 
    userLocation, 
    setIsLocationModalOpen,
    currentView, 
    setCurrentView,
    savedListingIds,
    conversations,
    searchSuggestions
  } = useMarketplace();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate total unread messages
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    if (currentView !== 'feed') {
      setCurrentView('feed');
    }
  };

  const selectSuggestion = (term: string) => {
    setFilters(prev => ({ ...prev, query: term }));
    setIsSearchFocused(false);
    if (currentView !== 'feed') {
      setCurrentView('feed');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#3a3a3a] bg-[#1a1a1a]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            id="brand-logo-btn"
            onClick={() => {
              setCurrentView('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#BE1E2F] text-white shadow-md shadow-[#BE1E2F]/30 transition-transform group-hover:scale-105">
              <span className="font-['Hammersmith_One'] text-xl font-bold tracking-tight">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-['Hammersmith_One'] text-xl uppercase tracking-wider text-white group-hover:text-[#BE1E2F] transition-colors">
                SANE<span className="text-[#BE1E2F]">.</span>MARKET
              </span>
              <p className="text-[10px] tracking-widest uppercase text-white/50 font-mono -mt-1">P2P EXCHANGE</p>
            </div>
          </button>
        </div>

        {/* Global Search Bar & Autocomplete */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="global-search-input"
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search marketplace (MacBook, Tesla, Camera, Aeron...)"
              className="w-full rounded-md border border-[#3a3a3a] bg-[#2b2b2b] py-2 pl-10 pr-10 text-sm text-white placeholder-white/40 focus:border-[#BE1E2F] focus:bg-[#222222] focus:outline-none focus:ring-1 focus:ring-[#BE1E2F] transition-all"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-md border border-[#3a3a3a] bg-[#2b2b2b] p-1.5 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-white/50 flex items-center justify-between">
                <span>Suggested Searches</span>
                <span className="text-[10px] text-[#BE1E2F]">Live Filter</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {searchSuggestions.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => selectSuggestion(term)}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-white/90 hover:bg-[#3a3a3a] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="h-3.5 w-3.5 text-white/40" />
                      <span>{term}</span>
                    </div>
                    <span className="text-[11px] font-mono text-white/40">Enter ↵</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Selector Button */}
        <button
          id="header-location-selector"
          onClick={() => setIsLocationModalOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] px-3 py-2 text-xs text-white/90 hover:border-[#BE1E2F] hover:bg-[#333333] transition-all"
        >
          <MapPin className="h-4 w-4 text-[#BE1E2F] shrink-0" />
          <div className="text-left font-mono">
            <span className="block text-[10px] text-white/50 uppercase">Location & Radius</span>
            <span className="font-semibold text-white truncate max-w-[130px] block">
              {userLocation.city} • {userLocation.radius_miles || 15}mi
            </span>
          </div>
        </button>

        {/* Action Buttons & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sell Item Button (Primary Red) */}
          <button
            id="sell-item-header-btn"
            onClick={() => setCurrentView('create_listing')}
            className={`btn px-3.5 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-md shadow-[#BE1E2F]/20 ${
              currentView === 'create_listing' ? 'ring-2 ring-white' : ''
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Sell Item</span>
          </button>

          {/* Chat Inbox Button */}
          <button
            id="chat-inbox-header-btn"
            onClick={() => setCurrentView('chat')}
            className={`relative rounded-md border p-2 text-white transition-all ${
              currentView === 'chat' 
                ? 'border-[#BE1E2F] bg-[#BE1E2F]/15 text-[#BE1E2F]' 
                : 'border-[#3a3a3a] bg-[#2b2b2b] hover:border-[#555] hover:bg-[#333]'
            }`}
            title="Messages / In-App Chat"
          >
            <MessageSquare className="h-4 w-4" />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#BE1E2F] px-1 text-[10px] font-bold font-mono text-white ring-2 ring-[#1a1a1a]">
                {totalUnread}
              </span>
            )}
          </button>

          {/* Saved / Wishlist Button */}
          <button
            id="saved-wishlist-header-btn"
            onClick={() => setCurrentView('saved')}
            className={`relative rounded-md border p-2 text-white transition-all ${
              currentView === 'saved' 
                ? 'border-[#BE1E2F] bg-[#BE1E2F]/15 text-[#BE1E2F]' 
                : 'border-[#3a3a3a] bg-[#2b2b2b] hover:border-[#555] hover:bg-[#333]'
            }`}
            title="Saved Items / Wishlist"
          >
            <Heart className={`h-4 w-4 ${savedListingIds.length > 0 ? 'text-[#BE1E2F] fill-[#BE1E2F]' : ''}`} />
            {savedListingIds.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3a3a3a] px-1 text-[10px] font-mono text-white border border-[#555]">
                {savedListingIds.length}
              </span>
            )}
          </button>

          {/* Supabase PostgreSQL Schema Tab */}
          <button
            id="supabase-schema-header-btn"
            onClick={() => setCurrentView('sql_schema')}
            className={`hidden lg:flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-mono transition-all ${
              currentView === 'sql_schema'
                ? 'border-[#BE1E2F] bg-[#BE1E2F]/15 text-[#BE1E2F]'
                : 'border-[#3a3a3a] bg-[#2b2b2b] text-white/80 hover:border-[#555] hover:text-white'
            }`}
            title="Supabase PostgreSQL Schema & RLS Rules"
          >
            <Database className="h-3.5 w-3.5 text-[#BE1E2F]" />
            <span>SQL Schema</span>
          </button>

          {/* User Profile & Persona Switcher Dropdown */}
          <div ref={userDropdownRef} className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#2b2b2b] p-1.5 pr-2.5 hover:border-[#555] transition-all"
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-[#BE1E2F]"
              />
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-white leading-tight truncate max-w-[90px]">{currentUser.full_name}</p>
                <p className="text-[10px] text-white/50 font-mono">★ {currentUser.rating}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/60" />
            </button>

            {/* Persona Switcher Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-lg border border-[#3a3a3a] bg-[#222222] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
                <div className="border-b border-[#3a3a3a] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono uppercase tracking-wider text-white/50">Active Persona</p>
                    <span className="rounded bg-[#BE1E2F]/20 px-1.5 py-0.5 text-[10px] font-mono text-[#BE1E2F]">
                      P2P Testing
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.full_name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-[#BE1E2F]"
                    />
                    <div>
                      <p className="font-semibold text-sm text-white">{currentUser.full_name}</p>
                      <p className="text-xs text-white/60">{currentUser.location}</p>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 text-[11px] font-mono text-white/50 uppercase">
                  Switch Persona (Test Buyer / Seller):
                </div>

                <div className="space-y-1">
                  {availableUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUserById(u.id);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                          isSelected 
                            ? 'bg-[#BE1E2F]/20 text-white border border-[#BE1E2F]/40' 
                            : 'text-white/80 hover:bg-[#333333] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img src={u.avatar_url} alt={u.full_name} className="h-6 w-6 rounded-full object-cover" />
                          <div className="truncate">
                            <span className="font-medium text-white block">{u.full_name}</span>
                            <span className="text-[10px] text-white/40 block truncate">{u.location}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#BE1E2F] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#3a3a3a] mt-2 pt-2">
                  <button
                    onClick={() => {
                      setCurrentView('sql_schema');
                      setIsUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-xs text-white/70 hover:bg-[#333] hover:text-white"
                  >
                    <Database className="h-3.5 w-3.5 text-[#BE1E2F]" />
                    <span>View PostgreSQL Supabase Schema</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
