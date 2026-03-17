
import { getBundles, getCoursesForSelect } from "@/lib/actions"
import { BundlesContent } from "@/components/bundles-content"

export const metadata = {
    title: "الباقات والعروض | لوحة التحكم",
    description: "إدارة الباقات الدراسية والعروض الخاصة",
}

export default async function BundlesPage() {
    const bundlesPromise = getBundles()
    const coursesPromise = getCoursesForSelect()

    const [bundles, courses] = await Promise.all([
        bundlesPromise,
        coursesPromise
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">إدارة الباقات</h2>
            </div>

            <BundlesContent initialBundles={bundles} courses={courses} />
        </div>
    )
}
