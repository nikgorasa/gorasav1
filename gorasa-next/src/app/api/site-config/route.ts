import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    let query = supabase.from("SiteConfig").select("key, value");
    if (key) query = query.eq("key", key);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });

    if (key && data && data.length > 0) {
      return NextResponse.json({ [data[0].key]: data[0].value });
    }

    const config: Record<string, string> = {};
    (data || []).forEach((row) => { config[row.key] = row.value; });
    return NextResponse.json(config);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
