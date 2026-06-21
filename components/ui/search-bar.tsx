'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar({ placeholder = 'Buscar...' }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const initialSearch = searchParams.get('search') ?? ''
  const [term, setTerm] = useState(initialSearch)
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    setTerm(searchParams.get('search') ?? '')
  }, [searchParams])

  useEffect(() => {
    // Only push if term actually differs from what's in the URL
    const currentParams = new URLSearchParams(searchParamsString)
    const currentSearch = currentParams.get('search') ?? ''
    if (term === currentSearch) return

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParamsString)
      if (term) {
        params.set('search', term)
      } else {
        params.delete('search')
      }
      params.delete('page') // reset page only when the user types a new search
      router.push(`${pathname}?${params.toString()}`)
    }, 400) // 400ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [term, pathname, router, searchParamsString])

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50 dark:text-white/50" />
      <input
        type="text"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-sky-950 border border-sky-200 dark:border-sky-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
      />
    </div>
  )
}
