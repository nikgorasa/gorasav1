import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.walletBalance != null) {
      const { data: company, error } = await supabase
        .from("Company")
        .update({ walletBalance: body.walletBalance, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Company update error:", error);
        return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
      }

      return NextResponse.json(company);
    }

    return NextResponse.json({ error: "walletBalance is required" }, { status: 400 });
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
