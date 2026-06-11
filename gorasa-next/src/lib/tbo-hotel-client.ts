import type {
  TBOHotelSearchRequest,
  TBOHotelPreBookRequest,
  TBOHotelBookRequest,
  TBOHotelBookingDetailRequest,
  TBOHotelDisplay,
  TBOHotelRoomDisplay,
  TBOHotelSearchOutput,
  TBOHotelPreBookOutput,
  TBOHotelBookOutput,
  TBOHotelBookingDetailOutput,
} from "./tbo-hotel-types";
import * as api from "./tbo-hotel-api";
import * as mock from "./tbo-hotel-mock";

const hasCredentials = !!(process.env.TBO_HOTEL_USERNAME && process.env.TBO_HOTEL_PASSWORD)
  && process.env.TBO_HOTEL_FORCE_MOCK !== "true";

function toDisplay(
  h: { HotelCode: string; Currency: string; Rooms: any[] },
): TBOHotelDisplay {
  const rooms: TBOHotelRoomDisplay[] = h.Rooms.map((r: any, ri: number) => {
    const roomName = Array.isArray(r.Name) ? r.Name[0] : (r.Name || "Room");
    const totalFare = r.TotalFare || 0;
    const totalTax = r.TotalTax || 0;
    const dayRates = r.DayRates?.[0] || [];
    const cancelPolicies = r.CancelPolicies || [];

    return {
      roomId: r.RoomID?.[0] || `${h.HotelCode}-${ri}`,
      roomName,
      name: roomName,
      bookingCode: r.BookingCode || "",
      mealType: r.MealType || "Room_Only",
      isRefundable: r.IsRefundable ?? false,
      totalFare,
      totalTax,
      inclusion: r.Inclusion || "",
      dayRates: dayRates.map((dr: any) => ({
        basePrice: dr.BasePrice || 0,
      })),
      cancelPolicy: cancelPolicies[0]
        ? `${cancelPolicies[0].ChargeType}: ${cancelPolicies[0].CancellationCharge}%`
        : "Non Refundable",
      cancellationPolicy: cancelPolicies[0]
        ? `${cancelPolicies[0].ChargeType}: ${cancelPolicies[0].CancellationCharge}%`
        : "Non Refundable",
      roomIndex: ri + 1,
      typeCode: "",
      ratePlanCode: "",
      roomFare: dayRates[0]?.BasePrice || totalFare,
      roomTax: totalTax / Math.max(1, dayRates.length || 1),
      currency: h.Currency,
      amenities: [],
    };
  });

  const minFare = Math.min(...rooms.map(r => r.totalFare));
  const details = _hotelDetailsCache[h.HotelCode] || {};
  const ratingMap: Record<string, number> = {
    "OneStar": 1, "TwoStar": 2, "ThreeStar": 3, "FourStar": 4, "FiveStar": 5,
  };

  return {
    hotelCode: Number(h.HotelCode) || 0,
    name: details.name || `Hotel ${h.HotelCode}`,
    hotelRating: ratingMap[details.rating] || 3,
    location: details.city || details.address || "",
    currency: h.Currency,
    minTotalFare: minFare,
    rooms,
    resultIndex: 1,
    picture: "",
    rating: "ThreeStar",
    address: details.address || "",
    tripAdvisorRating: 0,
    description: "",
    price: minFare,
    starRating: ratingMap[details.rating] || 3,
    originalPrice: minFare * 1.2,
  };
}

let _lastHotelResults: any[] = [];
let _lastTraceId = "";

export function setLastHotelResults(results: any[], traceId: string): void {
  _lastHotelResults = results;
  _lastTraceId = traceId;
}

const CITY_TO_CODE: Record<string, number> = {
  goa: 15648,
  mumbai: 13484,
  delhi: 13482,
  "new delhi": 13482,
  bangalore: 14565,
  bengaluru: 14565,
  chennai: 14564,
  hyderabad: 15664,
  jaipur: 15197,
  kolkata: 13543,
  pune: 14612,
  kodaikanal: 123608,
  ooty: 13014,
  manali: 12597,
  varanasi: 14312,
};

