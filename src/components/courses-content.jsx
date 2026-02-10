"use client"

import { useState, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Pencil,
    Trash2,
    Plus,
    BookOpen,
    ImagePlus,
    Loader2,
    X,
    Eye,
    EyeOff
} from "lucide-react"
import { createCourse, updateCourse, deleteCourse } from "@/lib/actions"
import { uploadImage, deleteFile } from "@/lib/upload"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export function CoursesContent({ initialCourses, categories }) {
    const [courses, setCourses] = useState(initialCourses)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const { toast } = useToast()
    const router = useRouter()
    const fileInputRef = useRef(null)

    // Form State
    const [editingCourse, setEditingCourse] = useState(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        category_id: null,
        is_published: false,
        thumbnail_url: ""
    })
    const [thumbnailPreview, setThumbnailPreview] = useState(null)

    const resetForm = () => {
        setEditingCourse(null)
        setFormData({ title: "", description: "", price: 0, category_id: null, is_published: false, thumbnail_url: "" })
        setThumbnailPreview(null)
    }

    const openCreateDialog = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const openEditDialog = (course) => {
        setEditingCourse(course)
        setFormData({
            title: course.title,
            description: course.description || "",
            price: course.price,
            category_id: course.category_id,
            is_published: course.is_published,
            thumbnail_url: course.thumbnail_url || ""
        })
        setThumbnailPreview(course.thumbnail_url || null)
        setIsDialogOpen(true)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (ev) => setThumbnailPreview(ev.target.result)
        reader.readAsDataURL(file)

        setUploading(true)

        // Delete old thumbnail if exists
        if (formData.thumbnail_url) {
            await deleteFile(formData.thumbnail_url)
        }

        const { url, error } = await uploadImage(file, 'courses')
        setUploading(false)

        if (error) {
            toast({ title: "خطأ في رفع الصورة", description: error, variant: "destructive" })
            setThumbnailPreview(formData.thumbnail_url || null)
            return
        }

        setFormData(prev => ({ ...prev, thumbnail_url: url }))
        toast({ title: "تم رفع الصورة", description: "تم ضغط ورفع الصورة بنجاح ✅", variant: "success" })
    }

    const removeThumbnail = async () => {
        // Delete from storage
        if (formData.thumbnail_url) {
            await deleteFile(formData.thumbnail_url)
        }
        setFormData(prev => ({ ...prev, thumbnail_url: "" }))
        setThumbnailPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const dataToSend = { ...formData }
        if (!dataToSend.thumbnail_url) {
            dataToSend.thumbnail_url = null
        }

        let result
        if (editingCourse) {
            result = await updateCourse(editingCourse.id, dataToSend)
        } else {
            result = await createCourse(dataToSend)
        }

        if (result.success) {
            toast({ title: "تم بنجاح", description: result.message, variant: "success" })
            setIsDialogOpen(false)
            window.location.reload()
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setLoading(true)
        const result = await deleteCourse(deleteId)
        if (result.success) {
            setCourses(courses.filter(c => c.id !== deleteId))
            toast({ title: "تم الحذف", description: result.message })
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setDeleteId(null)
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">

            <div className="flex items-center justify-between">
                <div></div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة كورس جديد
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        الكورسات التعليمية
                    </CardTitle>
                    <CardDescription>
                        إدارة المحتوى التعليمي. اضغط على الكورس لإدارة الفصول والدروس.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الصورة</TableHead>
                                <TableHead>اسم الكورس</TableHead>
                                <TableHead>التصنيف</TableHead>
                                <TableHead>السعر</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-right">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        لا توجد كورسات حالياً.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => (
                                    <TableRow
                                        key={course.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                                    >
                                        <TableCell>
                                            {course.thumbnail_url ? (
                                                <img
                                                    src={course.thumbnail_url}
                                                    alt={course.title}
                                                    className="h-12 w-16 rounded-md object-cover border shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-12 w-16 rounded-md bg-muted flex items-center justify-center border">
                                                    <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {course.title}
                                            {course.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{course.description}</p>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{course.category?.name || "بدون تصنيف"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {course.price > 0 ? `${course.price} ج.م` : <span className="text-emerald-600 font-bold">مجاني</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={course.is_published ? "default" : "secondary"}>
                                                {course.is_published ? "منشور" : "مسودة"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(course)}>
                                                    <Pencil className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(course.id)}>
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
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? "تعديل الكورس" : "إضافة كورس جديد"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">

                        {/* Thumbnail Upload */}
                        <div className="space-y-2">
                            <Label>صورة الكورس (الغلاف)</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/20">
                                {thumbnailPreview ? (
                                    <div className="relative group">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Course thumbnail"
                                            className="mx-auto h-36 rounded-lg object-cover shadow-md"
                                        />
                                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="gap-1"
                                            >
                                                <ImagePlus className="h-4 w-4" /> تغيير
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={removeThumbnail}
                                                className="gap-1"
                                            >
                                                <X className="h-4 w-4" /> حذف
                                            </Button>
                                        </div>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                <span className="mr-2 text-sm font-medium">جاري الضغط والرفع...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-sm">جاري الضغط والرفع...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ImagePlus className="h-8 w-8" />
                                                <span className="text-sm">اضغط لرفع صورة الكورس</span>
                                                <span className="text-xs text-muted-foreground">سيتم ضغط الصورة تلقائياً لأصغر حجم</span>
                                            </>
                                        )}
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">اسم الكورس</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">التصنيف</Label>
                            <Select
                                value={formData.category_id?.toString() || ""}
                                onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر التصنيف..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">وصف الكورس</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">السعر (ج.م)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_published"
                                checked={formData.is_published}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                            />
                            <Label htmlFor="is_published">نشر الكورس</Label>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={loading || uploading} className="w-full">
                                {loading ? "جاري الحفظ..." : (editingCourse ? "تحديث الكورس" : "إنشاء الكورس")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف الكورس؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف الكورس وجميع الفصول والدروس والمحتوى بداخله، ولن يتمكن الطلاب المشتركين من الوصول إليه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
