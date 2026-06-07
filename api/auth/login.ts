import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return res.status(401).json({ error: error.message })
  }

  const { data: dbUser, error: dbError } = await supabase
    .from('User')
    .select('*')
    .eq('email', email)
    .single()

  if (dbError || !dbUser) {
    return res.status(404).json({ error: 'User not found in database' })
  }

  return res.json({
    token: data.session.access_token,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      avatar: dbUser.avatar,
      companyId: dbUser.companyId,
      walletBalance: dbUser.walletBalance,
      loyaltyPoints: dbUser.loyaltyPoints,
      loyaltyTier: dbUser.loyaltyTier,
    },
  })
}
