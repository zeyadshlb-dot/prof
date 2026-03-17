"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Trash2,
    Search,
    Smartphone,
    Monitor,
    RefreshCcw,
    AlertTriangle,
    User
} from "lucide-react"
import { deleteDevice, deleteStudentDevices, deleteAllDevices } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DevicesContent({ initialDevices }) {
    const [devices, setDevices] = useState(initialDevices)
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    // 1. Group devices by student
    const groupedDevices = devices.reduce((acc, device) => {
        const studentId = device.student_id;
        if (!acc[studentId]) {
            acc[studentId] = {
                student: device.student,
                devices: []
            };
        }
        acc[studentId].devices.push(device);
        return acc;
    }, {});

    const groups = Object.values(groupedDevices);

    // 2. Filter groups
    const filteredGroups = groups.filter(group => {
        const query = searchQuery.toLowerCase();
        return group.student?.full_name?.toLowerCase().includes(query) ||
            group.student?.phone_number?.includes(query);
    });

    // Actions
    const handleDeleteDevice = async (deviceId) => {
        if (!confirm("هل أنت متأكد من حذف هذا الجهاز؟")) return;

        const result = await deleteDevice(deviceId);
        if (result.success) {
            setDevices(devices.filter(d => d.id !== deviceId));
            toast({ title: "تم الحذف", description: result.message });
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" });
        }
    }

    const handleDeleteStudentDevices = async (studentId) => {
        setLoading(true);
        const result = await deleteStudentDevices(studentId);
        if (result.success) {
            setDevices(devices.filter(d => d.student_id !== studentId));
            toast({ title: "تم التصفير", description: result.message, variant: "success" });
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" });
        }
        setLoading(false);
    }

    const handleResetAll = async () => {
        setLoading(true);
        const result = await deleteAllDevices();
        if (result.success) {
            setDevices([]); // Clear all locally
            toast({ title: "تم المسح الشامل", description: result.message, variant: "success" });
        } else {
            toast({ title: "خطأ", description: result.message, variant: "destructive" });
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث باسم الطالب أو رقم الهاتف..."
                        className="bg-background pr-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2 w-full sm:w-auto">
                            <AlertTriangle className="h-4 w-4" />
                            تصفير جميع الأجهزة (Danger)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>تحذير شديد! 🚨</AlertDialogTitle>
                            <AlertDialogDescription>
                                أنت على وشك حذف جميع الأجهزة المسجلة لكل الطلاب في النظام.
                                <br />
                                هذا سيجبر جميع الطلاب على تسجيل الدخول مرة أخرى من أجهزتهم.
                                <br /><br />
                                <strong>هل أنت متأكد تماماً؟</strong>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetAll} className="bg-destructive hover:bg-destructive/90">
                                نعم، احذف الكل
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Students List */}
            <div className="grid gap-4">
                {filteredGroups.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
                        لا توجد أجهزة مسجلة تطابق بحثك.
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <Card key={group.student?.id || Math.random()} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{group.student?.full_name || "مستخدم محذوف"}</CardTitle>
                                            <CardDescription>{group.student?.phone_number || "-"}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {group.devices.length} جهاز
                                        </Badge>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20 ml-2">
                                                    <RefreshCcw className="h-3.5 w-3.5 ml-1" />
                                                    تصفير الطالب
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>تصفير أجهزة الطالب؟</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        سيتم حذف {group.devices.length} جهاز مسجل للطالب "{group.student?.full_name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteStudentDevices(group.student?.id)} className="bg-primary">
                                                        تأكيد التصفير
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-muted/10">
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>الجهاز / المتصفح</TableHead>
                                            <TableHead>آخر دخول</TableHead>
                                            <TableHead className="text-right">إجراء</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.devices.map((device, index) => (
                                            <TableRow key={device.id}>
                                                <TableCell className="text-muted-foreground font-medium pl-4">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {device.device_name?.toLowerCase().includes('mobile') || device.device_name?.toLowerCase().includes('android') || device.device_name?.toLowerCase().includes('iphone') ? (
                                                            <Smartphone className="h-4 w-4 text-violet-500" />
                                                        ) : (
                                                            <Monitor className="h-4 w-4 text-blue-500" />
                                                        )}
                                                        <span className="font-medium text-sm">{device.device_name || "غير معروف"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {device.last_active ? new Date(device.last_active).toLocaleString('ar-EG') : 'منذ فترة'}
                                                </TableCell>
                                                <TableCell className="text-right pr-4">
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteDevice(device.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
