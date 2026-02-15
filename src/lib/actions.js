'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
    const supabase = await createClient()

    try {
        // 1. إحصائيات عامة (عدد الصفوف في كل جدول)
        const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
        const { count: bannedCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true)
        const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true })
        const { count: publishedCourseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true)
        const { count: bundleCount } = await supabase.from('bundles').select('*', { count: 'exact', head: true })
        const { count: lessonCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true })
        const { count: examResultCount } = await supabase.from('exam_results').select('*', { count: 'exact', head: true })
        const { count: passedExams } = await supabase.from('exam_results').select('*', { count: 'exact', head: true }).eq('is_passed', true)
        const { count: activeEnrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true })

        // 2. إحصائيات الأكواد
        const { count: totalCodes } = await supabase.from('activation_codes').select('*', { count: 'exact', head: true })
        const { count: usedCodes } = await supabase.from('activation_codes').select('*', { count: 'exact', head: true }).eq('is_used', true)

        // 3. آخر الاشتراكات (مع بيانات الطالب والكورس/الباقة)
        const { data: recentEnrollments } = await supabase
            .from('enrollments')
            .select(`
                id,
                activated_at,
                student:profiles(full_name),
                course:courses(title),
                bundle:bundles(title)
            `)
            .order('activated_at', { ascending: false })
            .limit(5)

        return {
            totalRevenue: 0,
            totalStudents: studentCount || 0,
            bannedStudents: bannedCount || 0,
            totalCourses: courseCount || 0,
            publishedCourses: publishedCourseCount || 0,
            totalBundles: bundleCount || 0,
            totalLessons: lessonCount || 0,
            totalEnrollments: activeEnrollments || 0,
            totalActivationCodes: totalCodes || 0,
            usedCodes: usedCodes || 0,
            unusedCodes: (totalCodes - usedCodes) || 0,
            passedExams: passedExams || 0,
            failedExams: (examResultCount - passedExams) || 0,
            recentEnrollments: recentEnrollments || [],
        }

    } catch (error) {
        console.error("Error fetching stats:", error)
        return null
    }
}

// --- Students Actions ---

export async function getStudents() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error("Error fetching students:", error)
        return []
    }
}

export async function toggleStudentBan(studentId, currentStatus) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_banned: !currentStatus })
            .eq('id', studentId)

        if (error) throw error

        revalidatePath('/admin/students')
        return { success: true, message: currentStatus ? "تم إلغاء الحظر بنجاح" : "تم حظر الطالب بنجاح" }
    } catch (error) {
        console.error("Error toggling ban:", error)
        return { success: false, message: "حدث خطأ أثناء تحديث حالة الطالب" }
    }
}

export async function deleteStudent(studentId) {
    // حذف الطالب نهائياً (يتطلب مسح اليوزر من Auth كمان لو أمكن، بس هنا هنمسح البروفايل)
    // ملحوظة: حذف البروفايل هيمسح كل حاجة مرتبطة بيه بسبب ON DELETE CASCADE
    const supabase = await createClient()

    try {
        // 1. حذف البروفايل (وبالتالي الاشتراكات والنتائج)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', studentId)

        if (error) throw error

        // 2. (اختياري) حذف اليوزر من Auth لو معاك service_role key، بس هنا هنكتفي بالبروفايل

        revalidatePath('/admin/students')
        return { success: true, message: "تم حذف الطالب بنجاح" }
    } catch (error) {
        console.error("Error deleting student:", error)
        return { success: false, message: "حدث خطأ أثناء حذف الطالب" }
    }
}

// --- Activation Codes Actions ---

