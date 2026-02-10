
import { getAllLessons, getCourses } from "@/lib/actions"
import { LessonsContent } from "@/components/lessons-content"

export const metadata = {
    title: "مكتبة الدروس والامتحانات | لوحة التحكم",
    description: "إدارة مركزية لجميع الدروس والامتحانات",
}

export default async function LessonsPage() {
    const lessonsPromise = getAllLessons()
    const coursesPromise = getCourses()

    const [lessons, courses] = await Promise.all([
        lessonsPromise,
        coursesPromise
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">مكتبة المحتوى</h2>
                <p className="text-muted-foreground text-sm">
                    إدارة شاملة للدروس والامتحانات عبر جميع الكورسات.
                </p>
            </div>

            <LessonsContent initialLessons={lessons} courses={courses} />
        </div>
    )
}
