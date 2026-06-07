import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(packages)
})

router.get('/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  const packages = await prisma.package.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(packages)
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const pkg = await prisma.package.findUnique({ where: { id: req.params.id } })
  if (!pkg) { res.status(404).json({ error: 'Package not found' }); return }
  res.json(pkg)
})

router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const { title, duration, price, originalPrice, rating, provider, overview, itinerary, inclusions, exclusions, importantNotes, images } = req.body
  if (!title || !duration || price === undefined) {
    res.status(400).json({ error: 'title, duration, and price are required' })
    return
  }
  const pkg = await prisma.package.create({
    data: {
      title, duration, price,
      originalPrice: originalPrice || null,
      rating: rating || 4.5,
      provider: provider || 'GoRASA Direct',
      overview: overview || '{}',
      itinerary: itinerary || '{}',
      inclusions: inclusions || '[]',
      exclusions: exclusions || '[]',
      importantNotes: importantNotes || '{}',
      images: images || '[]',
    },
  })
  res.status(201).json(pkg)
})

router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const { title, duration, price, originalPrice, rating, provider, overview, itinerary, inclusions, exclusions, importantNotes, images, isActive } = req.body
  const pkg = await prisma.package.update({
    where: { id: req.params.id },
    data: { title, duration, price, originalPrice, rating, provider, overview, itinerary, inclusions, exclusions, importantNotes, images, isActive },
  })
  res.json(pkg)
})

router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: Request, res: Response): Promise<void> => {
  await prisma.package.update({ where: { id: req.params.id }, data: { isActive: false } })
  res.json({ message: 'Package deactivated' })
})

router.get('/stats/summary', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (_req: Request, res: Response): Promise<void> => {
  const [total, active] = await Promise.all([
    prisma.package.count(),
    prisma.package.count({ where: { isActive: true } }),
  ])
  res.json({ total, active })
})

export default router
