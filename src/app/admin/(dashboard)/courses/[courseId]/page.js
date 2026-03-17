
import { getCourseDetails } from "@/lib/actions"
import { CourseDetailsContent } from "@/components/course-details-content"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }) {
    const course = await getCourseDetails(params.courseId)
    if (!course) return { title: "غير موجود" }

    return {
        title: `${course.title} | إدارة المحتوى`,
        description: course.description
    }
}

export default async function CourseDetailsPage({ params }) {
    const courseData = await getCourseDetails(params.courseId)

    if (!courseData) {
        notFound()
    }

    // Separate course info from chapters for cleaner props
    const { chapters, ...course } = courseData

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">محتوى الكورس</h2>
            </div>

            <CourseDetailsContent course={course} initialChapters={chapters} />
        </div>
    )
}
