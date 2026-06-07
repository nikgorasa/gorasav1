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

    if (!['SALES', 'ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const leads = await prisma.lead.findMany({
      include: { assignedUser: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(leads)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
