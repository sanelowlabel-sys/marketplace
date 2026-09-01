export type ListingCategory = 
  | 'Electronics' 
  | 'Vehicles' 
  | 'Apparel' 
  | 'Home Goods' 
  | 'Free Stuff' 
  | 'Musical Instruments' 
  | 'Sports & Outdoors' 
  | 'Collectibles';

export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export type ListingStatus = 'active' | 'pending' | 'sold';

export interface User {
  id: string;
  full_name: string;
  avatar_url: string;
  location: string;
  rating: number;
  review_count: number;
  verified: boolean;
  member_since: string;
  response_rate: string;
  response_time: string;
  created_at: string;
}

export interface LocationGeoJSON {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
  address: string;
  city: string;
  state: string;
  zip: string;
  hide_exact: boolean;
  radius_miles: number;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller?: User;
  title: string;
  description: string;
  price: number; // 0 for free
  category: ListingCategory;
  condition: ListingCondition;
  status: ListingStatus;
  location_geojson: LocationGeoJSON;
  images: ListingImage[];
  created_at: string;
  views_count?: number;
  saved_count?: number;
}

export interface MeetingPoint {
  name: string;
  address: string;
  type: 'safe_zone' | 'public_place' | 'custom';
  coordinates: [number, number];
  notes?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: User;
  content: string;
  is_offer?: boolean;
  offer_amount?: number;
  offer_status?: 'pending' | 'accepted' | 'declined' | 'countered';
  counter_amount?: number;
  meeting_point?: MeetingPoint;
  image_url?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing?: Listing;
  buyer_id: string;
  buyer?: User;
  seller_id: string;
  seller?: User;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: number;
}

export interface SavedListing {
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface UserLocation {
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  radius_miles: number;
}

export interface FilterState {
  query: string;
  category: ListingCategory | 'All';
  minPrice: string;
  maxPrice: string;
  condition: ListingCondition | 'All';
  radiusMiles: number;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'distance' | 'popular';
  status: 'all' | 'active';
}
