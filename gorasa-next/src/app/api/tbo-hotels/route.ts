import { NextRequest, NextResponse } from "next/server";
import {
  searchHotels,
  preBook,
  bookHotel,
  getBookingDetail,
  setLastHotelResults,
  getCountries,
  getCities,
  getHotelCodes,
} from "@/lib/tbo-hotel-client";

function getEndUserIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "192.168.1.1";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const endUserIp = getEndUserIp(req);

    switch (action) {
      case "search": {
        const {
          city, hotelCodes, checkIn, checkOut,
          rooms, guestNationality, preferredCurrency,
        } = body;
        const roomsArray = rooms || [{ adults: 1, children: 0, childrenAges: [] }];
        const result = await searchHotels({
          checkIn,
          checkOut,
          hotelCodes,
          city,
          rooms: roomsArray,
          guestNationality: guestNationality || "IN",
          preferredCurrency: preferredCurrency || "INR",
          EndUserIp: endUserIp,
        });
        return NextResponse.json(result);
      }

      case "pre-book": {
        const { bookingCode } = body;
        if (!bookingCode) {
          return NextResponse.json({ error: "bookingCode required" }, { status: 400 });
        }
        const result = await preBook({ bookingCode, EndUserIp: endUserIp });
        return NextResponse.json(result);
      }

      case "book": {
        const {
          bookingCode, guestNationality, netAmount, hotelRoomsDetails,
        } = body;
        if (!bookingCode || !hotelRoomsDetails) {
          return NextResponse.json(
            { error: "bookingCode and hotelRoomsDetails required" },
            { status: 400 },
          );
        }
        const result = await bookHotel({
          bookingCode,
          guestNationality: guestNationality || "IN",
          netAmount: netAmount || 0,
          hotelRoomsDetails,
          EndUserIp: endUserIp,
        });
        return NextResponse.json(result);
      }

      case "booking-detail": {
        const { bookingId } = body;
        if (!bookingId) {
          return NextResponse.json({ error: "bookingId required" }, { status: 400 });
        }
        const result = await getBookingDetail({ bookingId: Number(bookingId), EndUserIp: endUserIp });
        return NextResponse.json(result);
      }

      case "static-data/countries": {
        const result = getCountries();
        return NextResponse.json({ countries: result });
      }

      case "static-data/cities": {
        const { countryCode } = body;
        if (!countryCode) {
          return NextResponse.json({ error: "countryCode required" }, { status: 400 });
        }
        const result = getCities(countryCode);
        return NextResponse.json({ cities: result });
      }

      case "static-data/hotel-codes": {
        const { cityCode } = body;
        if (!cityCode) {
          return NextResponse.json({ error: "cityCode required" }, { status: 400 });
        }
        const result = getHotelCodes(Number(cityCode));
        return NextResponse.json({ hotels: result });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error("TBO hotel API route error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 },
    );
  }
}
