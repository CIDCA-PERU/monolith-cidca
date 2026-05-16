'use client'

import { useState, useTransition } from 'react'
import { PagoAdminDto, actualizarEstadoPago } from '@/actions/admin.actions'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { CreditCard, ExternalLink, FileImage, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// ─── Badge de estado ───────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    PAGADO:    { label: 'Pagado',    className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
    PENDIENTE: { label: 'Pendiente', className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', icon: Clock },
    OBSERVADO: { label: 'Observado', className: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20', icon: AlertCircle },
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

// ─── Sheet de detalle ─────────────────────────────────────────────────────────

function PagoSheet({
  pago,
  open,
  onClose,
  onUpdate,
}: {
  pago: PagoAdminDto | null
  open: boolean
  onClose: () => void
  onUpdate: (uuid: string, estado: 'PENDIENTE' | 'PAGADO' | 'OBSERVADO', obs?: string) => void
}) {
  const [obs, setObs] = useState(pago?.pago_obs_vac ?? '')
  const [isPending, startTransition] = useTransition()

  if (!pago) return null

  const handleEstado = (nuevoEstado: 'PAGADO' | 'OBSERVADO' | 'PENDIENTE') => {
    startTransition(async () => {
      const res = await actualizarEstadoPago(pago.pago_uuid, nuevoEstado, obs || undefined)
      if (res.success) {
        toast.success(`Pago marcado como ${nuevoEstado}`)
        onUpdate(pago.pago_uuid, nuevoEstado, obs || undefined)
        onClose()
      } else {
        toast.error(res.error ?? 'Error al actualizar')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            Detalle del pago
          </SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400">
            {pago.pago_nro_vac ?? 'Sin número de comprobante'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-5">
          {/* Estado actual */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Estado actual</span>
            <EstadoBadge estado={pago.pago_estad_vac} />
          </div>

          {/* Info del pago */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { label: 'Estudiante', value: `${pago.estudiante_apellidos}, ${pago.estudiante_nombre}` },
              { label: 'Curso', value: pago.curso_nombre },
              { label: 'Monto', value: `S/ ${Number(pago.pago_mont_num).toFixed(2)}` },
              { label: 'Registrado', value: formatDate(pago.pago_cre_tmp) },
              { label: 'Actualizado', value: formatDate(pago.pago_upd_tmp) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center px-4 py-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[60%]">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Comprobante */}
          {pago.pago_url_vac && (
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Comprobante
              </p>
              <a
                href={pago.pago_url_vac}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors"
              >
                <FileImage className="h-4 w-4 flex-shrink-0" />
                Ver comprobante adjunto
                <ExternalLink className="h-3.5 w-3.5 ml-auto flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Observaciones
            </label>
            <textarea
              rows={3}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Añadir observaciones internas..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 resize-none transition"
            />
          </div>

          {/* Acciones de estado */}
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Cambiar estado
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleEstado('PAGADO')}
                disabled={isPending || pago.pago_estad_vac === 'PAGADO'}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <CheckCircle2 className="h-5 w-5" />
                Aprobar
              </button>
              <button
                onClick={() => handleEstado('PENDIENTE')}
                disabled={isPending || pago.pago_estad_vac === 'PENDIENTE'}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Tabla principal ───────────────────────────────────────────────────────────

export function PagosTable({ pagos: initialPagos }: { pagos: PagoAdminDto[] }) {
  const [pagos, setPagos] = useState(initialPagos)
  const [selected, setSelected] = useState<PagoAdminDto | null>(null)
  const [filter, setFilter] = useState<string>('TODOS')

  const handleUpdate = (
    uuid: string,
    estado: 'PENDIENTE' | 'PAGADO' | 'OBSERVADO',
    obs?: string
  ) => {
    setPagos((prev) =>
      prev.map((p) =>
        p.pago_uuid === uuid
          ? { ...p, pago_estad_vac: estado, pago_obs_vac: obs ?? p.pago_obs_vac }
          : p
      )
    )
  }

  const filtered = filter === 'TODOS' ? pagos : pagos.filter((p) => p.pago_estad_vac === filter)

  const counts = {
    TODOS: pagos.length,
    PENDIENTE: pagos.filter((p) => p.pago_estad_vac === 'PENDIENTE').length,
    PAGADO: pagos.filter((p) => p.pago_estad_vac === 'PAGADO').length,
    OBSERVADO: pagos.filter((p) => p.pago_estad_vac === 'OBSERVADO').length,
  }

  return (
    <>
      {/* Filtros por estado */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['TODOS', 'PENDIENTE', 'PAGADO', 'OBSERVADO'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              filter === f
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/40'
            }`}
          >
            {f === 'TODOS' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <CreditCard className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No hay pagos {filter !== 'TODOS' ? `con estado ${filter.toLowerCase()}` : 'registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nro / Fecha</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estudiante</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Curso</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((pago) => (
                  <tr
                    key={pago.pago_uuid}
                    onClick={() => setSelected(pago)}
                    className="hover:bg-amber-50/50 dark:hover:bg-amber-500/5 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {pago.pago_nro_vac ?? '—'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(pago.pago_cre_tmp).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {pago.estudiante_apellidos}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {pago.estudiante_nombre}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {pago.curso_nombre}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
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

      {/* Sheet de detalle */}
      <PagoSheet
        pago={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
      />
    </>
  )
}
