
import { getExamResults } from "@/lib/actions"
import { ExamResultsContent } from "@/components/exam-results-content"

export const metadata = {
    title: "نتائج الامتحانات | لوحة التحكم",
    description: "عرض نتائج الطلاب وتفوقهم في الامتحانات",
}

export default async function ExamResultsPage() {
    // 1. Fetch real results from Supabase
    const results = await getExamResults()

    // 2. Render client component
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">سجل النتائج</h2>
            </div>

            <ExamResultsContent initialResults={results} />
        </div>
    )
}
