import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    res.status(401).json({ error: error.message })
    return
  }

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: 'CUSTOMER',
        supabaseId: data.user.id,
      },
    })
  } else if (!user.supabaseId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { supabaseId: data.user.id },
    })
  }

  res.json({
    token: data.session.access_token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      companyId: user.companyId,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
    },
  })
})

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password, and name are required' })
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  if (!data.user) {
    res.status(400).json({ error: 'Failed to create user' })
    return
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        name,
        role: 'CUSTOMER',
        supabaseId: data.user.id,
      },
    })
  }

  res.json({
    message: 'Registration successful. Please check your email to verify your account.',
    token: data.session?.access_token,
  })
})

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(header.slice(7))

    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })

    if (!dbUser) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      avatar: dbUser.avatar,
      companyId: dbUser.companyId,
      walletBalance: dbUser.walletBalance,
      loyaltyPoints: dbUser.loyaltyPoints,
      loyaltyTier: dbUser.loyaltyTier,
    })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
