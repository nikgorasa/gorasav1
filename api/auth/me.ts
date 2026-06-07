import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
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

    return res.json({
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
    return res.status(401).json({ error: 'Invalid token' })
  }
}
