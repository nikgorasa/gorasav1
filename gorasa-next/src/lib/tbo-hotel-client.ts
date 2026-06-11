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
  h: { HotelCode: number; Currency: string; Rooms: any[] },
): TBOHotelDisplay {
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
    typeCode: "",
    ratePlanCode: "",
    roomFare: r.DayRates?.[0]?.[0]?.BasePrice || 0,
    roomTax: (r.TotalTax || 0) / Math.max(1, (r.DayRates?.[0]?.length || 1)),
    currency: h.Currency,
    amenities: [],
  }));

  return {
    hotelCode: h.HotelCode,
    name: "",
    hotelRating: 0,
    location: "",
    currency: h.Currency,
    minTotalFare: Math.min(...rooms.map(r => r.totalFare)),
    rooms,
    resultIndex: 1,
    picture: "",
    rating: "ThreeStar",
    address: "",
    tripAdvisorRating: 0,
    description: "",
    price: Math.min(...rooms.map(r => r.totalFare)),
    starRating: 3,
    originalPrice: Math.min(...rooms.map(r => r.totalFare)) * 1.2,
  };
}

let _lastHotelResults: any[] = [];
let _lastTraceId = "";

export function setLastHotelResults(results: any[], traceId: string): void {
  _lastHotelResults = results;
  _lastTraceId = traceId;
}

export async function searchHotels(params: {
  checkIn: string;
  checkOut: string;
  hotelCodes?: string;
  city?: string;
  rooms: { adults: number; children: number; childrenAges: number[] }[];
  guestNationality?: string;
  preferredCurrency?: string;
}): Promise<TBOHotelSearchOutput> {
  if (hasCredentials) {
    try {
      const searchReq: TBOHotelSearchRequest = {
        CheckIn: params.checkIn,
        CheckOut: params.checkOut,
        HotelCodes: params.hotelCodes || "",
        GuestNationality: params.guestNationality || "IN",
        PaxRooms: params.rooms.map(r => ({ Adults: r.adults, Children: r.children, ChildrenAges: r.childrenAges })),
        PreferredCurrency: params.preferredCurrency || "INR",
        SearchedCities: params.city ? [params.city] : undefined,
      };
      const res = await api.searchHotels(searchReq);
      if (res.Status?.Code === 200 && res.HotelResult?.length > 0) {
        const hotels = res.HotelResult.map(h => toDisplay(h));
        return { hotels, traceId: _lastTraceId };
      }
      throw new Error(`Hotel search failed: ${res.Status?.Description}`);
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
      hotelCode: h.HotelCode,
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
