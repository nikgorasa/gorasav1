import { NextRequest, NextResponse } from "next/server";
import { isPrisma, prisma, supabaseAdmin } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, userId, reason } = body;

    if (!bookingId || !userId || !reason) {
      return NextResponse.json({ error: "bookingId, userId, and reason are required" }, { status: 400 });
    }

    let existing;
    if (isPrisma()) {
      existing = await prisma.cancellationRequest.findFirst({ where: { bookingId } });
    } else {
      const { data } = await supabaseAdmin
        .from('CancellationRequest')
        .select('id')
        .eq('bookingId', bookingId)
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      return NextResponse.json({ error: "Cancellation already requested for this booking" }, { status: 409 });
    }

    let cancellation;
    if (isPrisma()) {
      cancellation = await prisma.cancellationRequest.create({
        data: { bookingId, userId, reason, status: "PENDING" },
      });
    } else {
      const { data } = await supabaseAdmin
        .from('CancellationRequest')
        .insert({ bookingId, userId, reason, status: "PENDING" })
        .select()
        .single();
      cancellation = data;
    }

    const { isPrisma: isP, prisma: p, supabaseAdmin: sa } = await import("@/lib/db");
    if (isP()) {
      await p.booking.update({ where: { id: bookingId }, data: { status: "CANCELLATION_REQUESTED" } });
    } else {
      await sa.from('Booking').update({ status: "CANCELLATION_REQUESTED" }).eq("id", bookingId);
    }

    return NextResponse.json(cancellation, { status: 201 });
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json({ error: "Failed to create cancellation request" }, { status: 500 });
  }
}
