export interface Flight {
  id: string;
  airline: "Indigo" | "Air India";
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  tier: "Lite" | "Standard" | "Flexi Plus" | "Economy" | "Business";
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  imageUrl: string;
  description: string;
  brand: "Oyo" | "Premium" | "Global";
  category?: string;
}

export interface SearchParams {
  location: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
}

export interface FlightSearchParams extends SearchParams {
  origin: string;
  tripType: "one-way" | "return";
}

export const FLIGHTS_DATA: { indigo: Flight[]; airIndia: Flight[] } = {
  indigo: [
    { id: "6E-204", airline: "Indigo", flightNumber: "6E-204", origin: "Mumbai", destination: "Delhi", departureTime: "06:30", arrivalTime: "08:45", duration: "2h 15m", stops: 0, price: 4800, tier: "Lite" },
    { id: "6E-308", airline: "Indigo", flightNumber: "6E-308", origin: "Mumbai", destination: "Delhi", departureTime: "09:15", arrivalTime: "11:30", duration: "2h 15m", stops: 0, price: 5200, tier: "Standard" },
    { id: "6E-412", airline: "Indigo", flightNumber: "6E-412", origin: "Mumbai", destination: "Delhi", departureTime: "13:45", arrivalTime: "16:00", duration: "2h 15m", stops: 0, price: 6100, tier: "Flexi Plus" },
    { id: "6E-528", airline: "Indigo", flightNumber: "6E-528", origin: "Mumbai", destination: "Delhi", departureTime: "18:20", arrivalTime: "20:35", duration: "2h 15m", stops: 0, price: 5500, tier: "Standard" },
    { id: "6E-642", airline: "Indigo", flightNumber: "6E-642", origin: "Mumbai", destination: "Delhi", departureTime: "21:30", arrivalTime: "23:45", duration: "2h 15m", stops: 0, price: 4500, tier: "Lite" },
    { id: "6E-180", airline: "Indigo", flightNumber: "6E-180", origin: "Mumbai", destination: "Delhi", departureTime: "07:00", arrivalTime: "09:20", duration: "2h 20m", stops: 1, price: 4200, tier: "Lite" },
  ],
  airIndia: [
    { id: "AI-101", airline: "Air India", flightNumber: "AI-101", origin: "Mumbai", destination: "Delhi", departureTime: "06:00", arrivalTime: "08:20", duration: "2h 20m", stops: 0, price: 7200, tier: "Economy" },
    { id: "AI-203", airline: "Air India", flightNumber: "AI-203", origin: "Mumbai", destination: "Delhi", departureTime: "10:30", arrivalTime: "12:50", duration: "2h 20m", stops: 0, price: 8500, tier: "Economy" },
    { id: "AI-315", airline: "Air India", flightNumber: "AI-315", origin: "Mumbai", destination: "Delhi", departureTime: "14:15", arrivalTime: "16:35", duration: "2h 20m", stops: 0, price: 12500, tier: "Business" },
    { id: "AI-427", airline: "Air India", flightNumber: "AI-427", origin: "Mumbai", destination: "Delhi", departureTime: "19:45", arrivalTime: "22:05", duration: "2h 20m", stops: 0, price: 9800, tier: "Economy" },
    { id: "AI-550", airline: "Air India", flightNumber: "AI-550", origin: "Mumbai", destination: "Delhi", departureTime: "08:30", arrivalTime: "11:00", duration: "2h 30m", stops: 1, price: 6800, tier: "Economy" },
  ],
};

