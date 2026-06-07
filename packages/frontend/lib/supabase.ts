import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://isubgeemvhvhnhikxbjb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdWJnZWVtdmh2aG5oaWt4YmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTA4MzQsImV4cCI6MjA5NjM4NjgzNH0.NpmJdqkeSHW236ghgchCdx_B1UpMGngDRRg6W0qcrhg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
