import { NextResponse } from 'next/server'

export function middleware(request) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isLoginRoute = request.nextUrl.pathname === '/admin/login'

    // لو مش مسار أدمن، كمل عادي
    if (!isAdminRoute) {
        return NextResponse.next()
    }

    // التحقق من الجلسة الوهمية (Cookie)
    const adminSession = request.cookies.get('admin_session')

    // 1. لو في صفحة اللوجين وعنده جلسة، دخله
    if (isLoginRoute) {
        if (adminSession?.value === 'true') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
        return NextResponse.next()
    }

    // 2. حماية باقي مسارات الأدمن
    if (!adminSession || adminSession.value !== 'true') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
