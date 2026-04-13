'use client'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    const getPageNumbers = (): number[] => {
        return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            if (totalPages <= 5) return i + 1
            if (currentPage <= 3) return i + 1
            if (currentPage >= totalPages - 2) return totalPages - 4 + i
            return currentPage - 2 + i
        })
    }

    return (
        <div className="mt-12 flex items-center justify-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Předchozí
            </button>

            <div className="flex gap-2">
                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl transition-all ${
                            currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Další
            </button>
        </div>
    )
}
