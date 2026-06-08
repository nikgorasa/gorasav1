import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: rewards, error } = await supabase
    .from("LoyaltyReward")
    .select("*")
    .eq("isActive", true)
    .order("pointsCost", { ascending: true });

  if (error) {
    console.error("Rewards fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }

  return NextResponse.json(rewards);
}
