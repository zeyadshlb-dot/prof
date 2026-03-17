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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Pencil,
    Trash2,
    Plus,
    Package as PackageIcon,
    Layers,
    BookOpen,
    ImagePlus,
    Loader2,
    X
} from "lucide-react"
import { createBundle, updateBundle, deleteBundle } from "@/lib/actions"
import { uploadImage, deleteFile } from "@/lib/upload"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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

export function BundlesContent({ initialBundles, courses }) {
    const [bundles, setBundles] = useState(initialBundles)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const { toast } = useToast()
    const fileInputRef = useRef(null)

    // Form State
    const [editingBundle, setEditingBundle] = useState(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        is_published: false,
        courseIds: [],
        thumbnail_url: ""
    })
    const [thumbnailPreview, setThumbnailPreview] = useState(null)

    const resetForm = () => {
        setEditingBundle(null)
        setFormData({ title: "", description: "", price: 0, is_published: false, courseIds: [], thumbnail_url: "" })
        setThumbnailPreview(null)
    }

    const openCreateDialog = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const handleEditClick = async (bundle) => {
        setLoading(true)
        try {
            const { getBundle } = await import("@/lib/actions")
            const data = await getBundle(bundle.id)
            if (data) {
                setEditingBundle(data)
                setFormData({
                    title: data.title,
                    description: data.description || "",
                    price: data.price,
                    is_published: data.is_published,
                    courseIds: data.courseIds || [],
                    thumbnail_url: data.thumbnail_url || ""
                })
                setThumbnailPreview(data.thumbnail_url || null)
                setIsDialogOpen(true)
            }
        } catch (e) {
            toast({ title: "خطأ", description: "فشل تحميل بيانات الباقة" })
        }
        setLoading(false)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (ev) => setThumbnailPreview(ev.target.result)
        reader.readAsDataURL(file)

        setUploading(true)

        // Delete old thumbnail if exists
        if (formData.thumbnail_url) {
            await deleteFile(formData.thumbnail_url)
        }

        const { url, error } = await uploadImage(file, 'bundles')
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
        if (formData.thumbnail_url) {
            await deleteFile(formData.thumbnail_url)
        }
        setFormData(prev => ({ ...prev, thumbnail_url: "" }))
        setThumbnailPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleCourseToggle = (courseId) => {
        setFormData(prev => {
            const ids = prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
            return { ...prev, courseIds: ids }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const dataToSend = { ...formData }
        if (!dataToSend.thumbnail_url) {
            dataToSend.thumbnail_url = null
        }

        let result
        if (editingBundle) {
            result = await updateBundle({ id: editingBundle.id, ...dataToSend })
        } else {
            result = await createBundle(dataToSend)
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
        const result = await deleteBundle(deleteId)
        if (result.success) {
            setBundles(bundles.filter(b => b.id !== deleteId))
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
                    إنشاء باقة جديدة
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PackageIcon className="h-5 w-5 text-violet-500" />
                        الباقات والعروض
                    </CardTitle>
                    <CardDescription>
                        تجميعات الكورسات بأسعار خاصة.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الصورة</TableHead>
                                <TableHead>اسم الباقة</TableHead>
                                <TableHead>السعر</TableHead>
                                <TableHead>عدد الكورسات</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-right">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bundles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        لا توجد باقات حالياً.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bundles.map((bundle) => (
                                    <TableRow key={bundle.id}>
                                        <TableCell>
                                            {bundle.thumbnail_url ? (
                                                <img
                                                    src={bundle.thumbnail_url}
                                                    alt={bundle.title}
                                                    className="h-12 w-16 rounded-md object-cover border shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-12 w-16 rounded-md bg-muted flex items-center justify-center border">
                                                    <PackageIcon className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {bundle.title}
                                            {bundle.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{bundle.description}</p>}
                                        </TableCell>
                                        <TableCell>
                                            {bundle.price > 0 ? `${bundle.price} ج.م` : <span className="text-emerald-600 font-bold">مجاني</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1">
                                                <Layers className="h-3 w-3" />
                                                {bundle.itemsCount || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={bundle.is_published ? "default" : "secondary"}>
                                                {bundle.is_published ? "منشور" : "مسودة"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(bundle)}>
                                                    <Pencil className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(bundle.id)}>
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
                        <DialogTitle>{editingBundle ? "تعديل الباقة" : "إنشاء باقة جديدة"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">

                        {/* Thumbnail Upload */}
                        <div className="space-y-2">
                            <Label>صورة الباقة (الغلاف)</Label>
                            <div className="border-2 border-dashed rounded-xl p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/20">
                                {thumbnailPreview ? (
                                    <div className="relative group">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Bundle thumbnail"
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
                                                <span className="text-sm">اضغط لرفع صورة الباقة</span>
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
                            <Label htmlFor="title">اسم الباقة</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">وصف الباقة</Label>
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
                            <Label htmlFor="is_published">نشر الباقة للطلاب</Label>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label>محتوى الباقة (اختر الكورسات)</Label>
                            <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                                {courses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center">لا توجد كورسات متاحة للإضافة.</p>
                                ) : (
                                    courses.map(course => (
                                        <div key={course.id} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={`course-${course.id}`}
                                                checked={formData.courseIds.includes(course.id)}
                                                onCheckedChange={() => handleCourseToggle(course.id)}
                                            />
                                            <label
                                                htmlFor={`course-${course.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                            >
                                                {course.title}
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                تم اختيار {formData.courseIds.length} كورس
                            </p>
                        </div>

                        <DialogFooter className="sticky bottom-0 bg-background pt-2">
                            <Button type="submit" disabled={loading || uploading} className="w-full">
                                {loading ? "جاري الحفظ..." : (editingBundle ? "تحديث الباقة" : "إنشاء الباقة")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف الباقة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف الباقة وإزالتها من اشتراكات الطلاب (لن تظهر لهم بعد الآن)، لكن الكورسات نفسها لن تُحذف.
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
