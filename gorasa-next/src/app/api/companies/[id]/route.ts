import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.domain !== undefined) updateData.domain = body.domain;
    if (body.discountRate !== undefined) updateData.discountRate = body.discountRate;
    if (body.walletBalance !== undefined) updateData.walletBalance = body.walletBalance;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const { data: company, error } = await supabase
      .from("Company")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Company update error:", error);
      return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from("Company")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
