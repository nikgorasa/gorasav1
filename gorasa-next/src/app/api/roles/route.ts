import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("Role")
      .select("*")
      .eq("isactive", true);
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
    const mapped = (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      isActive: row.isactive,
    }));
    return NextResponse.json(mapped);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
