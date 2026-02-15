
import { getAllLessons, getCourses, getChapters } from "@/lib/actions"
import { LessonsContent } from "@/components/lessons-content"

export const metadata = {
    title: "الفصول والدروس | لوحة التحكم",
    description: "إدارة الفصول والدروس والامتحانات",
}

export default async function LessonsPage() {
    const [lessons, courses, chapters] = await Promise.all([
        getAllLessons(),
        getCourses(),
        getChapters(),
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <LessonsContent initialLessons={lessons} courses={courses} initialChapters={chapters} />
        </div>
    )
}
