import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const bookings = await prisma.booking.findMany({
      where: { userId: dbUser.id },
      orderBy: { bookedAt: 'desc' },
    })

    return res.json(bookings)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
