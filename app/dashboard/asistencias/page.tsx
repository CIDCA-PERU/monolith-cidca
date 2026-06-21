'use client'

import { useState, useTransition, useEffect } from 'react'
import { getSesionesByCurso, getReporteAsistencia } from '@/actions/asistencia.actions'
import { getCursosSelectAdmin, registrarAsistenciaMasiva } from '@/actions/admin.actions'
import { ClipboardList, CheckCircle2, XCircle, Clock, Save, BookOpen, CalendarDays, Search } from 'lucide-react'
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
  const [cursoId, setCursoId] = useState('')
  const [sesionUuid, setSesionUuid] = useState('')
  const [cursos, setCursos] = useState<any[]>([])
  const [sesiones, setSesiones] = useState<any[]>([])
  const [estudiantes, setEstudiantes] = useState<EstudianteAsistencia[]>([])
  const [originalEstudiantes, setOriginalEstudiantes] = useState<EstudianteAsistencia[]>([])
  const [loadingCursos, setLoadingCursos] = useState(true)
  const [loadingSesiones, setLoadingSesiones] = useState(false)
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isPending, startTransition] = useTransition()

  // Load courses on mount
  useEffect(() => {
    getCursosSelectAdmin().then((res) => {
      if (res.success && res.data) setCursos(res.data)
      setLoadingCursos(false)
    })
  }, [])

  const handleCursoChange = async (id: string) => {
    setCursoId(id)
    setSesionUuid('')
    setEstudiantes([])
    setOriginalEstudiantes([])
    setSesiones([])
    if (!id) return

    setLoadingSesiones(true)
    try {
      const res = await getSesionesByCurso(id)
      if (res.success && res.data) {
        setSesiones(res.data)
      } else {
        toast.error(res.error || 'Error al cargar las sesiones')
      }
    } catch (e: any) {
      toast.error('Error de red al cargar sesiones')
    } finally {
      setLoadingSesiones(false)
    }
  }

  // Seleccionar sesión y cargar reporte
  const handleSesionSelect = async (uuid: string) => {
    setSesionUuid(uuid)
    if (!uuid) { 
      setEstudiantes([])
      setOriginalEstudiantes([])
      return 
    }

    setLoadingEstudiantes(true)
    try {
      const res = await getReporteAsistencia(uuid)
      if (res.success && res.data) {
        // Mapear reporte a la estructura local
        const mapped: EstudianteAsistencia[] = (res.data.registros ?? []).map((e: any) => {
          let estadoAsistencia = 2; // Default Ausente en UI
          if (e.asist_est_int === 1) estadoAsistencia = 1; // Presente
          else if (e.asist_est_int === 2) estadoAsistencia = 3; // Tardanza

          return {
            usr_uuid: e.usr_uuid ?? '',
            nombre: `${e.estu_apell_pat_vac} ${e.estu_apell_mat_vac ?? ''}, ${e.estu_nomb_vac}`.trim(),
            estado: estadoAsistencia as EstadoAsistencia,
          };
        })
        setEstudiantes(mapped)
        setOriginalEstudiantes(JSON.parse(JSON.stringify(mapped))) // Guardar estado original
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

    // Solo enviar los que cambiaron de estado
    const modificados = estudiantes.filter((e) => {
      const original = originalEstudiantes.find(o => o.usr_uuid === e.usr_uuid)
      return !original || original.estado !== e.estado
    })

    if (modificados.length === 0) {
      toast.info('No hay cambios para guardar')
      return
    }

    startTransition(async () => {
      // Mapear estados de UI a DB
      // UI: 1=Presente, 2=Ausente, 3=Tardanza
      // DB: 1=Presente, 0=Ausente, 2=Tardanza
      const dbPayload = modificados.map((e) => {
        let dbEstado = 0 // Ausente
        if (e.estado === 1) dbEstado = 1 // Presente
        else if (e.estado === 3) dbEstado = 2 // Tardanza

        return { usuarioUuid: e.usr_uuid, estado: dbEstado }
      })

      const res = await registrarAsistenciaMasiva(sesionUuid, dbPayload)
      if (res.success) {
        toast.success(`Asistencia actualizada — ${res.registrados} cambios guardados`)
        // Actualizar el estado original al nuevo estado para futuras modificaciones
        setOriginalEstudiantes((prev) => 
          prev.map(o => {
            const mod = modificados.find(m => m.usr_uuid === o.usr_uuid)
            return mod ? { ...o, estado: mod.estado } : o
          })
        )
      } else {
        toast.error(res.error ?? 'Error al guardar')
      }
    })
  }

  // Calcular si hay cambios actuales para mostrar los botones condicionalmente
  const modificadosActuales = estudiantes.filter((e) => {
    const original = originalEstudiantes.find(o => o.usr_uuid === e.usr_uuid)
    return !original || original.estado !== e.estado
  })

  const presentes = estudiantes.filter((e) => e.estado === 1).length
  const tardes = estudiantes.filter((e) => e.estado === 3).length
  const ausentes = estudiantes.filter((e) => e.estado === 2).length

  // Pagination logic
  const filteredEstudiantes = estudiantes.filter(e => e.nombre.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filteredEstudiantes.length / pageSize)
  const paginatedEstudiantes = filteredEstudiantes.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Asistencias</h1>
        <p className="mt-1 text-sm text-black dark:text-white">
          Registra y gestiona la asistencia por sesión de clase
        </p>
      </div>

      {/* Selector de sesión */}
      <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
          Seleccionar sesión
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Curso Selector */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Curso
            </label>
            <select
              suppressHydrationWarning
              value={cursoId}
              onChange={(e) => handleCursoChange(e.target.value)}
              disabled={loadingCursos}
              className="w-full rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
            >
              <option value="">Selecciona un curso...</option>
              {cursos.map((c) => (
                <option key={c.cur_uuid} value={c.cur_uuid}>
                  {c.cur_nomb_vac}
                </option>
              ))}
            </select>
          </div>

          {/* Sesión Selector */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Sesión de clase
            </label>
            <select
              suppressHydrationWarning
              value={sesionUuid}
              onChange={(e) => {
                setSesionUuid(e.target.value)
                handleSesionSelect(e.target.value)
              }}
              disabled={!cursoId || loadingSesiones}
              className="w-full rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition disabled:opacity-50"
            >
              <option value="">Selecciona una sesión...</option>
              {sesiones.map((s) => (
                <option key={s.ses_id_int} value={s.ses_id_int}>
                  {`Sesión del ${new Date(s.ses_fecha_dat).toLocaleDateString('es-PE')} (${s.ses_hora_inic_tmp})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sesionUuid && !loadingEstudiantes && estudiantes.length > 0 && (
          <div className="relative w-full sm:max-w-xs mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50 dark:text-white/50" />
            <input
              type="text"
              placeholder="Buscar alumno en esta sesión..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-sky-950 border border-sky-200 dark:border-sky-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
            />
          </div>
        )}
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
              <span className="text-xs text-black dark:text-white font-medium">Marcar todos:</span>
              {ESTADOS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => marcarTodos(e.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${e.color}`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de asistencia */}
          <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Estado de asistencia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-200 dark:divide-sky-900">
                {paginatedEstudiantes.map((est) => (
                  <tr key={est.usr_uuid} className="hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-black dark:text-white">
                            {est.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-black dark:text-white">{est.nombre}</span>
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
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                                ${active ? estado.color + ' shadow-sm' : 'text-black dark:text-white border-sky-200 dark:border-sky-900 hover:border-sky-200 dark:border-sky-900 dark:hover:border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950'}
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

          {/* Controles de paginación */}
          <div className="flex items-center justify-between px-2 py-3 border-t border-sky-100 dark:border-sky-900/50 mt-2">
            <span className="text-sm text-black/60 dark:text-white/60">
              Mostrando {filteredEstudiantes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} a {Math.min(currentPage * pageSize, filteredEstudiantes.length)} de {filteredEstudiantes.length} alumnos
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-black dark:text-white border-sky-200 dark:border-sky-900 cursor-pointer"
              >
                Anterior
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-black dark:text-white border-sky-200 dark:border-sky-900 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>

          {/* Botones de acción inferior */}
          {modificadosActuales.length > 0 && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEstudiantes(JSON.parse(JSON.stringify(originalEstudiantes)))}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-sky-200 dark:border-sky-900 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-black dark:text-white text-sm font-bold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black dark:text-white text-sm font-bold shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isPending ? 'Guardando...' : `Guardar asistencia (${modificadosActuales.length})`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Estado vacío inicial */}
      {estudiantes.length === 0 && !loadingEstudiantes && (
        <div className="rounded-xl border border-dashed border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-black dark:text-white mx-auto mb-4" />
          <p className="text-black dark:text-white font-medium">
            Selecciona una sesión de clase para gestionar la asistencia
          </p>
          <p className="text-sm text-black dark:text-white mt-1">
            Selecciona un curso y luego una sesión en los menús desplegables
          </p>
        </div>
      )}
    </div>
  )
}
