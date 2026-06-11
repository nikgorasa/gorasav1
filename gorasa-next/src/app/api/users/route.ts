import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    let query = supabase
      .from("User")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query;

    if (error) {
      console.error("Users fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    const { count: activeCount } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })
      .eq("isActive", true);

    const { count: adminCount } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })
      .in("role", ["ADMIN", "SUPER_ADMIN"]);

    const { count: customerCount } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })
      .eq("role", "CUSTOMER");

    return NextResponse.json({
      users,
      total: count || 0,
      counts: {
        active: activeCount || 0,
        admins: adminCount || 0,
        customers: customerCount || 0,
      },
      page,
      limit,
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, companyId } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "email and name are required" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("User")
      .insert({
        email,
        name,
        role: role || "CUSTOMER",
        companyId: companyId || null,
        isActive: true,
        walletBalance: 0,
        loyaltyPoints: 0,
        loyaltyTier: "Silver",
      })
      .select()
      .single();

    if (error) {
      console.error("User create error:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role, isActive, name, email } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const { data: user, error } = await supabase
      .from("User")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("User update error:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
