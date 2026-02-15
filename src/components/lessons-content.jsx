"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    Trash2,
    Video,
    FileText,
    File,
    CheckCircle2,
    Upload,
    Loader2,
    X,
    Search,
    BookOpen,
    Clock,
    Award,
    Pencil,
    FolderOpen,
    Layers,
    GripVertical,
    ChevronDown,
    ChevronUp,
    Hash,
} from "lucide-react"
import {
    createLesson,
    updateLesson,
    deleteLesson,
    getChaptersForSelect,
    createChapter,
    deleteChapter,
    updateChapter,
} from "@/lib/actions"
import { uploadPDF, deleteFile } from "@/lib/upload"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LessonsContent({ initialLessons, courses, initialChapters = [] }) {
    const [lessons, setLessons] = useState(initialLessons)
    const [filteredLessons, setFilteredLessons] = useState(initialLessons)
    const [chapters, setChapters] = useState([])
    const [allChapters, setAllChapters] = useState(initialChapters)
    const [fetchingChapters, setFetchingChapters] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterCourse, setFilterCourse] = useState("all")
    const [activeTab, setActiveTab] = useState("chapters")
    const { toast } = useToast()
    const pdfInputRef = useRef(null)
    const [pdfFileName, setPdfFileName] = useState("")
    const [editingLesson, setEditingLesson] = useState(null)

    // Chapter management state
    const [chapterDialogOpen, setChapterDialogOpen] = useState(false)
    const [chapterCourseId, setChapterCourseId] = useState("")
    const [chapterTitle, setChapterTitle] = useState("")
    const [editingChapter, setEditingChapter] = useState(null)
    const [deleteChapterTarget, setDeleteChapterTarget] = useState(null)
    const [chapterSearchQuery, setChapterSearchQuery] = useState("")
    const [chapterFilterCourse, setChapterFilterCourse] = useState("all")
    const [expandedCourses, setExpandedCourses] = useState(new Set())

    // Lesson Form
    const [lessonData, setLessonData] = useState({
        title: "",
        type: "video",
        video_url: "",
        duration: 0,
        passing_score: 50,
        questions: [],
        courseId: "",
        chapter_id: "",
        pdf_url: ""
    })

    // Question State
    const [currentQuestion, setCurrentQuestion] = useState({
        question_text: "",
        options: ["", "", "", ""],
        correct_answer: ""
    })

    // Filter lessons
    useEffect(() => {
        let filtered = lessons
        if (searchQuery) {
            filtered = filtered.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
        }
        if (filterCourse && filterCourse !== "all") {
            filtered = filtered.filter(l => l.chapter?.course_id === filterCourse)
        }
        setFilteredLessons(filtered)
    }, [searchQuery, filterCourse, lessons])

    // Fetch chapters when course changes in lesson form
    useEffect(() => {
        if (lessonData.courseId) {
            setFetchingChapters(true)
            getChaptersForSelect(lessonData.courseId).then(data => {
                setChapters(data)
                setFetchingChapters(false)
            })
        } else {
            setChapters([])
        }
    }, [lessonData.courseId])

    // Group chapters by course
    const chaptersGroupedByCourse = (() => {
        let filtered = allChapters
        if (chapterSearchQuery) {
            filtered = filtered.filter(ch =>
                ch.title.toLowerCase().includes(chapterSearchQuery.toLowerCase()) ||
                ch.course?.title?.toLowerCase().includes(chapterSearchQuery.toLowerCase())
            )
        }
        if (chapterFilterCourse && chapterFilterCourse !== "all") {
            filtered = filtered.filter(ch => ch.course_id === chapterFilterCourse)
        }

        const groups = {}
        filtered.forEach(ch => {
            const courseId = ch.course_id
            if (!groups[courseId]) {
                groups[courseId] = {
                    courseId,
                    courseTitle: ch.course?.title || "كورس محذوف",
                    chapters: []
                }
            }
            groups[courseId].chapters.push(ch)
        })
        return Object.values(groups)
    })()

    const toggleCourseExpand = (courseId) => {
        setExpandedCourses(prev => {
            const next = new Set(prev)
            if (next.has(courseId)) next.delete(courseId)
            else next.add(courseId)
            return next
        })
    }

    // Auto expand all courses
    useEffect(() => {
        const ids = new Set(allChapters.map(ch => ch.course_id))
        setExpandedCourses(ids)
    }, [allChapters])

    const resetForm = () => {
        setLessonData({
            title: "",
            type: "video",
            video_url: "",
            duration: 0,
            passing_score: 50,
            questions: [],
            courseId: "",
            chapter_id: "",
            pdf_url: ""
        })
        setCurrentQuestion({
            question_text: "",
            options: ["", "", "", ""],
            correct_answer: ""
        })
        setPdfFileName("")
    }

    const handleAddQuestion = () => {
        if (!currentQuestion.question_text || !currentQuestion.correct_answer) {
            toast({ title: "تنبيه", description: "يرجى إكمال بيانات السؤال", variant: "destructive" })
            return
        }
        setLessonData(prev => ({
            ...prev,
            questions: [...prev.questions, { ...currentQuestion }]
        }))
        setCurrentQuestion({
            question_text: "",
            options: ["", "", "", ""],
            correct_answer: ""
        })
    }

    const handleRemoveQuestion = (idx) => {
        setLessonData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx)
        }))
    }

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setPdfFileName(file.name)
        setUploading(true)

        if (lessonData.pdf_url) {
            await deleteFile(lessonData.pdf_url)
        }

        const { url, error } = await uploadPDF(file, 'lessons')
        setUploading(false)

        if (error) {
            toast({ title: "خطأ في رفع الملف", description: error, variant: "destructive" })
            setPdfFileName("")
            return
        }

        setLessonData(prev => ({ ...prev, pdf_url: url }))
        toast({ title: "تم رفع الملف", description: "تم رفع ملف PDF بنجاح ✅", variant: "success" })
    }

    const handleSubmit = async () => {
        if (!lessonData.title || !lessonData.chapter_id) {
            toast({ title: "تنبيه", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
            return
        }
        if (lessonData.type === 'exam' && lessonData.questions.length === 0) {
            toast({ title: "تنبيه", description: "أضف سؤال واحد على الأقل", variant: "destructive" })
            return
        }
        if (lessonData.type === 'pdf' && !lessonData.pdf_url) {
            toast({ title: "تنبيه", description: "يجب رفع ملف PDF أولاً", variant: "destructive" })
            return
        }

        setLoading(true)

        let result
        if (editingLesson) {
            result = await updateLesson(editingLesson.id, lessonData, lessonData.courseId)
        } else {
            result = await createLesson(lessonData, lessonData.courseId)
        }

        if (result.success) {
            toast({ title: "تم", description: result.message, variant: "success" })
            setIsDialogOpen(false)
            window.location.reload()
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setLoading(false)
    }

    const openEditDialog = (lesson) => {
        let questions = []
        if (lesson.type === 'exam' && lesson.exam_questions) {
            questions = lesson.exam_questions.map(q => ({
                question_text: q.question,
                options: q.options || ["", "", "", ""],
                correct_answer: q.options?.[q.answer] || ""
            }))
        }

        setEditingLesson(lesson)
        setLessonData({
            title: lesson.title,
            type: lesson.type,
            video_url: lesson.type === 'pdf' ? "" : (lesson.video_url || ""),
            duration: lesson.duration_minutes || 0,
            passing_score: lesson.passing_score || 50,
            questions: questions,
            courseId: lesson.chapter?.course_id || "",
            chapter_id: lesson.chapter_id || "",
            pdf_url: lesson.type === 'pdf' ? (lesson.video_url || "") : ""
        })
        setPdfFileName(lesson.type === 'pdf' && lesson.video_url ? "ملف PDF مرفق" : "")
        setIsDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setLoading(true)
        const result = await deleteLesson(deleteTarget.id, deleteTarget.courseId)
        if (result.success) {
            setLessons(lessons.filter(l => l.id !== deleteTarget.id))
            toast({ title: "تم الحذف", description: result.message })
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setDeleteTarget(null)
        setLoading(false)
    }

    // ====== Chapter Handlers ======
    const handleCreateChapter = async () => {
        if (!chapterCourseId || !chapterTitle.trim()) {
            toast({ title: "تنبيه", description: "اختر الكورس وأدخل اسم الفصل", variant: "destructive" })
            return
        }
        setLoading(true)
        const result = await createChapter(chapterCourseId, chapterTitle.trim())
        if (result.success) {
            toast({ title: "تم", description: result.message, variant: "success" })
            setChapterDialogOpen(false)
            setChapterTitle("")
            setChapterCourseId("")
            window.location.reload()
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setLoading(false)
    }

    const handleUpdateChapter = async () => {
        if (!editingChapter || !chapterTitle.trim()) return
        setLoading(true)
        const result = await updateChapter(editingChapter.id, chapterTitle.trim(), editingChapter.sort_order, editingChapter.course_id)
        if (result.success) {
            toast({ title: "تم", description: result.message, variant: "success" })
            setChapterDialogOpen(false)
            setEditingChapter(null)
            setChapterTitle("")
            window.location.reload()
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setLoading(false)
    }

    const handleDeleteChapter = async () => {
        if (!deleteChapterTarget) return
        setLoading(true)
        const result = await deleteChapter(deleteChapterTarget.id, deleteChapterTarget.course_id)
        if (result.success) {
            setAllChapters(prev => prev.filter(ch => ch.id !== deleteChapterTarget.id))
            toast({ title: "تم الحذف", description: result.message })
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" })
        }
        setDeleteChapterTarget(null)
        setLoading(false)
    }

    const openEditChapter = (chapter) => {
        setEditingChapter(chapter)
        setChapterTitle(chapter.title)
        setChapterCourseId(chapter.course_id)
        setChapterDialogOpen(true)
    }

    const openNewChapter = () => {
        setEditingChapter(null)
        setChapterTitle("")
        setChapterCourseId("")
        setChapterDialogOpen(true)
    }

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video': return <Video className="h-5 w-5 text-blue-500" />
            case 'exam': return <FileText className="h-5 w-5 text-violet-500" />
            case 'pdf': return <File className="h-5 w-5 text-red-500" />
            default: return <File className="h-5 w-5" />
        }
    }

    const getLessonTypeLabel = (type) => {
        switch (type) {
            case 'video': return "فيديو"
            case 'exam': return "امتحان"
            case 'pdf': return "PDF"
            default: return "ملف"
        }
    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-cairo)]">

            {/* Page Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">الفصول والدروس</h2>
                <p className="text-muted-foreground text-sm mt-1">إدارة الفصول داخل الكورسات وجميع الدروس والامتحانات</p>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="chapters" className="gap-2">
                        <FolderOpen className="h-4 w-4" />
                        الفصول
                    </TabsTrigger>
                    <TabsTrigger value="lessons" className="gap-2">
                        <Video className="h-4 w-4" />
                        الدروس
                    </TabsTrigger>
                </TabsList>

                {/* ==================== CHAPTERS TAB ==================== */}
                <TabsContent value="chapters" className="mt-4 space-y-4">
                    {/* Chapters Header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-1 max-w-lg">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="بحث في الفصول..."
                                    value={chapterSearchQuery}
                                    onChange={(e) => setChapterSearchQuery(e.target.value)}
                                    className="pr-9"
                                />
                            </div>
                            <Select value={chapterFilterCourse} onValueChange={setChapterFilterCourse}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="كل الكورسات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الكورسات</SelectItem>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={openNewChapter} className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة فصل
                        </Button>
                    </div>

                    {/* Chapters List Grouped by Course */}
                    {chaptersGroupedByCourse.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl">
                            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                            <p className="text-muted-foreground text-lg">لا توجد فصول</p>
                            <p className="text-sm text-muted-foreground mt-1">اختر كورس وأضف فصول داخله</p>
                            <Button onClick={openNewChapter} className="mt-4 gap-2" variant="outline">
                                <Plus className="h-4 w-4" />
                                إضافة أول فصل
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {chaptersGroupedByCourse.map((group) => (
                                <Card key={group.courseId} className="overflow-hidden">
                                    {/* Course Header */}
                                    <button
                                        onClick={() => toggleCourseExpand(group.courseId)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors text-right"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center border border-violet-500/10">
                                                <BookOpen className="h-5 w-5 text-violet-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm">{group.courseTitle}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {group.chapters.length} فصل
                                                </p>
                                            </div>
                                        </div>
                                        {expandedCourses.has(group.courseId) ?
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" /> :
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        }
                                    </button>

                                    {/* Chapters List */}
                                    {expandedCourses.has(group.courseId) && (
                                        <div className="border-t">
                                            {group.chapters.map((chapter, idx) => (
                                                <div
                                                    key={chapter.id}
                                                    className="flex items-center justify-between px-5 py-3 hover:bg-accent/20 transition-colors group border-b last:border-b-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{chapter.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {chapter.lesson_count} درس
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-violet-500 hover:bg-violet-500/10"
                                                            onClick={() => openEditChapter(chapter)}
                                                            title="تعديل"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => setDeleteChapterTarget(chapter)}
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Quick Add inside course */}
                                            <button
                                                onClick={() => {
                                                    setEditingChapter(null)
                                                    setChapterTitle("")
                                                    setChapterCourseId(group.courseId)
                                                    setChapterDialogOpen(true)
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs text-muted-foreground hover:text-violet-500 hover:bg-accent/20 transition-colors"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                إضافة فصل لهذا الكورس
                                            </button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ==================== LESSONS TAB ==================== */}
                <TabsContent value="lessons" className="mt-4 space-y-4">
                    {/* Lessons Header */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="بحث في الدروس..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-9"
                                />
                            </div>
                            <Select value={filterCourse} onValueChange={setFilterCourse}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="كل الكورسات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الكورسات</SelectItem>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => { resetForm(); setEditingLesson(null); setIsDialogOpen(true); }} className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة درس
                        </Button>
                    </div>

                    {/* Lessons Grid */}
                    {filteredLessons.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl">
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                            <p className="text-muted-foreground text-lg">لا توجد دروس.</p>
                            <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة درس جديد.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredLessons.map((lesson) => (
                                <Card key={lesson.id} className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${lesson.type === 'video' ? 'bg-blue-500'
                                        : lesson.type === 'exam' ? 'bg-violet-500'
                                            : 'bg-red-500'
                                        }`} />
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getLessonIcon(lesson.type)}
                                                <Badge variant="outline" className="text-[10px]">
                                                    {getLessonTypeLabel(lesson.type)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => openEditDialog(lesson)}
                                                    title="تعديل"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setDeleteTarget({ id: lesson.id, courseId: lesson.chapter?.course_id })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-base mt-2">{lesson.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            {lesson.chapter?.course?.title && (
                                                <span className="truncate max-w-[160px]">{lesson.chapter.course.title}</span>
                                            )}
                                            {lesson.duration_minutes > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {lesson.duration_minutes} د
                                                </span>
                                            )}
                                        </div>
                                        {lesson.is_free_preview && (
                                            <Badge variant="secondary" className="mt-2 text-xs">مجاني</Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* ==================== CHAPTER DIALOG ==================== */}
            <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingChapter ? "تعديل الفصل" : "إضافة فصل جديد"}</DialogTitle>
                        <DialogDescription>
                            {editingChapter ? "عدّل اسم الفصل" : "اختر الكورس وأدخل عنوان الفصل الجديد"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {!editingChapter && (
                            <div className="space-y-2">
                                <Label>الكورس</Label>
                                <Select value={chapterCourseId} onValueChange={setChapterCourseId}>
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
                        <div className="space-y-2">
                            <Label>عنوان الفصل</Label>
                            <Input
                                value={chapterTitle}
                                onChange={(e) => setChapterTitle(e.target.value)}
                                placeholder="مثال: الفصل الأول - المقدمة"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={editingChapter ? handleUpdateChapter : handleCreateChapter}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    جاري الحفظ...
                                </span>
                            ) : (editingChapter ? "تحديث الفصل" : "إضافة الفصل")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== DELETE CHAPTER ALERT ==================== */}
            <AlertDialog open={!!deleteChapterTarget} onOpenChange={() => setDeleteChapterTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف الفصل؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف الفصل &quot;{deleteChapterTarget?.title}&quot; وجميع الدروس بداخله نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChapter} className="bg-destructive hover:bg-destructive/90">
                            حذف الفصل
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ==================== LESSON CREATE/EDIT DIALOG ==================== */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingLesson ? "تعديل الدرس" : "إضافة درس جديد"}</DialogTitle>
                        <DialogDescription>{editingLesson ? "عدّل بيانات الدرس الحالي" : "أضف درس جديد مع تحديد الكورس والفصل"}</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                            <TabsTrigger value="content">المحتوى</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>عنوان الدرس</Label>
                                <Input
                                    value={lessonData.title}
                                    onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="عنوان الدرس"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>الكورس</Label>
                                    <Select
                                        value={lessonData.courseId}
                                        onValueChange={(val) => setLessonData(prev => ({ ...prev, courseId: val, chapter_id: "" }))}
                                    >
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
                                <div className="space-y-2">
                                    <Label>الفصل</Label>
                                    <Select
                                        value={lessonData.chapter_id}
                                        onValueChange={(val) => setLessonData(prev => ({ ...prev, chapter_id: val }))}
                                        disabled={!lessonData.courseId || fetchingChapters}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={fetchingChapters ? "جاري التحميل..." : "اختر الفصل..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {chapters.map(ch => (
                                                <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>نوع المحتوى</Label>
                                <Select
                                    value={lessonData.type}
                                    onValueChange={(val) => setLessonData(prev => ({ ...prev, type: val, pdf_url: "", video_url: "" }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">
                                            <div className="flex items-center gap-2"><Video className="h-4 w-4 text-blue-500" /> فيديو</div>
                                        </SelectItem>
                                        <SelectItem value="exam">
                                            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-violet-500" /> امتحان</div>
                                        </SelectItem>
                                        <SelectItem value="pdf">
                                            <div className="flex items-center gap-2"><File className="h-4 w-4 text-red-500" /> ملف PDF</div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-4 mt-4">
                            {/* Video */}
                            {lessonData.type === 'video' && (
                                <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                                    <div className="space-y-2">
                                        <Label>رابط الفيديو</Label>
                                        <Input
                                            value={lessonData.video_url}
                                            onChange={(e) => setLessonData(prev => ({ ...prev, video_url: e.target.value }))}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>المدة (بالدقائق)</Label>
                                        <Input
                                            type="number"
                                            value={lessonData.duration}
                                            onChange={(e) => setLessonData(prev => ({ ...prev, duration: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Exam */}
                            {lessonData.type === 'exam' && (
                                <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2 flex-1">
                                            <Label>مدة الامتحان (دقائق)</Label>
                                            <Input
                                                type="number"
                                                value={lessonData.duration}
                                                onChange={(e) => setLessonData(prev => ({ ...prev, duration: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Label>درجة النجاح (%)</Label>
                                            <Input
                                                type="number"
                                                value={lessonData.passing_score}
                                                onChange={(e) => setLessonData(prev => ({ ...prev, passing_score: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Questions List */}
                                    {lessonData.questions.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-muted-foreground">الأسئلة ({lessonData.questions.length}):</h4>
                                            {lessonData.questions.map((q, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                                                    <span className="flex items-center gap-2 truncate">
                                                        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                                                        <span className="truncate">{q.question_text}</span>
                                                    </span>
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => handleRemoveQuestion(idx)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Question */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold mb-3 flex items-center justify-between">
                                            إضافة سؤال
                                            <Badge variant="outline">{lessonData.questions.length} أسئلة</Badge>
                                        </h4>
                                        <div className="space-y-3 p-3 bg-background rounded border">
                                            <Input
                                                placeholder="نص السؤال..."
                                                value={currentQuestion.question_text}
                                                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                {currentQuestion.options.map((opt, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-muted-foreground">{idx + 1}</span>
                                                        <Input
                                                            placeholder={`الخيار ${idx + 1}`}
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...currentQuestion.options]
                                                                newOpts[idx] = e.target.value
                                                                setCurrentQuestion(prev => ({ ...prev, options: newOpts }))
                                                            }}
                                                            className={currentQuestion.correct_answer === opt && opt !== "" ? "border-emerald-500 ring-1 ring-emerald-500" : ""}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            type="button"
                                                            onClick={() => setCurrentQuestion(prev => ({ ...prev, correct_answer: opt }))}
                                                            className={currentQuestion.correct_answer === opt && opt !== "" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-muted-foreground"}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleAddQuestion}
                                                variant="secondary"
                                                className="w-full"
                                                disabled={!currentQuestion.question_text || !currentQuestion.correct_answer}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> إدراج السؤال
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PDF Upload */}
                            {lessonData.type === 'pdf' && (
                                <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                                    <div className="border-2 border-dashed rounded-xl p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
                                        {lessonData.pdf_url ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="h-14 w-14 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                    <File className="h-7 w-7 text-red-500" />
                                                </div>
                                                <p className="text-sm font-medium">{pdfFileName || "ملف PDF"}</p>
                                                <p className="text-xs text-emerald-600">✅ تم الرفع بنجاح</p>
                                                <div className="flex gap-2">
                                                    <Button type="button" variant="outline" size="sm" onClick={() => pdfInputRef.current?.click()} className="gap-1">
                                                        <Upload className="h-4 w-4" /> تغيير
                                                    </Button>
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => { setLessonData(prev => ({ ...prev, pdf_url: "" })); setPdfFileName(""); }} className="gap-1">
                                                        <X className="h-4 w-4" /> حذف
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => pdfInputRef.current?.click()}
                                                className="w-full py-4 flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                        <span className="text-sm font-medium">جاري رفع الملف...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-10 w-10" />
                                                        <span className="text-sm font-medium">اضغط لاختيار ملف PDF</span>
                                                        <span className="text-xs">الحد الأقصى 50MB</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <input
                                            ref={pdfInputRef}
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={handlePdfUpload}
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={loading || uploading} className="w-full">
                            {loading ? "جاري الحفظ..." : (editingLesson ? "تحديث الدرس" : "حفظ الدرس")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== DELETE LESSON ALERT ==================== */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف الدرس؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف هذا الدرس نهائياً ولن يمكن استرجاعه.
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
