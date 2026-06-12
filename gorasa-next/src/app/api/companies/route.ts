import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: companies, error } = await supabase
    .from("Company")
    .select("*")
    .order("name");

  if (error) {
    console.error("Companies fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }

  return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain, discountRate, walletBalance } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const { data: company, error } = await supabase
      .from("Company")
      .insert({
        name,
        domain: domain || null,
        discountRate: discountRate || 0,
        walletBalance: walletBalance || 0,
        isActive: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Company create error:", error);
      return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
    }

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
