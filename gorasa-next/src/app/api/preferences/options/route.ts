import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = supabase.from("PreferenceOption").select("*").eq("isActive", true).order("sortOrder", { ascending: true });
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
    return NextResponse.json(data || []);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
