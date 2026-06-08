import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from("User")
      .select("id, name, email, role, avatar, loyaltyTier, loyaltyPoints, walletBalance, passengers, preferences, wishlist")
      .eq("email", email)
      .single();

    if (error || !user) {
      console.error("Profile fetch error:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email: newEmail, passengers, preferences, wishlist } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (newEmail !== undefined) updateData.email = newEmail;
    if (passengers !== undefined) updateData.passengers = passengers;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (wishlist !== undefined) updateData.wishlist = wishlist;

    const { data: user, error } = await supabase
      .from("User")
      .update(updateData)
      .eq("email", email)
      .select("id, name, email, role, avatar, loyaltyTier, loyaltyPoints, walletBalance, passengers, preferences, wishlist")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
