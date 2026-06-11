import type {
  TBOHotelAuthRequest,
  TBOHotelAuthResponse,
  TBOHotelSearchRequest,
  TBOHotelSearchResponse,
  TBOHotelPreBookRequest,
  TBOHotelPreBookResponse,
  TBOHotelBookRequest,
  TBOHotelBookResponse,
  TBOHotelBookingDetailRequest,
  TBOHotelBookingDetailResponse,
  TBOHotelCountry,
  TBOHotelCity,
  TBOHotelCodeItem,
  TBOHotelDetail,
  TBOStatus,
} from "./tbo-hotel-types";

const BASE_URL = "https://api.tbotechnology.in/TBOHolidays_HotelAPI";

const HOTEL_USERNAME = process.env.TBO_HOTEL_USERNAME || "TBOStaticAPITest";
const HOTEL_PASSWORD = process.env.TBO_HOTEL_PASSWORD || "Tbo@11530818";

const AUTH_HEADER = { Authorization: `Basic ${btoa(`${HOTEL_USERNAME}:${HOTEL_PASSWORD}`)}` };

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`TBO Hotel HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
  });
  if (!res.ok) {
    throw new Error(`TBO Hotel HTTP GET ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export function authenticate(req: TBOHotelAuthRequest): Promise<TBOHotelAuthResponse> {
  return post<TBOHotelAuthResponse>(`${BASE_URL}/Authenticate`, req);
}

export function searchHotels(req: TBOHotelSearchRequest): Promise<TBOHotelSearchResponse> {
  return post<TBOHotelSearchResponse>(`${BASE_URL}/Search`, req);
}

export function preBook(req: TBOHotelPreBookRequest): Promise<TBOHotelPreBookResponse> {
  return post<TBOHotelPreBookResponse>(`${BASE_URL}/PreBook`, req);
}

export function bookHotel(req: TBOHotelBookRequest): Promise<TBOHotelBookResponse> {
  return post<TBOHotelBookResponse>(`${BASE_URL}/Book`, req);
}

export function getBookingDetail(req: TBOHotelBookingDetailRequest): Promise<TBOHotelBookingDetailResponse> {
  return post<TBOHotelBookingDetailResponse>(`${BASE_URL}/GetBookingDetail`, req);
}

export function getCountries(): Promise<TBOHotelCountry[]> {
  return get<TBOHotelCountry[]>(`${BASE_URL}/CountryList`);
}

export function getCities(countryCode: string): Promise<TBOHotelCity[]> {
  return post<TBOHotelCity[]>(`${BASE_URL}/CityList`, { CountryCode: countryCode });
}

export function getHotelCodeList(cityCode: string): Promise<{ Status: TBOStatus; Hotels: TBOHotelCodeItem[] }> {
  return post(`${BASE_URL}/TBOHotelCodeList`, { CityCode: cityCode });
}

export function getHotelDetails(hotelCodes: string): Promise<{ Status: { Code: number; Description: string }; HotelDetails: TBOHotelDetail[] }> {
  return post(`${BASE_URL}/HotelDetails`, { HotelCodes: hotelCodes });
}
