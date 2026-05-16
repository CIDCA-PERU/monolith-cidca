'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ItemApartadoDto, crearItem, actualizarItem, eliminarItem } from '@/actions/admin.actions'
import { ItemSheet, ItemFormData, tipoConfig, ItemTipo } from '@/components/admin/item-sheet'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink, AlertCircle, EyeOff, SeparatorHorizontal } from 'lucide-react'

const EMPTY: ItemFormData = { tipo: 'VIDEO', titulo: '', url: '', estado: 1 }

function swap<T>(arr: T[], i: number, j: number): T[] {
  const c = [...arr]; [c[i], c[j]] = [c[j], c[i]]; return c
}

export function ApartadoItems({ aparUuid, initialItems }: { aparUuid: string; initialItems: ItemApartadoDto[] }) {
  const [items, setItems] = useState<ItemApartadoDto[]>(initialItems)
  const [sheet, setSheet] = useState<{ itemUuid?: string; initial: ItemFormData } | null>(null)
  const [del, setDel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [, startT] = useTransition()

  const moveItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = swap(items, idx, j)
    setItems(next)
    startT(async () => {
      await actualizarItem(next[idx].item_uuid, { orden: idx + 1 })
      await actualizarItem(next[j].item_uuid, { orden: j + 1 })
    })
  }

  const toggleEstado = (uuid: string) => {
    const it = items.find(x => x.item_uuid === uuid)
    if (!it) return
    const newEst = it.item_est_int === 1 ? 0 : 1
    setItems(p => p.map(x => x.item_uuid === uuid ? { ...x, item_est_int: newEst } : x))
    startT(async () => {
      const res = await actualizarItem(uuid, { estado: newEst })
      if (!res.success) toast.error(res.error)
    })
  }

  const handleSave = async (d: ItemFormData) => {
    setLoading(true)
    try {
      if (!sheet) return
      if (sheet.itemUuid) {
        const res = await actualizarItem(sheet.itemUuid, { tipo: d.tipo, titulo: d.titulo, url: d.url || null, estado: d.estado })
        if (!res.success) { toast.error(res.error); return }
        setItems(p => p.map(it => it.item_uuid === sheet.itemUuid ? { ...it, item_tipo_vac: d.tipo, item_titulo_vac: d.titulo, item_url_vac: d.url || null, item_est_int: d.estado } : it))
        toast.success('Item actualizado')
      } else {
        const res = await crearItem(aparUuid, { tipo: d.tipo, titulo: d.titulo, url: d.url || null, estado: d.estado, orden: items.length + 1 })
        if (!res.success || !res.data) { toast.error(res.error); return }
        setItems(p => [...p, res.data!])
        toast.success('Item creado')
      }
      setSheet(null)
    } finally { setLoading(false) }
  }

  const handleDelete = async (uuid: string) => {
    startT(async () => {
      const res = await eliminarItem(uuid)
      if (!res.success) { toast.error(res.error); return }
      setItems(p => p.filter(it => it.item_uuid !== uuid))
      setDel(null)
      toast.success('Item eliminado')
    })
  }

  return (
    <div className="border-t border-slate-100 dark:border-slate-800/50">
      {items.length === 0 && (
        <p className="px-8 py-2 text-xs text-slate-400 italic">Sin contenido en este apartado</p>
      )}

      {items.map((it, i) => {
        const cfg = tipoConfig(it.item_tipo_vac)
        const Icon = cfg.icon
        const inactive = it.item_est_int !== 1
        const isSep = it.item_tipo_vac === 'SEPARADOR'

        return (
          <div key={it.item_uuid} className={`transition-opacity ${inactive ? 'opacity-40' : ''}`}>

            {/* ── SEPARADOR: render como línea divisoria ── */}
            {isSep ? (
              <div className="group flex items-center gap-3 px-8 py-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                {it.item_titulo_vac && (
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <SeparatorHorizontal className="h-3 w-3" />
                    {it.item_titulo_vac}
                  </span>
                )}
                {it.item_url_vac && !it.item_titulo_vac && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 italic whitespace-nowrap">{it.item_url_vac}</span>
                )}
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                {/* acciones separador */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {inactive && <span title="Oculto para estudiantes"><EyeOff className="h-3 w-3 text-slate-400 mr-1" /></span>}
                  <button onClick={() => toggleEstado(it.item_uuid)} title={inactive ? 'Activar' : 'Desactivar'}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${inactive ? 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600' : 'bg-emerald-50 text-emerald-600 hover:bg-slate-100 hover:text-slate-500'}`}>
                    {inactive ? 'Activar' : 'Ocultar'}
                  </button>
                  <button onClick={() => setSheet({ itemUuid: it.item_uuid, initial: { tipo: it.item_tipo_vac as ItemTipo, titulo: it.item_titulo_vac, url: it.item_url_vac ?? '', estado: it.item_est_int } })}
                    className="p-1 rounded text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDel(it.item_uuid)}
                    className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              /* ── Items normales ── */
              <div className="flex items-center gap-2 px-8 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${inactive ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Icon className={`h-3 w-3 ${inactive ? 'text-slate-400' : cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${inactive ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {it.item_titulo_vac}
                  </p>
                  {it.item_url_vac && (
                    <a href={it.item_url_vac} target="_blank" rel="noreferrer"
                      className="text-[11px] text-blue-500 hover:underline truncate flex items-center gap-0.5 max-w-xs"
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="truncate">{it.item_url_vac}</span>
                    </a>
                  )}
                </div>

                {/* Badge de tipo */}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {cfg.label}
                </span>

                {/* Toggle estado (click) */}
                <button onClick={() => toggleEstado(it.item_uuid)} title={inactive ? 'Activar' : 'Desactivar'}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                    inactive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-slate-100 hover:text-slate-500'
                  }`}>
                  {inactive ? <><EyeOff className="h-2.5 w-2.5 inline mr-0.5" />Oculto</> : 'Visible'}
                </button>

                {/* Acciones hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col">
                    <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ChevronDown className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => setSheet({ itemUuid: it.item_uuid, initial: { tipo: it.item_tipo_vac as ItemTipo, titulo: it.item_titulo_vac, url: it.item_url_vac ?? '', estado: it.item_est_int } })}
                    className="p-1 rounded text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDel(it.item_uuid)}
                    className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Confirm delete */}
            {del === it.item_uuid && (
              <div className="flex items-center gap-2 mx-8 mb-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20 text-xs">
                <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 dark:text-red-400 font-medium flex-1">¿Eliminar «{it.item_titulo_vac || 'Separador'}»?</span>
                <button onClick={() => handleDelete(it.item_uuid)} className="px-2 py-0.5 rounded bg-red-500 text-white text-[11px] font-bold">Sí</button>
                <button onClick={() => setDel(null)} className="px-2 py-0.5 rounded border border-red-300 text-red-500 text-[11px] font-bold">No</button>
              </div>
            )}
          </div>
        )
      })}

      <button onClick={() => setSheet({ initial: EMPTY })}
        className="w-full flex items-center gap-1.5 px-8 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors">
        <Plus className="h-3 w-3" /> Agregar contenido
      </button>

      {sheet && (
        <ItemSheet open title={sheet.itemUuid ? 'Editar contenido' : 'Nuevo contenido'} initial={sheet.initial} onClose={() => setSheet(null)} onSave={handleSave} loading={loading} />
      )}
    </div>
  )
}
