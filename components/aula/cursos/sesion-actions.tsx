'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { registrarAsistenciaAula } from '@/actions/asistencia.actions'
import { toast } from 'sonner'

interface SesionActionsProps {
  zoomUrl: string | null
  /** ID entero del curso (cur_id_int) */
  curIdInt: number
  /** ID del horario_curso que aplica hoy */
  horCurIdInt: number
  /** "YYYY-MM-DD" en hora Lima */
  sesionFecha: string | null
  /** "HH:MM" — hora de inicio del horario */
  sesionHoraInicio: string | null
  /** "HH:MM" — hora de fin del horario */
  sesionHoraFin: string | null
  /** true si el alumno ya tiene estado > 0 (presente o tardanza) para esta sesión */
  yaRegistroAsistencia?: boolean
}

/**
 * Calcula las dos ventanas de tiempo:
 * - mostrarZoom: desde −15 min del inicio hasta el fin de la clase
 * - enVentanaAsistencia: desde −15 min del inicio hasta +30 min del inicio
 *
 * La hora de la sesión está en Lima (UTC-5) → se añade -05:00 al parsear.
 * Comparar contra new Date() (UTC) es correcto porque ambos son epoch.
 */
function calcularVentanas(
  fecha: string,
  horaInicio: string,
  horaFin: string
): { mostrarZoom: boolean; enVentanaAsistencia: boolean } {
  const inicioLima = new Date(`${fecha}T${horaInicio.slice(0, 5)}:00-05:00`)
  const finLima    = new Date(`${fecha}T${horaFin.slice(0, 5)}:00-05:00`)
  const ahora      = new Date()

  const minutosDesdeInicio = Math.floor((ahora.getTime() - inicioLima.getTime()) / 60000)
  const claseTermino       = ahora >= finLima

  return {
    // Zoom: desde -15 min hasta que termina la clase
    mostrarZoom: minutosDesdeInicio >= -15 && !claseTermino,
    // Asistencia: solo en los primeros 30 min desde el inicio
    enVentanaAsistencia: minutosDesdeInicio >= -15 && minutosDesdeInicio <= 30,
  }
}

export function SesionActions({
  zoomUrl,
  curIdInt,
  horCurIdInt,
  sesionFecha,
  sesionHoraInicio,
  sesionHoraFin,
  yaRegistroAsistencia = false,
}: SesionActionsProps) {
  const [zoomClicked, setZoomClicked] = useState(false)
  // Inicializar con el valor del servidor para persistir estado tras F5
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(yaRegistroAsistencia)
  const [mostrarZoom, setMostrarZoom]                   = useState(false)
  const [enVentanaAsistencia, setEnVentanaAsistencia]   = useState(false)
  const [isPending, startTransition]                    = useTransition()

  // Recalcular ventanas cada 30 segundos
  useEffect(() => {
    if (!sesionFecha || !sesionHoraInicio || !sesionHoraFin) {
      setMostrarZoom(false)
      setEnVentanaAsistencia(false)
      return
    }

    const check = () => {
      const { mostrarZoom: mz, enVentanaAsistencia: eva } =
        calcularVentanas(sesionFecha, sesionHoraInicio, sesionHoraFin)
      setMostrarZoom(mz)
      setEnVentanaAsistencia(eva)
    }

    check() // verificar inmediatamente al montar
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [sesionFecha, sesionHoraInicio, sesionHoraFin])

  const handleZoomClick = () => {
    setZoomClicked(true)
    if (zoomUrl) {
      window.open(zoomUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleMarcarAsistencia = () => {
    if (!sesionFecha || !sesionHoraInicio || !sesionHoraFin) {
      toast.error('No hay clase programada para registrar asistencia.')
      return
    }

    startTransition(async () => {
      const result = await registrarAsistenciaAula({
        curIdInt,
        horCurIdInt,
        horaInicio: sesionHoraInicio.slice(0, 5),
        horaFin:    sesionHoraFin.slice(0, 5),
        fecha:      sesionFecha,
      })

      if (result.success) {
        setAsistenciaRegistrada(true)
        toast.success(result.mensaje)
      } else {
        toast.error(result.razon_rechazo ?? result.mensaje)
      }
    })
  }

  // No renderizar nada si la clase aún no ha empezado o ya terminó
  if (!mostrarZoom) return null

  return (
    <div className="space-y-2">
      {/* Botón Zoom — visible hasta que termina la clase */}
      <Button
        onClick={handleZoomClick}
        disabled={!zoomUrl}
        className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 gap-2 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {zoomUrl ? (
          <>
            <Play className="h-5 w-5" />
            Ir a la Reunión
            <ExternalLink className="h-4 w-4 opacity-70" />
          </>
        ) : (
          <>
            <Play className="h-5 w-5 opacity-50" />
            Sin enlace de la Reunión
          </>
        )}
      </Button>

      {/* Botón Marcar Asistencia — solo durante los primeros 30 min */}
      {enVentanaAsistencia && (
        <Button
          onClick={handleMarcarAsistencia}
          disabled={!zoomClicked || asistenciaRegistrada || isPending}
          variant="outline"
          className={`w-full h-12 gap-2 font-semibold transition-all cursor-pointer
            ${asistenciaRegistrada
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : zoomClicked
                ? 'border-accent hover:bg-accent/5 hover:border-accent text-slate-900 dark:text-white'
                : 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
        >
          {isPending ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Registrando...</>
          ) : asistenciaRegistrada ? (
            <><CheckCircle className="h-5 w-5" /> Asistencia registrada ✓</>
          ) : (
            <><CheckCircle className="h-5 w-5" /> Marcar Asistencia</>
          )}
        </Button>
      )}

      {/* Hint contextual */}
      <p className={`text-xs text-center transition-colors ${
        zoomClicked && !asistenciaRegistrada && enVentanaAsistencia
          ? 'text-amber-600 dark:text-amber-400 font-medium'
          : 'text-muted-foreground'
      }`}>
        {asistenciaRegistrada
          ? '✓ Ya marcaste tu asistencia para esta sesión.'
          : !enVentanaAsistencia
            ? 'El registro de asistencia ya cerró.'
            : zoomClicked
              ? '¡Enlace abierto! Ahora puedes marcar tu asistencia.'
              : '💡 Primero ingresa a la reunión para habilitar el registro de asistencia.'}
      </p>
    </div>
  )
}