export async function getActivationCodes() {
    const supabase = await createClient()
    try {
        // 1. Fetch Codes with Student relation (explicit FK)
        // Note: attempting to select student using the FK column name
        const { data: codes, error } = await supabase
            .from('activation_codes')
            .select(`
                *,
                student:profiles!activation_codes_used_by_student_id_fkey(full_name, phone_number)
            `)
            .order('created_at', { ascending: false })

        // Fallback if the FK name is simple or auto-detected (try simpler query if first fails? No, let's try standard relation first)
        // Actually, let's try standard 'profiles' first. If FK is named 'used_by_student_id', Supabase might need 'profiles!used_by_student_id(...)'

        if (error) {
            // Retry with alternate syntax if needed, or just log and throw
            console.log("Initial fetch error, trying simpler student relation", error)
            throw error
        }

        // 2. Fetch Courses & Bundles titles
        const { data: courses } = await supabase.from('courses').select('id, title')
        const { data: bundles } = await supabase.from('bundles').select('id, title')

        // 3. Map titles
        return codes.map(code => {
            let targetTitle = "غير معروف"
            if (code.type === 'course') {
                targetTitle = courses?.find(c => c.id === code.target_id)?.title || "كورس محذوف"
            } else if (code.type === 'bundle') {
                targetTitle = bundles?.find(b => b.id === code.target_id)?.title || "باقة محذوفة"
            }

            return {
                ...code,
                course: code.type === 'course' ? { title: targetTitle } : null,
                bundle: code.type === 'bundle' ? { title: targetTitle } : null
            }
        }) || []

    } catch (error) {
        // Fallback: Try fetching codes without relations if fetching fails completely
        try {
            const supabaseRetry = await createClient()
            const { data: simpleCodes } = await supabaseRetry.from('activation_codes').select('*').order('created_at', { ascending: false })
            return simpleCodes || []
        } catch (e) {
            console.error("Error fetching codes:", e)
            return []
        }
    }
}


export async function getCoursesForSelect() {
    const supabase = await createClient()
    const { data } = await supabase.from('courses').select('id, title').order('title')
    return data || []
}

export async function getBundlesForSelect() {
    const supabase = await createClient()
    const { data } = await supabase.from('bundles').select('id, title').order('title')
    return data || []
}

function generateRandomCode() {
    // Generate a secure random code like "X92K-M21L-P900"
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like I, 1, O, 0
    let result = ''
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) result += '-'
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export async function generateCodes({ type, targetId, amount, balanceAmount }) {
    const supabase = await createClient()
    const codesToInsert = []

    for (let i = 0; i < amount; i++) {
        codesToInsert.push({
            code: generateRandomCode(),
            type,
            target_id: targetId,
            is_used: false,
        })
    }

    try {
        const { error } = await supabase
            .from('activation_codes')
            .insert(codesToInsert)

        if (error) throw error

        revalidatePath('/admin/activation-codes')
        return { success: true, message: `تم إنشاء ${amount} كود بنجاح!`, codes: codesToInsert }
    } catch (error) {
        console.error("Error generating codes:", error)
        return { success: false, message: "حدث خطأ أثناء إنشاء الأكواد" }
    }
}

export async function deleteCode(codeValue) {
    const supabase = await createClient()
    try {
        const { error } = await supabase
            .from('activation_codes')
            .delete()
            .eq('code', codeValue)

        if (error) throw error

        revalidatePath('/admin/activation-codes')
        return { success: true, message: "تم حذف الكود بنجاح" }
    } catch (error) {
        console.error("Error deleting code:", error)
        return { success: false, message: "حدث خطأ أثناء حذف الكود" }
    }
}

// --- Enrollments Actions ---

