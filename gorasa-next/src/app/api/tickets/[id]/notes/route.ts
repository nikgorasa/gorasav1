import { NextResponse } from "next/server";
import { addTicketNote, getTicketNotes } from "@/lib/ticket/serverManager";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeInternal = searchParams.get("includeInternal") === "true";

    const notes = await getTicketNotes(id, includeInternal);
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { author, authorRole, content, isInternal } = body;

    if (!author || !authorRole || !content) {
      return NextResponse.json(
        { error: "Author, authorRole, and content are required" },
        { status: 400 }
      );
    }

    const note = await addTicketNote({
      ticketId: id,
      author,
      authorRole,
      content,
      isInternal,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Failed to add note:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}
