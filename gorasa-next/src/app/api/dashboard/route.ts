import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const [usersResult, packagesResult, leadsResult, bookingsResult, revenueResult, rolesResult, companiesResult] =
      await Promise.all([
        supabase.from("User").select("*", { count: "exact", head: true }),
        supabase.from("Package").select("*", { count: "exact", head: true }).eq("isActive", true),
        supabase.from("Lead").select("*", { count: "exact", head: true }),
        supabase.from("Booking").select("*", { count: "exact", head: true }),
        supabase.from("Booking").select("price").neq("status", "CANCELLED"),
        supabase.from("User").select("role"),
        supabase.from("User").select("company").not("company", "is", null).neq("company", ""),
      ]);

    const totalRevenue = revenueResult.data?.reduce((sum, b) => sum + (b.price || 0), 0) || 0;

    const uniqueCompanies = new Set(companiesResult.data?.map((u) => u.company).filter(Boolean));
    const totalCompanies = uniqueCompanies.size;

    const roleDistribution = rolesResult.data?.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalCompanies,
      totalUsers: usersResult.count || 0,
      activePackages: packagesResult.count || 0,
      totalLeads: leadsResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      pendingLeads: 0,
      totalRevenue,
      roleDistribution: Object.entries(roleDistribution || {}).map(([role, count]) => ({
        role,
        count,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