export async function getEnrollments() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                student:profiles(full_name, phone_number),
                course:courses(title),
                bundle:bundles(title)
            `)
            .order('activated_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error("Error fetching enrollments:", error)
        return []
    }
}

export async function deleteEnrollment(enrollmentId) {
    const supabase = await createClient()
    try {
        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentId)

        if (error) throw error

        revalidatePath('/admin/enrollments')
        return { success: true, message: "تم حذف الاشتراك بنجاح" }
    } catch (error) {
        console.error("Error deleting enrollment:", error)
        return { success: false, message: "حدث خطأ أثناء حذف الاشتراك" }
    }
}

// --- Devices Actions ---

export async function getDevices() {
    const supabase = await createClient()
    try {
        // لا نطلب email لأن عمود email غير موجود في جدول profiles بالسكيما
        const { data: devices, error: devicesError } = await supabase
            .from('student_devices')
            .select('*')
            .order('created_at', { ascending: false })

        if (devicesError) throw devicesError
        if (!devices?.length) return []

        const studentIds = [...new Set(devices.map((d) => d.student_id).filter(Boolean))]
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, phone_number')
            .in('id', studentIds)

        const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))
        return devices.map((d) => ({
            ...d,
            student: d.student_id ? profileMap[d.student_id] ?? null : null,
        }))
    } catch (error) {
        console.error("Error fetching devices:", error)
        return []
    }
}

export async function deleteDevice(deviceId) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('student_devices').delete().eq('id', deviceId)
        if (error) throw error
        revalidatePath('/admin/devices')
        return { success: true, message: "تم حذف الجهاز بنجاح" }
    } catch (error) {
        return { success: false, message: "حدث خطأ أثناء حذف الجهاز" }
    }
}

export async function deleteStudentDevices(studentId) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('student_devices').delete().eq('student_id', studentId)
        if (error) throw error
        revalidatePath('/admin/devices')
        return { success: true, message: "تم حذف جميع أجهزة الطالب" }
    } catch (error) {
        return { success: false, message: "حدث خطأ أثناء حذف الأجهزة" }
    }
}

export async function deleteAllDevices() {
    const supabase = await createClient()
    try {
        // حذف الكل (بدون شرط)
        const { error } = await supabase.from('student_devices').delete().neq('id', 0) // Delete all rows
        if (error) throw error
        revalidatePath('/admin/devices')
        return { success: true, message: "تم حذف جميع الأجهزة من النظام" }
    } catch (error) {
        return { success: false, message: "حدث خطأ أثناء الحذف الشامل" }
    }
}

// --- Categories Actions ---

export async function getCategories() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error("Error fetching categories:", error)
        return []
    }
}

export async function createCategory(name, sortOrder) {
    const supabase = await createClient()
    try {
        const { error } = await supabase
            .from('categories')
            .insert({ name, sort_order: sortOrder })

        if (error) throw error
        revalidatePath('/admin/categories')
        return { success: true, message: "تم إضافة التصنيف بنجاح" }
    } catch (error) {
        return { success: false, message: "خطأ في الإضافة" }
    }
}

export async function updateCategory(id, name, sortOrder) {
    const supabase = await createClient()
    try {
        const { error } = await supabase
            .from('categories')
            .update({ name, sort_order: sortOrder })
            .eq('id', id)

        if (error) throw error
        revalidatePath('/admin/categories')
        return { success: true, message: "تم تحديث التصنيف بنجاح" }
    } catch (error) {
        return { success: false, message: "خطأ في التحديث" }
    }
}

export async function deleteCategory(id) {
    const supabase = await createClient()
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) {
            // Check for foreign key constraint (if courses rely on this category)
            if (error.code === '23503') { // Postgres FK violation code
                return { success: false, message: "لا يمكن حذف التصنيف لأنه مستخدم في كورسات" }
            }
            throw error
        }
        revalidatePath('/admin/categories')
        return { success: true, message: "تم حذف التصنيف بنجاح" }
    } catch (error) {
        return { success: false, message: "خطأ في الحذف" }
    }
}

// --- Bundles Actions ---

export async function getBundles() {
    const supabase = await createClient()
    try {
        // Need to fetch bundle items too to show count
        const { data, error } = await supabase
            .from('bundles')
            .select(`
                *,
                items:bundle_items(count)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Format count
        return data.map(b => ({
            ...b,
            itemsCount: b.items ? b.items[0]?.count : 0 // Supabase count returns array of objects with count
        })) || []
    } catch (error) {
        console.error("Error fetching bundles:", error)
        return []
    }
}

