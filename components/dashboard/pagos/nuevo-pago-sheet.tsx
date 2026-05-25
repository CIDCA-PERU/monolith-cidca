'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import {
  PagoAdminDto,
  EstudianteSelectDto,
  CursoSelectDto,
  getEstudiantesSelectAdmin,
  getCursosSelectAdmin,
  crearPagoAdmin,
} from '@/actions/admin.actions'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  PlusCircle, CreditCard, User, BookOpen,
  Hash, DollarSign, AlertCircle, Loader2, CheckCircle2,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Combobox simple (búsqueda en lista) ──────────────────────────────────────

function SearchSelect({
  label,
  icon: Icon,
  placeholder,
  items,
  value,
  onChange,
  disabled,
}: {
  label: string
  icon: React.ElementType
  placeholder: string
  items: { id: number; label: string }[]
  value: number | null
  onChange: (id: number | null) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = query
    ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : items

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = items.find((i) => i.id === value)

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label} <span className="text-red-500 ml-0.5">*</span>
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 disabled:opacity-50"
        >
          <span className={selected ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
            {selected ? selected.label : placeholder}
          </span>
          <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <ul className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-400 text-center">Sin resultados</li>
              ) : (
                filtered.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => { onChange(item.id); setOpen(false); setQuery('') }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      item.id === value
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sheet de nuevo pago ──────────────────────────────────────────────────────

export function NuevoPagoSheet({
  pagosExistentes,
  onCreado,
}: {
  pagosExistentes: PagoAdminDto[]   // para validar duplicados en cliente
  onCreado: (nuevoPago: PagoAdminDto) => void
}) {
  const [open, setOpen]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [isPending, start]        = useTransition()
  const [estudiantes, setEstud]   = useState<EstudianteSelectDto[]>([])
  const [cursos, setCursos]       = useState<CursoSelectDto[]>([])

  // Campos del formulario
  const [estuId, setEstuId]       = useState<number | null>(null)
  const [curId, setCurId]         = useState<number | null>(null)
  const [monto, setMonto]         = useState('')
  const [nro, setNro]             = useState('')
  const [estado, setEstado]       = useState<'PENDIENTE' | 'ACEPTADO'>('PENDIENTE')
  const [obs, setObs]             = useState('')

  // Cargar listas cuando el sheet abre
  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([getEstudiantesSelectAdmin(), getCursosSelectAdmin()]).then(([eRes, cRes]) => {
      if (eRes.success) setEstud(eRes.data ?? [])
      if (cRes.success) setCursos(cRes.data ?? [])
      setLoading(false)
    })
  }, [open])

  // Pre-rellenar monto con precio del curso seleccionado
  useEffect(() => {
    if (!curId) return
    const cur = cursos.find((c) => c.cur_id_int === curId)
    if (cur && cur.cur_precio_num > 0) setMonto(String(cur.cur_precio_num))
  }, [curId, cursos])

  // Verificar si ya existe pago (cliente)
  const yaExiste = estuId !== null && curId !== null &&
    pagosExistentes.some((p) => p.estu_id_int === estuId && p.cur_id_int === curId)

  const reset = () => {
    setEstuId(null); setCurId(null)
    setMonto(''); setNro(''); setObs('')
    setEstado('PENDIENTE')
  }

  const handleClose = () => { setOpen(false); reset() }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!estuId || !curId) {
      toast.error('Selecciona un alumno y un curso')
      return
    }
    if (yaExiste) {
      toast.error('Este alumno ya tiene un pago para ese curso')
      return
    }
    start(async () => {
      const res = await crearPagoAdmin({
        estuIdInt:    estuId,
        curIdInt:     curId,
        pagoMontNum:  Number(monto) || 0,
        pagoNroVac:   nro.trim()  || undefined,
        pagoEstadVac: estado,
        pagoObsVac:   obs.trim()  || undefined,
      })
      if (res.success) {
        toast.success('Pago registrado correctamente')
        // Construir el objeto para actualizar la lista local
        const est  = estudiantes.find((e) => e.estu_id_int === estuId)
        const cur  = cursos.find((c) => c.cur_id_int === curId)
        const parts = est?.nombre_completo.split(' ') ?? []
        onCreado({
          pago_uuid:           crypto.randomUUID(),
          pago_id_int:         0,
          estu_id_int:         estuId,
          cur_id_int:          curId,
          pago_nro_vac:        nro.trim() || null,
          pago_mont_num:       Number(monto) || 0,
          pago_estad_vac:      estado,
          pago_url_vac:        null,
          pago_obs_vac:        obs.trim() || null,
          pago_cre_tmp:        new Date().toISOString(),
          pago_upd_tmp:        new Date().toISOString(),
          estudiante_nombre:   parts[0] ?? '',
          estudiante_apellidos: parts.slice(1).join(' '),
          curso_nombre:        cur?.cur_nomb_vac ?? '—',
        })
        handleClose()
      } else {
        toast.error(res.error ?? 'Error al crear pago')
      }
    })
  }

  return (
    <>
      {/* Botón disparador */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg transition-all"
      >
        <PlusCircle className="h-4 w-4" />
        Nuevo pago
      </button>

      <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <SheetTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Registrar nuevo pago
            </SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              Crea un pago manualmente para un alumno en un curso.
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Cargando datos...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 py-5">
              {/* Alumno */}
              <SearchSelect
                label="Alumno"
                icon={User}
                placeholder="Buscar alumno..."
                items={estudiantes.map((e) => ({ id: e.estu_id_int, label: e.nombre_completo }))}
                value={estuId}
                onChange={(id) => { setEstuId(id); setCurId(null) }}
              />

              {/* Curso */}
              <SearchSelect
                label="Curso"
                icon={BookOpen}
                placeholder="Seleccionar curso..."
                items={cursos.map((c) => ({ id: c.cur_id_int, label: c.cur_nomb_vac }))}
                value={curId}
                onChange={setCurId}
                disabled={!estuId}
              />

              {/* Advertencia de duplicado */}
              {yaExiste && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Este alumno ya tiene un pago registrado para este curso. No se puede duplicar.
                </div>
              )}

              {/* Monto */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <DollarSign className="h-3.5 w-3.5" />
                  Monto (S/)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
                />
              </div>

              {/* Nro. de orden */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Hash className="h-3.5 w-3.5" />
                  Nro. de orden <span className="text-slate-400 font-normal normal-case ml-1">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={nro}
                  onChange={(e) => setNro(e.target.value)}
                  placeholder="OP-2025-001"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-mono transition"
                />
              </div>

              {/* Estado inicial */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Estado inicial
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PENDIENTE', 'ACEPTADO'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEstado(s)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        estado === s
                          ? s === 'ACEPTADO'
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                      }`}
                    >
                      {s === 'ACEPTADO' ? 'Aceptado' : 'Pendiente'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Observaciones <span className="text-slate-400 font-normal normal-case ml-1">(opcional)</span>
                </label>
                <textarea
                  rows={2}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Notas internas..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 resize-none transition"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending || yaExiste || !estuId || !curId}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-md hover:shadow-lg"
              >
                {isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                  : <><CreditCard className="h-4 w-4" /> Registrar pago</>
                }
              </button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
