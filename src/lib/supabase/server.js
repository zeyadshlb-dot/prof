
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = "https://ohsrukyeqrknbcqphxvf.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oc3J1a3llcXJrbmJjcXBoeHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MDg3NjQsImV4cCI6MjA4NjI4NDc2NH0.XlAEvMFVv9Fr9uYRBz0hkXSSvj_NBJd6EdU0ao9mPTg"

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
