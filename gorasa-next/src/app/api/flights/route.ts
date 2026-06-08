import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";

    let query = supabase
      .from("Flight")
      .select("*")
      .order("price", { ascending: true });

    if (origin) {
      query = query.ilike("origin", `%${origin}%`);
    }
    if (destination) {
      query = query.ilike("destination", `%${destination}%`);
    }

    const { data: flights, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 });
    }

    return NextResponse.json(flights || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 });
  }
}
