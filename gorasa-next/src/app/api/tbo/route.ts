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

    switch (action) {
      case "search": {
        const p = body.params || {};
        const roomsArray = (p.RoomGuests || [{ AdultCount: 1, ChildCount: 0 }]).map(
          (r: { AdultCount: number; ChildCount: number }) => ({
            adults: r.AdultCount || 1,
            children: r.ChildCount || 0,
            childrenAges: [],
          }),
        );
        const result = await searchHotelsNew({
          checkIn: p.CheckInDate,
          checkOut: p.CheckOutDate,
          city: p.CityName,
          rooms: roomsArray,
          preferredCurrency: p.PreferredCurrencyCode || "INR",
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
        const result = await preBook({ bookingCode });
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
