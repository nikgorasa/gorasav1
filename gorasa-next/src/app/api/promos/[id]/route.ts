import { NextRequest, NextResponse } from "next/server";
import * as promos from "@/lib/db/promo-codes";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json({ error: "isActive is required" }, { status: 400 });
    }

    const promo = await promos.update(id, {
      isActive,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error("Promo update error:", error);
    return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await promos.remove(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Promo delete error:", error);
    return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
  }
}
