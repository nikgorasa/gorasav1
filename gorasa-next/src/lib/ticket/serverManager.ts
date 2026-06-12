import { createClient } from "@supabase/supabase-js";
import {
  Ticket,
  TicketNote,
  TicketActivity,
  CreateTicketInput,
  UpdateTicketInput,
  AddNoteInput,
  TicketFilters,
  TicketStats,
} from "./types";

// Server-side module: uses anon key (RLS disabled on tickets tables)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// id column is UUID type — use crypto.randomUUID()
function generateId(): string {
  return crypto.randomUUID();
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const id = generateId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tickets")
    .insert({
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
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create ticket: ${error.message}`);

  await addActivity(id, "created", input.userName, `Ticket created: ${input.subject}`);

  return data;
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch ticket: ${error.message}`);
  }

  return data;
}

export async function getUserTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch tickets: ${error.message}`);
  return data || [];
}

export async function getAllTickets(filters?: TicketFilters): Promise<Ticket[]> {
  let query = supabase.from("tickets").select("*");

  if (filters) {
    if (filters.status?.length) {
      query = query.in("status", filters.status);
    }
    if (filters.priority?.length) {
      query = query.in("priority", filters.priority);
    }
    if (filters.category?.length) {
      query = query.in("category", filters.category);
    }
    if (filters.assignedTo) {
      query = query.eq("assigned_to", filters.assignedTo);
    }
    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.dateRange) {
      query = query.gte("created_at", filters.dateRange.from);
      query = query.lte("created_at", filters.dateRange.to);
    }
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch tickets: ${error.message}`);
  return data || [];
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket | null> {
  const now = new Date().toISOString();
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

  const { data, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to update ticket: ${error.message}`);
  }

  const changes = Object.entries(input)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  await addActivity(id, "updated", "System", changes);

  return data;
}

export async function addTicketNote(input: AddNoteInput): Promise<TicketNote> {
  const { data, error } = await supabase
    .from("ticket_notes")
    .insert({
      id: crypto.randomUUID(),
      ticket_id: input.ticketId,
      author: input.author,
      author_role: input.authorRole,
      content: input.content,
      is_internal: input.isInternal || false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add note: ${error.message}`);

  await addActivity(input.ticketId, "note_added", input.author, input.content.substring(0, 100));

  return data;
}

export async function getTicketNotes(ticketId: string, includeInternal: boolean = false): Promise<TicketNote[]> {
  let query = supabase
    .from("ticket_notes")
    .select("*")
    .eq("ticket_id", ticketId);

  if (!includeInternal) {
    query = query.eq("is_internal", false);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch notes: ${error.message}`);
  return data || [];
}

export async function getTicketActivities(ticketId: string): Promise<TicketActivity[]> {
  const { data, error } = await supabase
    .from("ticket_activities")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch activities: ${error.message}`);
  return data || [];
}

export async function getTicketStats(): Promise<TicketStats> {
  const { data, error } = await supabase
    .from("tickets")
    .select("status, priority, category");

  if (error) throw new Error(`Failed to fetch stats: ${error.message}`);

  const tickets = data || [];

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    escalated: tickets.filter((t) => t.status === "escalated").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    byPriority: tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCategory: tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

async function addActivity(ticketId: string, action: string, performedBy: string, details?: string): Promise<void> {
  await supabase.from("ticket_activities").insert({
    id: crypto.randomUUID(),
    ticket_id: ticketId,
    action,
    performed_by: performedBy,
    details,
    created_at: new Date().toISOString(),
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
