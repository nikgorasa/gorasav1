import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { role, userId } = req.user!
  const where = role === 'CUSTOMER' || role === 'CORPORATE_USER'
    ? { userId }
    : {}
  const bookings = await prisma.booking.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { bookedAt: 'desc' },
  })
  res.json(bookings)
})

router.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.userId },
    orderBy: { bookedAt: 'desc' },
  })
  res.json(bookings)
})

router.patch('/:id/cancel', authenticate, async (req: Request, res: Response): Promise<void> => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id as string } })
  if (!booking) { res.status(404).json({ error: 'Booking not found' }); return }
  if (booking.userId !== req.user!.userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
    res.status(403).json({ error: 'Not authorized' }); return
  }
  await prisma.booking.update({ where: { id: req.params.id as string }, data: { status: 'CANCELLED' } })
  res.json({ message: 'Booking cancelled' })
})

router.get('/stats/revenue', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  const bookings = await prisma.booking.findMany({ where: { status: { not: 'CANCELLED' } } })
  const totalRevenue = bookings.reduce((sum: number, b: { price: number }) => sum + b.price, 0)
  const totalDiscount = bookings.reduce((sum: number, b: { discountApplied: number }) => sum + b.discountApplied, 0)
  const activeBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } })
  res.json({ totalRevenue, totalDiscount, activeBookings, totalBookings: bookings.length })
})

export default router
