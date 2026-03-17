"use client";

import { useState, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Link as LinkIcon,
  Clock,
  Award,
  Pencil,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save,
} from "lucide-react";
import {
  createChapter,
  deleteChapter,
  updateChapter,
  reorderChapters,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/actions";
import { uploadPDF, deleteFile } from "@/lib/upload";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CourseDetailsContent({ course, initialChapters }) {
  const [chapters, setChapters] = useState(initialChapters);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const pdfInputRef = useRef(null);

  // Chapter Dialog State
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterTitle, setChapterTitle] = useState("");

  // Lesson Dialog State
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonData, setLessonData] = useState({
    title: "",
    type: "video",
    video_url: "",
    duration: 0,
    passing_score: 50,
    allowed_attempts: 0,
    questions: [],
    pdf_url: "",
    is_free_preview: false,
  });

  // Question State (Inside Lesson Dialog)
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: "",
  });

  const [pdfFileName, setPdfFileName] = useState("");

  // --- Chapter Handlers ---

  const openCreateChapterDialog = () => {
    setEditingChapter(null);
    setChapterTitle("");
    setIsChapterDialogOpen(true);
  };

  const openEditChapterDialog = (chapter) => {
    setEditingChapter(chapter);
    setChapterTitle(chapter.title);
    setIsChapterDialogOpen(true);
  };

  const handleSaveChapter = async () => {
    if (!chapterTitle.trim()) return;
    setLoading(true);

    let result;
    if (editingChapter) {
      result = await updateChapter(
        editingChapter.id,
        chapterTitle,
        undefined,
        course.id,
      );
    } else {
      result = await createChapter(course.id, chapterTitle);
    }

    if (result.success) {
      toast({ title: "تم", description: result.message, variant: "success" });
      setIsChapterDialogOpen(false);
      setChapterTitle("");
      window.location.reload();
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm("هل أنت متأكد من حذف الفصل وجميع دروسه؟")) return;
    setLoading(true);
    const result = await deleteChapter(chapterId, course.id);
    if (result.success) {
      toast({ title: "تم الحذف", description: result.message });
      window.location.reload();
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleMoveChapter = async (index, direction) => {
    const newChapters = [...chapters];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newChapters.length) return;

    // Swap
    const temp = newChapters[index];
    newChapters[index] = newChapters[targetIndex];
    newChapters[targetIndex] = temp;

    setChapters(newChapters);

    // Save to DB
    const result = await reorderChapters(
      newChapters.map((c) => ({ id: c.id })),
      course.id,
    );
    if (result.success) {
      toast({ title: "تم", description: "تم تحديث ترتيب الفصول" });
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
      setChapters(chapters); // Revert
    }
  };

  // --- Lesson Handlers ---

  const openAddLessonDialog = (chapterId) => {
    setSelectedChapterId(chapterId);
    setEditingLesson(null);
    setLessonData({
      title: "",
      type: "video",
      video_url: "",
      duration: 0,
      passing_score: 50,
      allowed_attempts: 0,
      questions: [],
      pdf_url: "",
      is_free_preview: false,
    });
    setPdfFileName("");
    setIsLessonDialogOpen(true);
  };

  const openEditLessonDialog = (lesson, chapterId) => {
    setSelectedChapterId(chapterId);
    setEditingLesson(lesson);

    // Parse exam_questions back to component format
    let questions = [];
    if (lesson.type === "exam" && lesson.exam_questions) {
      questions = lesson.exam_questions.map((q) => ({
        question_text: q.question,
        options: q.options || ["", "", "", ""],
        correct_answer: q.options?.[q.answer] || "",
      }));
    }

    setLessonData({
      title: lesson.title,
      type: lesson.type,
      video_url: lesson.type === "pdf" ? "" : lesson.video_url || "",
      duration: lesson.duration_minutes || 0,
      passing_score: lesson.passing_score || 50,
      allowed_attempts: lesson.allowed_attempts || 0,
      questions: questions,
      pdf_url: lesson.type === "pdf" ? lesson.video_url || "" : "",
      is_free_preview: lesson.is_free_preview || false,
    });
    setPdfFileName(
      lesson.type === "pdf" && lesson.video_url ? "ملف PDF مرفق" : "",
    );
    setIsLessonDialogOpen(true);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question_text || !currentQuestion.correct_answer) {
      toast({
        title: "تنبيه",
        description: "يرجى إكمال بيانات السؤال واختيار الإجابة الصحيحة",
        variant: "destructive",
      });
      return;
    }
    setLessonData({
      ...lessonData,
      questions: [...lessonData.questions, { ...currentQuestion }],
    });
    setCurrentQuestion({
      question_text: "",
      options: ["", "", "", ""],
      correct_answer: "",
    });
    toast({
      title: "تم إضافة السؤال",
      description: `إجمالي الأسئلة: ${lessonData.questions.length + 1}`,
    });
  };

  const handleRemoveQuestion = (idx) => {
    setLessonData({
      ...lessonData,
      questions: lessonData.questions.filter((_, i) => i !== idx),
    });
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setUploading(true);

    // Delete old PDF if exists
    if (lessonData.pdf_url) {
      await deleteFile(lessonData.pdf_url);
    }

    const { url, error } = await uploadPDF(file, "lessons");
    setUploading(false);

    if (error) {
      toast({
        title: "خطأ في رفع الملف",
        description: error,
        variant: "destructive",
      });
      setPdfFileName("");
      return;
    }

    setLessonData((prev) => ({ ...prev, pdf_url: url }));
    toast({
      title: "تم رفع الملف",
      description: "تم رفع ملف PDF بنجاح ✅",
      variant: "success",
    });
  };

  const handleSaveLesson = async () => {
    if (!lessonData.title) return;
    if (lessonData.type === "exam" && lessonData.questions.length === 0) {
      toast({
        title: "تنبيه",
        description: "يجب إضافة سؤال واحد على الأقل للامتحان",
        variant: "destructive",
      });
      return;
    }
    if (lessonData.type === "pdf" && !lessonData.pdf_url) {
      toast({
        title: "تنبيه",
        description: "يجب رفع ملف PDF أولاً",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    let result;

    if (editingLesson) {
      result = await updateLesson(
        editingLesson.id,
        { ...lessonData, chapter_id: selectedChapterId },
        course.id,
      );
    } else {
      result = await createLesson(
        { ...lessonData, chapter_id: selectedChapterId },
        course.id,
      );
    }

    if (result.success) {
      toast({ title: "تم", description: result.message, variant: "success" });
      setIsLessonDialogOpen(false);
      window.location.reload();
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("حذف الدرس؟")) return;
    const result = await deleteLesson(lessonId, course.id);
    if (result.success) {
      toast({ title: "تم الحذف", description: result.message });
      window.location.reload();
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "exam":
        return <FileText className="h-4 w-4 text-violet-500" />;
      case "pdf":
        return <File className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLessonTypeBadge = (type) => {
    switch (type) {
      case "video":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/20"
          >
            فيديو
          </Badge>
        );
      case "exam":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border-violet-500/20"
          >
            امتحان
          </Badge>
        );
      case "pdf":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-500/20"
          >
            PDF
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            ملف
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">
      {/* Header / Course Info */}
      <div className="flex items-center justify-between bg-card p-6 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
          <p className="text-muted-foreground">
            {course.description || "لا يوجد وصف"}
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant={course.is_published ? "default" : "secondary"}>
              {course.is_published ? "منشور" : "مسودة"}
            </Badge>
            <Badge variant="outline">{chapters.length} فصول</Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {chapters.reduce(
                (sum, ch) => sum + (ch.lessons?.length || 0),
                0,
              )}{" "}
              درس
            </Badge>
          </div>
        </div>
        <Button onClick={openCreateChapterDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة فصل جديد
        </Button>
      </div>

      {/* Chapters & Lessons */}
      <div className="space-y-4">
        {chapters.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              لا يوجد محتوى بعد. ابدأ بإضافة فصل.
            </p>
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={chapters.map((c) => c.id)}
            className="space-y-4"
          >
            {chapters.map((chapter, chIdx) => (
              <AccordionItem
                key={chapter.id}
                value={chapter.id}
                className="border rounded-lg bg-card px-4"
              >
                <div className="flex items-center justify-between py-2">
                  <AccordionTrigger className="hover:no-underline flex-1">
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {chIdx + 1}
                      </span>
                      <span className="font-bold text-lg">{chapter.title}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {chapter.lessons?.length || 0} درس
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <div className="flex items-center gap-1">
                    {/* Reorder Buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={chIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveChapter(chIdx, "up");
                      }}
                      title="نقل للأعلى"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={chIdx === chapters.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveChapter(chIdx, "down");
                      }}
                      title="نقل للأسفل"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    {/* Edit Chapter */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditChapterDialog(chapter);
                      }}
                      title="تعديل الفصل"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {/* Add Lesson */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddLessonDialog(chapter.id);
                      }}
                      className="gap-1 h-7 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      درس
                    </Button>
                    {/* Delete Chapter */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="pt-2 pb-4 space-y-2">
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    chapter.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-md border hover:bg-muted/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-muted-foreground w-4">
                            {lIdx + 1}
                          </span>
                          {getLessonIcon(lesson.type)}
                          <span className="font-medium">{lesson.title}</span>
                          {getLessonTypeBadge(lesson.type)}
                          {lesson.is_free_preview && (
                            <Badge variant="secondary" className="text-xs">
                              مجاني
                            </Badge>
                          )}
                          {lesson.duration_minutes > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />{" "}
                              {lesson.duration_minutes} د
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              openEditLessonDialog(lesson, chapter.id)
                            }
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title="تعديل الدرس"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      لا توجد دروس في هذا الفصل.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Dialog: Add/Edit Chapter */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChapter ? "تعديل الفصل" : "إضافة فصل جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>عنوان الفصل</Label>
            <Input
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="مثال: الفصل الأول - المقدمة"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveChapter} disabled={loading}>
              {loading
                ? "جاري الحفظ..."
                : editingChapter
                  ? "تحديث الفصل"
                  : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add/Edit Lesson */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "تعديل الدرس" : "إضافة درس جديد"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "عدّل بيانات الدرس الحالي."
                : "أضف فيديو يوتيوب أو امتحان تفاعلي أو ملف PDF."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>عنوان الدرس</Label>
                <Input
                  value={lessonData.title}
                  onChange={(e) =>
                    setLessonData({ ...lessonData, title: e.target.value })
                  }
                  placeholder="عنوان الدرس"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع المحتوى</Label>
                <Select
                  value={lessonData.type}
                  onValueChange={(val) =>
                    setLessonData({
                      ...lessonData,
                      type: val,
                      pdf_url: "",
                      video_url: "",
                    })
                  }
                  disabled={!!editingLesson} // Can't change type when editing
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-500" /> فيديو
                        (YouTube)
                      </div>
                    </SelectItem>
                    <SelectItem value="exam">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-violet-500" /> امتحان
                        (Quiz)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-red-500" /> ملف PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Free Preview Toggle */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border">
              <Switch
                checked={lessonData.is_free_preview}
                onCheckedChange={(checked) =>
                  setLessonData({ ...lessonData, is_free_preview: checked })
                }
              />
              <div>
                <Label className="cursor-pointer">
                  درس مجاني (Free Preview)
                </Label>
                <p className="text-xs text-muted-foreground">
                  يمكن للطلاب غير المشتركين مشاهدة هذا الدرس
                </p>
              </div>
            </div>

            {/* Video Fields */}
            {lessonData.type === "video" && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    رابط يوتيوب (Video URL)
                  </Label>
                  <Input
                    value={lessonData.video_url}
                    onChange={(e) =>
                      setLessonData({
                        ...lessonData,
                        video_url: e.target.value,
                      })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    سيتم استخراج ID الفيديو تلقائياً.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    المدة (بالدقائق)
                  </Label>
                  <Input
                    type="number"
                    value={lessonData.duration}
                    onChange={(e) =>
                      setLessonData({ ...lessonData, duration: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Exam Fields */}
            {lessonData.type === "exam" && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      مدة الامتحان (بالدقائق)
                    </Label>
                    <Input
                      type="number"
                      value={lessonData.duration}
                      onChange={(e) =>
                        setLessonData({
                          ...lessonData,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      درجة النجاح (%)
                    </Label>
                    <Input
                      type="number"
                      value={lessonData.passing_score}
                      onChange={(e) =>
                        setLessonData({
                          ...lessonData,
                          passing_score: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      عدد المحاولات
                    </Label>
                    <Input
                      type="number"
                      value={lessonData.allowed_attempts}
                      onChange={(e) =>
                        setLessonData({
                          ...lessonData,
                          allowed_attempts: e.target.value,
                        })
                      }
                      placeholder="0 = غير محدود"
                    />
                  </div>
                </div>

                {/* Questions list */}
                {lessonData.questions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      الأسئلة المضافة:
                    </h4>
                    {lessonData.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-background rounded-md border text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[350px]">
                            {q.question_text}
                          </span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemoveQuestion(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Question Section */}
                <div className="border-t pt-4 mt-2">
                  <h4 className="font-semibold mb-3 flex items-center justify-between">
                    إضافة سؤال جديد
                    <Badge variant="outline">
                      {lessonData.questions.length} أسئلة مضافة
                    </Badge>
                  </h4>

                  <div className="space-y-3 p-3 bg-background rounded-md border">
                    <Input
                      placeholder="نص السؤال..."
                      value={currentQuestion.question_text}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          question_text: e.target.value,
                        })
                      }
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {currentQuestion.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {idx + 1}
                          </span>
                          <Input
                            placeholder={`الخيار ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...currentQuestion.options];
                              newOpts[idx] = e.target.value;
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: newOpts,
                              });
                            }}
                            className={
                              currentQuestion.correct_answer === opt &&
                              opt !== ""
                                ? "border-emerald-500 ring-1 ring-emerald-500"
                                : ""
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                correct_answer: opt,
                              })
                            }
                            className={
                              currentQuestion.correct_answer === opt &&
                              opt !== ""
                                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                                : "text-muted-foreground"
                            }
                            title="تحديد كإجابة صحيحة"
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
                      className="w-full mt-2"
                      disabled={
                        !currentQuestion.question_text ||
                        !currentQuestion.correct_answer
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      إدراج السؤال في الامتحان
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Upload Fields */}
            {lessonData.type === "pdf" && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                <div className="border-2 border-dashed rounded-xl p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
                  {lessonData.pdf_url ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <File className="h-7 w-7 text-red-500" />
                      </div>
                      <p className="text-sm font-medium">
                        {pdfFileName || "ملف PDF"}
                      </p>
                      <p className="text-xs text-emerald-600">
                        ✅ تم الرفع بنجاح
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => pdfInputRef.current?.click()}
                          className="gap-1"
                        >
                          <Upload className="h-4 w-4" /> تغيير الملف
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (lessonData.pdf_url)
                              await deleteFile(lessonData.pdf_url);
                            setLessonData((prev) => ({ ...prev, pdf_url: "" }));
                            setPdfFileName("");
                          }}
                          className="gap-1"
                        >
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
                          <span className="text-sm font-medium">
                            جاري رفع الملف...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-10 w-10" />
                          <span className="text-sm font-medium">
                            اضغط لاختيار ملف PDF
                          </span>
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
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveLesson}
              disabled={loading || uploading}
              className="w-full sm:w-auto"
            >
              {loading
                ? "جاري الحفظ..."
                : editingLesson
                  ? "تحديث الدرس"
                  : "حفظ الدرس"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
