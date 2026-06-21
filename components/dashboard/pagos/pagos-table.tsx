'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import {
  PagoAdminDto,
  actualizarEstadoPago,
  editarPagoAdmin,
  eliminarPagoAdmin,
  getVoucherSignedUrl,
} from '@/actions/admin.actions'
import { NuevoPagoSheet } from '@/components/dashboard/pagos/nuevo-pago-sheet'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  CreditCard, ExternalLink, FileImage, CheckCircle2,
  Clock, AlertCircle, Loader2, ImageOff,
  Pencil, Trash2, Hash, DollarSign, TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'

// --- Badge de estado ----------------------------------------------------------

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    ACEPTADO:  { label: 'Aceptado',  className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
    PENDIENTE: { label: 'Pendiente', className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', icon: Clock },
    OBSERVADO: { label: 'Observado', className: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20', icon: AlertCircle },
    // compatibilidad con registros viejos
    PAGADO:    { label: 'Aceptado',  className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
    ENVIADO:   { label: 'Enviado',   className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', icon: FileImage },
  }
  const cfg = map[estado] ?? map.PENDIENTE
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// --- Previsualización del comprobante -----------------------------------------

function VoucherPreview({ pagoUuid, hasVoucher }: { pagoUuid: string; hasVoucher: boolean }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(false)

  useEffect(() => {
    if (!hasVoucher) return
    setLoading(true)
    setError(false)
    getVoucherSignedUrl(pagoUuid).then((res) => {
      if (res.success && res.url) setSignedUrl(res.url)
      else setError(true)
      setLoading(false)
    })
  }, [pagoUuid, hasVoucher])

  if (!hasVoucher) return (
    <div className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border border-dashed border-sky-200 dark:border-sky-900 text-black dark:text-white">
      <ImageOff className="h-8 w-8" />
      <p className="text-xs">Sin comprobante adjunto</p>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-40 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950">
      <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white" />
    </div>
  )

  if (error || !signedUrl) return (
    <div className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border border-dashed border-red-200 dark:border-red-500/20 text-red-400">
      <AlertCircle className="h-8 w-8" />
      <p className="text-xs">No se pudo cargar el comprobante</p>
    </div>
  )

  // Determinar si es imagen o PDF
  const isPdf = signedUrl.includes('.pdf') || signedUrl.includes('application/pdf')

  if (isPdf) {
    return (
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors"
      >
        <FileImage className="h-4 w-4 flex-shrink-0" />
        Ver comprobante PDF
        <ExternalLink className="h-3.5 w-3.5 ml-auto flex-shrink-0" />
      </a>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950">
        <Image
          src={signedUrl}
          alt="Comprobante de pago"
          fill
          className="object-contain"
          unoptimized // URL firmada temporal — no cachear
        />
      </div>
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        Abrir en tamaño completo
      </a>
    </div>
  )
}

// --- Sheet de detalle / edición -----------------------------------------------

function PagoSheet({
  pago,
  open,
  onClose,
  onUpdate,
  onDelete,
}: {
  pago: PagoAdminDto | null
  open: boolean
  onClose: () => void
  onUpdate: (uuid: string, changes: Partial<PagoAdminDto>) => void
  onDelete: (uuid: string) => void
}) {
  const [obs, setObs]         = useState('')
  const [monto, setMonto]     = useState('')
  const [nro, setNro]         = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const [isPending, start]    = useTransition()
  const [isDeleting, startDel] = useTransition()
  const [isSaving, startSave] = useTransition()

  // Sincronizar campos cuando cambia el pago seleccionado
  useEffect(() => {
    setObs(pago?.pago_obs_vac ?? '')
    setMonto(String(pago?.pago_mont_num ?? ''))
    setNro(pago?.pago_nro_vac ?? '')
    setConfirmDel(false)
  }, [pago?.pago_uuid])

  if (!pago) return null

  const esPendiente = pago.pago_estad_vac === 'PENDIENTE'

  // -- Cambiar estado -----------------------------------------------------------
  const handleEstado = (nuevoEstado: 'ACEPTADO' | 'OBSERVADO' | 'PENDIENTE') => {
    start(async () => {
      const res = await actualizarEstadoPago(pago.pago_uuid, nuevoEstado, obs || undefined)
      if (res.success) {
        toast.success(`Pago marcado como ${nuevoEstado}`)
        onUpdate(pago.pago_uuid, { pago_estad_vac: nuevoEstado, pago_obs_vac: obs || pago.pago_obs_vac })
        onClose()
      } else {
        toast.error(res.error ?? 'Error al actualizar')
      }
    })
  }

  // -- Guardar cambios de datos --------------------------------------------------
  const handleGuardar = () => {
    startSave(async () => {
      const res = await editarPagoAdmin(pago.pago_uuid, {
        pagoMontNum: Number(monto) || 0,
        pagoNroVac:  nro.trim()   || null,
        pagoObsVac:  obs.trim()   || null,
      })
      if (res.success) {
        toast.success('Pago actualizado correctamente')
        onUpdate(pago.pago_uuid, {
          pago_mont_num: Number(monto) || 0,
          pago_nro_vac:  nro.trim()   || null,
          pago_obs_vac:  obs.trim()   || null,
        })
        onClose()
      } else {
        toast.error(res.error ?? 'Error al guardar')
      }
    })
  }

  // -- Eliminar ------------------------------------------------------------------
  const handleEliminar = () => {
    startDel(async () => {
      const res = await eliminarPagoAdmin(pago.pago_uuid)
      if (res.success) {
        toast.success('Pago eliminado')
        onDelete(pago.pago_uuid)
        onClose()
      } else {
        toast.error(res.error ?? 'Error al eliminar')
        setConfirmDel(false)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-white dark:bg-sky-950 border-sky-200 dark:border-sky-900 overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-sky-200 dark:border-sky-900">
          <SheetTitle className="text-black dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            Gestión de pago
          </SheetTitle>
          <SheetDescription className="text-black dark:text-white">
            {pago.estudiante_apellidos} {pago.estudiante_nombre} — {pago.curso_nombre}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-5">

          {/* -- Editar datos ----------------------------------------------- */}
          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
              <Pencil className="h-3.5 w-3.5" />
              Datos del pago
            </p>

            {/* Monto */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                <DollarSign className="h-3 w-3" />
                Monto (S/)
              </label>
              <input
                type="number" min="0" step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
              />
            </div>

            {/* Nro. orden */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                <Hash className="h-3 w-3" />
                Nro. de orden
              </label>
              <input
                type="text"
                value={nro}
                onChange={(e) => setNro(e.target.value)}
                placeholder="OP-2025-001"
                className="w-full rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-mono transition"
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black dark:text-white uppercase tracking-wider block">
                Observaciones
              </label>
              <textarea
                rows={2}
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Notas internas..."
                className="w-full rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 resize-none transition"
              />
            </div>

            <button
              onClick={handleGuardar}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-100 dark:bg-sky-900 dark:bg-sky-950 hover:bg-sky-50 dark:hover:bg-sky-900/40 disabled:opacity-40 text-white font-semibold text-sm transition-all"
            >
              {isSaving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                : <><Pencil className="h-4 w-4" /> Guardar cambios</>
              }
            </button>
          </div>

          {/* -- Comprobante --------------------------------------------------- */}
          <div>
            <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-2">
              Comprobante de pago
            </p>
            <VoucherPreview pagoUuid={pago.pago_uuid} hasVoucher={Boolean(pago.pago_url_vac)} />
          </div>

          {/* -- Cambiar estado ------------------------------------------------- */}
          {pago.pago_estad_vac !== 'ACEPTADO' && (
            <div>
              <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-3">
                Cambiar estado
              </p>
              <div className="grid grid-cols-3 gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isPending}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Aceptar
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Confirmar aceptación
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm pt-2">
                        ¿Estás seguro de que deseas aceptar el pago de <strong>{pago.estudiante_nombre} {pago.estudiante_apellidos}</strong>?
                        <br /><br />
                        Esto le dará acceso inmediato al curso. <span className="font-semibold text-red-500 dark:text-red-400">Esta acción no se puede deshacer.</span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel className="border-slate-200 dark:border-slate-700">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleEstado('ACEPTADO')}
                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-colors"
                      >
                        Sí, aceptar pago
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <button
                  onClick={() => handleEstado('PENDIENTE')}
                  disabled={isPending || pago.pago_estad_vac === 'PENDIENTE'}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-sky-50 dark:hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Clock className="h-5 w-5" />
                  Pendiente
                </button>
                <button
                  onClick={() => handleEstado('OBSERVADO')}
                  disabled={isPending || pago.pago_estad_vac === 'OBSERVADO'}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <AlertCircle className="h-5 w-5" />
                  Observar
                </button>
              </div>
              {isPending && (
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-black dark:text-white">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...
                </div>
              )}
            </div>
          )}

          {/* -- Zona de peligro: Eliminar -------------------------------------- */}
          {esPendiente && (
            <div className="rounded-xl border border-red-200 dark:border-red-500/20 p-4 space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
                <TriangleAlert className="h-3.5 w-3.5" />
                Zona de peligro
              </p>

              {!confirmDel ? (
                <button
                  onClick={() => setConfirmDel(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar pago
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                    ¿Confirmas la eliminación? Esta acción no se puede deshacer.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmDel(false)}
                      className="py-2 rounded-lg border border-sky-200 dark:border-sky-900 text-black dark:text-white text-xs font-semibold hover:bg-sky-50 dark:hover:bg-sky-900/40 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEliminar}
                      disabled={isDeleting}
                      className="py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      {isDeleting
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <><Trash2 className="h-3.5 w-3.5" /> Eliminar</>}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-black dark:text-white text-center">
                Solo eliminable si no hay inscripción activa en el curso.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// --- Tabla principal ----------------------------------------------------------

export function PagosTable({ pagos: initialPagos }: { pagos: PagoAdminDto[] }) {
  const [pagos, setPagos] = useState(initialPagos)
  const [selected, setSelected] = useState<PagoAdminDto | null>(null)
  const [filter, setFilter] = useState<string>('TODOS')

  useEffect(() => {
    setPagos(initialPagos)
  }, [initialPagos])

  const handleUpdate = (uuid: string, changes: Partial<PagoAdminDto>) => {
    setPagos((prev) =>
      prev.map((p) => p.pago_uuid === uuid ? { ...p, ...changes } : p)
    )
  }

  const handleDelete = (uuid: string) => {
    setPagos((prev) => prev.filter((p) => p.pago_uuid !== uuid))
  }

  const normalizeEstado = (e: string) =>
    e === 'PAGADO' ? 'ACEPTADO' : e // compatibilidad con registros viejos

  const filtered = filter === 'TODOS'
    ? pagos
    : pagos.filter((p) => normalizeEstado(p.pago_estad_vac) === filter)

  const counts = {
    TODOS:     pagos.length,
    PENDIENTE: pagos.filter((p) => normalizeEstado(p.pago_estad_vac) === 'PENDIENTE').length,
    ACEPTADO:  pagos.filter((p) => normalizeEstado(p.pago_estad_vac) === 'ACEPTADO').length,
    OBSERVADO: pagos.filter((p) => normalizeEstado(p.pago_estad_vac) === 'OBSERVADO').length,
  }

  return (
    <>
      {/* Header: filtros + botón nuevo pago */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filtros por estado */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['TODOS', 'PENDIENTE', 'ACEPTADO', 'OBSERVADO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                filter === f
                  ? 'bg-amber-500 text-black dark:text-white border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-sky-950 text-black dark:text-white border-sky-200 dark:border-sky-900 hover:border-amber-300 dark:hover:border-amber-500/40'
              }`}
            >
              {f === 'TODOS' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
              <span className="ml-1.5 opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <CreditCard className="h-12 w-12 text-black dark:text-white mb-4" />
            <p className="text-black dark:text-white font-medium">
              No hay pagos {filter !== 'TODOS' ? `con estado ${filter.toLowerCase()}` : 'registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Nro / Fecha</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Estudiante</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden md:table-cell">Curso</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Monto</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-200 dark:divide-sky-900 dark:divide-sky-200 dark:divide-sky-900">
                {filtered.map((pago) => (
                  <tr
                    key={pago.pago_uuid}
                    onClick={() => setSelected(pago)}
                    className="hover:bg-amber-50/50 dark:hover:bg-amber-500/5 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-black dark:text-white">
                        {pago.pago_nro_vac ?? '—'}
                      </p>
                      <p className="text-xs text-black dark:text-white">
                        {new Date(pago.pago_cre_tmp).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-black dark:text-white">
                        {pago.estudiante_apellidos}
                      </p>
                      <p className="text-xs text-black dark:text-white">
                        {pago.estudiante_nombre}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-black dark:text-white text-sm">
                        {pago.curso_nombre}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-black dark:text-white">
                        S/ {Number(pago.pago_mont_num).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <EstadoBadge estado={pago.pago_estad_vac} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sheet de detalle/edición */}
      <PagoSheet
        pago={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  )
}
