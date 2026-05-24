/**
 * Constantes compartidas para el módulo de asistencias.
 * Separadas del archivo 'use server' porque Next.js solo permite
 * exportar async functions desde archivos con esa directiva.
 */

export const ESTADO_ASISTENCIA: Record<number, string> = {
  1: 'Presente',
  2: 'Tardanza',
  0: 'Ausente',
}

export const ESTADO_ASISTENCIA_CONFIG = {
  1: { label: 'Presente', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  2: { label: 'Tardanza', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  0: { label: 'Ausente',  color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
} as const
