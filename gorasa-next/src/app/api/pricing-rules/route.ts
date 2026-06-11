import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: rules, error } = await supabase
    .from("PricingRule")
    .select("*")
    .order("priority", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch pricing rules" }, { status: 500 });
  }

  return NextResponse.json(rules);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, type, category, destination, hotelName, airlineCode, roomType,
      markupType, markupValue, minPrice, maxPrice, priority, isActive,
      validFrom, validTo,
    } = body;

    if (!name || !type || markupValue == null) {
      return NextResponse.json(
        { error: "name, type, and markupValue are required" },
        { status: 400 }
      );
    }

    const { data: rule, error } = await supabase
      .from("PricingRule")
      .insert({
        name,
        type,
        category: category || "ALL",
        destination: destination || null,
        hotelName: hotelName || null,
        airlineCode: airlineCode || null,
        roomType: roomType || null,
        markupType: markupType || "PERCENT",
        markupValue,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        priority: priority || 0,
        isActive: isActive !== false,
        validFrom: validFrom || null,
        validTo: validTo || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create pricing rule" }, { status: 500 });
    }

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
