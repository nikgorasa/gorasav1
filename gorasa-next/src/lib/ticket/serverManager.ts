import { prisma } from "@/lib/prisma";
import type {
  Ticket,
  TicketNote,
  TicketActivity,
  CreateTicketInput,
  UpdateTicketInput,
  AddNoteInput,
  TicketFilters,
  TicketStats,
} from "./types";

function generateId(): string {
  return crypto.randomUUID();
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const id = generateId();
  const now = new Date();

  const ticket = await prisma.tickets.create({
    data: {
      id,
      subject: input.subject,
      description: input.description,
      category: input.category,
      priority: input.priority || "medium",
      status: "open",
      user_id: input.userId,
      user_name: input.userName,
      user_email: input.userEmail,
      user_phone: input.userPhone,
      booking_ref: input.bookingRef,
      created_at: now,
      updated_at: now,
    },
  });

  await addActivity(id, "created", input.userName, `Ticket created: ${input.subject}`);

  return ticket as unknown as Ticket;
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const ticket = await prisma.tickets.findUnique({ where: { id } });
  return ticket as unknown as Ticket | null;
}

export async function getUserTickets(userId: string): Promise<Ticket[]> {
  const tickets = await prisma.tickets.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
  return tickets as unknown as Ticket[];
}

export async function getAllTickets(filters?: TicketFilters): Promise<Ticket[]> {
  const where: Record<string, unknown> = {};

  if (filters) {
    if (filters.status?.length) where.status = { in: filters.status };
    if (filters.priority?.length) where.priority = { in: filters.priority };
    if (filters.category?.length) where.category = { in: filters.category };
    if (filters.assignedTo) where.assigned_to = filters.assignedTo;
    if (filters.userId) where.user_id = filters.userId;
    if (filters.dateRange) {
      where.created_at = {
        gte: new Date(filters.dateRange.from),
        lte: new Date(filters.dateRange.to),
      };
    }
  }

  const tickets = await prisma.tickets.findMany({
    where: where as any,
    orderBy: { created_at: "desc" },
  });

  return tickets as unknown as Ticket[];
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket | null> {
  const now = new Date();
  const updateData: Record<string, unknown> = { updated_at: now };

  if (input.status) {
    updateData.status = input.status;
    if (input.status === "resolved") updateData.resolved_at = now;
    if (input.status === "closed") updateData.closed_at = now;
  }

  if (input.priority) updateData.priority = input.priority;
  if (input.assignedTo) {
    updateData.assigned_to = input.assignedTo;
    updateData.assigned_to_name = input.assignedToName;
  }

  try {
    const ticket = await prisma.tickets.update({
      where: { id },
      data: updateData,
    });

    const changes = Object.entries(input)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    await addActivity(id, "updated", "System", changes);

    return ticket as unknown as Ticket;
  } catch {
    return null;
  }
}

export async function addTicketNote(input: AddNoteInput): Promise<TicketNote> {
  const note = await prisma.ticket_notes.create({
    data: {
      id: crypto.randomUUID(),
      ticket_id: input.ticketId,
      author: input.author,
      author_role: input.authorRole,
      content: input.content,
      is_internal: input.isInternal || false,
      created_at: new Date(),
    },
  });

  await addActivity(input.ticketId, "note_added", input.author, input.content.substring(0, 100));

  return note as unknown as TicketNote;
}

export async function getTicketNotes(ticketId: string, includeInternal: boolean = false): Promise<TicketNote[]> {
  const where: Record<string, unknown> = { ticket_id: ticketId };
  if (!includeInternal) where.is_internal = false;

  const notes = await prisma.ticket_notes.findMany({
    where: where as any,
    orderBy: { created_at: "asc" },
  });

  return notes as unknown as TicketNote[];
}

export async function getTicketActivities(ticketId: string): Promise<TicketActivity[]> {
  const activities = await prisma.ticket_activities.findMany({
    where: { ticket_id: ticketId },
    orderBy: { created_at: "asc" },
  });

  return activities as unknown as TicketActivity[];
}

export async function getTicketStats(): Promise<TicketStats> {
  const [
    total,
    open,
    inProgress,
    resolved,
    tickets,
  ] = await Promise.all([
    prisma.tickets.count(),
    prisma.tickets.count({ where: { status: "open" } }),
    prisma.tickets.count({ where: { status: "in_progress" } }),
    prisma.tickets.count({ where: { status: { in: ["resolved", "closed"] } } }),
    prisma.tickets.findMany({ select: { priority: true, category: true } }),
  ]);

  const byPriority = tickets.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { total, open, inProgress, escalated: 0, resolved, byPriority, byCategory };
}

async function addActivity(ticketId: string, action: string, performedBy: string, details?: string): Promise<void> {
  await prisma.ticket_activities.create({
    data: {
      id: crypto.randomUUID(),
      ticket_id: ticketId,
      action,
      performed_by: performedBy,
      details,
      created_at: new Date(),
    },
  });
}

export async function escalateTicket(id: string, reason: string, agentName: string): Promise<Ticket | null> {
  const ticket = await updateTicket(id, { status: "escalated" });
  if (!ticket) return null;

  await addTicketNote({
    ticketId: id,
    author: agentName,
    authorRole: "agent",
    content: `Escalated: ${reason}`,
    isInternal: true,
  });

  return ticket;
}

export async function resolveTicket(id: string, resolution: string, agentName: string): Promise<Ticket | null> {
  const ticket = await updateTicket(id, { status: "resolved" });
  if (!ticket) return null;

  await addTicketNote({
    ticketId: id,
    author: agentName,
    authorRole: "agent",
    content: `Resolved: ${resolution}`,
  });

  return ticket;
}
