"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getRecentActivity } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Bell,
    User,
    CreditCard,
    KeyRound,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    ExternalLink,
    Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const POLL_INTERVAL = 60000 // 1 minute

const typeConfig = {
    new_student: {
        icon: User,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    new_enrollment: {
        icon: CreditCard,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
    },
    code_used: {
        icon: KeyRound,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
    exam_result: {
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
    },
}

function getTimeAgo(dateString) {
    if (!dateString) return ""
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return "الآن"
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} د`
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`
    if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
}

export function NotificationsPanel() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [lastFetch, setLastFetch] = useState(null)
    const [seenIds, setSeenIds] = useState(new Set())
    const router = useRouter()

    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        const result = await getRecentActivity()
        if (result.success) {
            setNotifications(result.notifications)
            setLastFetch(new Date())
        }
        setLoading(false)
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Polling
    useEffect(() => {
        const interval = setInterval(fetchNotifications, POLL_INTERVAL)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Mark all as seen when opening
    const handleOpen = (open) => {
        setIsOpen(open)
        if (open) {
            const ids = new Set(notifications.map(n => n.id))
            setSeenIds(ids)
        }
    }

    const unseenCount = notifications.filter(n => !seenIds.has(n.id)).length

    const handleNotificationClick = (notification) => {
        if (notification.href) {
            router.push(notification.href)
            setIsOpen(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full hover:bg-muted/60 transition-all duration-200"
                >
                    <Bell className={cn(
                        "h-[1.15rem] w-[1.15rem] transition-all duration-300",
                        unseenCount > 0 ? "text-primary animate-[wiggle_1s_ease-in-out]" : "text-muted-foreground"
                    )} />
                    {unseenCount > 0 && (
                        <span className="absolute -top-0.5 -left-0.5 flex items-center justify-center">
                            <span className="absolute h-4.5 w-4.5 rounded-full bg-destructive/30 animate-ping" />
                            <span className="relative h-4.5 w-4.5 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground text-[9px] font-bold shadow-lg">
                                {unseenCount > 9 ? '9+' : unseenCount}
                            </span>
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[380px] sm:w-[420px] p-0 flex flex-col">
                {/* Header */}
                <div className="p-5 pb-3 border-b bg-gradient-to-b from-primary/5 to-transparent">
                    <SheetHeader>
                        <SheetTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Bell className="h-4.5 w-4.5 text-primary" />
                                </div>
                                <div>
                                    <span className="font-bold text-base">الإشعارات</span>
                                    <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                        {lastFetch ? `آخر تحديث: ${getTimeAgo(lastFetch)}` : "جاري التحميل..."}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={(e) => { e.stopPropagation(); fetchNotifications(); }}
                                disabled={loading}
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                            </Button>
                        </SheetTitle>
                    </SheetHeader>

                    {/* Stats bar */}
                    <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0.5">
                            <Sparkles className="h-2.5 w-2.5" />
                            {notifications.length} إشعار
                        </Badge>
                        {unseenCount > 0 && (
                            <Badge className="text-[10px] bg-destructive/15 text-destructive border-destructive/20 gap-1 px-2 py-0.5">
                                {unseenCount} جديد
                            </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground mr-auto flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            تحديث كل دقيقة
                        </span>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <Bell className="h-7 w-7 text-muted-foreground/40" />
                            </div>
                            <p className="font-medium">لا توجد إشعارات</p>
                            <p className="text-xs mt-1">سيتم عرض الإشعارات هنا عند وجود نشاط جديد</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const config = typeConfig[notification.type] || typeConfig.new_student
                                const Icon = notification.type === 'exam_result' && notification.icon === 'x' ? XCircle : config.icon
                                const isNew = !seenIds.has(notification.id)

                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "w-full flex items-start gap-3 p-4 text-right transition-all duration-200 hover:bg-muted/40 group",
                                            isNew && "bg-primary/[0.03]"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110",
                                            config.bg,
                                        )}>
                                            <Icon className={cn("h-4 w-4", config.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{notification.title}</span>
                                                {isNew && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground/70 mt-1.5 flex items-center gap-1">
                                                <Clock className="h-2.5 w-2.5" />
                                                {getTimeAgo(notification.time)}
                                            </span>
                                        </div>
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/50 shrink-0 mt-1 transition-colors" />
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t bg-muted/20">
                    <p className="text-[10px] text-center text-muted-foreground">
                        يتم تحديث الإشعارات تلقائياً كل دقيقة • اضغط على أي إشعار للانتقال
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}
