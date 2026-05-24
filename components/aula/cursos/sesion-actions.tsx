'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { registrarAsistenciaAula, generarAusentesParaHorario } from '@/actions/asistencia.actions'
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
  /** true si el alumno ya registró asistencia en esta sesión (persiste tras F5) */
  yaRegistroAsistencia?: boolean
}

/**
 * Calcula las dos ventanas de tiempo:
 * - mostrarZoom: desde −15 min del inicio hasta el fin de la clase (hor_cur_fin_tmp)
 * - enVentanaAsistencia: desde −15 min del inicio hasta +30 min del inicio
 */
function calcularVentanas(
  fecha: string,
  horaInicio: string,
  horaFin: string
): { mostrarZoom: boolean; enVentanaAsistencia: boolean; minutosDesdeInicio: number } {
  const horaInicioStr = horaInicio.slice(0, 5)
  const horaFinStr    = horaFin.slice(0, 5)

  // Ambas se parsean con offset Lima (UTC-5) para comparar contra new Date() en UTC
  const inicioLima = new Date(`${fecha}T${horaInicioStr}:00-05:00`)
  const finLima    = new Date(`${fecha}T${horaFinStr}:00-05:00`)
  const ahora      = new Date()

  const minutosDesdeInicio = Math.floor((ahora.getTime() - inicioLima.getTime()) / 60000)
  const claseTermino       = ahora >= finLima

  // Zoom aparece desde 15 min antes del inicio hasta que termina la clase
  const mostrarZoom = minutosDesdeInicio >= -15 && !claseTermino

  // Asistencia solo en la primera mitad: hasta +30 min del inicio
  const enVentanaAsistencia = minutosDesdeInicio >= -15 && minutosDesdeInicio <= 30

  return { mostrarZoom, enVentanaAsistencia, minutosDesdeInicio }
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

  // Refs para detectar la transición "en ventana → cerrada" y dispararla una sola vez
  const wasInVentanaRef  = useRef(false)
  const ausentesDisparadoRef = useRef(false)

  const dispararAusentes = () => {
    if (ausentesDisparadoRef.current) return
    if (!sesionFecha || !sesionHoraInicio || !sesionHoraFin) return
    ausentesDisparadoRef.current = true
    generarAusentesParaHorario({
      curIdInt,
      horCurIdInt,
      horaInicio: sesionHoraInicio.slice(0, 5),
      horaFin:    sesionHoraFin.slice(0, 5),
      fecha:      sesionFecha,
    }).catch(console.error)
  }

  // Recalcular ventanas cada 30 segundos
  useEffect(() => {
    if (!sesionFecha || !sesionHoraInicio || !sesionHoraFin) {
      setMostrarZoom(false)
      setEnVentanaAsistencia(false)
      return
    }

    const check = () => {
      const { mostrarZoom: mz, enVentanaAsistencia: eva, minutosDesdeInicio } =
        calcularVentanas(sesionFecha, sesionHoraInicio, sesionHoraFin)

      const ventanaAsistCerro = minutosDesdeInicio > 30

      // Caso 1: Transición dentro → fuera de ventana de asistencia
      if (wasInVentanaRef.current && !eva && ventanaAsistCerro) {
        dispararAusentes()
      }
      // Caso 2: Página cargada ya con ventana de asistencia cerrada
      if (!wasInVentanaRef.current && ventanaAsistCerro && mz) {
        // Solo si la clase aún está en curso (zoom visible) significa q ya pasó la asistencia
        dispararAusentes()
      }
      // Caso 3: Página cargada después de que terminó la clase
      if (!wasInVentanaRef.current && !mz && ventanaAsistCerro) {
        dispararAusentes()
      }

      wasInVentanaRef.current = eva
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

  // No renderizar nada si la clase aún no ha empezado (-15 min) o ya terminó
  if (!mostrarZoom) return null

  return (
    <div className="space-y-2">
      {/* Botón Zoom */}
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

      {/* Botón Marcar Asistencia — solo activo tras click en Zoom Y dentro de la ventana de asistencia */}
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
