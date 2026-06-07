import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  const userData = await apiFetch<{
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    companyId?: string;
    walletBalance: number;
    loyaltyPoints: number;
    loyaltyTier: string;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return {
    token: data.session.access_token,
    user: userData,
  }
}

export async function register(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    message: 'Registration successful. Please check your email to verify your account.',
    token: data.session?.access_token,
  }
}

export async function getMe() {
  return apiFetch<{
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    companyId?: string;
    walletBalance: number;
    loyaltyPoints: number;
    loyaltyTier: string;
  }>('/api/auth/me')
}

export async function getPackages() {
  return apiFetch<Array<{
    id: string;
    title: string;
    duration: string;
    price: number;
    originalPrice?: number;
    rating: number;
    provider: string;
    overview: string;
    itinerary: string;
    inclusions: string;
    exclusions: string;
    importantNotes: string;
    images: string;
    status: string;
    isActive: boolean;
  }>>('/api/packages');
}

export async function getMyBookings() {
  return apiFetch<Array<{
    id: string;
    type: string;
    itemName: string;
    providerOrAirline?: string;
    price: number;
    originalPrice?: number;
    discountApplied: number;
    couponCodeUsed?: string;
    status: string;
    pnr?: string;
    seatOrRoom?: string;
    paxCount: number;
    travelDates?: string;
    bookedAt: string;
  }>>('/api/bookings/my');
}

export async function cancelBooking(id: string) {
  return apiFetch<{ message: string }>(`/api/bookings/${id}/cancel`, {
    method: 'PATCH',
  });
}

export async function getDashboardStats() {
  return apiFetch<{
    totalUsers: number;
    activePackages: number;
    totalLeads: number;
    totalBookings: number;
    pendingLeads: number;
    totalRevenue: number;
    roleDistribution: Array<{ role: string; _count: number }>;
  }>('/api/dashboard/stats');
}

export async function getLeads() {
  return apiFetch<Array<{
    id: string;
    destination: string;
    travelerName: string;
    travelerEmail: string;
    travelerPhone?: string;
    numberOfDays: number;
    inclusions: string;
    specificDemands?: string;
    notes?: string;
    stage: string;
    priceEstimated?: number;
    assignedTo?: string;
    createdAt: string;
  }>>('/api/leads');
}

export async function submitLead(data: {
  destination: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  numberOfDays: number;
  inclusions: string;
  specificDemands?: string;
  notes?: string;
}) {
  return apiFetch<{ id: string }>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logout() {
  await supabase.auth.signOut()
}
