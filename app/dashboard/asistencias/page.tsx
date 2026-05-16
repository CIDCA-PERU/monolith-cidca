'use client'

import { useState, useTransition } from 'react'
import { getSesionesByCurso, getReporteAsistencia } from '@/actions/asistencia.actions'
import { getCursosAdmin } from '@/actions/admin.actions'
import { registrarAsistenciaMasiva } from '@/actions/admin.actions'
import { ClipboardList, CheckCircle2, XCircle, Clock, Save, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

type EstadoAsistencia = 1 | 2 | 3 // 1=Presente, 2=Ausente, 3=Tardanza

interface EstudianteAsistencia {
  usr_uuid: string
  nombre: string
  estado: EstadoAsistencia
}

const ESTADOS: { value: EstadoAsistencia; label: string; icon: React.ElementType; color: string }[] = [
  { value: 1, label: 'Presente', icon: CheckCircle2, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  { value: 3, label: 'Tardanza', icon: Clock,         color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  { value: 2, label: 'Ausente',  icon: XCircle,       color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' },
]

export default function AsistenciasPage() {
  const [sesionUuid, setSesionUuid] = useState('')
  const [sesiones, setSesiones] = useState<any[]>([])
  const [estudiantes, setEstudiantes] = useState<EstudianteAsistencia[]>([])
  const [loadingSesiones, setLoadingSesiones] = useState(false)
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Seleccionar sesión y cargar reporte
  const handleSesionSelect = async (uuid: string) => {
    setSesionUuid(uuid)
    if (!uuid) { setEstudiantes([]); return }

    setLoadingEstudiantes(true)
    try {
      const res = await getReporteAsistencia(uuid)
      if (res.success && res.data) {
        // Mapear reporte a la estructura local
        const mapped: EstudianteAsistencia[] = (res.data.estudiantes ?? []).map((e: any) => ({
          usr_uuid: e.usr_uuid ?? e.usr_id_int?.toString() ?? '',
          nombre: e.nombre ?? e.usr_nomb_vac ?? '—',
          estado: (e.asist_est_int ?? 2) as EstadoAsistencia,
        }))
        setEstudiantes(mapped)
      } else {
        toast.error(res.error ?? 'Error al cargar reporte')
      }
    } finally {
      setLoadingEstudiantes(false)
    }
  }

  const toggleEstado = (uuid: string, nuevo: EstadoAsistencia) => {
    setEstudiantes((prev) =>
      prev.map((e) => (e.usr_uuid === uuid ? { ...e, estado: nuevo } : e))
    )
  }

  const marcarTodos = (estado: EstadoAsistencia) => {
    setEstudiantes((prev) => prev.map((e) => ({ ...e, estado })))
  }

  const handleGuardar = () => {
    if (!sesionUuid || estudiantes.length === 0) return
    startTransition(async () => {
      const res = await registrarAsistenciaMasiva(
        sesionUuid,
        estudiantes.map((e) => ({ usuarioUuid: e.usr_uuid, estado: e.estado }))
      )
      if (res.success) {
        toast.success(`Asistencia registrada — ${res.registrados} estudiante${res.registrados !== 1 ? 's' : ''}`)
      } else {
        toast.error(res.error ?? 'Error al guardar')
      }
    })
  }

  const presentes = estudiantes.filter((e) => e.estado === 1).length
  const tardes = estudiantes.filter((e) => e.estado === 3).length
  const ausentes = estudiantes.filter((e) => e.estado === 2).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Asistencias</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Registra y gestiona la asistencia por sesión de clase
        </p>
      </div>

      {/* Selector de sesión */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Seleccionar sesión
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ingresa el UUID de la sesión de clase o usa el selector de curso para buscar sesiones disponibles.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={sesionUuid}
              onChange={(e) => setSesionUuid(e.target.value)}
              placeholder="UUID de la sesión de clase..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
            />
          </div>
          <button
            onClick={() => handleSesionSelect(sesionUuid)}
            disabled={!sesionUuid || loadingEstudiantes}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {loadingEstudiantes ? 'Cargando...' : 'Cargar sesión'}
          </button>
        </div>
      </div>

      {/* Lista de asistencia */}
      {estudiantes.length > 0 && (
        <>
          {/* Resumen + acciones masivas */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                ✓ {presentes} presentes
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                ⏰ {tardes} tardanza
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                ✗ {ausentes} ausentes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Marcar todos:</span>
              {ESTADOS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => marcarTodos(e.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${e.color}`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de asistencia */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado de asistencia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {estudiantes.map((est) => (
                  <tr key={est.usr_uuid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {est.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{est.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {ESTADOS.map((estado) => {
                          const Icon = estado.icon
                          const active = est.estado === estado.value
                          return (
                            <button
                              key={estado.value}
                              onClick={() => toggleEstado(est.usr_uuid, estado.value)}
                              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                                ${active ? estado.color + ' shadow-sm' : 'text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}
                              `}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {estado.label}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end">
            <button
              onClick={handleGuardar}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar asistencia'}
            </button>
          </div>
        </>
      )}

      {/* Estado vacío inicial */}
      {estudiantes.length === 0 && !loadingEstudiantes && (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Selecciona una sesión de clase para gestionar la asistencia
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Ingresa el UUID de la sesión en el campo de arriba
          </p>
        </div>
      )}
    </div>
  )
}
