import { getStudents, getDevices, getEnrollments, getActivationCodes } from "@/lib/actions"
import { StudentsContent } from "@/components/students-content"

export const metadata = {
    title: "الطلاب | لوحة التحكم",
    description: "إدارة الطلاب والمسجلين في المنصة",
}

export default async function StudentsPage() {
    const [students, devices, enrollments, activationCodes] = await Promise.all([
        getStudents(),
        getDevices(),
        getEnrollments(),
        getActivationCodes(),
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">الطلاب المسجلين</h2>
            </div>

            <StudentsContent
                initialStudents={students}
                devices={devices}
                enrollments={enrollments}
                activationCodes={activationCodes}
            />
        </div>
    )
}