let _hotelCodesCache: Record<string, string> = {};
let _hotelDetailsCache: Record<string, { name: string; rating: string; address: string; city: string }> = {};

async function resolveHotelCodes(city?: string, hotelCodes?: string, cityCode?: string): Promise<string> {
  // 1. If hotel codes provided directly, use them
  if (hotelCodes) return hotelCodes;

  // 2. If city code provided from dropdown, use it directly
  if (cityCode) {
    const cacheKey = `code:${cityCode}`;
    if (_hotelCodesCache[cacheKey]) return _hotelCodesCache[cacheKey];

    try {
      const res = await api.getHotelCodeList(cityCode);
      if (res.Status?.Code === 200 && res.Hotels?.length > 0) {
        const codeStr = res.Hotels.slice(0, 50).map(c => c.HotelCode).join(",");
        _hotelCodesCache[cacheKey] = codeStr;
        for (const h of res.Hotels) {
          _hotelDetailsCache[h.HotelCode] = {
            name: h.HotelName,
            rating: h.HotelRating,
            address: h.Address || "",
            city: h.CityName || city || "",
          };
        }
        console.log(`Resolved ${res.Hotels.length} hotel codes for city code ${cityCode} (showing first 50)`);
        return codeStr;
      }
      console.warn(`No hotel codes returned for city code ${cityCode}:`, res.Status?.Description);
    } catch (e) {
      console.warn(`Failed to fetch hotel codes for city code ${cityCode}:`, e);
    }
    return "";
  }

  // 3. Fallback: try hardcoded mapping by city name
  if (!city) return "";
  const key = city.toLowerCase().trim();
  if (_hotelCodesCache[key]) return _hotelCodesCache[key];

  const mappedCode = CITY_TO_CODE[key];
  if (!mappedCode) {
    console.warn(`No city code mapping for "${city}" and no cityCode provided`);
    return "";
  }

  try {
    const res = await api.getHotelCodeList(String(mappedCode));
    if (res.Status?.Code === 200 && res.Hotels?.length > 0) {
      const codeStr = res.Hotels.slice(0, 50).map(c => c.HotelCode).join(",");
      _hotelCodesCache[key] = codeStr;
      for (const h of res.Hotels) {
        _hotelDetailsCache[h.HotelCode] = {
          name: h.HotelName,
          rating: h.HotelRating,
          address: h.Address || "",
          city: h.CityName || city,
        };
      }
      console.log(`Resolved ${res.Hotels.length} hotel codes for ${city} (showing first 50)`);
      return codeStr;
    }
    console.warn(`No hotel codes returned for ${city}:`, res.Status?.Description);
  } catch (e) {
    console.warn(`Failed to fetch hotel codes for ${city}:`, e);
  }

  return "";
}

