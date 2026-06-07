import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/stats', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'SALES'), async (_req: Request, res: Response): Promise<void> => {
  const [totalUsers, activePackages, totalLeads, totalBookings, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.package.count({ where: { isActive: true } }),
    prisma.lead.count(),
    prisma.booking.count(),
    prisma.booking.findMany({ where: { status: { not: 'CANCELLED' } } }),
  ])

  const totalRevenue = bookings.reduce<number>((sum, b) => sum + b.price, 0)
  const pendingLeads = await prisma.lead.count({ where: { status: 'INQUIRED' } })
  const roleDistribution = await prisma.user.groupBy({ by: ['role'], _count: true })

  res.json({
    totalUsers,
    activePackages,
    totalLeads,
    totalBookings,
    pendingLeads,
    totalRevenue,
    roleDistribution,
  })
})

export default router
