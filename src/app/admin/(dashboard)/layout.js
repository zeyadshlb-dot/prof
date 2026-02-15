"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Home,
    Menu,
    Package,
    Users,
    BookOpen,
    Layers,
    KeyRound,
    CreditCard,
    FileCheck,
    Smartphone,
    GraduationCap,
    Video,
    Search,
    LogOut,
    Settings,
    ChevronLeft,
    LayoutDashboard,
    Zap,
    X,
    Moon,
    Sun,
    Bell,
    ChevronDown,
    PanelLeftClose,
    PanelLeft,
    FolderOpen,
} from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { getSidebarCounts } from "@/lib/actions"
import { cn } from "@/lib/utils"

const sidebarLinks = [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true, section: "main" },
    { href: "/admin/students", label: "الطلاب", icon: Users, section: "main", countKey: "totalStudents" },
    { href: "/admin/courses", label: "الكورسات", icon: BookOpen, section: "content" },
    { href: "/admin/lessons", label: "الفصول والدروس", icon: FolderOpen, section: "content" },
    { href: "/admin/categories", label: "التصنيفات", icon: Layers, section: "content" },
    { href: "/admin/bundles", label: "الباقات", icon: Package, section: "content" },
    { href: "/admin/activation-codes", label: "أكواد التفعيل", icon: KeyRound, section: "sales", countKey: "unusedCodes" },
    { href: "/admin/enrollments", label: "الاشتراكات", icon: CreditCard, section: "sales", countKey: "totalEnrollments" },
    { href: "/admin/exam-results", label: "نتائج الامتحانات", icon: FileCheck, section: "analytics" },
    { href: "/admin/devices", label: "الأجهزة", icon: Smartphone, section: "analytics" },
]

const sectionLabels = {
    main: "القائمة الرئيسية",
    content: "إدارة المحتوى",
    sales: "المبيعات",
    analytics: "التحليلات",
}

const sectionIcons = {
    main: "🏠",
    content: "📚",
    sales: "💰",
    analytics: "📊",
}

function isLinkActive(pathname, href, exact = false) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
}

