import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Header } from './components/Header';
import { BrowseFeed } from './components/BrowseFeed';
import { CreateListingWizard } from './components/CreateListingWizard';
import { ChatView } from './components/ChatView';
import { SavedListingsView } from './components/SavedListingsView';
import { SupabaseSchemaViewer } from './components/SupabaseSchemaViewer';
import { ListingDetailModal } from './components/ListingDetailModal';
import { LocationModal } from './components/LocationModal';
import { Footer } from './components/Footer';

const MarketplaceApp: React.FC = () => {
  const { currentView, selectedListingId, setSelectedListingId } = useMarketplace();

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a] text-white">
      {/* Global Navigation Header */}
      <Header />

      {/* Main Dynamic View Content */}
      <div className="flex-1">
        {currentView === 'feed' && <BrowseFeed />}
        {currentView === 'create_listing' && <CreateListingWizard />}
        {currentView === 'chat' && <ChatView />}
        {currentView === 'saved' && <SavedListingsView />}
        {currentView === 'sql_schema' && <SupabaseSchemaViewer />}
      </div>

      {/* Listing Detail Modal / Lightbox (Available across all views) */}
      {selectedListingId && (
        <ListingDetailModal
          listingId={selectedListingId}
          onClose={() => setSelectedListingId(null)}
        />
      )}

      {/* Location & Radius Selector Modal */}
      <LocationModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
