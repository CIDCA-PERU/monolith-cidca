'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Aquí podrías enviar el error a un servicio de monitoreo como Sentry
    console.error('Global application error:', error)
  }, [error])

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0B1120] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-8">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Oops!
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Algo salió mal
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm px-4">
            Ha ocurrido un error inesperado en la aplicación. Nuestro equipo ha sido notificado.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 dark:text-white font-bold transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCcw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
