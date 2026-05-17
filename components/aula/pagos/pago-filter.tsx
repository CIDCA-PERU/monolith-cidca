'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListFilter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const ESTADOS = [
  { value: 'TODOS', label: 'Todos los estados', Icon: ListFilter },
  { 
    value: 'PENDIENTE', 
    label: 'Pendiente',
    svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  { 
    value: 'ENVIADO', 
    label: 'Enviado',
    svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
  },
  { 
    value: 'OBSERVADO', 
    label: 'Observado',
    svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M12 3a9 9 0 110 18 9 9 0 010-18z" /></svg>
  },
  { 
    value: 'ACEPTADO', 
    label: 'Aceptado',
    svg: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
]

export function PagoFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const estado = searchParams.get('estado') || 'TODOS'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = ESTADOS.find(e => e.value === estado)

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'TODOS') {
      params.delete('estado')
    } else {
      params.set('estado', value)
    }
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative inline-block w-full sm:w-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:focus:ring-slate-500"
      >
        <span className="flex items-center gap-2">
          {selectedOption && <span className="text-slate-500 dark:text-white">{selectedOption.svg}</span>}
          {selectedOption?.label}
        </span>
        <ChevronDown 
          className={cn('w-4 h-4 text-slate-500 dark:text-white transition-transform duration-200', isOpen && 'rotate-180')} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden dark:bg-slate-900 dark:border-slate-700">
          {ESTADOS.map((est) => (
            <button
              key={est.value}
              onClick={() => handleSelect(est.value)}
              className={cn(
                'w-full px-4 py-3 flex items-center gap-3 text-sm text-left transition-colors duration-150 border-b border-slate-200 last:border-b-0 dark:border-slate-700',
                estado === est.value
                  ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-800 dark:text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800'
              )}
            >
              <span className="text-slate-500 dark:text-white">{est.svg}</span>
              {est.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}