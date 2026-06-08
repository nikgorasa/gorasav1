import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("LeadStage")
      .select("*")
      .eq("isActive", true)
      .order("sortOrder", { ascending: true });
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
    return NextResponse.json(data || []);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
