import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUsers, activePackages, totalLeads, totalBookings, pendingLeads, revenueData, roleDistribution] =
      await Promise.all([
        prisma.user.count(),
        prisma.package.count({ where: { isActive: true } }),
        prisma.lead.count(),
        prisma.booking.count(),
        prisma.lead.count({ where: { stage: "NEW" } }),
        prisma.booking.aggregate({
          _sum: { price: true },
          where: { status: { not: "CANCELLED" } },
        }),
        prisma.user.groupBy({
          by: ["role"],
          _count: true,
        }),
      ]);

    return NextResponse.json({
      totalUsers,
      activePackages,
      totalLeads,
      totalBookings,
      pendingLeads,
      totalRevenue: revenueData._sum.price || 0,
      roleDistribution: roleDistribution.map((r) => ({
        role: r.role,
        count: r._count,
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
