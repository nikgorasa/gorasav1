import type {
  TBOHotelSearchRequest,
  TBOHotelSearchResponse,
  TBOHotelResult,
  TBOAvailableRoomResponse,
  TBOBlockResponse,
  TBOBookRequest,
  TBOBookResponse,
  TBODisplayHotel,
  TBODisplayRoom,
} from "./tbo-hotel-types";
import * as api from "./tbo-hotel-api";
import * as mock from "./tbo-hotel-mock";

const hasCredentials = !!(process.env.TBO_USERNAME && process.env.TBO_PASSWORD);

function mapHotelResult(r: TBOHotelResult, index: number): TBODisplayHotel {
  const starMap: Record<string, number> = {
    OneStar: 1, TwoStar: 2, ThreeStar: 3, FourStar: 4, FiveStar: 5,
  };
  return {
    resultIndex: r.ResultIndex || index + 1,
    hotelCode: r.HotelInfo.HotelCode,
    name: r.HotelInfo.HotelName,
    picture: r.HotelInfo.HotelPicture,
    description: r.HotelInfo.HotelDescription,
    address: r.HotelInfo.HotelAddress,
    rating: r.HotelInfo.Rating,
    starRating: starMap[r.HotelInfo.Rating] || 3,
    tripAdvisorRating: r.HotelInfo.TripAdvisorRating,
    price: r.MinHotelPrice.TotalPrice,
    currency: r.MinHotelPrice.Currency,
    originalPrice: r.MinHotelPrice.OriginalPrice,
  };
}

function mapRoom(room: any): TBODisplayRoom {
  return {
    roomIndex: room.RoomIndex,
    name: room.RoomTypeName,
    typeCode: room.RoomTypeCode,
    ratePlanCode: room.RatePlanCode,
    roomFare: room.RoomRate.RoomFare,
    roomTax: room.RoomRate.RoomTax,
    totalFare: room.RoomRate.TotalFare,
    currency: room.RoomRate.Currency,
    amenities: room.Amenities?.Amenity || [],
  };
}

export async function searchHotels(req: TBOHotelSearchRequest): Promise<{
  sessionId: string;
  hotels: TBODisplayHotel[];
  raw?: TBOHotelSearchResponse;
}> {
  try {
    if (hasCredentials) {
      const res = await api.hotelSearch(req);
      if (res.Status?.StatusCode === "01") {
        const hotels = (res.HotelResultList?.HotelResult || []).map(mapHotelResult);
        return { sessionId: res.SessionId, hotels, raw: res };
      }
      throw new Error(`TBO error: ${res.Status?.StatusCode} - ${res.Status?.Description}`);
    }
  } catch (e) {
    console.warn("TBO API call failed, falling back to mock:", e);
  }

  const mockRes = mock.mockHotelSearch(req.CityName);
  const hotels = (mockRes.HotelResultList?.HotelResult || []).map(mapHotelResult);
  return { sessionId: mockRes.SessionId, hotels, raw: mockRes };
}

export async function getHotelRooms(
  sessionId: string,
  resultIndex: number,
  hotelCode: string
): Promise<{
  rooms: TBODisplayRoom[];
  cancellationPolicy?: string;
  raw?: TBOAvailableRoomResponse;
}> {
  try {
    if (hasCredentials) {
      const res = await api.availableHotelRooms({ SessionId: sessionId, ResultIndex: resultIndex, HotelCode: hotelCode, ResponseTime: 10 });
      if (res.Status?.StatusCode === "01") {
        const rooms = (res.HotelRooms?.HotelRoom || []).map(mapRoom);
        return { rooms, cancellationPolicy: res.HotelCancellationPolicies, raw: res };
      }
      throw new Error(`TBO error: ${res.Status?.StatusCode} - ${res.Status?.Description}`);
    }
  } catch (e) {
    console.warn("TBO rooms API failed, falling back to mock:", e);
  }

  const mockRes = mock.mockAvailableHotelRooms(sessionId, resultIndex, hotelCode);
  const rooms = (mockRes.HotelRooms?.HotelRoom || []).map(mapRoom);
  return { rooms, cancellationPolicy: mockRes.HotelCancellationPolicies, raw: mockRes };
}

export async function blockAndPrice(
  sessionId: string,
  resultIndex: number,
  hotelCode: string,
  hotelName: string,
  room: TBODisplayRoom
): Promise<{ success: boolean; isPriceChanged: boolean; cancellationPolicy?: string }> {
  try {
    if (hasCredentials) {
      const res = await api.availabilityAndPricing({
        SessionId: sessionId,
        ResultIndex: resultIndex,
        HotelCode: hotelCode,
        HotelName: hotelName,
        HotelRooms: {
          HotelRoom: [
            {
              RoomIndex: room.roomIndex,
              RoomTypeName: room.name,
              RoomTypeCode: room.typeCode,
              RatePlanCode: room.ratePlanCode,
              RoomRate: { RoomFare: room.roomFare, RoomTax: room.roomTax, TotalFare: room.totalFare, Currency: room.currency },
            },
          ],
        },
        ResponseTime: 10,
      });
      if (res.Status?.StatusCode === "01") {
        return { success: true, isPriceChanged: res.IsPriceChanged, cancellationPolicy: res.HotelCancellationPolicies };
      }
      throw new Error(`TBO error: ${res.Status?.StatusCode} - ${res.Status?.Description}`);
    }
  } catch (e) {
    console.warn("TBO block API failed, falling back to mock:", e);
  }

  const mockRes = mock.mockBlockAndPrice(sessionId, hotelName);
  return { success: mockRes.Status.StatusCode === "01", isPriceChanged: false, cancellationPolicy: mockRes.HotelCancellationPolicies };
}

export async function bookHotel(
  req: TBOBookRequest
): Promise<{ success: boolean; bookingId?: string; confirmationNo?: string; tripId?: string; status?: string }> {
  try {
    if (hasCredentials) {
      const res = await api.hotelBook(req);
      if (res.Status?.StatusCode === "01") {
        return { success: true, bookingId: res.BookingId, confirmationNo: res.ConfirmationNo, tripId: res.TripId, status: res.BookingStatus };
      }
      throw new Error(`TBO error: ${res.Status?.StatusCode} - ${res.Status?.Description}`);
    }
  } catch (e) {
    console.warn("TBO book API failed, falling back to mock:", e);
  }

  const mockRes = mock.mockBook(req.ClientReferenceNumber, req.HotelName);
  return { success: mockRes.Status.StatusCode === "01", bookingId: mockRes.BookingId, confirmationNo: mockRes.ConfirmationNo, tripId: mockRes.TripId, status: mockRes.BookingStatus };
}