export async function getBundle(id) {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('bundles')
            .select(`
                *,
                items:bundle_items(course_id)
            `)
            .eq('id', id)
            .single()

        if (error) throw error

        // Extract course IDs
        const courseIds = data.items.map(item => item.course_id)
        return { ...data, courseIds }
    } catch (error) {
        return null
    }
}

export async function createBundle({ title, description, price, is_published, courseIds, thumbnail_url }) {
    const supabase = await createClient()
    try {
        // 1. Create Bundle
        const { data: bundle, error: bundleError } = await supabase
            .from('bundles')
            .insert({ title, description, price, is_published, thumbnail_url })
            .select()
            .single()

        if (bundleError) throw bundleError

        // 2. Add Items
        if (courseIds && courseIds.length > 0) {
            const items = courseIds.map(cId => ({ bundle_id: bundle.id, course_id: cId }))
            const { error: itemsError } = await supabase.from('bundle_items').insert(items)
            if (itemsError) throw itemsError
        }

        revalidatePath('/admin/bundles')
        return { success: true, message: "تم إنشاء الباقة بنجاح" }
    } catch (error) {
        console.error("Error creating bundle:", error)
        return { success: false, message: "حدث خطأ أثناء إنشاء الباقة" }
    }
}

export async function updateBundle({ id, title, description, price, is_published, courseIds, thumbnail_url }) {
    const supabase = await createClient()
    try {
        // 1. Update Bundle Details
        const { error: bundleError } = await supabase
            .from('bundles')
            .update({ title, description, price, is_published, thumbnail_url })
            .eq('id', id)

        if (bundleError) throw bundleError

        // 2. Update Items (Delete all & Re-insert is simplest strategy for Many-To-Many)
        // a. Delete existing
        await supabase.from('bundle_items').delete().eq('bundle_id', id)

        // b. Insert new
        if (courseIds && courseIds.length > 0) {
            const items = courseIds.map(cId => ({ bundle_id: id, course_id: cId }))
            const { error: itemsError } = await supabase.from('bundle_items').insert(items)
            if (itemsError) throw itemsError
        }

        revalidatePath('/admin/bundles')
        return { success: true, message: "تم تحديث الباقة بنجاح" }
    } catch (error) {
        console.error("Error updating bundle:", error)
        return { success: false, message: "حدث خطأ أثناء تحديث الباقة" }
    }
}

export async function deleteBundle(id) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('bundles').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/admin/bundles')
        return { success: true, message: "تم حذف الباقة بنجاح" }
    } catch (error) {
        return { success: false, message: "حدث خطأ أثناء حذف الباقة" }
    }
}

// --- Courses & Content Actions ---

export async function getCourses() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*, category:categories(name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error("Error fetching courses:", error)
        return []
    }
}

export async function createCourse(data) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('courses').insert(data)
        if (error) throw error
        revalidatePath('/admin/courses')
        return { success: true, message: "تم إنشاء الكورس بنجاح" }
    } catch (error) {
        return { success: false, message: "خطأ في إنشاء الكورس" }
    }
}

export async function updateCourse(id, data) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('courses').update(data).eq('id', id)
        if (error) throw error
        revalidatePath('/admin/courses')
        revalidatePath(`/admin/courses/${id}`)
        return { success: true, message: "تم تحديث الكورس بنجاح" }
    } catch (error) {
        return { success: false, message: "خطأ في تحديث الكورس" }
    }
}

export async function deleteCourse(id) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('courses').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/admin/courses')
        return { success: true, message: "تم حذف الكورس بنجاح" }
    } catch (error) {
        return { success: false, message: "خطأ في حذف الكورس" }
    }
}

// --- Chapters & Lessons ---

