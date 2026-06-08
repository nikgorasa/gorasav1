import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: promos, error } = await supabase
    .from("PromoCode")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Promos fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch promos" }, { status: 500 });
  }

  return NextResponse.json(promos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discountValue, type, description, minBookingValue } = body;

    if (!code || discountValue == null) {
      return NextResponse.json({ error: "Code and discount value are required" }, { status: 400 });
    }

    const { data: promo, error } = await supabase
      .from("PromoCode")
      .insert({
        code: code.toUpperCase(),
        discountValue,
        type: type || "flat",
        description: description || "",
        minBookingValue: minBookingValue || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Promo create error:", error);
      return NextResponse.json({ error: "Failed to create promo" }, { status: 500 });
    }

    return NextResponse.json(promo, { status: 201 });
  } catch (error) {
    console.error("Promo create error:", error);
    return NextResponse.json({ error: "Failed to create promo" }, { status: 500 });
  }
}
