"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Loader2, AlertCircle } from "lucide-react"

export default function LoginForm() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // لوجين وهمي للتيست
        if (email === "admin@admin.com" && password === "admin") {
            // تسجيل كوكي وهمية
            document.cookie = "admin_session=true; path=/; max-age=86400" // يوم كامل

            setTimeout(() => {
                router.push("/admin")
                router.refresh()
            }, 1000)
        } else {
            setError("بيانات الدخول غير صحيحة (جرب: admin@admin.com / admin)")
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen font-(family-name:--font-cairo) bg-muted/20" dir="rtl">
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="mx-auto w-full max-w-sm shadow-xl border-border/40 bg-card/80 backdrop-blur-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary/10 p-3 rounded-2xl shadow-sm">
                                <GraduationCap className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">تسجيل دخول (تيست)</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            استخدم البيانات دي للتجربة:
                            <br />
                            <span className="font-mono text-xs bg-muted px-1 rounded">admin@admin.com</span> / <span className="font-mono text-xs bg-muted px-1 rounded">admin</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="grid gap-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@admin.com"
                                    required
                                    className="h-10 text-left"
                                    dir="ltr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="h-10 text-left font-sans"
                                    dir="ltr"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full h-10 text-base font-semibold transition-all hover:scale-[1.02] shadow-sm" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        جاري الدخول...
                                    </span>
                                ) : (
                                    "دخول سريع 🚀"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