export async function getCourseDetails(courseId) {
    const supabase = await createClient()
    try {
        // 1. Get Course Info
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()

        if (courseError) throw courseError

        // 2. Get Chapters with Lessons (Ordered)
        const { data: chapters, error: chaptersError } = await supabase
            .from('chapters')
            .select(`
                *,
                lessons:lessons(*)
            `)
            .eq('course_id', courseId)
            .order('sort_order', { ascending: true })

        if (chaptersError) throw chaptersError

        // Sort lessons internally (Supabase nested order is unreliable sometimes)
        chapters.forEach(chapter => {
            if (chapter.lessons) {
                chapter.lessons.sort((a, b) => a.sort_order - b.sort_order)
            }
        })

        return { ...course, chapters: chapters || [] }
    } catch (error) {
        console.error("Error fetching course details:", error)
        return null
    }
}

export async function createChapter(courseId, title) {
    const supabase = await createClient()
    try {
        // Get max sort order
        const { data: max } = await supabase.from('chapters').select('sort_order').eq('course_id', courseId).order('sort_order', { ascending: false }).limit(1).single()
        const nextOrder = (max?.sort_order || 0) + 1

        const { error } = await supabase.from('chapters').insert({ course_id: courseId, title, sort_order: nextOrder })
        if (error) throw error

        revalidatePath(`/admin/courses/${courseId}`)
        revalidatePath('/admin/lessons')
        return { success: true, message: "تم إضافة الفصل" }
    } catch (error) {
        return { success: false, message: "خطأ في إضافة الفصل" }
    }
}

export async function deleteChapter(id, courseId) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('chapters').delete().eq('id', id)
        if (error) throw error
        revalidatePath(`/admin/courses/${courseId}`)
        revalidatePath('/admin/lessons')
        return { success: true, message: "تم حذف الفصل" }
    } catch (error) {
        return { success: false, message: "خطأ في حذف الفصل" }
    }
}

export async function getChapters() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('chapters')
            .select(`
                *,
                course:courses(id, title),
                lessons(id)
            `)
            .order('sort_order', { ascending: true })

        if (error) throw error
        return (data || []).map(ch => ({
            ...ch,
            lesson_count: ch.lessons?.length || 0,
            lessons: undefined,
        }))
    } catch (error) {
        console.error("Error fetching chapters:", error)
        return []
    }
}

export async function createLesson({ chapter_id, title, type, video_url, duration, passing_score, questions, pdf_url }, courseId) {
    const supabase = await createClient()
    try {
        // Get max sort order
        const { data: max } = await supabase.from('lessons').select('sort_order').eq('chapter_id', chapter_id).order('sort_order', { ascending: false }).limit(1).single()
        const nextOrder = (max?.sort_order || 0) + 1

        // Build exam_questions JSONB from questions array
        let exam_questions = null
        if (type === 'exam' && questions && questions.length > 0) {
            exam_questions = questions.map(q => ({
                question: q.question_text,
                options: q.options.filter(o => o.trim() !== ''),
                answer: q.options.findIndex(o => o === q.correct_answer)
            }))
        }

        // Build lesson data
        const lessonData = {
            chapter_id,
            title,
            type,
            sort_order: nextOrder,
            is_free_preview: false,
            duration_minutes: parseInt(duration) || 0,
        }

        // Video fields
        if (type === 'video') {
            lessonData.video_url = video_url || null
            lessonData.video_provider = 'youtube'
        }

        // Exam fields
        if (type === 'exam') {
            lessonData.exam_questions = exam_questions
            lessonData.passing_score = parseInt(passing_score) || 50
        }

        // PDF field — store the URL in video_url (reused for PDF link)
        if (type === 'pdf') {
            lessonData.video_url = pdf_url || null
        }

        // Insert Lesson
        const { error: lessonError } = await supabase
            .from('lessons')
            .insert(lessonData)

        if (lessonError) throw lessonError

        revalidatePath(`/admin/courses/${courseId}`)
        revalidatePath('/admin/lessons')
        return { success: true, message: "تم إضافة الدرس بنجاح" }

    } catch (error) {
        console.error("Create lesson error:", error)
        return { success: false, message: "خطأ في إضافة الدرس: " + (error.message || '') }
    }
}

