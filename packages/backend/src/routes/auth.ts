import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body

  if (!email) {
    res.status(400).json({ error: 'email is required' })
    return
  }

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    res.status(404).json({ error: 'User not found. Use an email that exists in the seed data.' })
    return
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account is deactivated' })
    return
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role })

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
    },
  })
})

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  try {
    const { verifyToken } = await import('../lib/jwt.js')
    const payload = verifyToken(header.slice(7))
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
    })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
