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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Copy,
    Trash2,
    Ticket,
    BookOpen,
    Package as PackageIcon,
    Wallet,
    CheckCircle2,
    Printer,
    RefreshCw,
    Search
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { generateCodes, deleteCode } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Pagination } from "@/components/ui/pagination"

export function ActivationCodesContent({ initialCodes, courses, bundles }) {
    const [codes, setCodes] = useState(initialCodes)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [filterQuery, setFilterQuery] = useState("")
    const { toast } = useToast()
    const ITEMS_PER_PAGE = 20

    // فلترة بالكود أو اسم الكورس/الباقة أو اسم الطالب
    const filteredCodes = filterQuery.trim()
        ? codes.filter((code) => {
            const q = filterQuery.toLowerCase()
            const title = (code.course?.title || code.bundle?.title || "").toLowerCase()
            const codeStr = (code.code || "").toLowerCase()
            const studentName = (code.student?.full_name || "").toLowerCase()
            return title.includes(q) || codeStr.includes(q) || studentName.includes(q)
        })
        : codes

    const totalPages = Math.ceil(filteredCodes.length / ITEMS_PER_PAGE)
    const paginatedCodes = filteredCodes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Form Stats
    const [type, setType] = useState("course")
    const [targetId, setTargetId] = useState("")
    const [amount, setAmount] = useState(1)
    const [balanceAmount, setBalanceAmount] = useState(0)

    const handleGenerate = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Validation
        if (type === 'course' && !targetId) {
            toast({ title: "خطأ", description: "يجب اختيار الكورس", variant: "destructive" })
            setLoading(false)
            return
        }
        if (type === 'bundle' && !targetId) {
            toast({ title: "خطأ", description: "يجب اختيار الباقة", variant: "destructive" })
            setLoading(false)
            return
        }

        const result = await generateCodes({
            type,
            targetId,
            amount: parseInt(amount),
            balanceAmount: parseFloat(balanceAmount)
        })

        if (result.success) {
            toast({ title: "تم بنجاح", description: result.message, variant: "success" })
            setOpen(false)
            // Reload page or update state (here we rely on server revalidation but we can optimistic update)
            window.location.reload() // Simple reload to get fresh data
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setLoading(false)
    }

    const handleDelete = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return

        const result = await deleteCode(id)
        if (result.success) {
            setCodes(codes.filter(c => c.code !== id))
            toast({ title: "تم الحذف", description: result.message })
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
    }

    const copyCode = (code) => {
        navigator.clipboard.writeText(code)
        toast({ title: "تم النسخ", description: "تم نسخ الكود للحافظة" })
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">

            {/* Action Bar + Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">أكواد التفعيل</h2>
                    <Badge variant="secondary">{filteredCodes.length}</Badge>
                </div>
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="فلتر بالكود أو اسم الكورس أو الطالب..."
                        className="bg-background pr-9"
                        value={filterQuery}
                        onChange={(e) => {
                            setFilterQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            إنشاء أكواد جديدة
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>إنشاء أكواد تفعيل</DialogTitle>
                            <DialogDescription>
                                قم بتوليد مجموعة من الأكواد لكورس، باقة، أو شحن رصيد.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>النوع</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر النوع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="course">كورس محدد</SelectItem>
                                        <SelectItem value="bundle">باقة مجمعة</SelectItem>
                                        {/* <SelectItem value="balance">رصيد محفظة</SelectItem> */}
                                    </SelectContent>
                                </Select>
                            </div>

                            {type === 'course' && (
                                <div className="grid gap-2">
                                    <Label>اختر الكورس</Label>
                                    <Select value={targetId} onValueChange={setTargetId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الكورس..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {type === 'bundle' && (
                                <div className="grid gap-2">
                                    <Label>اختر الباقة</Label>
                                    <Select value={targetId} onValueChange={setTargetId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الباقة..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bundles.map(b => (
                                                <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {type === 'balance' && (
                                <div className="grid gap-2">
                                    <Label>المبلغ (ج.م)</Label>
                                    <Input
                                        type="number"
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>عدد الأكواد</Label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="1"
                                    max="100"
                                />
                                <p className="text-[10px] text-muted-foreground">أقصى عدد 100 كود في المرة الواحدة</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleGenerate} disabled={loading} className="w-full">
                                {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                إنشاء الأكواد
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Codes Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">الكود</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead>المحتوى</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>تم الاستخدام بواسطة</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCodes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {codes.length === 0
                                        ? "لا توجد أكواد تفعيل حالياً. قم بإنشاء بعض الأكواد."
                                        : "لا توجد نتائج تطابق الفلتر."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedCodes.map((code) => (
                                <TableRow key={code.code}>
                                    <TableCell className="font-mono font-medium tracking-wide">
                                        {code.code}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {code.type === 'course' && <BookOpen className="h-4 w-4 text-blue-500" />}
                                            {code.type === 'bundle' && <PackageIcon className="h-4 w-4 text-violet-500" />}
                                            {code.type === 'balance' && <Wallet className="h-4 w-4 text-emerald-500" />}
                                            <span className="capitalize text-sm">
                                                {code.type === 'course' ? 'كورس' : code.type === 'bundle' ? 'باقة' : 'رصيد'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {code.course?.title || code.bundle?.title || (code.balance_amount ? `${code.balance_amount} ج.م` : "-")}
                                    </TableCell>
                                    <TableCell>
                                        {code.is_used ? (
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground">مستخدم</Badge>
                                        ) : (
                                            <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">متاح</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {code.student ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{code.student.full_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {code.used_at ? new Date(code.used_at).toLocaleDateString('ar-EG') : ''}
                                                </span>
                                            </div>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => copyCode(code.code)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(code.code)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
