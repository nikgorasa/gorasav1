import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, authorize('SALES', 'ADMIN', 'SUPER_ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  const leads = await prisma.lead.findMany({
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(leads)
})

router.get('/:id', authenticate, authorize('SALES', 'ADMIN', 'SUPER_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const lead = await prisma.lead.findUnique({
    where: { id: req.params.id as string },
    include: { assignedUser: { select: { id: true, name: true, email: true } } },
  })
  if (!lead) { res.status(404).json({ error: 'Lead not found' }); return }
  res.json(lead)
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { destination, travelerName, travelerEmail, travelerPhone, numberOfDays, inclusions, specificDemands, notes } = req.body
  if (!destination || !travelerName || !travelerEmail) {
    res.status(400).json({ error: 'destination, travelerName, and travelerEmail are required' })
    return
  }
  const lead = await prisma.lead.create({
    data: {
      destination,
      travelerName,
      travelerEmail,
      travelerPhone,
      numberOfDays: numberOfDays || 5,
      inclusions: inclusions || '[]',
      specificDemands,
      notes,
    },
  })
  res.status(201).json(lead)
})

router.patch('/:id', authenticate, authorize('SALES', 'ADMIN', 'SUPER_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const { stage, assignedTo, notes } = req.body
  const lead = await prisma.lead.update({
    where: { id: req.params.id as string },
    data: { stage, assignedTo, notes },
  })
  res.json(lead)
})

router.get('/stats/summary', authenticate, authorize('SALES', 'ADMIN', 'SUPER_ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  const [total, byStage] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.groupBy({ by: ['stage'], _count: true }),
  ])
  res.json({ total, byStage })
})

export default router
