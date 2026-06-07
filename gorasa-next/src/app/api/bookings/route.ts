import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: dbUser } = await supabaseAdmin
    .from("User")
    .select("*")
    .eq("email", user.email!)
    .single();

  return dbUser;
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bookings, error } = await supabaseAdmin
      .from("Booking")
      .select("*, payment:Payment(*), invoice:Invoice(*), cancellation:CancellationRequest(*)")
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
    const user = await getUser();
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

    const { data: booking, error } = await supabaseAdmin
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
      await supabaseAdmin.from("Payment").insert({
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
