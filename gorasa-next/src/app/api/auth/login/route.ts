import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, supabaseId, name, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          supabaseId: supabaseId || null,
          email,
          name: name || email.split("@")[0],
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: "CUSTOMER",
        },
      });
    } else if (supabaseId && !dbUser.supabaseId) {
      // Link Supabase ID
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { supabaseId },
      });
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      avatar: dbUser.avatar,
      companyId: dbUser.companyId,
      walletBalance: dbUser.walletBalance,
      loyaltyPoints: dbUser.loyaltyPoints,
      loyaltyTier: dbUser.loyaltyTier,
    });
  } catch (error) {
    console.error("Auth/login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
