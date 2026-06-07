import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

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

    const pkg = await prisma.package.create({
      data: {
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
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Package create error:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
