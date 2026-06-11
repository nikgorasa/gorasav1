import { NextRequest, NextResponse } from "next/server";
import {
  searchFlights,
  getFareRule,
  getFareQuote,
  bookFlight,
  ticketFlight,
  getBookingDetail,
} from "@/lib/tbo-flight-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "search": {
        const p = body.params || {};
        const tripType = p.tripType || p.TripType || "OneWay";
        const journeyType = tripType === "Return" ? 2 : tripType === "Circle" ? 3 : 1;
        const result = await searchFlights({
          Origin: p.origin || p.Origin || "",
          Destination: p.destination || p.Destination || "",
          AdultCount: p.adults || p.AdultCount || 1,
          ChildCount: p.children || p.ChildCount || 0,
          InfantCount: p.infants || p.InfantCount || 0,
          JourneyType: journeyType,
          PreferredDepartureTime: p.departureDate || p.DepartureDate || "",
        });
        return NextResponse.json(result);
      }

      case "fare-rule": {
        const p = body.params || body;
        if (!p.traceId || !p.resultIndex) {
          return NextResponse.json({ error: "traceId and resultIndex required" }, { status: 400 });
        }
        const result = await getFareRule({ traceId: p.traceId, resultIndex: p.resultIndex });
        return NextResponse.json(result);
      }

      case "fare-quote": {
        const p = body.params || body;
        if (!p.traceId || !p.resultIndex) {
          return NextResponse.json({ error: "traceId and resultIndex required" }, { status: 400 });
        }
        const result = await getFareQuote({ traceId: p.traceId, resultIndex: p.resultIndex });
        return NextResponse.json(result);
      }

      case "book": {
        const p = body.params || body;
        if (!p.traceId || !p.resultIndex || !p.passengers) {
          return NextResponse.json({ error: "traceId, resultIndex, passengers required" }, { status: 400 });
        }
        const result = await bookFlight({
          traceId: p.traceId,
          resultIndex: p.resultIndex,
          passengers: p.passengers,
        });
        return NextResponse.json(result);
      }

      case "ticket": {
        const p = body.params || body;
        if (!p.traceId || !p.passengers || !p.segments || !p.fare || !p.fareBreakdown) {
          return NextResponse.json({ error: "traceId, passengers, segments, fare, fareBreakdown required" }, { status: 400 });
        }
        const result = await ticketFlight({
          traceId: p.traceId,
          resultIndex: p.resultIndex,
          PNR: p.pnr,
          BookingId: p.bookingId,
          passengers: p.passengers,
          segments: p.segments,
          fare: p.fare,
          fareBreakdown: p.fareBreakdown,
          isLCC: p.isLCC ?? false,
        });
        return NextResponse.json(result);
      }

      case "booking-detail": {
        const p = body.params || body;
        if (!p.bookingIds && !p.bookingId) {
          return NextResponse.json({ error: "bookingIds or bookingId required" }, { status: 400 });
        }
        const ids = p.bookingIds || [p.bookingId];
        const result = await getBookingDetail({ bookingIds: ids });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error("TBO flight API route error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 },
    );
  }
}