export async function searchHotels(params: {
  checkIn: string;
  checkOut: string;
  hotelCodes?: string;
  city?: string;
  cityCode?: string;
  rooms: { adults: number; children: number; childrenAges: number[] }[];
  guestNationality?: string;
  preferredCurrency?: string;
}): Promise<TBOHotelSearchOutput> {
  if (hasCredentials) {
    try {
      const resolvedCodes = await resolveHotelCodes(params.city, params.hotelCodes, params.cityCode);
      if (!resolvedCodes) {
        console.warn("No hotel codes resolved for city:", params.city, "— falling back to mock");
      } else {
        const searchReq: TBOHotelSearchRequest = {
          CheckIn: params.checkIn,
          CheckOut: params.checkOut,
          HotelCodes: resolvedCodes,
          GuestNationality: params.guestNationality || "IN",
          PaxRooms: params.rooms.map(r => ({ Adults: r.adults, Children: r.children, ChildrenAges: r.childrenAges })),
          PreferredCurrency: params.preferredCurrency || "INR",
        };
        const res = await api.searchHotels(searchReq);
        if (res.Status?.Code === 200 && res.HotelResult?.length > 0) {
          const hotels = res.HotelResult.map(h => toDisplay(h));
          return { hotels, traceId: _lastTraceId };
        }
        throw new Error(`Hotel search failed: ${res.Status?.Description}`);
      }
    } catch (e) {
      console.warn("TBO hotel API search failed, fallback to mock:", e);
    }
  }

  const mockReq: TBOHotelSearchRequest = {
    CheckIn: params.checkIn,
    CheckOut: params.checkOut,
    HotelCodes: params.hotelCodes || "",
    GuestNationality: params.guestNationality || "IN",
    PaxRooms: params.rooms.map(r => ({ Adults: r.adults, Children: r.children, ChildrenAges: r.childrenAges })),
    PreferredCurrency: params.preferredCurrency || "INR",
    SearchedCities: params.city ? [params.city] : undefined,
  };
  const mockRes = mock.mockSearchHotels(mockReq);

  if (mockRes.HotelResult.length === 0) {
    return { hotels: [], traceId: "" };
  }

  const hotels = mockRes.HotelResult.map(h => {
    const info = mock.getHotelInfoByCode(h.HotelCode);
    const location = info?.CityName || params.city || "";

    const rooms: TBOHotelRoomDisplay[] = h.Rooms.map((r: any, ri: number) => ({
      roomId: r.RoomID?.[0] || "",
      roomName: r.Name?.[0] || "Room",
      name: r.Name?.[0] || "Room",
      bookingCode: r.BookingCode || "",
      mealType: r.MealType || "Room_Only",
      isRefundable: r.IsRefundable ?? false,
      totalFare: r.TotalFare || 0,
      totalTax: r.TotalTax || 0,
      inclusion: r.Inclusion || "",
      dayRates: (r.DayRates?.[0] || []).map((dr: any) => ({
        basePrice: dr.BasePrice || 0,
      })),
      cancelPolicy: r.CancelPolicies?.[0]
        ? `${r.CancelPolicies[0].ChargeType}: ${r.CancelPolicies[0].CancellationCharge}%`
        : "Non Refundable",
      cancellationPolicy: r.CancelPolicies?.[0]
        ? `${r.CancelPolicies[0].ChargeType}: ${r.CancelPolicies[0].CancellationCharge}%`
        : "Non Refundable",
      roomIndex: ri + 1,
      typeCode: r.RoomTypeCode || "",
      ratePlanCode: r.RatePlanCode || "",
      roomFare: r.DayRates?.[0]?.[0]?.BasePrice || 0,
      roomTax: (r.TotalTax || 0) / Math.max(1, (r.DayRates?.[0]?.length || 1)),
      currency: h.Currency,
      amenities: r.Amenities?.Amenity || [],
    }));

    return {
      hotelCode: Number(h.HotelCode) || 0,
      name: info?.HotelName || `Hotel ${h.HotelCode}`,
      hotelRating: info?.HotelRating || 0,
      location,
      currency: h.Currency,
      minTotalFare: Math.min(...rooms.map(r => r.totalFare)),
      rooms,
      resultIndex: 1,
      picture: info?.imageUrl || "",
      rating: "ThreeStar",
      address: "",
      tripAdvisorRating: 0,
      description: "",
      price: Math.min(...rooms.map(r => r.totalFare)),
      starRating: info?.HotelRating || 3,
      originalPrice: Math.min(...rooms.map(r => r.totalFare)) * 1.2,
    };
  });

  return { hotels, traceId: "" };
}

