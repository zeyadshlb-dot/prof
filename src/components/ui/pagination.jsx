"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react"

export function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    const getVisiblePages = () => {
        const pages = []
        const maxVisible = 5

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        let end = Math.min(totalPages, start + maxVisible - 1)

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages
    }

    return (
        <div className="flex items-center justify-center gap-1 mt-6 font-(family-name:--font-cairo)">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {getVisiblePages().map(page => (
                <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Button>
            ))}

            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            <span className="text-xs text-muted-foreground mr-3">
                صفحة {currentPage} من {totalPages}
            </span>
        </div>
    )
}
