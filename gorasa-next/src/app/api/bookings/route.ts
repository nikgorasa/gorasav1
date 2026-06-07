import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserFromRequest(request: Request) {
  // Get user email from header (sent by frontend after login)
  const userEmail = request.headers.get("x-user-email");
  if (!userEmail) return null;

  const { data: dbUser } = await supabase
    .from("User")
    .select("*")
    .eq("email", userEmail)
    .single();

  return dbUser;
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bookings, error } = await supabase
      .from("Booking")
      .select("*")
      .eq("userId", user.id)
      .order("bookedAt", { ascending: false });

    if (error) {
      console.error("Bookings error:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, itemName, providerOrAirline, price, originalPrice, discountApplied, couponCodeUsed, pnr, seatOrRoom, paxCount, travelDates, paymentMethod } = body;

    if (!type || !itemName || price === undefined) {
      return NextResponse.json(
        { error: "Type, itemName, and price are required" },
        { status: 400 }
      );
    }

    const bookingId = crypto.randomUUID();
    const pnrCode = pnr || `GR${Date.now().toString(36).toUpperCase()}`;

    const { data: booking, error } = await supabase
      .from("Booking")
      .insert({
        id: bookingId,
        userId: user.id,
        type,
        itemName,
        providerOrAirline,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountApplied: discountApplied ? Number(discountApplied) : 0,
        couponCodeUsed,
        pnr: pnrCode,
        seatOrRoom,
        paxCount: paxCount || 1,
        travelDates,
      })
      .select()
      .single();

    if (error) {
      console.error("Booking create error:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    if (paymentMethod) {
      await supabase.from("Payment").insert({
        bookingId: booking.id,
        amount: Number(price),
        method: paymentMethod,
        status: "PENDING",
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking create error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
