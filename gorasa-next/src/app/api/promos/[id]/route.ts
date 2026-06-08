import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json({ error: "isActive is required" }, { status: 400 });
    }

    const { data: promo, error } = await supabase
      .from("PromoCode")
      .update({ isActive, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Promo update error:", error);
      return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
    }

    return NextResponse.json(promo);
  } catch (error) {
    console.error("Promo update error:", error);
    return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("PromoCode")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Promo delete error:", error);
      return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Promo delete error:", error);
    return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
  }
}
