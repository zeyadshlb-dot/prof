"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Bell,
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
    HeadphonesIcon,
    ChevronLeft,
    LayoutDashboard,
    Sparkles,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationsPanel } from "@/components/notifications-panel"
import { getSidebarCounts } from "@/lib/actions"
import { cn } from "@/lib/utils"

const sidebarLinks = [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true, section: "main" },
    { href: "/admin/students", label: "الطلاب", icon: Users, section: "main", countKey: "totalStudents" },
    { href: "/admin/courses", label: "الكورسات", icon: BookOpen, section: "content" },
    { href: "/admin/lessons", label: "الفصول والدروس", icon: Video, section: "content" },
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

function SidebarLink({ href, label, icon: Icon, badge, isMobile = false, isActive = false }) {
    return (
        <Link
            href={href}
            className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isMobile ? "gap-4 px-3" : "",
                isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
            )}
        >
            <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300",
                isActive
                    ? "bg-primary-foreground/15"
                    : "bg-transparent group-hover:bg-muted/60"
            )}>
                <Icon className={cn(
                    "shrink-0 transition-all duration-300 group-hover:scale-110",
                    isMobile ? "h-5 w-5" : "h-4 w-4",
                    isActive ? "text-primary-foreground" : ""
                )} />
            </div>
            <span>{label}</span>
            {badge && badge !== "0" && (
                <Badge className={cn(
                    "mr-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold px-1.5 transition-all",
                    isActive
                        ? "bg-primary-foreground/20 text-primary-foreground border-0"
                        : "bg-primary/10 text-primary border-primary/20"
                )}>
                    {badge}
                </Badge>
            )}
        </Link>
    )
}

function isLinkActive(pathname, href, exact = false) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
}

export default function AdminLayout({ children }) {
    const pathname = usePathname()
    const activeLink = sidebarLinks.find(link => isLinkActive(pathname, link.href, link.exact))
    const [counts, setCounts] = useState({})

    // Fetch sidebar counts
    useEffect(() => {
        getSidebarCounts().then(setCounts)
        const interval = setInterval(() => {
            getSidebarCounts().then(setCounts)
        }, 120000) // every 2 minutes
        return () => clearInterval(interval)
    }, [])

    // Group links by section
    const sections = {}
    sidebarLinks.forEach(link => {
        if (!sections[link.section]) sections[link.section] = []
        sections[link.section].push(link)
    })

    const renderLinks = (links, isMobile = false) => (
        links.map((link) => (
            <SidebarLink
                key={link.href}
                {...link}
                badge={link.countKey && counts[link.countKey] !== undefined ? String(counts[link.countKey]) : undefined}
                isMobile={isMobile}
                isActive={isLinkActive(pathname, link.href, link.exact)}
            />
        ))
    )

    return (
        <div dir="rtl" className="grid min-h-screen w-full md:grid-cols-[272px_1fr] lg:grid-cols-[288px_1fr] font-(family-name:--font-cairo)">
            {/* ==================== DESKTOP SIDEBAR ==================== */}
            <div className="hidden md:block">
                <div className="flex h-screen flex-col sticky top-0 border-l bg-gradient-to-b from-card to-card/95">

                    {/* Logo Section */}
                    <div className="flex h-[72px] items-center gap-3 px-5 border-b">
                        <div className="relative">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                                <GraduationCap className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-extrabold tracking-tight">Prof. Ser</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5 text-primary" />
                                لوحة تحكم المدير
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                        {Object.entries(sections).map(([sectionKey, links]) => (
                            <div key={sectionKey}>
                                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] px-3 mb-2">
                                    {sectionLabels[sectionKey]}
                                </p>
                                <nav className="grid gap-1">
                                    {renderLinks(links)}
                                </nav>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Footer - User Card */}
                    <div className="border-t p-4">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/10 p-3">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 to-transparent" />
                            <div className="relative flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md shadow-primary/20">
                                    م
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">المدير العام</p>
                                    <p className="text-[10px] text-muted-foreground truncate">admin@profser.com</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                                    <LogOut className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== MAIN CONTENT AREA ==================== */}
            <div className="flex flex-col min-h-screen bg-background">

                {/* ===== HEADER ===== */}
                <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b bg-background/60 backdrop-blur-xl px-4 lg:px-6">

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden h-9 w-9 rounded-xl">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">القائمة</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col w-[300px] p-0">
                            {/* Mobile Header */}
                            <div className="flex items-center gap-3 p-5 border-b">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/25">
                                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">Prof. Ser</span>
                                    <span className="text-[10px] text-muted-foreground">لوحة تحكم المدير</span>
                                </div>
                            </div>
                            {/* Mobile Nav */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                                {Object.entries(sections).map(([sectionKey, links]) => (
                                    <div key={sectionKey}>
                                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider px-3 mb-1.5">
                                            {sectionLabels[sectionKey]}
                                        </p>
                                        <nav className="grid gap-1">
                                            {renderLinks(links, true)}
                                        </nav>
                                    </div>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Breadcrumb */}
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                            لوحة التحكم
                        </Link>
                        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/40 rtl:rotate-180" />
                        <span className="font-semibold text-foreground">{activeLink?.label || "الصفحة الحالية"}</span>
                    </div>

                    <div className="flex-1" />

                    {/* Search */}
                    <div className="w-full max-w-xs lg:max-w-sm hidden sm:block">
                        <div className="relative group">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                            <Input
                                placeholder="بحث سريع..."
                                className="pr-9 bg-muted/30 border-transparent focus-visible:border-primary/40 focus-visible:bg-background/80 focus-visible:ring-1 focus-visible:ring-primary/20 h-10 rounded-xl transition-all duration-300 placeholder:text-muted-foreground/50"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity">
                                <span className="text-[10px] bg-background/80 border rounded-md px-1.5 py-0.5 font-mono">⌘K</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <NotificationsPanel />

                        <div className="h-5 w-px bg-border/50 mx-0.5 hidden sm:block" />

                        {/* Theme Toggle */}
                        <ModeToggle />

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-300 mr-1">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md shadow-primary/20">
                                        م
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl">
                                <DropdownMenuLabel className="flex items-center gap-3 p-3">
                                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">م</div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-bold">المدير العام</p>
                                        <p className="text-[10px] text-muted-foreground font-normal">admin@profser.com</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1.5" />
                                <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg py-2.5 focus:bg-primary/10 focus:text-primary transition-colors">
                                    <Settings className="h-4 w-4" />
                                    الإعدادات العامة
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg py-2.5 focus:bg-primary/10 focus:text-primary transition-colors">
                                    <HeadphonesIcon className="h-4 w-4" />
                                    مركز الدعم
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1.5" />
                                <DropdownMenuItem className="gap-2.5 text-destructive cursor-pointer rounded-lg py-2.5 focus:bg-destructive/10 focus:text-destructive transition-colors">
                                    <LogOut className="h-4 w-4" />
                                    تسجيل الخروج
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* ===== MAIN CONTENT ===== */}
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-x-auto bg-gradient-to-b from-muted/20 to-transparent">
                    {children}
                </main>

                {/* ===== FOOTER ===== */}
                <footer className="py-4 text-center border-t bg-card/50 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <Zap className="h-3 w-3 text-primary" />
                        تم التصميم والبرمجة بواسطة{" "}
                        <a
                            href="https://www.facebook.com/zeyad.haytham.abass"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-primary hover:underline underline-offset-2 transition-colors"
                        >
                            زياد شلبي
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    )
}
