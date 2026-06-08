import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: companies, error } = await supabase
    .from("Company")
    .select("*")
    .eq("isActive", true)
    .order("name");

  if (error) {
    console.error("Companies fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }

  return NextResponse.json(companies);
}
