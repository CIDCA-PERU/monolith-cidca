'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  ModuloAdminDto, ApartadoAdminDto,
  crearModulo, actualizarModulo, eliminarModulo,
  crearApartado, actualizarApartado, eliminarApartado,
} from '@/actions/admin.actions'
import { ApartadoItems } from '@/components/admin/apartado-items'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  ChevronRight, Loader2, Layers, FileText, AlertCircle,
} from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function swap<T>(arr: T[], i: number, j: number): T[] {
  const copy = [...arr]
  ;[copy[i], copy[j]] = [copy[j], copy[i]]
  return copy
}

function EstadoBadge({ estado, onClick }: { estado: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click para alternar estado"
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
        estado === 1
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
      }`}
    >
      {estado === 1 ? 'Activo' : 'Inactivo'}
    </button>
  )
}

// ─── Sheet genérico de formulario ─────────────────────────────────────────────

interface FormData { nombre: string; descripcion: string; estado: number }

function FormSheet({
  open, onClose, title, initial, onSave, loading,
}: {
  open: boolean
  onClose: () => void
  title: string
  initial: FormData
  onSave: (d: FormData) => void
  loading: boolean
}) {
  const [data, setData] = useState<FormData>(initial)

  // reset when opening
  useState(() => { setData(initial) })

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-slate-900 dark:text-white">{title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 py-5">
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Nombre *</Label>
            <Input
              value={data.nombre}
              onChange={(e) => setData((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre del elemento"
              className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Descripción</Label>
            <Textarea
              value={data.descripcion}
              onChange={(e) => setData((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción (opcional)"
              rows={3}
              className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Estado</Label>
            <div className="flex gap-2">
              {[{ val: 1, label: 'Activo' }, { val: 0, label: 'Inactivo' }].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setData((p) => ({ ...p, estado: opt.val }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    data.estado === opt.val
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading || !data.nombre.trim()}
            onClick={() => onSave(data)}
            className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ─── Confirm inline ────────────────────────────────────────────────────────────

function DeleteConfirm({ label, onConfirm, onCancel }: {
  label: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20 text-xs animate-in slide-in-from-right-2 duration-150">
      <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
      <span className="text-red-700 dark:text-red-400 font-medium flex-1">¿Eliminar «{label}»?</span>
      <button onClick={onConfirm} className="px-2 py-0.5 rounded bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 transition-colors">Sí</button>
      <button onClick={onCancel} className="px-2 py-0.5 rounded border border-red-200 dark:border-red-500/30 text-red-500 text-[11px] font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">No</button>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ModulosManager({
  curUuid,
  initialModulos,
}: {
  curUuid: string
  initialModulos: ModuloAdminDto[]
}) {
  const [modulos, setModulos] = useState<ModuloAdminDto[]>(initialModulos)
  const [expandedMods, setExpandedMods] = useState<Set<string>>(new Set(initialModulos.map((m) => m.mod_uuid)))
  const [isPending, startTransition] = useTransition()

  // Sheet state
  const [sheet, setSheet] = useState<{
    type: 'mod-new' | 'mod-edit' | 'apar-new' | 'apar-edit'
    modUuid?: string
    aparUuid?: string
    initial: FormData
  } | null>(null)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'mod' | 'apar'
    uuid: string
    modUuid?: string
    label: string
  } | null>(null)

  const [sheetLoading, setSheetLoading] = useState(false)

  // ── Reorder helpers ────────────────────────────────────────────────────────

  const moveModulo = (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= modulos.length) return
    setModulos((prev) => swap(prev, idx, j))
  }

  const moveApartado = (modUuid: string, idx: number, dir: -1 | 1) => {
    setModulos((prev) =>
      prev.map((m) => {
        if (m.mod_uuid !== modUuid) return m
        const j = idx + dir
        if (j < 0 || j >= m.apartados.length) return m
        return { ...m, apartados: swap(m.apartados, idx, j) }
      })
    )
  }

  const toggleExpand = (uuid: string) => {
    setExpandedMods((prev) => {
      const next = new Set(prev)
      next.has(uuid) ? next.delete(uuid) : next.add(uuid)
      return next
    })
  }

  // ── Toggle estado rápido ──────────────────────────────────────────────────

  const toggleEstadoModulo = (modUuid: string) => {
    const m = modulos.find((x) => x.mod_uuid === modUuid)
    if (!m) return
    const newEst = m.mod_est_int === 1 ? 0 : 1
    setModulos((prev) => prev.map((x) => x.mod_uuid === modUuid ? { ...x, mod_est_int: newEst } : x))
    startTransition(async () => {
      const res = await actualizarModulo(modUuid, { estado: newEst })
      if (!res.success) toast.error(res.error)
    })
  }

  const toggleEstadoApartado = (modUuid: string, aparUuid: string) => {
    const m = modulos.find((x) => x.mod_uuid === modUuid)
    const a = m?.apartados.find((x) => x.apar_uuid === aparUuid)
    if (!a) return
    const newEst = a.apar_est_int === 1 ? 0 : 1
    setModulos((prev) => prev.map((m) =>
      m.mod_uuid !== modUuid ? m : {
        ...m,
        apartados: m.apartados.map((ap) =>
          ap.apar_uuid === aparUuid ? { ...ap, apar_est_int: newEst } : ap
        ),
      }
    ))
    startTransition(async () => {
      const res = await actualizarApartado(aparUuid, { estado: newEst })
      if (!res.success) toast.error(res.error)
    })
  }

  // ── Save sheet ─────────────────────────────────────────────────────────────

  const handleSave = async (formData: FormData) => {
    if (!sheet) return
    setSheetLoading(true)
    try {
      if (sheet.type === 'mod-new') {
        const res = await crearModulo(curUuid, formData)
        if (!res.success || !res.data) { toast.error(res.error); return }
        setModulos((prev) => [...prev, res.data!])
        setExpandedMods((prev) => new Set([...prev, res.data!.mod_uuid]))
        toast.success('Módulo creado')
        setSheet(null)
      }
      else if (sheet.type === 'mod-edit' && sheet.modUuid) {
        const res = await actualizarModulo(sheet.modUuid, formData)
        if (!res.success) { toast.error(res.error); return }
        setModulos((prev) => prev.map((m) =>
          m.mod_uuid !== sheet.modUuid ? m : {
            ...m, mod_nomb_vac: formData.nombre,
            mod_desc_vac: formData.descripcion, mod_est_int: formData.estado,
          }
        ))
        toast.success('Módulo actualizado')
        setSheet(null)
      }
      else if (sheet.type === 'apar-new' && sheet.modUuid) {
        const res = await crearApartado(sheet.modUuid, formData)
        if (!res.success || !res.data) { toast.error(res.error); return }
        setModulos((prev) => prev.map((m) =>
          m.mod_uuid !== sheet.modUuid ? m : { ...m, apartados: [...m.apartados, res.data!] }
        ))
        toast.success('Apartado creado')
        setSheet(null)
      }
      else if (sheet.type === 'apar-edit' && sheet.aparUuid && sheet.modUuid) {
        const res = await actualizarApartado(sheet.aparUuid, formData)
        if (!res.success) { toast.error(res.error); return }
        setModulos((prev) => prev.map((m) =>
          m.mod_uuid !== sheet.modUuid ? m : {
            ...m,
            apartados: m.apartados.map((a) =>
              a.apar_uuid !== sheet.aparUuid ? a : {
                ...a, apar_nomb_vac: formData.nombre,
                apar_desc_vac: formData.descripcion, apar_est_int: formData.estado,
              }
            ),
          }
        ))
        toast.success('Apartado actualizado')
        setSheet(null)
      }
    } finally {
      setSheetLoading(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return
    startTransition(async () => {
      if (deleteTarget.type === 'mod') {
        const res = await eliminarModulo(deleteTarget.uuid)
        if (!res.success) { toast.error(res.error); return }
        setModulos((prev) => prev.filter((m) => m.mod_uuid !== deleteTarget.uuid))
        toast.success('Módulo eliminado')
      } else {
        const res = await eliminarApartado(deleteTarget.uuid)
        if (!res.success) { toast.error(res.error); return }
        setModulos((prev) => prev.map((m) =>
          m.mod_uuid !== deleteTarget.modUuid ? m : {
            ...m, apartados: m.apartados.filter((a) => a.apar_uuid !== deleteTarget.uuid),
          }
        ))
        toast.success('Apartado eliminado')
      }
      setDeleteTarget(null)
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const EMPTY_FORM: FormData = { nombre: '', descripcion: '', estado: 1 }

  return (
    <>
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {modulos.length} módulo{modulos.length !== 1 ? 's' : ''} — el orden se aplica en esta vista
        </p>
        <button
          onClick={() => setSheet({ type: 'mod-new', initial: EMPTY_FORM })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-semibold shadow-sm transition-all duration-150 hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Nuevo módulo
        </button>
      </div>

      {/* Lista */}
      {modulos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-16 text-center">
          <Layers className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Sin módulos todavía</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Crea el primer módulo para estructurar el curso</p>
        </div>
      ) : (
        <div className="space-y-3">
          {modulos.map((mod, mIdx) => {
            const expanded = expandedMods.has(mod.mod_uuid)
            const isDeleteTarget = deleteTarget?.type === 'mod' && deleteTarget.uuid === mod.mod_uuid
            return (
              <div key={mod.mod_uuid} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                {/* Módulo header */}
                <div className="flex items-center gap-2 px-4 py-3.5">
                  {/* Número + expand */}
                  <button
                    onClick={() => toggleExpand(mod.mod_uuid)}
                    className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-colors"
                  >
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{mIdx + 1}</span>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(mod.mod_uuid)}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{mod.mod_nomb_vac}</p>
                      <EstadoBadge estado={mod.mod_est_int} onClick={() => toggleEstadoModulo(mod.mod_uuid)} />
                    </div>
                    {mod.mod_desc_vac && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{mod.mod_desc_vac}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Reorder */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveModulo(mIdx, -1)}
                        disabled={mIdx === 0}
                        className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Subir"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => moveModulo(mIdx, 1)}
                        disabled={mIdx === modulos.length - 1}
                        className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Bajar"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Edit */}
                    <button
                      onClick={() => setSheet({
                        type: 'mod-edit', modUuid: mod.mod_uuid,
                        initial: { nombre: mod.mod_nomb_vac, descripcion: mod.mod_desc_vac, estado: mod.mod_est_int },
                      })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      title="Editar módulo"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget({ type: 'mod', uuid: mod.mod_uuid, label: mod.mod_nomb_vac })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Eliminar módulo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Expand chevron */}
                    <button onClick={() => toggleExpand(mod.mod_uuid)} className="p-1 text-slate-400">
                      {expanded
                        ? <ChevronDown className="h-4 w-4" />
                        : <ChevronRight className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>

                {/* Delete confirm for module */}
                {isDeleteTarget && (
                  <div className="px-4 pb-3">
                    <DeleteConfirm
                      label={mod.mod_nomb_vac}
                      onConfirm={handleDelete}
                      onCancel={() => setDeleteTarget(null)}
                    />
                  </div>
                )}

                {/* Apartados (expanded) */}
                {expanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800">
                    {mod.apartados.length === 0 && (
                      <p className="px-5 py-3 text-xs text-slate-400 dark:text-slate-500 italic">
                        Sin apartados en este módulo
                      </p>
                    )}
                    {mod.apartados.map((apar, aIdx) => {
                      const isAparDelete = deleteTarget?.type === 'apar' && deleteTarget.uuid === apar.apar_uuid
                      return (
                        <div key={apar.apar_uuid} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                          <div className="flex items-center gap-2 px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <FileText className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                            <span className="text-xs text-slate-500 dark:text-slate-500 font-mono flex-shrink-0">{aIdx + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{apar.apar_nomb_vac}</p>
                              {apar.apar_desc_vac && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{apar.apar_desc_vac}</p>
                              )}
                            </div>
                            <EstadoBadge
                              estado={apar.apar_est_int}
                              onClick={() => toggleEstadoApartado(mod.mod_uuid, apar.apar_uuid)}
                            />
                            {/* Reorder */}
                            <div className="flex flex-col">
                              <button onClick={() => moveApartado(mod.mod_uuid, aIdx, -1)} disabled={aIdx === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed"><ChevronUp className="h-3 w-3" /></button>
                              <button onClick={() => moveApartado(mod.mod_uuid, aIdx, 1)} disabled={aIdx === mod.apartados.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed"><ChevronDown className="h-3 w-3" /></button>
                            </div>
                            <button
                              onClick={() => setSheet({
                                type: 'apar-edit', modUuid: mod.mod_uuid, aparUuid: apar.apar_uuid,
                                initial: { nombre: apar.apar_nomb_vac, descripcion: apar.apar_desc_vac, estado: apar.apar_est_int },
                              })}
                              className="p-1.5 rounded text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'apar', uuid: apar.apar_uuid, modUuid: mod.mod_uuid, label: apar.apar_nomb_vac })}
                              className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          {isAparDelete && (
                            <div className="px-5 pb-2">
                              <DeleteConfirm label={apar.apar_nomb_vac} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
                            </div>
                          )}
                          {/* Items del apartado */}
                          <ApartadoItems aparUuid={apar.apar_uuid} initialItems={apar.items ?? []} />
                        </div>
                      )
                    })}

                    {/* Add apartado */}
                    <button
                      onClick={() => setSheet({ type: 'apar-new', modUuid: mod.mod_uuid, initial: EMPTY_FORM })}
                      className="w-full flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar apartado
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Sheet */}
      {sheet && (
        <FormSheet
          open={Boolean(sheet)}
          onClose={() => setSheet(null)}
          title={
            sheet.type === 'mod-new' ? 'Nuevo Módulo'
            : sheet.type === 'mod-edit' ? 'Editar Módulo'
            : sheet.type === 'apar-new' ? 'Nuevo Apartado'
            : 'Editar Apartado'
          }
          initial={sheet.initial}
          onSave={handleSave}
          loading={sheetLoading}
        />
      )}
    </>
  )
}
