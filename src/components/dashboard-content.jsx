"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    BookOpen,
    CreditCard,
    KeyRound,
    TrendingUp,
    Package,
    Video,
    Smartphone,
    ArrowUpLeft,
    Activity,
    DollarSign,
} from "lucide-react"

export function DashboardContent({ stats }) {
    if (!stats) {
        return <div className="p-8 text-center text-muted-foreground">جاري تحميل البيانات...</div>
    }

    const passRate = Math.round((stats.passedExams / (stats.passedExams + stats.failedExams || 1)) * 100)
    const codeUsageRate = Math.round((stats.usedCodes / (stats.totalActivationCodes || 1)) * 100)

    const mainStats = [
        {
            title: "إجمالي الإيرادات (تقديري)",
            value: `${stats.totalRevenue.toLocaleString()} ج.م`,
            subtitle: `من ${stats.usedCodes} كود مفعّل`,
            icon: DollarSign,
            color: "emerald",
            trend: "+12%",
            trendUp: true,
        },
        {
            title: "إجمالي الطلاب",
            value: stats.totalStudents,
            subtitle: stats.bannedStudents > 0 ? `${stats.bannedStudents} محظور` : "لا يوجد محظورين",
            icon: Users,
            color: "blue",
            trend: "+8%",
            trendUp: true,
        },
        {
            title: "الاشتراكات النشطة",
            value: stats.totalEnrollments,
            subtitle: "اشتراك نشط",
            icon: CreditCard,
            color: "violet",
            trend: "+23%",
            trendUp: true,
        },
        {
            title: "أكواد التفعيل",
            value: `${stats.unusedCodes} / ${stats.totalActivationCodes}`,
            subtitle: "كود متاح للاستخدام",
            icon: KeyRound,
            color: "amber",
            trend: `${codeUsageRate}% مستخدم`,
            trendUp: false,
        },
    ]

    const colorMap = {
        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", bar: "from-emerald-400 to-teal-500" },
        blue: { bg: "bg-blue-500/10", text: "text-blue-500", bar: "from-blue-400 to-indigo-500" },
        violet: { bg: "bg-violet-500/10", text: "text-violet-500", bar: "from-violet-400 to-purple-500" },
        amber: { bg: "bg-amber-500/10", text: "text-amber-500", bar: "from-amber-400 to-orange-500" },
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">
            {/* Welcome Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">مرحباً بعودتك 👋</h1>
                    <p className="text-muted-foreground text-sm mt-1">إليك نظرة عامة على أداء منصتك اليوم</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                        <Activity className="h-3 w-3" />
                        المنصة تعمل بشكل طبيعي
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {mainStats.map((stat) => {
                    const colors = colorMap[stat.color]
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-l ${colors.bar}`} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`h-5 w-5 ${colors.text}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                                    <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                        {stat.trendUp && <ArrowUpLeft className="h-3 w-3" />}
                                        {stat.trend}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Quick Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-muted/30">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">الكورسات</p>
                                <p className="text-xl font-bold mt-1">{stats.totalCourses}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20">{stats.publishedCourses} منشور</Badge>
                            <Badge variant="outline" className="text-[10px]">{stats.totalCourses - stats.publishedCourses} مسودة</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">الباقات</p>
                                <p className="text-xl font-bold mt-1">{stats.totalBundles}</p>
                            </div>
                            <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Badge variant="outline" className="text-[10px]">باقة متاحة</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">الدروس</p>
                                <p className="text-xl font-bold mt-1">{stats.totalLessons}</p>
                            </div>
                            <Video className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                    </CardContent>
                </Card>
                {/* يمكنك إضافة خانة للأجهزة هنا لو حبيت تجيبها من Supabase */}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">أكواد التفعيل</CardTitle>
                        <CardDescription>نسبة استخدام الأكواد (المباعة vs المتاحة)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center py-4">
                            {/* Donut Chart SVG */}
                            <div className="relative h-36 w-36">
                                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                                        className="text-amber-500 transition-all duration-1000 ease-out"
                                        strokeDasharray={`${codeUsageRate * 2.51} 251`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold">{codeUsageRate}%</span>
                                    <span className="text-[10px] text-muted-foreground">مستخدم</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            <div className="text-center p-2.5 rounded-lg bg-muted/40">
                                <p className="text-lg font-bold">{stats.totalActivationCodes}</p>
                                <p className="text-[10px] text-muted-foreground">الكل</p>
                            </div>
                            <div className="text-center p-2.5 rounded-lg bg-emerald-500/5">
                                <p className="text-lg font-bold text-emerald-500">{stats.usedCodes}</p>
                                <p className="text-[10px] text-muted-foreground">مستخدم</p>
                            </div>
                            <div className="text-center p-2.5 rounded-lg bg-amber-500/5">
                                <p className="text-lg font-bold text-amber-500">{stats.unusedCodes}</p>
                                <p className="text-[10px] text-muted-foreground">متاح</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pass Rate Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">نتائج الامتحانات</CardTitle>
                        <CardDescription>معدل نجاح الطلاب في الامتحانات</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center py-4">
                            <div className="relative h-36 w-36">
                                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                                        className="text-emerald-500 transition-all duration-1000 ease-out"
                                        strokeDasharray={`${passRate * 2.51} 251`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold">{passRate}%</span>
                                    <span className="text-[10px] text-muted-foreground">نجاح</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            <div className="text-center p-2.5 rounded-lg bg-muted/40">
                                <p className="text-lg font-bold">{(stats.passedExams + stats.failedExams)}</p>
                                <p className="text-[10px] text-muted-foreground">الكل</p>
                            </div>
                            <div className="text-center p-2.5 rounded-lg bg-emerald-500/5">
                                <p className="text-lg font-bold text-emerald-500">{stats.passedExams}</p>
                                <p className="text-[10px] text-muted-foreground">ناجح</p>
                            </div>
                            <div className="text-center p-2.5 rounded-lg bg-red-500/5">
                                <p className="text-lg font-bold text-red-500">{stats.failedExams}</p>
                                <p className="text-[10px] text-muted-foreground">راسب</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Enrollments */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">آخر الاشتراكات</CardTitle>
                            <CardDescription>أحدث {stats.recentEnrollments?.length || 0} عمليات تسجيل</CardDescription>
                        </div>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentEnrollments?.length > 0 ? (
                                stats.recentEnrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0 shadow-sm">
                                            {enrollment.student?.full_name?.charAt(0) || "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none truncate">
                                                {enrollment.student?.full_name || "مستخدم غير معرف"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                                {enrollment.course?.title || enrollment.bundle?.title || "محتوى محذوف"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <Badge variant="outline" className="text-[10px]">
                                                {enrollment.course ? "كورس" : "باقة"}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(enrollment.activated_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-center text-muted-foreground py-4">لا توجد اشتراكات حتى الآن</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Popular Courses Placeholder (could be real later) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">الكورسات الأكثر طلباً</CardTitle>
                        <CardDescription>قريبا...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                        سيتم تفعيل هذه الإحصائية قريباً
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
