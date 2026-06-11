import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: rates, error } = await supabase
    .from("CorporateRate")
    .select("*, company:Company(name)")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch corporate rates" }, { status: 500 });
  }

  return NextResponse.json(rates);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, category, destination, discountType, discountValue, maxDiscount, isActive } = body;

    if (!companyId || !discountType || discountValue == null) {
      return NextResponse.json(
        { error: "companyId, discountType, and discountValue are required" },
        { status: 400 }
      );
    }

    const { data: rate, error } = await supabase
      .from("CorporateRate")
      .insert({
        companyId,
        category: category || "ALL",
        destination: destination || null,
        discountType,
        discountValue,
        maxDiscount: maxDiscount || null,
        isActive: isActive !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create corporate rate" }, { status: 500 });
    }

    return NextResponse.json(rate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
