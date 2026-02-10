
import { getActivationCodes, getCoursesForSelect, getBundlesForSelect } from "@/lib/actions"
import { ActivationCodesContent } from "@/components/activation-codes-content"

export const metadata = {
    title: "أكواد التفعيل | لوحة التحكم",
    description: "إدارة وتوليد أكواد تفعيل الكورسات والباقات",
}

export default async function ActivationCodesPage() {
    const codesPromise = getActivationCodes()
    const coursesPromise = getCoursesForSelect()
    const bundlesPromise = getBundlesForSelect()

    const [codes, courses, bundles] = await Promise.all([
        codesPromise,
        coursesPromise,
        bundlesPromise
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">إدارة الأكواد</h2>
            </div>

            <ActivationCodesContent
                initialCodes={codes}
                courses={courses}
                bundles={bundles}
            />
        </div>
    )
}
