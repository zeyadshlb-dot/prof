"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getRecentActivity } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Smartphone,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 60000; // 1 minute

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
  device_registered: {
    icon: Smartphone,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  lesson_completed: {
    icon: Trophy,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
};

function getTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "الآن";
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} د`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
  return date.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [seenIds, setSeenIds] = useState(new Set());
  const router = useRouter();

  // Persistent seen status
  useEffect(() => {
    const saved = localStorage.getItem("admin_seen_notifications");
    if (saved) {
      try {
        setSeenIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Error parsing seen notifications", e);
      }
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const result = await getRecentActivity();
    if (result.success) {
      setNotifications(result.notifications);
      setLastFetch(new Date());
    }
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling
  useEffect(() => {
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark all as seen when opening
  const handleOpen = (open) => {
    setIsOpen(open);
    if (open) {
      const allIds = notifications.map((n) => n.id);
      const newSeenIds = new Set([...Array.from(seenIds), ...allIds]);
      setSeenIds(newSeenIds);
      localStorage.setItem(
        "admin_seen_notifications",
        JSON.stringify(Array.from(newSeenIds)),
      );
    }
  };

  const unseenCount = notifications.filter((n) => !seenIds.has(n.id)).length;

  const handleNotificationClick = (notification) => {
    if (notification.href) {
      router.push(notification.href);
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-muted/60 transition-all duration-300 active:scale-95"
        >
          <Bell
            className={cn(
              "h-5 w-5 transition-all duration-300",
              unseenCount > 0
                ? "text-primary animate-pulse"
                : "text-muted-foreground",
            )}
          />
          {unseenCount > 0 && (
            <span className="absolute top-1 left-1 flex items-center justify-center">
              <span className="absolute h-4 w-4 rounded-full bg-destructive/40 animate-ping" />
              <span className="relative h-4 w-4 rounded-full bg-linear-to-tr from-destructive to-rose-400 flex items-center justify-center text-white text-[8px] font-black shadow-md border-[1.5px] border-background">
                {unseenCount > 9 ? "9+" : unseenCount}
              </span>
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[440px] p-0 flex flex-col border-r-0 shadow-2xl overflow-hidden bg-background/95 backdrop-blur-xl"
      >
        {/* Header Decoration */}
        <div className="absolute top-0 right-0 left-0 h-32 bg-linear-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 pb-4 border-b">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center shadow-inner">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <span className="font-black text-xl tracking-tight">
                    النشاط الأخير
                  </span>
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {lastFetch
                      ? `محدث ${getTimeAgo(lastFetch)}`
                      : "جاري تحميل النشاط..."}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-primary/5 border-primary/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchNotifications();
                }}
                disabled={loading}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 text-primary",
                    loading && "animate-spin",
                  )}
                />
              </Button>
            </SheetTitle>
          </SheetHeader>

          {/* Stats pills */}
          <div className="flex items-center gap-2 mt-5">
            <div className="flex -space-x-1.5 children:ring-2 children:ring-background overflow-hidden">
              {notifications.slice(0, 3).map((n, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px]",
                    typeConfig[n.type]?.bg || "bg-muted",
                  )}
                >
                  <span className={cn("font-bold", typeConfig[n.type]?.color)}>
                    •
                  </span>
                </div>
              ))}
            </div>
            <Badge
              variant="secondary"
              className="text-[10px] font-bold bg-muted/50 rounded-lg px-2 shadow-sm border-none"
            >
              {notifications.length} إجمالي
            </Badge>
            {unseenCount > 0 && (
              <Badge className="text-[10px] font-black bg-destructive text-white border-0 shadow-sm animate-bounce-slow">
                {unseenCount} جديد
              </Badge>
            )}
            <div className="mr-auto flex items-center gap-1.5 opacity-60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold">مباشر</span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20 opacity-80">
              <div className="h-20 w-20 rounded-3xl bg-muted/20 flex items-center justify-center mb-5 rotate-12 transition-transform hover:rotate-0 duration-500">
                <Sparkles className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="font-bold text-lg text-foreground/80">
                هدوء تام...
              </p>
              <p className="text-sm mt-1.5 px-10 text-center">
                لا توجد تنبيهات حالياً، سنخبرك فور حدوث أي نشاط جديد في منصتك.
              </p>
            </div>
          ) : (
            <div className="px-3 space-y-1">
              {notifications.map((notification) => {
                const config =
                  typeConfig[notification.type] || typeConfig.new_student;
                const Icon =
                  notification.type === "exam_result" &&
                  notification.icon === "x"
                    ? XCircle
                    : config.icon;
                const isNew = !seenIds.has(notification.id);

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-2xl text-right transition-all duration-300 group relative overflow-hidden",
                      isNew
                        ? "bg-primary/4 hover:bg-primary/8"
                        : "hover:bg-muted/50",
                    )}
                  >
                    {isNew && (
                      <div className="absolute top-0 right-0 bottom-0 w-1 bg-primary rounded-full my-4" />
                    )}

                    <div
                      className={cn(
                        "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition-all duration-500 shadow-sm border border-transparent group-hover:shadow-md group-hover:scale-105 group-hover:rotate-3",
                        config.bg,
                        isNew && "ring-2 ring-primary/5",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[13px] font-bold tracking-tight",
                            isNew ? "text-foreground" : "text-foreground/80",
                          )}
                        >
                          {notification.title}
                        </span>
                        {isNew && (
                          <span className="flex h-2 w-2 rounded-full bg-primary shadow-sm" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-1 leading-relaxed line-clamp-2",
                          isNew
                            ? "text-foreground/90 font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-[10px] font-bold text-muted-foreground/70 flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded-md">
                          <Clock className="h-2.5 w-2.5" />
                          {getTimeAgo(notification.time)}
                        </span>
                      </div>
                    </div>
                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <ExternalLink className="h-4 w-4 text-primary/60" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/10 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
            <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
            تحديث تلقائي مفعّل
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
