import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rewardId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { data: reward, error: rewardError } = await supabase
      .from("LoyaltyReward")
      .select("pointsCost")
      .eq("id", rewardId)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const { data: user, error: userError } = await supabase
      .from("User")
      .select("loyaltyPoints")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.loyaltyPoints < reward.pointsCost) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    const { data: redemption, error: redeemError } = await supabase
      .from("Redemption")
      .insert({ userId, rewardId, pointsCost: reward.pointsCost })
      .select()
      .single();

    if (redeemError) {
      console.error("Redemption create error:", redeemError);
      return NextResponse.json({ error: "Failed to redeem reward" }, { status: 500 });
    }

    await supabase
      .from("User")
      .update({ loyaltyPoints: user.loyaltyPoints - reward.pointsCost })
      .eq("id", userId);

    return NextResponse.json(redemption, { status: 201 });
  } catch (error) {
    console.error("Redemption error:", error);
    return NextResponse.json({ error: "Failed to redeem reward" }, { status: 500 });
  }
}
