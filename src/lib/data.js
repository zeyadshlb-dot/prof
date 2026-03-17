// ============================================
// بيانات هارد كود - يتم استبدالها لاحقاً بـ Supabase
// ============================================

// التصنيفات
export const categories = [
    { id: 1, name: "الصف الأول الثانوي", sort_order: 1, created_at: "2026-01-15" },
    { id: 2, name: "الصف الثاني الثانوي", sort_order: 2, created_at: "2026-01-15" },
    { id: 3, name: "الصف الثالث الثانوي", sort_order: 3, created_at: "2026-01-15" },
];

// الطلاب (profiles)
export const students = [
    {
        id: "s1",
        full_name: "أحمد محمد علي",
        phone_number: "01012345678",
        academic_year: "3 ثانوي",
        role: "student",
        is_banned: false,
        created_at: "2026-01-20T10:30:00",
        updated_at: "2026-02-01T14:00:00",
    },
    {
        id: "s2",
        full_name: "سارة أحمد حسن",
        phone_number: "01098765432",
        academic_year: "3 ثانوي",
        role: "student",
        is_banned: false,
        created_at: "2026-01-21T09:00:00",
        updated_at: "2026-02-02T11:00:00",
    },
    {
        id: "s3",
        full_name: "محمد خالد إبراهيم",
        phone_number: "01155667788",
        academic_year: "2 ثانوي",
        role: "student",
        is_banned: true,
        created_at: "2026-01-22T08:00:00",
        updated_at: "2026-02-03T16:00:00",
    },
    {
        id: "s4",
        full_name: "فاطمة عبدالله سعيد",
        phone_number: "01234567890",
        academic_year: "1 ثانوي",
        role: "student",
        is_banned: false,
        created_at: "2026-01-23T12:00:00",
        updated_at: "2026-02-04T10:00:00",
    },
    {
        id: "s5",
        full_name: "عمر ياسر محمود",
        phone_number: "01567890123",
        academic_year: "3 ثانوي",
        role: "student",
        is_banned: false,
        created_at: "2026-01-24T15:00:00",
        updated_at: "2026-02-05T09:00:00",
    },
    {
        id: "s6",
        full_name: "نورهان مصطفى",
        phone_number: "01111222333",
        academic_year: "2 ثانوي",
        role: "student",
        is_banned: false,
        created_at: "2026-01-25T11:00:00",
        updated_at: "2026-02-06T13:00:00",
    },
    {
        id: "s7",
        full_name: "يوسف حسام الدين",
        phone_number: "01099887766",
        academic_year: "1 ثانوي",
        role: "student",
        is_banned: false,
        created_at: "2026-01-26T14:00:00",
        updated_at: "2026-02-07T12:00:00",
    },
    {
        id: "s8",
        full_name: "مريم طارق عادل",
        phone_number: "01288776655",
        academic_year: "3 ثانوي",
        role: "student",
        is_banned: false,
        created_at: "2026-01-27T16:00:00",
        updated_at: "2026-02-08T11:00:00",
    },
];

