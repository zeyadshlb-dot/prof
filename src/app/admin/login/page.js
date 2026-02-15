"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Loader2, Eye, EyeOff, Lock, Fingerprint } from "lucide-react"

// ===== بيانات الدخول الثابتة =====
const ADMIN_ID = "PROF-2026-ADMIN"
const ADMIN_PASS = "ser@admin#2026"
// ==================================

export default function AdminLogin() {
    const router = useRouter()
    const [adminId, setAdminId] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [mounted, setMounted] = useState(false)
    const [shake, setShake] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Simulate network delay for UX
        await new Promise((r) => setTimeout(r, 1200))

        if (adminId === ADMIN_ID && password === ADMIN_PASS) {
            document.cookie = "admin_session=true; path=/; max-age=604800" // 7 days
            router.push("/admin")
            router.refresh()
        } else {
            setError("بيانات الدخول غير صحيحة")
            setShake(true)
            setTimeout(() => setShake(false), 600)
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden" dir="rtl">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-[#0a0a0f]">
                {/* Gradient Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-600/20 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-cyan-500/15 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-fuchsia-500/10 to-transparent blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Noise Overlay */}
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
                />
            </div>

            {/* Login Card */}
            <div className={`relative z-10 w-full max-w-[420px] mx-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                {/* Card Glow Effect */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] pointer-events-none" />
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-violet-500/20 via-transparent to-cyan-500/10 opacity-50 blur-sm pointer-events-none" />

                <div className="relative rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-black/40 overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

                    <div className="p-8 sm:p-10">
                        {/* Icon & Title */}
                        <div className="text-center mb-10">
                            <div className="relative inline-flex mb-5">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <Fingerprint className="h-8 w-8 text-violet-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-[#0a0a0f] animate-pulse" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                مركز التحكم
                            </h1>
                            <p className="text-sm text-white/40 mt-2">
                                أدخل بيانات الاعتماد للوصول إلى لوحة الإدارة
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in slide-in-from-top-2">
                                    <Shield className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Admin ID Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                                    معرّف المدير
                                </label>
                                <div className="relative group">
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={adminId}
                                        onChange={(e) => setAdminId(e.target.value)}
                                        disabled={loading}
                                        placeholder="PROF-XXXX-XXXX"
                                        className="w-full h-12 pr-11 pl-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-left font-mono text-sm tracking-wider focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/10 transition-all duration-300 disabled:opacity-50"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                                    كلمة المرور
                                </label>
                                <div className="relative group">
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        placeholder="••••••••••"
                                        className="w-full h-12 pr-11 pl-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-left font-mono text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/10 transition-all duration-300 disabled:opacity-50"
                                        dir="ltr"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full h-12 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 disabled:opacity-70 group"
                            >
                                {/* Button Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 transition-opacity group-hover:opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {/* Shine Effect */}
                                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
                                <span className="relative flex items-center justify-center gap-2 text-white">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            جاري التحقق...
                                        </>
                                    ) : (
                                        "تسجيل الدخول"
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Footer Note */}
                        <p className="text-center text-[11px] text-white/20 mt-8">
                            الوصول مقيّد للمسؤولين فقط • اتصال مشفّر
                        </p>
                    </div>
                </div>
            </div>

            {/* Shake Animation */}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    )
}