export async function deleteLesson(id, courseId) {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from('lessons').delete().eq('id', id)
        if (error) throw error
        revalidatePath(`/admin/courses/${courseId}`)
        return { success: true, message: "تم حذف الدرس" }
    } catch (error) {
        return { success: false, message: "خطأ في حذف الدرس" }
    }
}

export async function getAllLessons() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('lessons')
            .select(`
                *,
                chapter:chapters(
                    title,
                    course_id,
                    course:courses(id, title)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error("Error fetching all lessons:", error)
        return []
    }
}

export async function getChaptersForSelect(courseId) {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('chapters')
            .select('id, title')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        return []
    }
}

// --- Update Chapter ---

export async function updateChapter(id, title, sortOrder, courseId) {
    const supabase = await createClient()
    try {
        const updateData = { title }
        if (sortOrder !== undefined) updateData.sort_order = sortOrder

        const { error } = await supabase
            .from('chapters')
            .update(updateData)
            .eq('id', id)

        if (error) throw error
        revalidatePath(`/admin/courses/${courseId}`)
        return { success: true, message: "تم تحديث الفصل بنجاح" }
    } catch (error) {
        return { success: false, message: "خطأ في تحديث الفصل" }
    }
}

export async function reorderChapters(chapters, courseId) {
    const supabase = await createClient()
    try {
        // Update sort_order for each chapter
        for (let i = 0; i < chapters.length; i++) {
            const { error } = await supabase
                .from('chapters')
                .update({ sort_order: i + 1 })
                .eq('id', chapters[i].id)
            if (error) throw error
        }

        revalidatePath(`/admin/courses/${courseId}`)
        return { success: true, message: "تم تحديث ترتيب الفصول" }
    } catch (error) {
        return { success: false, message: "خطأ في ترتيب الفصول" }
    }
}

// --- Update Lesson ---

export async function updateLesson(lessonId, { title, type, video_url, duration, passing_score, questions, pdf_url, is_free_preview }, courseId) {
    const supabase = await createClient()
    try {
        // Build exam_questions JSONB
        let exam_questions = null
        if (type === 'exam' && questions && questions.length > 0) {
            exam_questions = questions.map(q => ({
                question: q.question_text || q.question,
                options: (q.options || []).filter(o => o.trim() !== ''),
                answer: q.correct_answer !== undefined
                    ? q.options.findIndex(o => o === q.correct_answer)
                    : (q.answer !== undefined ? q.answer : 0)
            }))
        }

        const lessonData = {
            title,
            type,
            is_free_preview: is_free_preview || false,
            duration_minutes: parseInt(duration) || 0,
        }

        // Video fields
        if (type === 'video') {
            lessonData.video_url = video_url || null
            lessonData.video_provider = 'youtube'
            lessonData.exam_questions = null
        }

        // Exam fields
        if (type === 'exam') {
            lessonData.exam_questions = exam_questions
            lessonData.passing_score = parseInt(passing_score) || 50
            lessonData.video_url = null
        }

        // PDF field
        if (type === 'pdf') {
            lessonData.video_url = pdf_url || null
            lessonData.exam_questions = null
        }

        const { error } = await supabase
            .from('lessons')
            .update(lessonData)
            .eq('id', lessonId)

        if (error) throw error

        revalidatePath(`/admin/courses/${courseId}`)
        revalidatePath('/admin/lessons')
        return { success: true, message: "تم تحديث الدرس بنجاح" }
    } catch (error) {
        console.error("Update lesson error:", error)
        return { success: false, message: "خطأ في تحديث الدرس: " + (error.message || '') }
    }
}

// --- Exam Results Actions ---

export async function getExamResults() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('exam_results')
            .select(`
                *,
                student:profiles(full_name, phone_number),
                exam:lessons(title)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error("Error fetching exam results:", error)
        return []
    }
}

