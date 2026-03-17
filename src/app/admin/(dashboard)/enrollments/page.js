
import { getEnrollments } from "@/lib/actions"
import { EnrollmentsContent } from "@/components/enrollments-content"

export const metadata = {
    title: "الاشتراكات | لوحة التحكم",
    description: "متابعة اشتراكات الطلاب في المنصة",
}

export default async function EnrollmentsPage() {
    const enrollments = await getEnrollments()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">إدارة الاشتراكات</h2>
            </div>

            <EnrollmentsContent initialEnrollments={enrollments} />
        </div>
    )
}
