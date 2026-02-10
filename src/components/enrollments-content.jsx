"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Trash2,
    Search,
    BookOpen,
    Package as PackageIcon,
    Filter,
    Calendar,
    User
} from "lucide-react"
import { deleteEnrollment } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/ui/pagination"

export function EnrollmentsContent({ initialEnrollments }) {
    const [enrollments, setEnrollments] = useState(initialEnrollments)
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteId, setDeleteId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const { toast } = useToast()
    const ITEMS_PER_PAGE = 15

    // Filter enrollments
    const filteredEnrollments = enrollments.filter(enrollment => {
        const studentName = enrollment.student?.full_name?.toLowerCase() || ""
        const contentName = (enrollment.course?.title || enrollment.bundle?.title || "").toLowerCase()
        const query = searchQuery.toLowerCase()

        return studentName.includes(query) || contentName.includes(query)
    })

    const totalPages = Math.ceil(filteredEnrollments.length / ITEMS_PER_PAGE)
    const paginatedEnrollments = filteredEnrollments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const handleDelete = async () => {
        if (!deleteId) return
        setLoading(true)

        const result = await deleteEnrollment(deleteId)

        if (result.success) {
            setEnrollments(enrollments.filter(e => e.id !== deleteId))
            toast({ title: "تم الحذف", description: result.message })
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }

        setDeleteId(null)
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">

            {/* Header / Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث باسم الطالب أو اسم المحتوى..."
                        className="bg-background pr-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Enrollments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        سجل الاشتراكات
                        <Badge variant="secondary" className="text-xs font-normal">{filteredEnrollments.length}</Badge>
                    </CardTitle>
                    <CardDescription>
                        قائمة بجميع الطلاب المسجلين في الكورسات والباقات.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>الطالب</TableHead>
                                <TableHead>المحتوى</TableHead>
                                <TableHead>تاريخ الاشتراك</TableHead>
                                <TableHead className="text-right">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEnrollments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        لا توجد اشتراكات تطابق البحث.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedEnrollments.map((enrollment, index) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell className="text-muted-foreground font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {enrollment.student?.full_name || "غير معروف"}
                                                </div>
                                                <span className="text-xs text-muted-foreground pr-5">
                                                    {enrollment.student?.phone_number || "-"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {enrollment.course ? (
                                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">
                                                        <BookOpen className="h-3 w-3 ml-1" />
                                                        كورس
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20">
                                                        <PackageIcon className="h-3 w-3 ml-1" />
                                                        باقة
                                                    </Badge>
                                                )}
                                                <span className="text-sm font-medium">
                                                    {enrollment.course?.title || enrollment.bundle?.title || "محتوى محذوف"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(enrollment.activated_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                onClick={() => setDeleteId(enrollment.id)}
                                                title="حذف الاشتراك"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا الاشتراك؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم إزالة صلاحية الوصول لهذا المحتوى من حساب الطالب فوراً.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={loading}
                        >
                            {loading ? "جاري الحذف..." : "نعم، احذف الاشتراك"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
