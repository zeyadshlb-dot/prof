
import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = "https://ohsrukyeqrknbcqphxvf.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oc3J1a3llcXJrbmJjcXBoeHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MDg3NjQsImV4cCI6MjA4NjI4NDc2NH0.XlAEvMFVv9Fr9uYRBz0hkXSSvj_NBJd6EdU0ao9mPTg"

export function createClient() {
    return createBrowserClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    )
}
