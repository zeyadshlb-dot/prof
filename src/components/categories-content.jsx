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
import { Label } from "@/components/ui/label"
import {
    Pencil,
    Trash2,
    Plus,
    Layers,
    ArrowUp,
    ArrowDown
} from "lucide-react"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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

export function CategoriesContent({ initialCategories }) {
    const [categories, setCategories] = useState(initialCategories)
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const { toast } = useToast()

    // Form State
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({ name: "", sort_order: 0 })

    const resetForm = () => {
        setEditingCategory(null)
        setFormData({ name: "", sort_order: categories.length + 1 })
    }

    const openCreateDialog = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const openEditDialog = (category) => {
        setEditingCategory(category)
        setFormData({ name: category.name, sort_order: category.sort_order })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        let result
        if (editingCategory) {
            result = await updateCategory(editingCategory.id, formData.name, parseInt(formData.sort_order))
        } else {
            result = await createCategory(formData.name, parseInt(formData.sort_order))
        }

        if (result.success) {
            toast({ title: "تم بنجاح", description: result.message, variant: "success" })
            setIsDialogOpen(false)
            // Reload page to get fresh data (or optimistic update)
            window.location.reload()
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setLoading(true)

        const result = await deleteCategory(deleteId)

        if (result.success) {
            setCategories(categories.filter(c => c.id !== deleteId))
            toast({ title: "تم الحذف", description: result.message })
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }

        setDeleteId(null)
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">

            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div>
                    {/* Empty for spacing if needed, or search */}
                </div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة تصنيف جديد
                </Button>
            </div>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        التصنيفات الدراسية
                    </CardTitle>
                    <CardDescription>
                        إدارة المراحل الدراسية أو تخصصات الكورسات.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">الترتيب</TableHead>
                                <TableHead>اسم التصنيف</TableHead>
                                <TableHead className="text-right">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        لا توجد تصنيفات حالياً.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold">
                                                {category.sort_order}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-base">
                                            {category.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                                                    <Pencil className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(category.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "تعديل اسم أو ترتيب التصنيف الحالي." : "أضف مرحلة دراسية أو فئة جديدة للكورسات."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    الاسم
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="مثال: الصف الثالث الثانوي"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sort_order" className="text-right">
                                    الترتيب
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            لا يمكن حذف التصنيف إذا كان مرتبطاً بكورسات حالية. يرجى حذف الكورسات أو نقلها أولاً.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={loading}
                        >
                            {loading ? "جاري الحذف..." : "حذف التصنيف"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
