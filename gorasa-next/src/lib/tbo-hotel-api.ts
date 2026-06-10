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
} from "./tbo-hotel-types";

const AUTH_URL = "http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate";
const SEARCH_URL = "https://affiliate.tektravels.com/HotelAPI/Search";
const PREBOOK_URL = "https://affiliate.tektravels.com/HotelAPI/PreBook";
const BOOK_URL = "https://HotelBE.tektravels.com/hotelservice.svc/rest/book/";
const BOOKING_DETAIL_URL = "https://affiliate.tektravels.com/HotelAPI/GetBookingDetail";
const STATIC_BASE = "http://api.tbotechnology.in/TBOHolidays_HotelAPI";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`TBO Hotel HTTP GET ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export function authenticate(req: TBOHotelAuthRequest): Promise<TBOHotelAuthResponse> {
  return post<TBOHotelAuthResponse>(AUTH_URL, req);
}

export function searchHotels(req: TBOHotelSearchRequest): Promise<TBOHotelSearchResponse> {
  return post<TBOHotelSearchResponse>(SEARCH_URL, req);
}

export function preBook(req: TBOHotelPreBookRequest): Promise<TBOHotelPreBookResponse> {
  return post<TBOHotelPreBookResponse>(PREBOOK_URL, req);
}

export function bookHotel(req: TBOHotelBookRequest): Promise<TBOHotelBookResponse> {
  return post<TBOHotelBookResponse>(BOOK_URL, req);
}

export function getBookingDetail(req: TBOHotelBookingDetailRequest): Promise<TBOHotelBookingDetailResponse> {
  return post<TBOHotelBookingDetailResponse>(BOOKING_DETAIL_URL, req);
}

export function getCountries(): Promise<TBOHotelCountry[]> {
  return get<TBOHotelCountry[]>(`${STATIC_BASE}/CountryList`);
}

export function getCities(countryCode: string): Promise<TBOHotelCity[]> {
  return get<TBOHotelCity[]>(`${STATIC_BASE}/CityList?CountryCode=${countryCode}`);
}

export function getHotelCodeList(cityCode: string): Promise<TBOHotelCodeItem[]> {
  return get<TBOHotelCodeItem[]>(`${STATIC_BASE}/TBOHotelCodeList?CityCode=${cityCode}`);
}

export function getHotelDetails(hotelCode: string): Promise<TBOHotelDetail> {
  return get<TBOHotelDetail>(`${STATIC_BASE}/HotelDetails?HotelCode=${hotelCode}`);
}
