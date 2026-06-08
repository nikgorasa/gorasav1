import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, userId, reason } = body;

    if (!bookingId || !userId || !reason) {
      return NextResponse.json({ error: "bookingId, userId, and reason are required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("CancellationRequest")
      .select("id")
      .eq("bookingId", bookingId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Cancellation already requested for this booking" }, { status: 409 });
    }

    const { data: cancellation, error } = await supabase
      .from("CancellationRequest")
      .insert({ bookingId, userId, reason, status: "PENDING" })
      .select()
      .single();

    if (error) {
      console.error("Cancellation create error:", error);
      return NextResponse.json({ error: "Failed to create cancellation request" }, { status: 500 });
    }

    await supabase
      .from("Booking")
      .update({ status: "CANCELLATION_REQUESTED" })
      .eq("id", bookingId);

    return NextResponse.json(cancellation, { status: 201 });
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json({ error: "Failed to create cancellation request" }, { status: 500 });
  }
}
