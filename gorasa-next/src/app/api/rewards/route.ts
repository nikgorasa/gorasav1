import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "true";

  let query = supabase
    .from("LoyaltyReward")
    .select("*")
    .order("pointsCost", { ascending: true });

  if (!all) {
    query = query.eq("isActive", true);
  }

  const { data: rewards, error } = await query;

  if (error) {
    console.error("Rewards fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }

  return NextResponse.json(rewards);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, pointsCost, category, imageColor, icon, isActive } = body;

    if (!name || pointsCost == null) {
      return NextResponse.json({ error: "name and pointsCost are required" }, { status: 400 });
    }

    const { data: reward, error } = await supabase
      .from("LoyaltyReward")
      .insert({
        name,
        description: description || "",
        pointsCost,
        category: category || "General",
        imageColor: imageColor || "bg-gradient-to-br from-amber-400 to-orange-500",
        icon: icon || "Gift",
        isActive: isActive !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("Reward create error:", error);
      return NextResponse.json({ error: "Failed to create reward" }, { status: 500 });
    }

    return NextResponse.json(reward, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
