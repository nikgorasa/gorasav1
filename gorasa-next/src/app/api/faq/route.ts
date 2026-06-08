import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";

    let query = supabase
      .from("Faq")
      .select("*")
      .eq("isActive", true);

    if (keyword) {
      query = query.ilike("keyword", `%${keyword}%`);
    }

    const { data: faqs, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
    }

    return NextResponse.json(faqs || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}
