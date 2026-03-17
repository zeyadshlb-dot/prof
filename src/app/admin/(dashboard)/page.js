
import { getDashboardStats } from "@/lib/actions"
import { DashboardContent } from "@/components/dashboard-content"

export default async function Dashboard() {
    // 1. Fetch real stats from Supabase
    const stats = await getDashboardStats()

    // 2. Render the client component with data
    return <DashboardContent stats={stats} />
}