// الكورسات
export const courses = [
    {
        id: "c1",
        category_id: 3,
        title: "شرح الفيزياء - الباب الأول",
        description: "شرح شامل للباب الأول في الفيزياء للصف الثالث الثانوي",
        thumbnail_url: null,
        price: 150,
        is_published: true,
        sort_order: 1,
        created_at: "2026-01-15",
    },
    {
        id: "c2",
        category_id: 3,
        title: "شرح الفيزياء - الباب الثاني",
        description: "شرح شامل للباب الثاني في الفيزياء",
        thumbnail_url: null,
        price: 150,
        is_published: true,
        sort_order: 2,
        created_at: "2026-01-16",
    },
    {
        id: "c3",
        category_id: 3,
        title: "شرح الفيزياء - الباب الثالث",
        description: "شرح شامل للباب الثالث في الفيزياء",
        thumbnail_url: null,
        price: 200,
        is_published: false,
        sort_order: 3,
        created_at: "2026-01-20",
    },
    {
        id: "c4",
        category_id: 2,
        title: "الفيزياء 2 ثانوي - ترم أول",
        description: "شرح منهج الفيزياء كامل للترم الأول",
        thumbnail_url: null,
        price: 250,
        is_published: true,
        sort_order: 1,
        created_at: "2026-01-18",
    },
    {
        id: "c5",
        category_id: 1,
        title: "الفيزياء 1 ثانوي - ترم أول",
        description: "شرح منهج الفيزياء كامل للترم الأول",
        thumbnail_url: null,
        price: 200,
        is_published: true,
        sort_order: 1,
        created_at: "2026-01-19",
    },
    {
        id: "c6",
        category_id: 3,
        title: "مراجعة نهائية فيزياء 3 ثانوي",
        description: "مراجعة شاملة لكل أبواب المنهج",
        thumbnail_url: null,
        price: 300,
        is_published: true,
        sort_order: 4,
        created_at: "2026-02-01",
    },
];

// الباقات
export const bundles = [
    {
        id: "b1",
        title: "باقة 3 ثانوي الكاملة",
        description: "كل كورسات الصف الثالث الثانوي في باقة واحدة بخصم كبير",
        thumbnail_url: null,
        price: 500,
        is_published: true,
        created_at: "2026-01-20",
        courses: ["c1", "c2", "c3", "c6"],
    },
    {
        id: "b2",
        title: "باقة المراجعة النهائية",
        description: "مراجعة نهائية وأهم الأسئلة",
        thumbnail_url: null,
        price: 350,
        is_published: true,
        created_at: "2026-01-25",
        courses: ["c6", "c3"],
    },
    {
        id: "b3",
        title: "باقة الترم الأول",
        description: "كل كورسات الترم الأول لجميع الصفوف",
        thumbnail_url: null,
        price: 600,
        is_published: false,
        created_at: "2026-02-01",
        courses: ["c4", "c5"],
    },
];

// الفصول
export const chapters = [
    { id: "ch1", course_id: "c1", title: "الحركة الخطية", sort_order: 1, created_at: "2026-01-15" },
    { id: "ch2", course_id: "c1", title: "قوانين نيوتن", sort_order: 2, created_at: "2026-01-15" },
    { id: "ch3", course_id: "c2", title: "الموجات", sort_order: 1, created_at: "2026-01-16" },
    { id: "ch4", course_id: "c2", title: "الصوت والضوء", sort_order: 2, created_at: "2026-01-16" },
    { id: "ch5", course_id: "c4", title: "الحرارة", sort_order: 1, created_at: "2026-01-18" },
    { id: "ch6", course_id: "c5", title: "القياس والكميات الفيزيائية", sort_order: 1, created_at: "2026-01-19" },
];

// الدروس
export const lessons = [
    { id: "l1", chapter_id: "ch1", title: "مقدمة في الحركة", type: "video", video_url: "abc123", video_provider: "bunny", duration_minutes: 45, is_free_preview: true, sort_order: 1, created_at: "2026-01-15" },
    { id: "l2", chapter_id: "ch1", title: "السرعة والتسارع", type: "video", video_url: "def456", video_provider: "bunny", duration_minutes: 60, is_free_preview: false, sort_order: 2, created_at: "2026-01-15" },
    { id: "l3", chapter_id: "ch1", title: "امتحان الحركة الخطية", type: "exam", exam_questions: [], passing_score: 60, is_free_preview: false, sort_order: 3, created_at: "2026-01-16" },
    { id: "l4", chapter_id: "ch2", title: "القانون الأول لنيوتن", type: "video", video_url: "ghi789", video_provider: "youtube", duration_minutes: 50, is_free_preview: false, sort_order: 1, created_at: "2026-01-17" },
    { id: "l5", chapter_id: "ch2", title: "ملخص PDF - قوانين نيوتن", type: "pdf", is_free_preview: false, sort_order: 2, created_at: "2026-01-17" },
    { id: "l6", chapter_id: "ch3", title: "مقدمة في الموجات", type: "video", video_url: "jkl012", video_provider: "bunny", duration_minutes: 55, is_free_preview: true, sort_order: 1, created_at: "2026-01-18" },
    { id: "l7", chapter_id: "ch5", title: "درجة الحرارة والطاقة", type: "video", video_url: "mno345", video_provider: "bunny", duration_minutes: 40, is_free_preview: false, sort_order: 1, created_at: "2026-01-19" },
    { id: "l8", chapter_id: "ch6", title: "وحدات القياس", type: "video", video_url: "pqr678", video_provider: "youtube", duration_minutes: 35, is_free_preview: true, sort_order: 1, created_at: "2026-01-20" },
];

