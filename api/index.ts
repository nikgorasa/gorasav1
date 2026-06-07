import express from 'express'
import cors from 'cors'
import authRoutes from '../packages/backend/src/routes/auth.js'
import leadRoutes from '../packages/backend/src/routes/leads.js'
import packageRoutes from '../packages/backend/src/routes/packages.js'
import bookingRoutes from '../packages/backend/src/routes/bookings.js'
import dashboardRoutes from '../packages/backend/src/routes/dashboard.js'

const app = express()

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://rasa-zero-app-main-chi.vercel.app',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),
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

export default app
