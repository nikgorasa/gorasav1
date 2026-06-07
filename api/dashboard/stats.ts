import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(header.slice(7))

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { data: dbUser, error: dbError } = await supabase
      .from('User')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (dbError || !dbUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'SALES'].includes(dbUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const [usersResult, packagesResult, leadsResult, bookingsResult] = await Promise.all([
      supabase.from('User').select('id', { count: 'exact', head: true }),
      supabase.from('Package').select('id', { count: 'exact', head: true }).eq('isActive', true),
      supabase.from('Lead').select('id', { count: 'exact', head: true }),
      supabase.from('Booking').select('id, price', { count: 'exact' }).neq('status', 'CANCELLED'),
    ])

    const totalRevenue = bookingsResult.data?.reduce((sum: number, b: any) => sum + (b.price || 0), 0) || 0

    return res.json({
      totalUsers: usersResult.count || 0,
      activePackages: packagesResult.count || 0,
      totalLeads: leadsResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      pendingLeads: 0,
      totalRevenue,
      roleDistribution: [],
    })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