// --- Notifications / Activity Feed ---
export async function getRecentActivity() {
    const supabase = await createClient()
    try {
        // Get recent students (last 24 hours)
        const { data: recentStudents } = await supabase
            .from('profiles')
            .select('id, full_name, phone_number, created_at')
            .eq('role', 'student')
            .order('created_at', { ascending: false })
            .limit(10)

        // Get recent enrollments (last 24 hours)
        const { data: recentEnrollments } = await supabase
            .from('enrollments')
            .select(`
                id,
                activated_at,
                student:profiles(full_name),
                course:courses(title),
                bundle:bundles(title)
            `)
            .order('activated_at', { ascending: false })
            .limit(10)

        // Get recently used codes
        const { data: recentCodes } = await supabase
            .from('activation_codes')
            .select(`
                code,
                type,
                used_at,
                student:profiles(full_name),
                course:courses(title),
                bundle:bundles(title)
            `)
            .eq('is_used', true)
            .order('used_at', { ascending: false })
            .limit(10)

        // Get recent exam results
        const { data: recentExams } = await supabase
            .from('exam_results')
            .select(`
                id,
                score,
                is_passed,
                created_at,
                student:profiles(full_name),
                lesson:lessons(title)
            `)
            .order('created_at', { ascending: false })
            .limit(5)

        // Build notifications list
        const notifications = []

        // New students
        recentStudents?.forEach(s => {
            notifications.push({
                id: `student-${s.id}`,
                type: 'new_student',
                title: 'طالب جديد',
                message: `${s.full_name || 'طالب'} سجّل في المنصة`,
                time: s.created_at,
                icon: 'user',
                href: '/admin/students'
            })
        })

        // New enrollments
        recentEnrollments?.forEach(e => {
            const contentName = e.course?.title || e.bundle?.title || 'محتوى'
            const contentType = e.course ? 'كورس' : 'باقة'
            notifications.push({
                id: `enrollment-${e.id}`,
                type: 'new_enrollment',
                title: 'اشتراك جديد',
                message: `${e.student?.full_name || 'طالب'} اشترك في ${contentType}: ${contentName}`,
                time: e.activated_at,
                icon: 'credit-card',
                href: '/admin/enrollments'
            })
        })

        // Used codes
        recentCodes?.forEach(c => {
            notifications.push({
                id: `code-${c.code}`,
                type: 'code_used',
                title: 'كود مستخدم',
                message: `${c.student?.full_name || 'طالب'} استخدم كود تفعيل`,
                time: c.used_at,
                icon: 'key',
                href: '/admin/activation-codes'
            })
        })

        // Exam results
        recentExams?.forEach(e => {
            notifications.push({
                id: `exam-${e.id}`,
                type: 'exam_result',
                title: e.is_passed ? 'نجاح في الامتحان' : 'رسوب في الامتحان',
                message: `${e.student?.full_name || 'طالب'} حصل على ${e.score}% في ${e.lesson?.title || 'امتحان'}`,
                time: e.created_at,
                icon: e.is_passed ? 'check' : 'x',
                href: '/admin/exam-results'
            })
        })

        // Sort all by time descending
        notifications.sort((a, b) => new Date(b.time) - new Date(a.time))

        return { success: true, notifications: notifications.slice(0, 20) }
    } catch (error) {
        console.error("Error fetching activity:", error)
        return { success: false, notifications: [] }
    }
}

// --- Sidebar Badge Counts ---
export async function getSidebarCounts() {
    const supabase = await createClient()
    try {
        const { count: unusedCodes } = await supabase
            .from('activation_codes')
            .select('*', { count: 'exact', head: true })
            .eq('is_used', false)

        const { count: totalStudents } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')

        const { count: totalEnrollments } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })

        return {
            unusedCodes: unusedCodes || 0,
            totalStudents: totalStudents || 0,
            totalEnrollments: totalEnrollments || 0,
        }
    } catch (error) {
        console.error("Error fetching sidebar counts:", error)
        return { unusedCodes: 0, totalStudents: 0, totalEnrollments: 0 }
    }
}
