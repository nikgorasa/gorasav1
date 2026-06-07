import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data: leads, error } = await supabase
      .from("Lead")
      .select("*, assignedUser:User!assignedTo(id, name, email)")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Leads error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads" },
        { status: 500 }
      );
    }

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

    const { data: lead, error } = await supabase
      .from("Lead")
      .insert({
        destination,
        travelerName,
        travelerEmail,
        travelerPhone,
        numberOfDays: numberOfDays || 5,
        inclusions: inclusions || "[]",
        specificDemands,
        notes,
        stage: "NEW",
      })
      .select()
      .single();

    if (error) {
      console.error("Lead create error:", error);
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      );
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Lead create error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
