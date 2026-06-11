import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("User")
      .select("email, name, role")
      .eq("isActive", true)
      .order("role");

    if (error) {
      console.error("Demo users error:", error);
      return NextResponse.json(
        { error: "Failed to fetch demo users" },
        { status: 500 }
      );
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("Demo users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch demo users" },
      { status: 500 }
    );
  }
}
