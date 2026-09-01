import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  User, 
  Listing, 
  Conversation, 
  Message, 
  FilterState, 
  UserLocation, 
  MeetingPoint 
} from '../types';
import { 
  CURRENT_USER, 
  OTHER_USERS, 
  INITIAL_LISTINGS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES, 
  INITIAL_SAVED_IDS,
  LOCATION_PRESETS
} from '../data/mockData';

interface MarketplaceContextType {
  // Current user & profile switching
  currentUser: User;
  availableUsers: User[];
  setCurrentUserById: (userId: string) => void;

  // Listings state & actions
  listings: Listing[];
  addListing: (newListing: Omit<Listing, 'id' | 'created_at' | 'seller_id' | 'seller'>) => Listing;
  updateListingStatus: (listingId: string, status: 'active' | 'pending' | 'sold') => void;
  deleteListing: (listingId: string) => void;
  getListingById: (id: string) => Listing | undefined;
  getUserById: (id: string) => User | undefined;

  // Saved / Wishlist
  savedListingIds: string[];
  toggleSaveListing: (listingId: string) => void;
  isListingSaved: (listingId: string) => boolean;

  // Conversations & Chat
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  startOrGetConversation: (listingId: string) => string;
  sendMessage: (
    conversationId: string, 
    content: string, 
    extra?: { 
      isOffer?: boolean; 
      offerAmount?: number; 
      meetingPoint?: MeetingPoint;
      imageUrl?: string;
    }
  ) => void;
  respondToOffer: (
    messageId: string, 
    status: 'accepted' | 'declined' | 'countered', 
    counterAmount?: number
  ) => void;
  getConversationMessages: (conversationId: string) => Message[];
  getActiveConversation: () => { conversation: Conversation; listing?: Listing; otherUser?: User } | null;

  // Navigation & Modals
  currentView: 'feed' | 'listing_detail' | 'create_listing' | 'chat' | 'saved' | 'sql_schema' | 'profile';
  setCurrentView: (view: 'feed' | 'listing_detail' | 'create_listing' | 'chat' | 'saved' | 'sql_schema' | 'profile') => void;
  selectedListingId: string | null;
  setSelectedListingId: (id: string | null) => void;
  viewListingDetail: (listingId: string) => void;
  
  // Location & Radius
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;

  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredListings: Listing[];
  searchSuggestions: string[];

