import { NextRequest, NextResponse } from "next/server";
import { isPrisma, prisma, supabaseAdmin } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";
    const type = searchParams.get("type") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    let dateFilter = "";
    const now = new Date();
    let start: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = `AND "bookedAt" >= '${start.toISOString()}' AND "bookedAt" <= '${end.toISOString()}'`;
    } else {
      switch (period) {
        case "weekly":
          start = new Date(now);
          start.setDate(start.getDate() - 7);
          break;
        case "monthly":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarterly":
          start = new Date(now);
          start.setMonth(start.getMonth() - 3);
          break;
        case "halfyearly":
          start = new Date(now);
          start.setMonth(start.getMonth() - 6);
          break;
        case "annual":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      dateFilter = `AND "bookedAt" >= '${start.toISOString()}'`;
    }

    const typeFilter = type !== "all" ? `AND type = '${type}'` : "";

    if (isPrisma()) {
      // Use Prisma for queries
      const where: any = {
        bookedAt: { gte: startDate ? new Date(startDate) : start },
      };
      if (endDate) where.bookedAt.lte = new Date(endDate);
      if (type !== "all") where.type = type;

      const bookings = await prisma.booking.findMany({
        where,
        include: { payment: true, user: { select: { name: true, email: true } } },
        orderBy: { bookedAt: "desc" },
      });

      const summary = await prisma.booking.aggregate({
        where,
        _count: true,
        _sum: { price: true, originalPrice: true, discountApplied: true },
      });

      const cancelled = await prisma.booking.aggregate({
        where: { ...where, status: "CANCELLED" },
        _count: true,
        _sum: { price: true },
      });

      const byType = await prisma.booking.groupBy({
        by: ["type"],
        where,
        _count: true,
        _sum: { price: true, discountApplied: true },
      });

      const byMonth = await prisma.booking.groupBy({
        by: ["type"],
        where,
        _count: true,
        _sum: { price: true, discountApplied: true },
      });

      // Payment method breakdown
      const paymentMethods = await prisma.payment.groupBy({
        by: ["method"],
        _count: true,
        _sum: { amount: true },
      });

      return NextResponse.json({
        bookings: bookings.map((b) => ({
          id: b.id,
          type: b.type,
          itemName: b.itemName,
          providerOrAirline: b.providerOrAirline,
          price: b.price,
          originalPrice: b.originalPrice,
          discountApplied: b.discountApplied,
          couponCodeUsed: b.couponCodeUsed,
          status: b.status,
          pnr: b.pnr,
          seatOrRoom: b.seatOrRoom,
          paxCount: b.paxCount,
          travelDates: b.travelDates,
          bookedAt: b.bookedAt,
          paymentStatus: b.paymentStatus,
          leadGuestPan: b.leadGuestPan,
          userName: b.user?.name || "N/A",
          userEmail: b.user?.email || "N/A",
          paymentMethod: b.payment?.method || "N/A",
          paymentGateway: b.payment?.gateway || "N/A",
        })),
        summary: {
          totalBookings: Number(summary._count),
          totalRevenue: Number(summary._sum.price || 0),
          totalOriginalPrice: Number(summary._sum.originalPrice || 0),
          totalDiscount: Number(summary._sum.discountApplied || 0),
          cancelledBookings: Number(cancelled._count),
          cancelledRevenue: Number(cancelled._sum.price || 0),
        },
        byType: byType.map((t) => ({
          type: t.type,
          count: Number(t._count),
          revenue: Number(t._sum.price || 0),
          discount: Number(t._sum.discountApplied || 0),
        })),
        paymentMethods: paymentMethods.map((p) => ({
          method: p.method,
          count: Number(p._count),
          total: Number(p._sum.amount || 0),
        })),
      });
    }

    // Supabase fallback
    const { data: bookings } = await supabaseAdmin
      .from("Booking")
      .select("*, user:User(name, email), payment:Payment(method, gateway, amount)")
      .gte("bookedAt", start.toISOString())
      .order("bookedAt", { ascending: false });

    const filtered = (bookings || []).filter((b: any) => type === "all" || b.type === type);

    const totalRevenue = filtered.reduce((sum: number, b: any) => sum + (b.price || 0), 0);
    const totalDiscount = filtered.reduce((sum: number, b: any) => sum + (b.discountApplied || 0), 0);
    const cancelled = filtered.filter((b: any) => b.status === "CANCELLED");

    // Group by type
    const byTypeMap: Record<string, { count: number; revenue: number; discount: number }> = {};
    filtered.forEach((b: any) => {
      if (!byTypeMap[b.type]) byTypeMap[b.type] = { count: 0, revenue: 0, discount: 0 };
      byTypeMap[b.type].count++;
      byTypeMap[b.type].revenue += b.price || 0;
      byTypeMap[b.type].discount += b.discountApplied || 0;
    });

    // Group by payment method
    const payMethodMap: Record<string, { count: number; total: number }> = {};
    filtered.forEach((b: any) => {
      const method = b.payment?.method || "N/A";
      if (!payMethodMap[method]) payMethodMap[method] = { count: 0, total: 0 };
      payMethodMap[method].count++;
      payMethodMap[method].total += b.payment?.amount || b.price || 0;
    });

    return NextResponse.json({
      bookings: filtered.map((b: any) => ({
        id: b.id,
        type: b.type,
        itemName: b.itemName,
        providerOrAirline: b.providerOrAirline,
        price: b.price,
        originalPrice: b.originalPrice,
        discountApplied: b.discountApplied,
        couponCodeUsed: b.couponCodeUsed,
        status: b.status,
        pnr: b.pnr,
        seatOrRoom: b.seatOrRoom,
        paxCount: b.paxCount,
        travelDates: b.travelDates,
        bookedAt: b.bookedAt,
        paymentStatus: b.paymentStatus,
        leadGuestPan: b.leadGuestPan,
        userName: b.user?.name || "N/A",
        userEmail: b.user?.email || "N/A",
        paymentMethod: b.payment?.method || "N/A",
        paymentGateway: b.payment?.gateway || "N/A",
      })),
      summary: {
        totalBookings: filtered.length,
        totalRevenue,
        totalOriginalPrice: filtered.reduce((s: number, b: any) => s + (b.originalPrice || b.price || 0), 0),
        totalDiscount,
        cancelledBookings: cancelled.length,
        cancelledRevenue: cancelled.reduce((s: number, b: any) => s + (b.price || 0), 0),
      },
      byType: Object.entries(byTypeMap).map(([type, data]) => ({ type, ...data })),
      paymentMethods: Object.entries(payMethodMap).map(([method, data]) => ({ method, ...data })),
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
