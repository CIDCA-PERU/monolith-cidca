'use client'

import Link from 'next/link'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0B1120] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-sky-100 dark:bg-sky-500/10 rounded-full flex items-center justify-center mb-8">
          <FileQuestion className="h-12 w-12 text-sky-600 dark:text-sky-400" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Página no encontrada
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Lo sentimos, la página que intentas buscar no existe, ha sido movida o no tienes permisos para verla.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 dark:text-white font-bold transition-all shadow-md hover:shadow-lg"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}