  // Database actions
  resetDatabaseToSeed: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'sane_marketplace_users',
  CURRENT_USER_ID: 'sane_marketplace_cur_user_id',
  LISTINGS: 'sane_marketplace_listings',
  SAVED: 'sane_marketplace_saved',
  CONVERSATIONS: 'sane_marketplace_conversations',
  MESSAGES: 'sane_marketplace_messages',
  LOCATION: 'sane_marketplace_location',
};

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Users setup
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : [CURRENT_USER, ...OTHER_USERS];
    } catch {
      return [CURRENT_USER, ...OTHER_USERS];
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || CURRENT_USER.id;
    } catch {
      return CURRENT_USER.id;
    }
  });

  const currentUser = useMemo(() => {
    return allUsers.find(u => u.id === currentUserId) || allUsers[0] || CURRENT_USER;
  }, [allUsers, currentUserId]);

  const setCurrentUserById = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  };

  // 2. Location
  const [userLocation, setUserLocationState] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
      return saved ? JSON.parse(saved) : { ...LOCATION_PRESETS[0], radius_miles: 15 };
    } catch {
      return { ...LOCATION_PRESETS[0], radius_miles: 15 };
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const setUserLocation = (loc: UserLocation) => {
    setUserLocationState(loc);
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
  };

  // 3. Listings
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  // 4. Saved Listings
  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED);
      return saved ? JSON.parse(saved) : INITIAL_SAVED_IDS;
    } catch {
      return INITIAL_SAVED_IDS;
    }
  });

  // 5. Conversations & Messages
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return conversations[0]?.id || null;
  });

  // 6. Navigation
  const [currentView, setCurrentView] = useState<'feed' | 'listing_detail' | 'create_listing' | 'chat' | 'saved' | 'sql_schema' | 'profile'>('feed');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // 7. Filters
  const initialFilters: FilterState = {
    query: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    condition: 'All',
    radiusMiles: userLocation.radius_miles || 15,
    sortBy: 'newest',
    status: 'active',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(savedListingIds));
  }, [savedListingIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // Helpers
  const getUserById = (id: string): User | undefined => {
    return allUsers.find(u => u.id === id);
  };

  const getListingById = (id: string): Listing | undefined => {
    const item = listings.find(l => l.id === id);
    if (!item) return undefined;
    return {
      ...item,
      seller: getUserById(item.seller_id),
    };
  };

  const isListingSaved = (listingId: string): boolean => {
    return savedListingIds.includes(listingId);
  };

  const toggleSaveListing = (listingId: string) => {
    setSavedListingIds(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });

    // Update listing saved_count
    setListings(prev => prev.map(item => {
      if (item.id === listingId) {
        const currentSaved = item.saved_count || 0;
        return {
          ...item,
          saved_count: savedListingIds.includes(listingId) ? Math.max(0, currentSaved - 1) : currentSaved + 1,
        };
      }
      return item;
    }));
  };

  const addListing = (newListingData: Omit<Listing, 'id' | 'created_at' | 'seller_id' | 'seller'>): Listing => {
    const newListing: Listing = {
      ...newListingData,
      id: `lst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      seller_id: currentUser.id,
      seller: currentUser,
      created_at: new Date().toISOString(),
      views_count: 1,
      saved_count: 0,
    };

    setListings(prev => [newListing, ...prev]);
    return newListing;
  };

  const updateListingStatus = (listingId: string, status: 'active' | 'pending' | 'sold') => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status } : l));
  };

  const deleteListing = (listingId: string) => {
    setListings(prev => prev.filter(l => l.id !== listingId));
    setSavedListingIds(prev => prev.filter(id => id !== listingId));
    if (selectedListingId === listingId) {
      setSelectedListingId(null);
      setCurrentView('feed');
    }
  };

  const viewListingDetail = (listingId: string) => {
    setSelectedListingId(listingId);
    setCurrentView('listing_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // increment view count
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, views_count: (l.views_count || 0) + 1 } : l));
  };

  // Start or get conversation for a listing
  const startOrGetConversation = (listingId: string): string => {
    const listing = getListingById(listingId);
    if (!listing) return '';

    // Check if conversation already exists between current user and seller
    const existing = conversations.find(
      c => c.listing_id === listingId && (
        (c.buyer_id === currentUser.id && c.seller_id === listing.seller_id) ||
        (c.seller_id === currentUser.id && c.buyer_id === listing.seller_id)
      )
    );

    if (existing) {
      setActiveConversationId(existing.id);
      setCurrentView('chat');
      return existing.id;
    }

    // Create new conversation
    const newConvId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      listing_id: listingId,
      buyer_id: currentUser.id,
      seller_id: listing.seller_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      unread_count: 0,
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    setCurrentView('chat');
    return newConvId;
  };

  const sendMessage = (
    conversationId: string, 
    content: string, 
    extra?: { 
      isOffer?: boolean; 
      offerAmount?: number; 
      meetingPoint?: MeetingPoint;
      imageUrl?: string;
    }
  ) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      is_offer: extra?.isOffer,
      offer_amount: extra?.offerAmount,
      offer_status: extra?.isOffer ? 'pending' : undefined,
      meeting_point: extra?.meetingPoint,
      image_url: extra?.imageUrl,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);

    // Update conversation timestamp
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          updated_at: new Date().toISOString(),
          last_message: newMsg,
        };
      }
      return c;
    }));

    // Auto-respond simulation if chatting with a simulated seller and user is buyer
    const conv = conversations.find(c => c.id === conversationId);
    if (conv && conv.seller_id !== currentUser.id) {
      const seller = getUserById(conv.seller_id);
      const isOffer = extra?.isOffer;

      setTimeout(() => {
        let replyContent = "Thanks for reaching out! When would you be free to inspect it in person?";
        let replyOfferStatus: 'accepted' | 'countered' | undefined = undefined;
        let counterAmount: number | undefined = undefined;

        if (isOffer && extra?.offerAmount) {
          const listing = getListingById(conv.listing_id);
          const origPrice = listing ? listing.price : extra.offerAmount;
          if (extra.offerAmount >= origPrice * 0.85) {
            replyContent = `That offer works for me ($${extra.offerAmount}). Let's set up a pickup time!`;
            replyOfferStatus = 'accepted';
          } else {
            counterAmount = Math.round(origPrice * 0.9);
            replyContent = `That's a bit low, but I could meet you at $${counterAmount}. Does that work?`;
            replyOfferStatus = 'countered';
          }
        }

        const autoMsg: Message = {
          id: `msg_auto_${Date.now()}`,
          conversation_id: conversationId,
          sender_id: conv.seller_id,
          content: replyContent,
          is_offer: isOffer,
          offer_amount: extra?.offerAmount,
          offer_status: replyOfferStatus,
          counter_amount: counterAmount,
          created_at: new Date().toISOString(),
        };

        setMessages(mPrev => [...mPrev, autoMsg]);
        setConversations(cPrev => cPrev.map(c => c.id === conversationId ? {
          ...c,
          updated_at: new Date().toISOString(),
          last_message: autoMsg
        } : c));
      }, 1400);
    }
  };

  const respondToOffer = (
    messageId: string, 
    status: 'accepted' | 'declined' | 'countered', 
    counterAmount?: number
  ) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          offer_status: status,
          counter_amount: counterAmount,
        };
      }
      return m;
    }));

    // Send a confirmation message in the thread
    const targetMsg = messages.find(m => m.id === messageId);
    if (targetMsg) {
      const text = status === 'accepted'
        ? `Offer of $${targetMsg.offer_amount?.toLocaleString()} has been ACCEPTED!`
        : status === 'declined'
        ? `Offer of $${targetMsg.offer_amount?.toLocaleString()} was declined.`
        : `Counter-offer sent: $${counterAmount?.toLocaleString()}`;

      const sysMsg: Message = {
        id: `msg_sys_${Date.now()}`,
        conversation_id: targetMsg.conversation_id,
        sender_id: currentUser.id,
        content: text,
        is_offer: true,
        offer_amount: status === 'countered' ? counterAmount : targetMsg.offer_amount,
        offer_status: status,
        counter_amount: counterAmount,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, sysMsg]);
    }
  };

  const getConversationMessages = (conversationId: string): Message[] => {
    return messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const getActiveConversation = () => {
    if (!activeConversationId) return null;
    const conv = conversations.find(c => c.id === activeConversationId);
    if (!conv) return null;

    const listing = getListingById(conv.listing_id);
    const otherUserId = conv.buyer_id === currentUser.id ? conv.seller_id : conv.buyer_id;
    const otherUser = getUserById(otherUserId);

    return { conversation: conv, listing, otherUser };
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      condition: 'All',
      radiusMiles: userLocation.radius_miles || 15,
      sortBy: 'newest',
      status: 'active',
    });
  };

  // Autocomplete search suggestions
  const searchSuggestions = useMemo(() => {
    if (!filters.query.trim()) {
      return ['MacBook Pro', 'Tesla Model 3', 'Sony Camera', 'Herman Miller', 'Free Stuff', 'Arc\'teryx', 'Fender Strat'];
    }
    const q = filters.query.toLowerCase();
    const matches = new Set<string>();
    listings.forEach(l => {
      if (l.title.toLowerCase().includes(q)) matches.add(l.title);
      if (l.category.toLowerCase().includes(q)) matches.add(l.category);
    });
    return Array.from(matches).slice(0, 5);
  }, [filters.query, listings]);

  // Distance helper (Haversine formula approximation)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filtered & Sorted Listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // 1. Status
      if (filters.status === 'active' && item.status !== 'active') return false;

      // 2. Category
      if (filters.category !== 'All' && item.category !== filters.category) return false;

      // 3. Condition
      if (filters.condition !== 'All' && item.condition !== filters.condition) return false;

      // 4. Price range
      if (filters.minPrice !== '') {
        const min = parseFloat(filters.minPrice);
        if (!isNaN(min) && item.price < min) return false;
      }
      if (filters.maxPrice !== '') {
        const max = parseFloat(filters.maxPrice);
        if (!isNaN(max) && item.price > max) return false;
      }

      // 5. Search query
      if (filters.query.trim() !== '') {
        const q = filters.query.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inCat = item.category.toLowerCase().includes(q);
        const inCity = item.location_geojson.city.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inCat && !inCity) return false;
      }

      // 6. Distance Radius
      if (filters.radiusMiles > 0 && item.location_geojson?.coordinates) {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          item.location_geojson.coordinates[1],
          item.location_geojson.coordinates[0]
        );
        if (dist > filters.radiusMiles) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (filters.sortBy === 'price_low') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price_high') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'popular') {
        return ((b.views_count || 0) + (b.saved_count || 0) * 3) - ((a.views_count || 0) + (a.saved_count || 0) * 3);
      }
      if (filters.sortBy === 'distance') {
        const distA = calculateDistance(
          userLocation.lat, userLocation.lng,
          a.location_geojson.coordinates[1], a.location_geojson.coordinates[0]
        );
        const distB = calculateDistance(
          userLocation.lat, userLocation.lng,
          b.location_geojson.coordinates[1], b.location_geojson.coordinates[0]
        );
        return distA - distB;
      }
      return 0;
    });
  }, [listings, filters, userLocation]);

  const resetDatabaseToSeed = () => {
    localStorage.clear();
    setAllUsers([CURRENT_USER, ...OTHER_USERS]);
    setCurrentUserId(CURRENT_USER.id);
    setListings(INITIAL_LISTINGS);
    setSavedListingIds(INITIAL_SAVED_IDS);
    setConversations(INITIAL_CONVERSATIONS);
    setMessages(INITIAL_MESSAGES);
    setUserLocationState({ ...LOCATION_PRESETS[0], radius_miles: 15 });
    resetFilters();
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        availableUsers: allUsers,
        setCurrentUserById,
        listings,
        addListing,
        updateListingStatus,
        deleteListing,
        getListingById,
        getUserById,
        savedListingIds,
        toggleSaveListing,
        isListingSaved,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        startOrGetConversation,
        sendMessage,
        respondToOffer,
        getConversationMessages,
        getActiveConversation,
        currentView,
        setCurrentView,
        selectedListingId,
        setSelectedListingId,
        viewListingDetail,
        userLocation,
        setUserLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        filters,
        setFilters,
        resetFilters,
        filteredListings,
        searchSuggestions,
        resetDatabaseToSeed,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = (): MarketplaceContextType => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
