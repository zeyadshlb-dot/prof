
import { getCategories } from "@/lib/actions"
import { CategoriesContent } from "@/components/categories-content"

export const metadata = {
    title: "التصنيفات الدراسية | لوحة التحكم",
    description: "إدارة المراحل الدراسية والفئات",
}

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">إدارة التصنيفات</h2>
            </div>

            <CategoriesContent initialCategories={categories} />
        </div>
    )
}
