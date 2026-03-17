
import { getCourses, getCategories } from "@/lib/actions"
import { CoursesContent } from "@/components/courses-content"

export const metadata = {
    title: "الكورسات | لوحة التحكم",
    description: "إدارة الكورسات والمحتوى التعليمي",
}

export default async function CoursesPage() {
    const coursesPromise = getCourses()
    const categoriesPromise = getCategories()

    const [courses, categories] = await Promise.all([
        coursesPromise,
        categoriesPromise
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">إدارة الكورسات</h2>
            </div>

            <CoursesContent initialCourses={courses} categories={categories} />
        </div>
    )
}
