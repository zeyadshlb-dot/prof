"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowUpDown,
  Trash2,
  CheckCircle2,
  XCircle,
  User,
  FileText,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ExamResultsContent({ initialResults }) {
  const [results, setResults] = useState(initialResults);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // Sorting Logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle nested properties manually if sort key is complex, simple properties work directly
    if (sortConfig.key === "score_percent") {
      aValue = a.score / a.total_score || 0;
      bValue = b.score / b.total_score || 0;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Searching Logic
  const filteredResults = sortedResults.filter((result) => {
    const studentName = result.student?.full_name?.toLowerCase() || "";
    const examName = result.exam?.title?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return studentName.includes(query) || examName.includes(query);
  });

  return (
    <div className="flex flex-col gap-6 font-(family-name:--font-cairo)">
      {/* Header / Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم الطالب أو الامتحان..."
            className="bg-background pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            سجل النتائج
            <Badge variant="secondary" className="text-xs font-normal">
              {filteredResults.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            عرض وتتبع أداء الطلاب في الامتحانات.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>الطالب</TableHead>
                <TableHead>الامتحان</TableHead>
                <TableHead>الدرجة / الإجمالي</TableHead>
                <TableHead>المحاولة</TableHead>
                <TableHead
                  onClick={() => handleSort("score_percent")}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    النسبة %
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead
                  onClick={() => handleSort("created_at")}
                  className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    التاريخ
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    لا توجد نتائج مطابقة.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result, index) => {
                  const percent =
                    Math.round((result.score / result.total_score) * 100) || 0;

                  return (
                    <TableRow key={result.id}>
                      <TableCell className="text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-medium">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {result.student?.full_name || "طالب محذوف"}
                          </div>
                          <span className="text-xs text-muted-foreground pr-5">
                            {result.student?.phone_number || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium">
                            {result.exam?.title || "امتحان محذوف"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold font-mono">
                          {result.score}{" "}
                          <span className="text-muted-foreground font-normal text-xs">
                            / {result.total_score}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          #{result.attempt_number || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-mono text-sm">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span
                            className={
                              percent >= 50
                                ? "text-emerald-600 font-bold"
                                : "text-destructive font-bold"
                            }
                          >
                            {percent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.is_passed ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20"
                          >
                            <CheckCircle2 className="h-3 w-3 ml-1" />
                            ناجح
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                          >
                            <XCircle className="h-3 w-3 ml-1" />
                            راسب
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(result.created_at).toLocaleDateString(
                          "ar-EG",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
