import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

const BUCKET_NAME = 'platform'

/**
 * ضغط الصورة لأقصى حد ممكن ثم رفعها على باكت platform
 * @param {File} file - ملف الصورة
 * @param {string} folder - المجلد داخل الباكت (مثل: 'courses', 'bundles')
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export async function uploadImage(file, folder = 'images') {
    try {
        // ضغط الصورة لأقصى حد
        const options = {
            maxSizeMB: 0.3,           // أقصى حجم 300KB
            maxWidthOrHeight: 1200,    // أقصى عرض أو ارتفاع
            useWebWorker: true,
            fileType: 'image/webp',    // تحويل لـ WebP لأصغر حجم
            initialQuality: 0.7,      // جودة 70%
        }

        const compressedFile = await imageCompression(file, options)

        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const ext = 'webp'
        const fileName = `${folder}/${timestamp}_${randomStr}.${ext}`

        const supabase = createClient()

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, compressedFile, {
                contentType: 'image/webp',
                cacheControl: '31536000', // cache for 1 year
                upsert: false
            })

        if (error) {
            console.error('Upload error:', error)
            return { url: null, error: error.message }
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path)

        return { url: publicUrlData.publicUrl, error: null }

    } catch (err) {
        console.error('Image upload failed:', err)
        return { url: null, error: err.message || 'فشل رفع الصورة' }
    }
}

/**
 * رفع ملف PDF على باكت platform
 * @param {File} file - ملف PDF
 * @param {string} folder - المجلد داخل الباكت
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export async function uploadPDF(file, folder = 'pdfs') {
    try {
        if (file.type !== 'application/pdf') {
            return { url: null, error: 'الملف يجب يكون PDF' }
        }

        // Max 50MB for PDF
        if (file.size > 50 * 1024 * 1024) {
            return { url: null, error: 'حجم الملف يجب أن يكون أقل من 50MB' }
        }

        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const fileName = `${folder}/${timestamp}_${randomStr}_${safeName}`

        const supabase = createClient()

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                contentType: 'application/pdf',
                cacheControl: '31536000',
                upsert: false
            })

        if (error) {
            console.error('PDF upload error:', error)
            return { url: null, error: error.message }
        }

        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path)

        return { url: publicUrlData.publicUrl, error: null }

    } catch (err) {
        console.error('PDF upload failed:', err)
        return { url: null, error: err.message || 'فشل رفع الملف' }
    }
}

/**
 * حذف ملف من باكت platform
 * @param {string} fileUrl - الرابط الكامل للملف
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteFile(fileUrl) {
    try {
        const supabase = createClient()

        // Extract path from URL
        const urlParts = fileUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
        if (urlParts.length < 2) {
            return { success: false, error: 'رابط غير صالح' }
        }

        const filePath = urlParts[1]

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath])

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, error: null }
    } catch (err) {
        return { success: false, error: err.message }
    }
}
