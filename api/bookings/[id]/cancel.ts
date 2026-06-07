import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Booking ID is required' })
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

    const { data: booking, error: bookingError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.userId !== dbUser.id && !['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const { error: updateError } = await supabase
      .from('Booking')
      .update({ status: 'CANCELLED' })
      .eq('id', id)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }

    return res.json({ message: 'Booking cancelled' })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