export async function preBook(params: {
  bookingCode: string;
}): Promise<TBOHotelPreBookOutput> {
  if (hasCredentials) {
    try {
      const req: TBOHotelPreBookRequest = {
        BookingCode: params.bookingCode,
      };
      const res = await api.preBook(req);
      if (res.Status?.Code === 200) {
        return {
          hotelName: res.HotelName,
          hotelCode: res.HotelCode,
          netAmount: res.NetAmount,
          roomRate: res.RoomRate,
          roomTax: res.RoomTax,
          serviceFee: res.ServiceFee,
          agentCommission: res.AgentCommission,
          tds: res.TDS,
          validationInfo: res.ValidationInfo,
          amenities: res.Amenities,
          rateConditions: res.RateConditions,
          taxBreakup: res.TaxBreakup.map(t => ({ chargeType: t.ChargeType, amount: t.Amount })),
          traceId: res.TraceId,
        };
      }
      throw new Error(`PreBook failed: ${res.Status?.Description}`);
    } catch (e) {
      console.warn("TBO hotel preBook failed, fallback to mock:", e);
    }
  }

  const mockRes = mock.mockPreBook(params.bookingCode);
  return {
    hotelName: mockRes.HotelName,
    hotelCode: mockRes.HotelCode,
    netAmount: mockRes.NetAmount,
    roomRate: mockRes.RoomRate,
    roomTax: mockRes.RoomTax,
    serviceFee: mockRes.ServiceFee,
    agentCommission: mockRes.AgentCommission,
    tds: mockRes.TDS,
    validationInfo: mockRes.ValidationInfo,
    amenities: mockRes.Amenities,
    rateConditions: mockRes.RateConditions,
    taxBreakup: mockRes.TaxBreakup.map(t => ({ chargeType: t.ChargeType, amount: t.Amount })),
    traceId: _lastTraceId,
  };
}

export async function bookHotel(params: {
  bookingCode: string;
  guestNationality: string;
  netAmount: number;
  hotelRoomsDetails: { passengers: {
    title: string; firstName: string; lastName: string;
    paxType: number; leadPassenger: boolean; age: number;
    email: string; phone: string;
  }[] }[];
  EndUserIp?: string;
}): Promise<TBOHotelBookOutput> {
  if (hasCredentials) {
    try {
      const req: TBOHotelBookRequest = {
        BookingCode: params.bookingCode,
        IsVoucherBooking: true,
        GuestNationality: params.guestNationality,
        NetAmount: params.netAmount,
        HotelRoomsDetails: params.hotelRoomsDetails.map(rd => ({
          HotelPassenger: rd.passengers.map(p => ({
            Title: p.title,
            FirstName: p.firstName,
            LastName: p.lastName,
            PaxType: p.paxType,
            LeadPassenger: p.leadPassenger,
            Age: p.age,
            Email: p.email,
            Phoneno: p.phone,
          })),
        })),
      };
      const res = await api.bookHotel(req);
      if (res.BookResult?.ResponseStatus === 1) {
        return {
          bookingId: res.BookResult.BookingId,
          confirmationNo: res.BookResult.ConfirmationNo,
          bookingRefNo: res.BookResult.BookingRefNo,
          invoiceNumber: res.BookResult.InvoiceNumber,
          hotelBookingStatus: res.BookResult.HotelBookingStatus,
          isPriceChanged: res.BookResult.IsPriceChanged,
        };
      }
      throw new Error(`Hotel book failed: ${res.BookResult?.Error?.ErrorMessage || ""}`);
    } catch (e) {
      console.warn("TBO hotel book failed, fallback to mock:", e);
    }
  }

  const mockReq: TBOHotelBookRequest = {
    BookingCode: params.bookingCode,
    IsVoucherBooking: true,
    GuestNationality: params.guestNationality,
    NetAmount: params.netAmount,
    HotelRoomsDetails: params.hotelRoomsDetails.map(rd => ({
      HotelPassenger: rd.passengers.map(p => ({
        Title: p.title,
        FirstName: p.firstName,
        LastName: p.lastName,
        PaxType: p.paxType,
        LeadPassenger: p.leadPassenger,
        Age: p.age,
        Email: p.email,
        Phoneno: p.phone,
      })),
    })),
  };
  const mockRes = mock.mockBook(mockReq);
  return {
    bookingId: mockRes.BookResult.BookingId,
    confirmationNo: mockRes.BookResult.ConfirmationNo,
    bookingRefNo: mockRes.BookResult.BookingRefNo,
    invoiceNumber: mockRes.BookResult.InvoiceNumber,
    hotelBookingStatus: mockRes.BookResult.HotelBookingStatus,
    isPriceChanged: mockRes.BookResult.IsPriceChanged,
  };
}

