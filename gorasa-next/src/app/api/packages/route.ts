import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "public" },
});

export async function GET() {
  try {
    const { data: packages, error } = await supabase
      .from("Package")
      .select("*")
      .eq("isActive", true)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Packages error:", error);
      return NextResponse.json(
        { error: "Failed to fetch packages" },
        { status: 500 }
      );
    }

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Packages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, duration, price, originalPrice, rating, provider, overview, itinerary, inclusions, exclusions, importantNotes, images, status } = body;

    if (!title || !duration || price === undefined) {
      return NextResponse.json(
        { error: "Title, duration, and price are required" },
        { status: 400 }
      );
    }

    const { data: pkg, error } = await supabase
      .from("Package")
      .insert({
        title,
        duration,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        rating: rating ? Number(rating) : 4.5,
        provider: provider || "GoRASA Direct",
        overview: overview || "{}",
        itinerary: itinerary || "{}",
        inclusions: inclusions || "[]",
        exclusions: exclusions || "[]",
        importantNotes: importantNotes || "{}",
        images: images || "[]",
        status: status || "DRAFT",
      })
      .select()
      .single();

    if (error) {
      console.error("Package create error:", error);
      return NextResponse.json(
        { error: "Failed to create package" },
        { status: 500 }
      );
    }

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Package create error:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
