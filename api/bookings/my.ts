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

    const { data: bookings, error: bookingsError } = await supabase
      .from('Booking')
      .select('*')
      .eq('userId', dbUser.id)
      .order('bookedAt', { ascending: false })

    if (bookingsError) {
      return res.status(500).json({ error: bookingsError.message })
    }

    return res.json(bookings)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
