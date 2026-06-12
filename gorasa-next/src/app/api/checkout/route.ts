import { NextRequest, NextResponse } from "next/server";
import { createCheckout, PAYMENT_CONFIG } from "@/lib/payment";
import * as users from "@/lib/db/users";
import { isPrisma, prisma, supabaseAdmin } from "@/lib/db";

async function getUserFromRequest(request: Request) {
  const userEmail = request.headers.get("x-user-email");
  if (!userEmail) return null;
  return users.findByEmail(userEmail);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, gateway } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const selectedGateway = gateway || PAYMENT_CONFIG.gateway;

    let booking: any;
    if (isPrisma()) {
      booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { price: true } });
    } else {
      const { data } = await supabaseAdmin
        .from('Booking')
        .select('price')
        .eq('id', bookingId)
        .single();
      booking = data;
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const result = await createCheckout({
      bookingId,
      amount: booking.price,
      gateway: selectedGateway,
      userEmail: (user as any).email,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
