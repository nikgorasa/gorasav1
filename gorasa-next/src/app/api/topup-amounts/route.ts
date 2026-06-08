import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("QuickTopUpAmount")
      .select("*")
      .eq("isactive", true)
      .order("sortorder", { ascending: true });
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
    const mapped = (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      isActive: row.isactive,
      sortOrder: row.sortorder,
    }));
    return NextResponse.json(mapped);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
