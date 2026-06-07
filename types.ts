
export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  price: number;
  rating: number;
  imageUrl: string;
  category: 'adventure' | 'beach' | 'city' | 'nature';
}

export interface SearchParams {
  location: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  childrenAges: number[];
  infants: number;
}

export interface FlightSearchParams extends SearchParams {
  origin: string;
  tripType: 'one-way' | 'return';
}

export interface Flight {
  id: string;
  airline: 'Indigo' | 'Air India';
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  tier: 'Lite' | 'Standard' | 'Flexi Plus' | 'Economy' | 'Business';
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  imageUrl: string;
  description: string;
  brand: 'Oyo' | 'Premium' | 'Global';
  category?: string;
}

export interface TravelPackage {
  id: string;
  title: string;
  duration: string;
  price: number;
  originalPrice?: number;
  inclusions: string[];
  imageUrl: string;
  provider: string;
  rating: number;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'corporate' | 'agent';
  companyName?: string;
  loyaltyPoints: number;
  loyaltyTier: 'Silver' | 'Gold' | 'Platinum';
  walletBalance: number;
}

export interface TripSuggestion {
  title: string;
  highlights: string[];
  vibe: string;
  bestTime: string;
}

export interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  itemName: string;
  providerOrAirline: string;
  price: number;
  originalPrice: number;
  discountApplied: number;
  couponCodeUsed?: string;
  bookedDate: string;
  travelDates: string;
  status: 'Confirmed' | 'Cancelled' | 'Refunded';
  pnr: string;
  seatOrRoom?: string;
  paxCount: number;
}

export interface PromoCode {
  code: string;
  discountValue: number;
  type: 'flat' | 'percentage';
  description: string;
  minBookingValue: number;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface PackageInquiry {
  id: string;
  destination: string;
  travelerName: string;
  travelerEmail: string;
  numberOfDays: number;
  inclusionsSelected: string[];
  specificDemands?: string;
  submittedAt: string;
  status: 'Inquired' | 'Contacted' | 'Quoted' | 'Success';
  priceEstimated: number;
}