export const HOTELS_DATA: { premium: Hotel[]; oyo: Hotel[]; global: Hotel[] } = {
  premium: [
    { id: "premium-1", name: "The Amaya Luxury Resort Goa", location: "Goa", price: 15200, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800", description: "Oceanfront luxury resort with private beach access, infinity pool, and world-class spa.", brand: "Premium", category: "Luxury Resort" },
    { id: "premium-2", name: "Taj Exotica Maldives", location: "Maldives", price: 45000, rating: 4.9, imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800", description: "Overwater villas with glass floors, private butler service, and marine life viewing.", brand: "Premium", category: "Overwater Villa" },
    { id: "premium-3", name: "The Leela Palace Udaipur", location: "Udaipur", price: 28500, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", description: "Palace hotel on Lake Pichola with royal suites and traditional Rajasthani architecture.", brand: "Premium", category: "Palace Hotel" },
    { id: "premium-4", name: "Six Senses Fort Barwara", location: "Rajasthan", price: 32000, rating: 4.7, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", description: "14th-century fort converted to luxury wellness resort.", brand: "Premium", category: "Heritage Wellness" },
    { id: "premium-5", name: "Aman-i-Khas Ranthambore", location: "Ranthambore", price: 38000, rating: 4.9, imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", description: "Luxury tented camp on the edge of Ranthambore National Park.", brand: "Premium", category: "Luxury Camp" },
  ],
  oyo: [
    { id: "oyo-1", name: "OYO Townhouse 145 Goa Calangute", location: "Goa", price: 2800, rating: 4.2, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", description: "Modern rooms with free Wi-Fi, AC, and complimentary breakfast.", brand: "Oyo", category: "OYO Townhouse" },
    { id: "oyo-2", name: "OYO Flagship 289 Mumbai Andheri", location: "Mumbai", price: 3500, rating: 4.3, imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", description: "Business-friendly hotel near metro station.", brand: "Oyo", category: "OYO Flagship" },
    { id: "oyo-3", name: "Capital O 1234 Delhi Connaught Place", location: "Delhi", price: 2200, rating: 4.1, imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800", description: "Central location near Rajiv Chowk.", brand: "Oyo", category: "Capital O" },
    { id: "oyo-4", name: "Spot On 5678 Bangalore Koramangala", location: "Bangalore", price: 1800, rating: 4.0, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", description: "Budget stay in tech hub.", brand: "Oyo", category: "Spot On" },
    { id: "oyo-5", name: "SilverKey 9012 Jaipur City Center", location: "Jaipur", price: 4200, rating: 4.4, imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", description: "Premium OYO category with enhanced amenities.", brand: "Oyo", category: "SilverKey" },
    { id: "oyo-6", name: "OYO Townhouse 334 Kochi Marine Drive", location: "Kochi", price: 2500, rating: 4.2, imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800", description: "Sea-facing rooms with Marine Drive views.", brand: "Oyo", category: "OYO Townhouse" },
    { id: "oyo-7", name: "Capital O 7788 Hyderabad Hitech City", location: "Hyderabad", price: 2100, rating: 4.1, imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", description: "Near IT corridor with 24-hour check-in.", brand: "Oyo", category: "Capital O" },
    { id: "oyo-8", name: "OYO Flagship 4455 Chennai Marina Beach", location: "Chennai", price: 3200, rating: 4.3, imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800", description: "Beachside location with Marina views.", brand: "Oyo", category: "OYO Flagship" },
  ],
  global: [
    { id: "global-1", name: "Marriott Resort Goa", location: "Goa", price: 12500, rating: 4.6, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800", description: "5-star resort with multiple pools and kids club.", brand: "Global", category: "Deluxe Room" },
    { id: "global-2", name: "Hilton Shillim Estate", location: "Maharashtra", price: 14800, rating: 4.7, imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", description: "Wellness retreat in Sahyadri mountains.", brand: "Global", category: "Executive Suite" },
    { id: "global-3", name: "Hyatt Regency Delhi", location: "Delhi", price: 11200, rating: 4.5, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", description: "Luxury hotel near diplomatic enclave.", brand: "Global", category: "Regency Club" },
    { id: "global-4", name: "InterContinental Maldives", location: "Maldives", price: 35000, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800", description: "Lagoon-facing overwater villas.", brand: "Global", category: "Overwater Villa" },
    { id: "global-5", name: "ITC Grand Chola Chennai", location: "Chennai", price: 9800, rating: 4.6, imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", description: "Luxury hotel with Chola dynasty architecture.", brand: "Global", category: "Executive Club" },
    { id: "global-6", name: "JW Marriott Mumbai Sahar", location: "Mumbai", price: 13500, rating: 4.5, imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800", description: "Airport-adjacent luxury with rooftop pool.", brand: "Global", category: "Deluxe Room" },
  ],
};

export function searchFlights(params: FlightSearchParams): Flight[] {
  const allFlights = [...FLIGHTS_DATA.indigo, ...FLIGHTS_DATA.airIndia];
  return allFlights.filter(
    (f) =>
      f.origin.toLowerCase() === params.origin.toLowerCase() &&
      f.destination.toLowerCase() === params.location.toLowerCase()
  );
}

export function searchHotels(params: SearchParams): Hotel[] {
  const allHotels = [...HOTELS_DATA.premium, ...HOTELS_DATA.oyo, ...HOTELS_DATA.global];
  return allHotels.filter((h) =>
    h.location.toLowerCase().includes(params.location.toLowerCase())
  );
}

export function adjustHotelPrice(hotel: Hotel, startDate: string, endDate: string): Hotel {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return { ...hotel, price: hotel.price * nights };
}

export const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Lucknow", "Goa", "Kochi", "Udaipur", "Varanasi", "Shimla", "Manali",
  "Darjeeling", "Rishikesh", "Agra", "Jodhpur", "Mysore", "Ooty", "Kodaikanal",
  "Coorg", "Mount Abu", "Amritsar", "Chandigarh", "Dehradun", "Nainital", "Mussoorie",
];
