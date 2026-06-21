'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  totalPages: number
}

export function Pagination({ totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10

  const createPageUrl = (page: number, newLimit?: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    if (newLimit) {
      params.set('limit', newLimit.toString())
    }
    return `${pathname}?${params.toString()}`
  }

  const navigate = (page: number) => {
    if (page < 1 || page > totalPages) return
    router.push(createPageUrl(page))
  }

  const changeLimit = (newLimit: number) => {
    router.push(createPageUrl(1, newLimit))
  }

  // Generate page numbers to show (e.g. 1 2 3 ... 10)
  const renderPages = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => navigate(i)}
          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-amber-500 text-black dark:text-white'
              : 'text-black dark:text-white hover:bg-sky-100 dark:hover:bg-sky-900/50'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="flex items-center gap-2 text-sm text-black dark:text-white">
        <span className="opacity-70">Mostrar</span>
        <select
          value={limit}
          onChange={(e) => changeLimit(Number(e.target.value))}
          className="border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="opacity-70">por página</span>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => navigate(1)}
          disabled={currentPage <= 1}
          title="Primera página"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-sky-200 dark:border-sky-900 text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Página anterior"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-sky-200 dark:border-sky-900 text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {renderPages()}

        <button
          onClick={() => navigate(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Página siguiente"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-sky-200 dark:border-sky-900 text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate(totalPages)}
          disabled={currentPage >= totalPages}
          title="Última página"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-sky-200 dark:border-sky-900 text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
