import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
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

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'SALES'].includes(dbUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const [totalUsers, activePackages, totalLeads, totalBookings, bookings] = await Promise.all([
      prisma.user.count(),
      prisma.package.count({ where: { isActive: true } }),
      prisma.lead.count(),
      prisma.booking.count(),
      prisma.booking.findMany({ where: { status: { not: 'CANCELLED' } } }),
    ])

    const totalRevenue = bookings.reduce((sum: number, b: { price: number }) => sum + b.price, 0)
    const pendingLeads = await prisma.lead.count({ where: { stage: 'NEW' } })
    const roleDistribution = await prisma.user.groupBy({ by: ['role'], _count: true })

    return res.json({
      totalUsers,
      activePackages,
      totalLeads,
      totalBookings,
      pendingLeads,
      totalRevenue,
      roleDistribution,
    })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
