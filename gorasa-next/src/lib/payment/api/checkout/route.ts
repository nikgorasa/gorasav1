import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCheckout } from "../../payment-service";
import { PAYMENT_CONFIG } from "../../config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUserFromRequest(request: Request) {
  const userEmail = request.headers.get("x-user-email");
  if (!userEmail) return null;
  const { data: dbUser } = await supabase
    .from("User")
    .select("*")
    .eq("email", userEmail)
    .single();
  return dbUser;
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

    const { data: booking } = await supabase
      .from("Booking")
      .select("price")
      .eq("id", bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const result = await createCheckout({
      bookingId,
      amount: booking.price,
      gateway: selectedGateway,
      userEmail: user.email,
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
