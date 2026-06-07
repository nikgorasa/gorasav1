import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination, travelerName, travelerEmail, travelerPhone, numberOfDays, inclusions, specificDemands, notes } = body;

    if (!destination || !travelerName || !travelerEmail) {
      return NextResponse.json(
        { error: "Destination, traveler name, and email are required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        destination,
        travelerName,
        travelerEmail,
        travelerPhone,
        numberOfDays: numberOfDays || 5,
        inclusions: inclusions || "[]",
        specificDemands,
        notes,
        stage: "NEW",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Lead create error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
