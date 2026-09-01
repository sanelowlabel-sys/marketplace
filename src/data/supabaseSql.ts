export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- SANE MARKETPLACE - SUPABASE POSTGRESQL SCHEMA & SECURITY RULES (RLS)
-- Database Architecture for Peer-to-Peer (P2P) Marketplace
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Optional for advanced geospatial radius queries

-- 2. USERS TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    location TEXT DEFAULT 'San Francisco, CA',
    rating NUMERIC(3,2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    response_rate TEXT DEFAULT '98%',
    response_time TEXT DEFAULT 'Within an hour',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL CHECK (category IN (
        'Electronics', 'Vehicles', 'Apparel', 'Home Goods', 
        'Free Stuff', 'Musical Instruments', 'Sports & Outdoors', 'Collectibles'
    )),
    condition TEXT NOT NULL CHECK (condition IN ('New', 'Like New', 'Good', 'Fair')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold')),
    location_geojson JSONB NOT NULL DEFAULT '{"type": "Point", "coordinates": [-122.4194, 37.7749], "city": "San Francisco", "state": "CA", "zip": "94103", "hide_exact": true, "radius_miles": 10}'::jsonb,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. LISTING IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(listing_id, buyer_id)
);

-- 6. MESSAGES TABLE (Real-Time Negotiation & Meeting Points)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_offer BOOLEAN DEFAULT FALSE,
    offer_amount NUMERIC(12,2),
    offer_status TEXT CHECK (offer_status IN ('pending', 'accepted', 'declined', 'countered')),
    counter_amount NUMERIC(12,2),
    meeting_point JSONB, -- { name, address, type, coordinates: [lng, lat] }
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. SAVED LISTINGS (Wishlist)
CREATE TABLE IF NOT EXISTS public.saved_listings (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, listing_id)
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE DISCOVERY & SEARCH
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id, display_order);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_seller ON public.conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "Public users profiles are viewable by everyone" 
ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE USING (auth.uid() = id);

-- Listings RLS
CREATE POLICY "Active listings are viewable by everyone" 
ON public.listings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert listings" 
ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings" 
ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings" 
ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Listing Images RLS
CREATE POLICY "Listing images are viewable by everyone" 
ON public.listing_images FOR SELECT USING (true);

CREATE POLICY "Sellers can manage images for their listings" 
ON public.listing_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid())
);

-- Conversations RLS (Only participants can access)
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can initiate conversations" 
ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Messages RLS
CREATE POLICY "Participants can view conversation messages" 
ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
);

CREATE POLICY "Participants can send messages" 
ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
);

-- Saved Listings RLS
CREATE POLICY "Users can view their own saved listings" 
ON public.saved_listings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark listings" 
ON public.saved_listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks" 
ON public.saved_listings FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- REALTIME REPLICATION CONFIGURATION
-- ==============================================================================
-- Enable Realtime events for chat messaging and listing status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (Run in Supabase Storage UI / SQL)
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'listing-photos');
-- CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');
`;
