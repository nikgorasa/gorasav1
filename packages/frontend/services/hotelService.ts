import { Hotel, SearchParams } from "../types";

interface HotelData {
  premium: Hotel[];
  oyo: Hotel[];
  global: Hotel[];
}

let cachedHotels: HotelData | null = null;

async function loadHotels(): Promise<HotelData> {
  if (cachedHotels) return cachedHotels;
  
  const response = await fetch('/data/hotels.json');
  if (!response.ok) {
    throw new Error('Failed to load hotels data');
  }
  cachedHotels = await response.json();
  return cachedHotels;
}

function filterHotels(hotels: Hotel[], params: SearchParams): Hotel[] {
  return hotels.filter(hotel => 
    hotel.location.toLowerCase().includes(params.location.toLowerCase())
  );
}

function adjustPriceForStay(hotels: Hotel[], params: SearchParams): Hotel[] {
  const start = new Date(params.startDate);
  const end = new Date(params.endDate);
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  return hotels.map(hotel => ({
    ...hotel,
    price: hotel.price * nights
  }));
}

export async function searchPremiumHotels(params: SearchParams): Promise<Hotel[]> {
  const data = await loadHotels();
  let hotels = filterHotels(data.premium, params);
  return adjustPriceForStay(hotels, params);
}

export async function searchOyoHotels(params: SearchParams): Promise<Hotel[]> {
  const data = await loadHotels();
  let hotels = filterHotels(data.oyo, params);
  return adjustPriceForStay(hotels, params);
}