import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  return dbUser;
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        payment: true,
        invoice: true,
        cancellation: true,
      },
      orderBy: { bookedAt: "desc" },
    });

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

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        type,
        itemName,
        providerOrAirline,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountApplied: discountApplied ? Number(discountApplied) : 0,
        couponCodeUsed,
        pnr: pnr || `GR${Date.now().toString(36).toUpperCase()}`,
        seatOrRoom,
        paxCount: paxCount || 1,
        travelDates,
        payment: paymentMethod
          ? {
              create: {
                amount: Number(price),
                method: paymentMethod,
                status: "PENDING",
              },
            }
          : undefined,
      },
      include: {
        payment: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking create error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
