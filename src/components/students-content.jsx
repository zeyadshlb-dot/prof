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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    MoreHorizontal,
    Search,
    UserCheck,
    UserX,
    Trash2,
    Shield,
    Smartphone,
    GraduationCap,
    Filter,
    Users,
    Eye,
    Monitor,
    BookOpen,
    Package as PackageIcon,
    Ticket
} from "lucide-react"
import { toggleStudentBan, deleteStudent } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

export function StudentsContent({ initialStudents, devices = [], enrollments = [], activationCodes = [] }) {
    const [students, setStudents] = useState(initialStudents)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredStudents, setFilteredStudents] = useState(initialStudents)
    const [deleteId, setDeleteId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [courseFilter, setCourseFilter] = useState("")
    const { toast } = useToast()
    const ITEMS_PER_PAGE = 15

    // بيانات الطالب المحدد للتفاصيل
    const studentDevices = selectedStudent
        ? devices.filter((d) => d.student_id === selectedStudent.id)
        : []
    const studentEnrollmentsRaw = selectedStudent
        ? enrollments.filter((e) => e.student_id === selectedStudent.id)
        : []
    const studentCodesRaw = selectedStudent
        ? activationCodes.filter(
            (c) => (c.used_by_student_id === selectedStudent.id) && c.is_used
        )
        : []
    const courseFilterLower = courseFilter.trim().toLowerCase()
    const studentEnrollments = courseFilterLower
        ? studentEnrollmentsRaw.filter((e) => {
            const title = (e.course?.title || e.bundle?.title || "").toLowerCase()
            return title.includes(courseFilterLower)
        })
        : studentEnrollmentsRaw
    const studentCodes = courseFilterLower
        ? studentCodesRaw.filter((c) => {
            const title = (c.course?.title || c.bundle?.title || "").toLowerCase()
            return title.includes(courseFilterLower)
        })
        : studentCodesRaw

    // الفلترة والبحث
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase()
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page on search

        if (!query) {
            setFilteredStudents(students)
            return
        }

        const filtered = students.filter(student =>
            student.full_name?.toLowerCase().includes(query) ||
            student.phone_number?.includes(query)
        )
        setFilteredStudents(filtered)
    }

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Toggle Ban
    const handleToggleBan = async (studentId, currentStatus) => {
        setLoading(true)
        const result = await toggleStudentBan(studentId, currentStatus)

        if (result.success) {
            toast({
                title: "تم بنجاح",
                description: result.message,
                variant: "success",
            })
            // تحديث الحالة محلياً
            const updated = students.map(s =>
                s.id === studentId ? { ...s, is_banned: !currentStatus } : s
            )
            setStudents(updated)
            setFilteredStudents(updated.filter(s =>
                s.full_name?.toLowerCase().includes(searchQuery) ||
                s.phone_number?.includes(searchQuery)
            ))
        } else {
            toast({
                title: "خطأ",
                description: result.message,
                variant: "destructive",
            })
        }
        setLoading(false)
    }

    // Delete Student
    const handleDelete = async () => {
        if (!deleteId) return
        setLoading(true)

        const result = await deleteStudent(deleteId)

        if (result.success) {
            toast({
                title: "تم الحذف",
                description: result.message,
            })
            const updated = students.filter(s => s.id !== deleteId)
            setStudents(updated)
            setFilteredStudents(updated.filter(s =>
                s.full_name?.toLowerCase().includes(searchQuery) ||
                s.phone_number?.includes(searchQuery)
            ))
        } else {
            toast({
                title: "خطأ",
                description: result.message,
                variant: "destructive",
            })
        }
        setDeleteId(null)
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">
            {/* Header Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                        <p className="text-xs text-muted-foreground">طالب مسجل</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الطلاب النشطين</CardTitle>
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.filter(s => !s.is_banned).length}</div>
                        <p className="text-xs text-muted-foreground">حساب مفعل</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المحظورين</CardTitle>
                        <UserX className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.filter(s => s.is_banned).length}</div>
                        <p className="text-xs text-muted-foreground">تم حظرهم</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center flex-1 max-w-sm gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث بالاسم أو رقم الهاتف..."
                            className="bg-background pr-9"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
                {/* Removed Create Student Button */}
            </div>

            {/* Students Table */}
            <Card>
                <CardHeader>
                    <CardTitle>قائمة الطلاب ({filteredStudents.length})</CardTitle>
                    <CardDescription>
                        إدارة حسابات الطلاب، الحظر، والحذف.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">#</TableHead>
                                <TableHead>الطالب</TableHead>
                                <TableHead>السنة الدراسية</TableHead>
                                <TableHead>رقم الهاتف</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-left">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        لا يوجد طلاب مطابقين للبحث.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedStudents.map((student, index) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium text-muted-foreground">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.full_name}&backgroundColor=e5e7eb`} />
                                                    <AvatarFallback>{student.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{student.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">{student.academic_year || "غير محدد"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors">
                                                <GraduationCap className="h-3 w-3 ml-1" />
                                                {student.academic_year || "غير محدد"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <a href={`tel:${student.phone_number}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-mono" dir="ltr">
                                                <Smartphone className="h-3.5 w-3.5" />
                                                {student.phone_number || "-"}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={student.is_banned ? "destructive" : "secondary"}
                                                className={student.is_banned ? "" : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"}
                                            >
                                                {student.is_banned ? "محظور" : "نشط"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">فتح القائمة</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                                                        <Eye className="mr-2 h-4 w-4 ml-2" />
                                                        عرض التفاصيل (أجهزة، تفعيلات، أكواد)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.id)}>
                                                        نسخ المعرف (ID)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleBan(student.id, student.is_banned)}
                                                        className={student.is_banned ? "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-500/10" : "text-destructive focus:text-destructive focus:bg-destructive/10"}
                                                    >
                                                        {student.is_banned ? (
                                                            <>
                                                                <UserCheck className="mr-2 h-4 w-4 ml-2" />
                                                                إلغاء الحظر
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Shield className="mr-2 h-4 w-4 ml-2" />
                                                                حظر الطالب
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => setDeleteId(student.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4 ml-2" />
                                                        حذف الحساب
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

            {/* تفاصيل الطالب: أجهزة، تفعيلات، أكواد */}
            <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <SheetContent side="left" className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {selectedStudent?.full_name || "تفاصيل الطالب"}
                        </SheetTitle>
                        <SheetDescription>
                            {selectedStudent?.phone_number || ""}
                        </SheetDescription>
                    </SheetHeader>
                    {selectedStudent && (
                        <div className="mt-6 space-y-6">
                            {/* فلتر باسم الكورس */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">فلتر باسم الكورس / الباقة</label>
                                <Input
                                    placeholder="ابحث باسم الكورس..."
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                    className="bg-background"
                                />
                            </div>

                            {/* أجهزة الطالب */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Monitor className="h-4 w-4" />
                                    الأجهزة المسجلة ({studentDevices.length})
                                </h4>
                                {studentDevices.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">لا توجد أجهزة مسجلة</p>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>الجهاز</TableHead>
                                                    <TableHead>آخر دخول</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {studentDevices.map((d) => (
                                                    <TableRow key={d.id}>
                                                        <TableCell className="font-medium text-sm">{d.device_name || "غير معروف"}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {d.last_active ? new Date(d.last_active).toLocaleString("ar-EG") : "—"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* التفعيلات (الاشتراكات) */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    التفعيلات / الاشتراكات ({studentEnrollments.length})
                                </h4>
                                {studentEnrollments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">لا توجد تفعيلات أو لا تطابق الفلتر</p>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>اسم الكورس / الباقة</TableHead>
                                                    <TableHead>النوع</TableHead>
                                                    <TableHead>تاريخ التفعيل</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {studentEnrollments.map((e) => (
                                                    <TableRow key={e.id}>
                                                        <TableCell className="font-medium text-sm">
                                                            {e.course?.title || e.bundle?.title || "—"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {e.course ? (
                                                                <Badge variant="outline" className="text-xs">كورس</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-xs bg-violet-500/10">باقة</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {e.activated_at ? new Date(e.activated_at).toLocaleDateString("ar-EG") : "—"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* أكواد التفعيل المستخدمة */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Ticket className="h-4 w-4" />
                                    أكواد التفعيل المستخدمة ({studentCodes.length})
                                </h4>
                                {studentCodes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">لا توجد أكواد مستخدمة أو لا تطابق الفلتر</p>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>الكود</TableHead>
                                                    <TableHead>اسم الكورس / الباقة</TableHead>
                                                    <TableHead>تاريخ الاستخدام</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {studentCodes.map((c) => (
                                                    <TableRow key={c.code}>
                                                        <TableCell className="font-mono text-xs">{c.code}</TableCell>
                                                        <TableCell className="font-medium text-sm">
                                                            {c.course?.title || c.bundle?.title || "—"}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {c.used_at ? new Date(c.used_at).toLocaleDateString("ar-EG") : "—"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Delete Alert Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حساب الطالب وجميع بياناته واشتراكاته ونتائجه نهائياً من النظام.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={loading}
                        >
                            {loading ? "جاري الحذف..." : "نعم، احذف الطالب"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
