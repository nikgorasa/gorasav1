import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import leadRoutes from './routes/leads.js'
import packageRoutes from './routes/packages.js'
import bookingRoutes from './routes/bookings.js'
import dashboardRoutes from './routes/dashboard.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://gorasav1.netlify.app',
  ],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.listen(PORT, () => {
  console.log(`GoRASA API running on http://localhost:${PORT}`)
})

export default app