export default function AdminLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const activeLink = sidebarLinks.find(link => isLinkActive(pathname, link.href, link.exact))
    const [counts, setCounts] = useState({})
    const [mobileOpen, setMobileOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        getSidebarCounts().then(setCounts)
        const interval = setInterval(() => {
            getSidebarCounts().then(setCounts)
        }, 120000)
        return () => clearInterval(interval)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    const handleLogout = () => {
        document.cookie = "admin_session=; path=/; max-age=0"
        router.push("/admin/login")
    }

    const sections = {}
    sidebarLinks.forEach(link => {
        if (!sections[link.section]) sections[link.section] = []
        sections[link.section].push(link)
    })

    return (
        <div dir="rtl" className="min-h-screen bg-background font-[family-name:var(--font-cairo)]">

            {/* ==================== SIDEBAR ==================== */}
            {/* Desktop */}
            <aside className={cn(
                "fixed top-0 right-0 z-50 h-screen hidden md:flex flex-col transition-all duration-300 ease-in-out",
                collapsed ? "w-[72px]" : "w-[264px]"
            )}>
                {/* Sidebar Background */}
                <div className="absolute inset-0 bg-card/95 dark:bg-[#111318]/95 backdrop-blur-xl border-l border-border/40" />

                {/* Content */}
                <div className="relative flex flex-col h-full">
                    {/* Logo */}
                    <div className={cn(
                        "flex items-center h-16 px-4 border-b border-border/30",
                        collapsed ? "justify-center" : "gap-3"
                    )}>
                        <div className="relative shrink-0">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold tracking-tight truncate">Prof. Ser</span>
                                <span className="text-[10px] text-muted-foreground truncate">لوحة التحكم</span>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={() => setCollapsed(true)}
                                className="mr-auto h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                            >
                                <PanelLeftClose className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-3 px-2.5 scrollbar-thin">
                        {Object.entries(sections).map(([sectionKey, links]) => (
                            <div key={sectionKey} className="mb-4">
                                {!collapsed && (
                                    <div className="flex items-center gap-1.5 px-3 mb-1.5">
                                        <span className="text-xs">{sectionIcons[sectionKey]}</span>
                                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                                            {sectionLabels[sectionKey]}
                                        </span>
                                    </div>
                                )}
                                <nav className="space-y-0.5">
                                    {links.map((link) => {
                                        const Icon = link.icon
                                        const active = isLinkActive(pathname, link.href, link.exact)
                                        const badge = link.countKey && counts[link.countKey] !== undefined ? String(counts[link.countKey]) : undefined

                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                title={collapsed ? link.label : undefined}
                                                className={cn(
                                                    "group flex items-center rounded-xl transition-all duration-200 relative",
                                                    collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5",
                                                    active
                                                        ? "bg-gradient-to-l from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/15"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "shrink-0 transition-transform group-hover:scale-110",
                                                    collapsed ? "h-5 w-5" : "h-4 w-4"
                                                )} />
                                                {!collapsed && (
                                                    <>
                                                        <span className="text-[13px] font-medium">{link.label}</span>
                                                        {badge && badge !== "0" && (
                                                            <span className={cn(
                                                                "mr-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                                                                active
                                                                    ? "bg-white/20 text-white"
                                                                    : "bg-violet-500/10 text-violet-500"
                                                            )}>
                                                                {badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                                {/* Active Indicator */}
                                                {active && !collapsed && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-1 rounded-full bg-violet-400" />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="border-t border-border/30 p-3">
                        {collapsed ? (
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={() => setCollapsed(false)}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                >
                                    <PanelLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
                                    title="تسجيل الخروج"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-gradient-to-br from-accent/50 to-accent/20 p-3 border border-border/30">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                        م
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate">المدير العام</p>
                                        <p className="text-[10px] text-muted-foreground truncate">Prof. Ser Admin</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                                        title="تسجيل الخروج"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ==================== MOBILE OVERLAY ==================== */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

                    {/* Menu */}
                    <div className="absolute top-0 right-0 h-full w-[280px] bg-card dark:bg-[#111318] border-l border-border/40 shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-border/30">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-sm">Prof. Ser</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Mobile Nav */}
                        <div className="overflow-y-auto h-[calc(100%-64px)] py-3 px-2.5">
                            {Object.entries(sections).map(([sectionKey, links]) => (
                                <div key={sectionKey} className="mb-4">
                                    <div className="flex items-center gap-1.5 px-3 mb-1.5">
                                        <span className="text-xs">{sectionIcons[sectionKey]}</span>
                                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                                            {sectionLabels[sectionKey]}
                                        </span>
                                    </div>
                                    <nav className="space-y-0.5">
                                        {links.map((link) => {
                                            const Icon = link.icon
                                            const active = isLinkActive(pathname, link.href, link.exact)
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200",
                                                        active
                                                            ? "bg-gradient-to-l from-violet-600 to-indigo-600 text-white shadow-md"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    <span className="text-sm font-medium">{link.label}</span>
                                                </Link>
                                            )
                                        })}
                                    </nav>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== MAIN AREA ==================== */}
            <div className={cn(
                "min-h-screen flex flex-col transition-all duration-300",
                collapsed ? "md:mr-[72px]" : "md:mr-[264px]"
            )}>

                {/* ===== HEADER ===== */}
                <header className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center border border-border/50 hover:bg-accent transition-colors"
                    >
                        <Menu className="h-4 w-4" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors text-xs">
                            لوحة التحكم
                        </Link>
                        {activeLink && activeLink.label !== "الرئيسية" && (
                            <>
                                <ChevronLeft className="h-3 w-3 text-muted-foreground/40 rtl:rotate-180" />
                                <span className="font-semibold text-foreground text-xs">{activeLink.label}</span>
                            </>
                        )}
                    </div>

                    {/* Mobile Title */}
                    <span className="md:hidden font-semibold text-sm">{activeLink?.label || "لوحة التحكم"}</span>

                    <div className="flex-1" />

                    {/* Search */}
                    <div className="hidden sm:block w-full max-w-[280px]">
                        <div className="relative group">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                placeholder="بحث سريع..."
                                className="w-full h-9 pr-9 pl-3 rounded-xl bg-accent/40 border-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:bg-accent focus:ring-1 focus:ring-violet-500/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        >
                            <Sun className="h-4 w-4 block dark:hidden" />
                            <Moon className="h-4 w-4 hidden dark:block" />
                        </button>

                        {/* Notifications */}
                        <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-background" />
                        </button>

                        <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />

                        {/* User Avatar */}
                        <button className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm hover:shadow-md hover:shadow-violet-600/20 transition-all">
                            م
                        </button>
                    </div>
                </header>

                {/* ===== CONTENT ===== */}
                <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
                    {children}
                </main>

                {/* ===== FOOTER ===== */}
                <footer className="py-3 text-center border-t border-border/30">
                    <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                        <Zap className="h-3 w-3 text-violet-500" />
                        تم التصميم والبرمجة بواسطة{" "}
                        <a
                            href="https://www.facebook.com/zeyad.haytham.abass"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-violet-500 hover:underline underline-offset-2"
                        >
                            زياد شلبي
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    )
}
