import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { data: bookings, error: bookingError } = await supabase
      .from("Booking")
      .select("itemName, bookedAt, price")
      .eq("userId", userId)
      .order("bookedAt", { ascending: false })
      .limit(50);

    if (bookingError) {
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    const { data: redemptions, error: redeemError } = await supabase
      .from("Redemption")
      .select("pointsCost, createdAt, rewardId")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (redeemError) {
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    const earned = (bookings || []).map((b: Record<string, unknown>) => ({
      action: `Booking (${b.itemName})`,
      points: `+${Math.round(Number(b.price) / 100)}`,
      date: String(b.bookedAt || ""),
      type: "earned" as const,
    }));

    const redeemed = (redemptions || []).map((r: Record<string, unknown>) => ({
      action: "Redeemed reward",
      points: `-${Number(r.pointsCost).toLocaleString()}`,
      date: String(r.createdAt || ""),
      type: "redeemed" as const,
    }));

    const history = [...earned, ...redeemed].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
