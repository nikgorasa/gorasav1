import { Hotel, SearchParams, TravelPackage } from "../types";

interface HotelData {
  global: Hotel[];
}

interface PackageData {
  packages: TravelPackage[];
}

let cachedGlobalHotels: HotelData | null = null;
let cachedPackages: PackageData | null = null;

async function loadGlobalHotels(): Promise<HotelData> {
  if (cachedGlobalHotels) return cachedGlobalHotels;
  
  const response = await fetch('/data/hotels.json');
  if (!response.ok) {
    throw new Error('Failed to load global hotels data');
  }
  const data = await response.json();
  cachedGlobalHotels = { global: data.global };
  return cachedGlobalHotels;
}

async function loadPackages(): Promise<PackageData> {
  if (cachedPackages) return cachedPackages;
  
  const response = await fetch('/data/packages.json');
  if (!response.ok) {
    throw new Error('Failed to load packages data');
  }
  cachedPackages = await response.json();
  return cachedPackages;
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

function filterPackages(packages: TravelPackage[], params: SearchParams): TravelPackage[] {
  return packages.filter(pkg => 
    pkg.title.toLowerCase().includes(params.location.toLowerCase()) ||
    params.location.toLowerCase() === 'all' ||
    params.location.toLowerCase() === ''
  );
}

export async function searchGlobalPartnersHotels(params: SearchParams): Promise<Hotel[]> {
  const data = await loadGlobalHotels();
  let hotels = filterHotels(data.global, params);
  return adjustPriceForStay(hotels, params);
}

export async function searchGlobalPackages(params: SearchParams): Promise<TravelPackage[]> {
  const data = await loadPackages();
  let packages = filterPackages(data.packages, params);
  return packages;
}