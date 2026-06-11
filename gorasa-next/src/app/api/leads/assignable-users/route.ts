import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: users, error } = await supabase
    .from("User")
    .select("id, name, email, role")
    .in("role", ["SALES", "ADMIN", "SUPER_ADMIN"])
    .eq("isActive", true)
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json(users);
}