// الاشتراكات
export const enrollments = [
    { id: "e1", student_id: "s1", course_id: "c1", bundle_id: null, activated_at: "2026-01-25T10:00:00", expires_at: null },
    { id: "e2", student_id: "s1", course_id: "c2", bundle_id: null, activated_at: "2026-01-26T11:00:00", expires_at: null },
    { id: "e3", student_id: "s2", course_id: null, bundle_id: "b1", activated_at: "2026-01-27T09:00:00", expires_at: "2026-07-27T09:00:00" },
    { id: "e4", student_id: "s4", course_id: "c5", bundle_id: null, activated_at: "2026-01-28T14:00:00", expires_at: null },
    { id: "e5", student_id: "s5", course_id: "c1", bundle_id: null, activated_at: "2026-01-29T08:00:00", expires_at: null },
    { id: "e6", student_id: "s5", course_id: null, bundle_id: "b2", activated_at: "2026-01-30T16:00:00", expires_at: null },
    { id: "e7", student_id: "s6", course_id: "c4", bundle_id: null, activated_at: "2026-02-01T10:00:00", expires_at: null },
    { id: "e8", student_id: "s7", course_id: "c5", bundle_id: null, activated_at: "2026-02-02T12:00:00", expires_at: null },
    { id: "e9", student_id: "s8", course_id: "c1", bundle_id: null, activated_at: "2026-02-03T09:00:00", expires_at: null },
    { id: "e10", student_id: "s8", course_id: "c6", bundle_id: null, activated_at: "2026-02-05T11:00:00", expires_at: null },
    { id: "e11", student_id: "s2", course_id: "c6", bundle_id: null, activated_at: "2026-02-06T14:00:00", expires_at: null },
    { id: "e12", student_id: "s6", course_id: null, bundle_id: "b1", activated_at: "2026-02-07T10:00:00", expires_at: "2026-08-07T10:00:00" },
];

// أكواد التفعيل
export const activationCodes = [
    { code: "ZEYAD-2026-A01", type: "course", target_id: "c1", is_used: true, used_by_student_id: "s1", used_at: "2026-01-25T10:00:00", created_at: "2026-01-20" },
    { code: "ZEYAD-2026-A02", type: "course", target_id: "c2", is_used: true, used_by_student_id: "s1", used_at: "2026-01-26T11:00:00", created_at: "2026-01-20" },
    { code: "ZEYAD-2026-B01", type: "bundle", target_id: "b1", is_used: true, used_by_student_id: "s2", used_at: "2026-01-27T09:00:00", created_at: "2026-01-22" },
    { code: "ZEYAD-2026-A03", type: "course", target_id: "c5", is_used: true, used_by_student_id: "s4", used_at: "2026-01-28T14:00:00", created_at: "2026-01-23" },
    { code: "ZEYAD-2026-A04", type: "course", target_id: "c1", is_used: false, used_by_student_id: null, used_at: null, created_at: "2026-01-24" },
    { code: "ZEYAD-2026-A05", type: "course", target_id: "c1", is_used: false, used_by_student_id: null, used_at: null, created_at: "2026-01-24" },
    { code: "ZEYAD-2026-B02", type: "bundle", target_id: "b1", is_used: false, used_by_student_id: null, used_at: null, created_at: "2026-01-25" },
    { code: "ZEYAD-2026-A06", type: "course", target_id: "c4", is_used: true, used_by_student_id: "s6", used_at: "2026-02-01T10:00:00", created_at: "2026-01-28" },
    { code: "ZEYAD-2026-A07", type: "course", target_id: "c6", is_used: true, used_by_student_id: "s8", used_at: "2026-02-05T11:00:00", created_at: "2026-02-01" },
    { code: "ZEYAD-2026-B03", type: "bundle", target_id: "b2", is_used: false, used_by_student_id: null, used_at: null, created_at: "2026-02-03" },
    { code: "ZEYAD-2026-A08", type: "course", target_id: "c3", is_used: false, used_by_student_id: null, used_at: null, created_at: "2026-02-05" },
    { code: "ZEYAD-2026-A09", type: "course", target_id: "c2", is_used: false, used_by_student_id: null, used_at: null, created_at: "2026-02-06" },
];

