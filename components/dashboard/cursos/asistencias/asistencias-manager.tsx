'use client'

import { useState } from 'react'
import { SesionClaseDto, ReporteAsistenciaDto, AsistenciaRegistroDto } from '@/dto/asistencia.dto'
import { updateAsistenciaManual, crearSesionClase } from '@/actions/asistencia.actions'
import { getReporteAsistencia } from '@/actions/asistencia.actions'
import { ESTADO_ASISTENCIA } from '@/lib/asistencia.constants'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  CalendarDays,
  Clock,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
} from 'lucide-react'

interface SesionConReporte {
  sesion: SesionClaseDto
  reporte: ReporteAsistenciaDto
}

interface AsistenciasManagerProps {
  cursoId: string
  initialSesiones: SesionConReporte[]
}

const ESTADO_CONFIG = {
  1: { label: 'Presente', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: CheckCircle2 },
  2: { label: 'Tardanza', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: AlertCircle },
  0: { label: 'Ausente', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: MinusCircle },
}

const ESTADO_SESION_CONFIG: Record<string, { color: string; label: string }> = {
  PROGRAMADA: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', label: 'Programada' },
  EN_PROGRESO: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', label: 'En Progreso' },
  FINALIZADA: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400', label: 'Finalizada' },
}

export function AsistenciasManager({ cursoId, initialSesiones }: AsistenciasManagerProps) {
  const [sesiones, setSesiones] = useState<SesionConReporte[]>(initialSesiones)
  const [expandida, setExpandida] = useState<number | null>(null)
  const [loadingAsist, setLoadingAsist] = useState<number | null>(null)
  const [showCrear, setShowCrear] = useState(false)
  const [creando, setCreando] = useState(false)

  const [nuevaSesion, setNuevaSesion] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
  })

  const toggleExpand = (sesId: number) => {
    setExpandida(expandida === sesId ? null : sesId)
  }

  const handleCambiarEstado = async (
    sesionIdx: number,
    registro: AsistenciaRegistroDto,
    nuevoEstado: number
  ) => {
    setLoadingAsist(registro.asist_id_int)
    try {
      const result = await updateAsistenciaManual(
        registro.asist_id_int,
        nuevoEstado,
        registro.asist_est_int
      )
      if (result.success) {
        // Recargar el reporte de esa sesión
        const reporte = await getReporteAsistencia(String(registro.ses_id_int))
        if (reporte.success && reporte.data) {
          setSesiones((prev) =>
            prev.map((s, i) =>
              i === sesionIdx ? { ...s, reporte: reporte.data! } : s
            )
          )
        }
        toast.success(`Asistencia actualizada a "${ESTADO_ASISTENCIA[nuevoEstado]}"`)
      } else {
        toast.error(result.error || 'Error al actualizar')
      }
    } finally {
      setLoadingAsist(null)
    }
  }

  const handleCrearSesion = async () => {
    if (!nuevaSesion.fecha || !nuevaSesion.hora_inicio || !nuevaSesion.hora_fin) {
      toast.error('Completa todos los campos de la sesión')
      return
    }
    setCreando(true)
    try {
      const result = await crearSesionClase(
        cursoId,
        nuevaSesion.fecha,
        nuevaSesion.hora_inicio,
        nuevaSesion.hora_fin
      )
      if (result.success) {
        toast.success('Sesión creada correctamente')
        // Agregar la nueva sesión al estado
        const nuevaEntry: SesionConReporte = {
          sesion: {
            ses_id_int: result.ses_id_int!,
            asist_uuid: '',
            ses_fecha_dat: nuevaSesion.fecha,
            ses_hora_inic_tmp: nuevaSesion.hora_inicio,
            ses_hora_fin_tmp: nuevaSesion.hora_fin,
            ses_estado_vac: 'PROGRAMADA',
            puede_asistir: false,
            minutos_antes_inicio: 0,
            minutos_desde_inicio: 0,
          },
          reporte: {
            ses_id_int: result.ses_id_int!,
            ses_fecha_dat: nuevaSesion.fecha,
            total_estudiantes: 0,
            presentes: 0,
            ausentes: 0,
            tardios: 0,
            porcentaje_asistencia: 0,
            registros: [],
          },
        }
        setSesiones((prev) => [nuevaEntry, ...prev])
        setShowCrear(false)
        setNuevaSesion({ fecha: '', hora_inicio: '', hora_fin: '' })
      } else {
        toast.error(result.error || 'Error al crear sesión')
      }
    } finally {
      setCreando(false)
    }
  }

  const totalSesiones = sesiones.length
  const promedioAsistencia =
    totalSesiones > 0
      ? Math.round(sesiones.reduce((sum, s) => sum + s.reporte.porcentaje_asistencia, 0) / totalSesiones)
      : 0

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="px-4 py-3 flex flex-col items-center justify-center text-center">
          <CalendarDays className="h-5 w-5 text-amber-500 mb-1" />
          <span className="text-2xl font-bold text-foreground">{totalSesiones}</span>
          <span className="text-xs text-muted-foreground">Sesiones totales</span>
        </Card>
        <Card className="px-4 py-3 flex flex-col items-center justify-center text-center">
          <UserCheck className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{promedioAsistencia}%</span>
          <span className="text-xs text-muted-foreground">Asistencia promedio</span>
        </Card>
        <Card className="px-4 py-3 flex flex-col items-center justify-center text-center">
          <Users className="h-5 w-5 text-blue-500 mb-1" />
          <span className="text-2xl font-bold text-foreground">
            {sesiones.reduce((sum, s) => sum + s.reporte.total_estudiantes, 0)}
          </span>
          <span className="text-xs text-muted-foreground">Registros totales</span>
        </Card>
      </div>

      {/* Botón crear sesión */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCrear(!showCrear)}
          className="cursor-pointer gap-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva Sesión
        </Button>
      </div>

      {/* Formulario crear sesión */}
      {showCrear && (
        <Card className="px-4 py-4 border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-semibold text-foreground mb-3">Crear Nueva Sesión</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Fecha</Label>
              <Input
                type="date"
                value={nuevaSesion.fecha}
                onChange={(e) => setNuevaSesion((prev) => ({ ...prev, fecha: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Hora Inicio</Label>
              <Input
                type="time"
                value={nuevaSesion.hora_inicio}
                onChange={(e) => setNuevaSesion((prev) => ({ ...prev, hora_inicio: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Hora Fin</Label>
              <Input
                type="time"
                value={nuevaSesion.hora_fin}
                onChange={(e) => setNuevaSesion((prev) => ({ ...prev, hora_fin: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowCrear(false)} className="cursor-pointer text-xs">
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={creando}
              onClick={handleCrearSesion}
              className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs"
            >
              {creando ? 'Creando...' : 'Crear Sesión'}
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de sesiones */}
      {sesiones.length === 0 ? (
        <Card className="px-4 py-10 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No hay sesiones registradas para este curso.</p>
          <p className="text-xs text-muted-foreground mt-1">Crea la primera sesión con el botón de arriba.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sesiones.map((entry, idx) => {
            const { sesion, reporte } = entry
            const estadoSesConfig = ESTADO_SESION_CONFIG[sesion.ses_estado_vac] ?? ESTADO_SESION_CONFIG.PROGRAMADA
            const isExpanded = expandida === sesion.ses_id_int
            const pct = reporte.porcentaje_asistencia

            return (
              <Card key={sesion.ses_id_int} className="overflow-hidden">
                {/* Header de la sesión */}
                <button
                  type="button"
                  onClick={() => toggleExpand(sesion.ses_id_int)}
                  className="cursor-pointer w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-sm text-foreground">
                          {new Date(sesion.ses_fecha_dat + 'T00:00:00').toLocaleDateString('es-PE', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoSesConfig.color}`}>
                          {estadoSesConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {sesion.ses_hora_inic_tmp} – {sesion.ses_hora_fin_tmp}
                        <span className="ml-3 text-muted-foreground">
                          {reporte.total_estudiantes} registros
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Mini barra de asistencia */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{reporte.presentes}P</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">{reporte.tardios}T</span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">{reporte.ausentes}A</span>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground font-medium w-7">{pct}%</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {reporte.registros.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">
                        No hay registros de asistencia para esta sesión.
                      </p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/40">
                            <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs">Estudiante</th>
                            <th className="text-center px-4 py-2 font-semibold text-muted-foreground text-xs">Estado actual</th>
                            <th className="text-center px-4 py-2 font-semibold text-muted-foreground text-xs">Cambiar a</th>
                            <th className="text-right px-4 py-2 font-semibold text-muted-foreground text-xs">Registrado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.registros.map((reg) => {
                            const estadoConf = ESTADO_CONFIG[reg.asist_est_int as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG[0]
                            return (
                              <tr key={reg.asist_id_int} className="border-t border-border/40 hover:bg-muted/10">
                                <td className="px-4 py-2 font-medium text-foreground">
                                  {reg.estu_apell_pat_vac}, {reg.estu_nomb_vac}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${estadoConf.color}`}>
                                    {reg.asist_est_int === 1 && <CheckCircle2 className="h-3 w-3" />}
                                    {reg.asist_est_int === 2 && <AlertCircle className="h-3 w-3" />}
                                    {reg.asist_est_int === 0 && <MinusCircle className="h-3 w-3" />}
                                    {estadoConf.label}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <div className="flex justify-center gap-1">
                                    {[1, 2, 0].map((estado) => {
                                      if (estado === reg.asist_est_int) return null
                                      const conf = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG]
                                      return (
                                        <button
                                          key={estado}
                                          type="button"
                                          disabled={loadingAsist === reg.asist_id_int}
                                          onClick={() => handleCambiarEstado(idx, reg, estado)}
                                          className={`cursor-pointer text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${conf.color} border-current opacity-70 hover:opacity-100`}
                                        >
                                          {conf.label}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                                  {new Date(reg.asist_cre_tmp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
