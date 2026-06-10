import { NextRequest, NextResponse } from "next/server";
import {
  searchHotels as searchHotelsNew,
  preBook,
  bookHotel as bookHotelNew,
  setLastHotelResults,
} from "@/lib/tbo-hotel-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const endUserIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "192.168.1.1";

    switch (action) {
      case "search": {
        const { checkIn, checkOut, rooms, cityName, preferredCurrency } = body;
        const roomsArray = (rooms || [{ AdultCount: 1, ChildCount: 0, ChildAges: [] }]).map(
          (r: { AdultCount: number; ChildCount: number; ChildAges?: number[] }) => ({
            adults: r.AdultCount || 1,
            children: r.ChildCount || 0,
            childrenAges: r.ChildAges || [],
          }),
        );
        const result = await searchHotelsNew({
          checkIn,
          checkOut,
          city: cityName,
          rooms: roomsArray,
          preferredCurrency: preferredCurrency || "INR",
          EndUserIp: endUserIp,
        });
        return NextResponse.json(result);
      }

      case "rooms": {
        const { hotelCode } = body;
        return NextResponse.json({ hotelCode, rooms: [] });
      }

      case "block": {
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
        const result = await bookHotelNew({
          bookingCode,
          guestNationality: guestNationality || "IN",
          netAmount: netAmount || 0,
          hotelRoomsDetails,
          EndUserIp: endUserIp,
        });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error("TBO API route error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 },
    );
  }
}