// أجهزة الطلاب
export const studentDevices = [
    { id: 1, student_id: "s1", device_id: "DEV-001-AAA", device_name: "Samsung Galaxy S23", last_active: "2026-02-10T08:00:00", created_at: "2026-01-25" },
    { id: 2, student_id: "s1", device_id: "DEV-002-BBB", device_name: "iPad Air 5", last_active: "2026-02-09T22:00:00", created_at: "2026-01-28" },
    { id: 3, student_id: "s2", device_id: "DEV-003-CCC", device_name: "iPhone 15", last_active: "2026-02-10T07:30:00", created_at: "2026-01-27" },
    { id: 4, student_id: "s4", device_id: "DEV-004-DDD", device_name: "Xiaomi 14", last_active: "2026-02-08T18:00:00", created_at: "2026-01-29" },
    { id: 5, student_id: "s5", device_id: "DEV-005-EEE", device_name: "Samsung Galaxy A54", last_active: "2026-02-10T09:00:00", created_at: "2026-01-30" },
    { id: 6, student_id: "s5", device_id: "DEV-006-FFF", device_name: "Huawei MatePad", last_active: "2026-02-07T20:00:00", created_at: "2026-02-01" },
    { id: 7, student_id: "s6", device_id: "DEV-007-GGG", device_name: "Oppo Reno 10", last_active: "2026-02-09T15:00:00", created_at: "2026-02-02" },
    { id: 8, student_id: "s7", device_id: "DEV-008-HHH", device_name: "Samsung Galaxy Tab S9", last_active: "2026-02-10T06:00:00", created_at: "2026-02-03" },
    { id: 9, student_id: "s8", device_id: "DEV-009-III", device_name: "iPhone 14 Pro", last_active: "2026-02-10T10:00:00", created_at: "2026-02-04" },
];

// تقدم الطلاب
export const studentProgress = [
    { student_id: "s1", lesson_id: "l1", is_completed: true, last_position_seconds: 2700, updated_at: "2026-01-26" },
    { student_id: "s1", lesson_id: "l2", is_completed: true, last_position_seconds: 3600, updated_at: "2026-01-27" },
    { student_id: "s1", lesson_id: "l3", is_completed: true, last_position_seconds: 0, updated_at: "2026-01-28" },
    { student_id: "s1", lesson_id: "l4", is_completed: false, last_position_seconds: 1200, updated_at: "2026-01-29" },
    { student_id: "s2", lesson_id: "l1", is_completed: true, last_position_seconds: 2700, updated_at: "2026-01-28" },
    { student_id: "s2", lesson_id: "l2", is_completed: false, last_position_seconds: 1800, updated_at: "2026-01-29" },
    { student_id: "s5", lesson_id: "l1", is_completed: true, last_position_seconds: 2700, updated_at: "2026-01-30" },
    { student_id: "s5", lesson_id: "l6", is_completed: true, last_position_seconds: 3300, updated_at: "2026-02-01" },
    { student_id: "s8", lesson_id: "l1", is_completed: true, last_position_seconds: 2700, updated_at: "2026-02-04" },
    { student_id: "s8", lesson_id: "l2", is_completed: true, last_position_seconds: 3600, updated_at: "2026-02-05" },
    { student_id: "s8", lesson_id: "l4", is_completed: true, last_position_seconds: 3000, updated_at: "2026-02-06" },
];