export async function getBookingDetail(params: {
  bookingId: number;
}): Promise<TBOHotelBookingDetailOutput> {
  if (hasCredentials) {
    try {
      const req: TBOHotelBookingDetailRequest = {
        BookingId: params.bookingId,
      };
      const res = await api.getBookingDetail(req);
      if (res.Status?.Code === 200 && res.BookingDetail) {
        const bd = res.BookingDetail;
        return {
          bookingId: bd.BookingId,
          confirmationNo: bd.ConfirmationNo,
          invoiceNumber: bd.InvoiceNumber,
          hotelName: bd.HotelName,
          hotelCode: bd.HotelCode,
          checkIn: bd.CheckIn,
          checkOut: bd.CheckOut,
          status: bd.HotelBookingStatus,
          rooms: (bd.Rooms || []).map(r => ({
            roomName: r.RoomName,
            passengers: (r.HotelPassenger || []).map(p => ({
              title: p.Title,
              firstName: p.FirstName,
              lastName: p.LastName,
              paxType: p.PaxType,
            })),
            totalFare: r.TotalFare,
            totalTax: r.TotalTax,
          })),
          priceBreakup: {
            roomRate: bd.PriceBreakup.RoomRate,
            roomTax: bd.PriceBreakup.RoomTax,
            extraGuestCharges: bd.PriceBreakup.ExtraGuestCharges,
            childCharges: bd.PriceBreakup.ChildCharges,
            netAmount: bd.PriceBreakup.NetAmount,
          },
        };
      }
      throw new Error(`Booking detail failed: ${res.Status?.Description || "Not found"}`);
    } catch (e) {
      console.warn("TBO hotel booking detail failed, fallback to mock:", e);
    }
  }

  const mockRes = mock.mockBookingDetail(params.bookingId);
  if (!mockRes.BookingDetail) {
    throw new Error("Booking not found");
  }

  const bd = mockRes.BookingDetail;
  return {
    bookingId: bd.BookingId,
    confirmationNo: bd.ConfirmationNo,
    invoiceNumber: bd.InvoiceNumber,
    hotelName: bd.HotelName,
    hotelCode: bd.HotelCode,
    checkIn: bd.CheckIn,
    checkOut: bd.CheckOut,
    status: bd.HotelBookingStatus,
    rooms: (bd.Rooms || []).map(r => ({
      roomName: r.RoomName,
      passengers: (r.HotelPassenger || []).map(p => ({
        title: p.Title,
        firstName: p.FirstName,
        lastName: p.LastName,
        paxType: p.PaxType,
      })),
      totalFare: r.TotalFare,
      totalTax: r.TotalTax,
    })),
    priceBreakup: {
      roomRate: bd.PriceBreakup.RoomRate,
      roomTax: bd.PriceBreakup.RoomTax,
      extraGuestCharges: bd.PriceBreakup.ExtraGuestCharges,
      childCharges: bd.PriceBreakup.ChildCharges,
      netAmount: bd.PriceBreakup.NetAmount,
    },
  };
}

export function getCountries(): { Code: string; Name: string }[] {
  return mock.getMockCountries();
}

export function getCities(countryCode: string): any[] {
  return mock.getMockCities(countryCode);
}

export function getHotelCodes(cityCode: number): any[] {
  return mock.getMockHotelCodes(cityCode);
}

export function resetClient(): void {
  mock.resetMock();
  _lastHotelResults = [];
  _lastTraceId = "";
}
