import { NextRequest, NextResponse } from "next/server";
import { searchHotels, getHotelRooms, blockAndPrice, bookHotel } from "@/lib/tbo-hotel-client";
import type { TBOHotelSearchRequest, TBOBookRequest } from "@/lib/tbo-hotel-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "search": {
        const params: TBOHotelSearchRequest = body.params;
        const result = await searchHotels(params);
        return NextResponse.json(result);
      }

      case "rooms": {
        const { sessionId, resultIndex, hotelCode } = body;
        const result = await getHotelRooms(sessionId, resultIndex, hotelCode);
        return NextResponse.json(result);
      }

      case "block": {
        const { sessionId, resultIndex, hotelCode, hotelName, room } = body;
        const result = await blockAndPrice(sessionId, resultIndex, hotelCode, hotelName, room);
        return NextResponse.json(result);
      }

      case "book": {
        const bookReq: TBOBookRequest = body.params;
        const result = await bookHotel(bookReq);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error("TBO API route error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
