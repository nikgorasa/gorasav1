import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: testimonials, error } = await supabase
      .from("Testimonial")
      .select("*")
      .eq("isActive", true)
      .order("createdAt", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
    }

    return NextResponse.json(testimonials || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
