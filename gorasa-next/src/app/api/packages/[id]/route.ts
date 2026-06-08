import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: pkg, error } = await supabase
      .from("Package")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
      }
      console.error("Package fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Package fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data: pkg, error } = await supabase
      .from("Package")
      .update({
        title: body.title,
        duration: body.duration,
        price: body.price ? Number(body.price) : undefined,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        rating: body.rating ? Number(body.rating) : undefined,
        provider: body.provider,
        overview: body.overview,
        itinerary: body.itinerary,
        inclusions: body.inclusions,
        exclusions: body.exclusions,
        importantNotes: body.importantNotes,
        images: body.images,
        status: body.status,
        isActive: body.isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Package update error:", error);
      return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Package update error:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from("Package")
      .update({ isActive: false })
      .eq("id", id);

    if (error) {
      console.error("Package delete error:", error);
      return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Package delete error:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
