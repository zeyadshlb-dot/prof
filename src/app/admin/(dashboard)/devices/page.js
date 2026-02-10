
import { getDevices } from "@/lib/actions"
import { DevicesContent } from "@/components/devices-content"

export const metadata = {
    title: "إدارة الأجهزة | لوحة التحكم",
    description: "التحكم في الأجهزة المسموح بها للطلاب",
}

export default async function DevicesPage() {
    // 1. Fetch real devices from Supabase
    const devices = await getDevices()

    // 2. Render client component
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">إدارة الأجهزة</h2>
            </div>

            <DevicesContent initialDevices={devices} />
        </div>
    )
}
