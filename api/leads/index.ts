import { createClient } from '@supabase/supabase-js'

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

    const { data: dbUser, error: dbError } = await supabase
      .from('User')
      .select('*')
      .eq('email', user.email!)
      .single()

    if (dbError || !dbUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!['SALES', 'ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { data: leads, error: leadsError } = await supabase
      .from('Lead')
      .select('*, assignedUser:assignedTo(id, name, email)')
      .order('createdAt', { ascending: false })

    if (leadsError) {
      return res.status(500).json({ error: leadsError.message })
    }

    return res.json(leads)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