// نتائج الامتحانات
export const examResults = [
    { id: "er1", student_id: "s1", lesson_id: "l3", score: 85, total_score: 100, is_passed: true, created_at: "2026-01-28T10:00:00" },
    { id: "er2", student_id: "s2", lesson_id: "l3", score: 45, total_score: 100, is_passed: false, created_at: "2026-01-29T11:00:00" },
    { id: "er3", student_id: "s5", lesson_id: "l3", score: 72, total_score: 100, is_passed: true, created_at: "2026-01-31T09:00:00" },
    { id: "er4", student_id: "s8", lesson_id: "l3", score: 90, total_score: 100, is_passed: true, created_at: "2026-02-06T14:00:00" },
    { id: "er5", student_id: "s2", lesson_id: "l3", score: 65, total_score: 100, is_passed: true, created_at: "2026-02-07T10:00:00" },
];

// ==========================================
// دوال مساعدة للحصول على البيانات المرتبطة
// ==========================================

export function getStudentName(studentId) {
    return students.find((s) => s.id === studentId)?.full_name || "غير معروف";
}

export function getCourseName(courseId) {
    return courses.find((c) => c.id === courseId)?.title || "غير معروف";
}

export function getBundleName(bundleId) {
    return bundles.find((b) => b.id === bundleId)?.title || "غير معروف";
}

export function getCategoryName(categoryId) {
    return categories.find((c) => c.id === categoryId)?.name || "غير معروف";
}

export function getLessonName(lessonId) {
    return lessons.find((l) => l.id === lessonId)?.title || "غير معروف";
}

export function getLessonTitle(lessonId) {
    return lessons.find((l) => l.id === lessonId)?.title || "غير معروف";
}

export function getChapterName(chapterId) {
    return chapters.find((ch) => ch.id === chapterId)?.title || "غير معروف";
}

// إحصائيات الداشبورد الرئيسية
export function getDashboardStats() {
    const totalStudents = students.filter((s) => s.role === "student").length;
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.is_published).length;
    const totalBundles = bundles.length;
    const totalEnrollments = enrollments.length;
    const totalActivationCodes = activationCodes.length;
    const usedCodes = activationCodes.filter((c) => c.is_used).length;
    const unusedCodes = activationCodes.filter((c) => !c.is_used).length;
    const bannedStudents = students.filter((s) => s.is_banned).length;
    const totalDevices = studentDevices.length;
    const totalLessons = lessons.length;
    const totalExams = lessons.filter((l) => l.type === "exam").length;
    const passedExams = examResults.filter((r) => r.is_passed).length;
    const failedExams = examResults.filter((r) => !r.is_passed).length;

    // حساب الإيرادات التقريبية من الأكواد المستخدمة
    let totalRevenue = 0;
    activationCodes
        .filter((c) => c.is_used)
        .forEach((code) => {
            if (code.type === "course") {
                const course = courses.find((c) => c.id === code.target_id);
                if (course) totalRevenue += course.price;
            } else if (code.type === "bundle") {
                const bundle = bundles.find((b) => b.id === code.target_id);
                if (bundle) totalRevenue += bundle.price;
            }
        });

    return {
        totalStudents,
        totalCourses,
        publishedCourses,
        totalBundles,
        totalEnrollments,
        totalActivationCodes,
        usedCodes,
        unusedCodes,
        bannedStudents,
        totalDevices,
        totalLessons,
        totalExams,
        passedExams,
        failedExams,
        totalRevenue,
    };
}
