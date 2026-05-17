'use client'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Video, FileArchive, FileText, FileType2, ClipboardList, SeparatorHorizontal } from 'lucide-react'

export type ItemTipo = 'VIDEO' | 'ARCHIVO' | 'SEPARADOR' | 'PDF' | 'EXAMEN'

export interface ItemFormData {
  tipo: ItemTipo
  titulo: string
  url: string
  estado: number
}

const TIPOS: { val: ItemTipo; label: string; icon: React.ElementType; color: string; urlRequired: boolean; urlLabel: string; urlPlaceholder: string }[] = [
  { val: 'VIDEO',     label: 'Video',     icon: Video,              color: 'text-red-500',    urlRequired: true,  urlLabel: 'URL del video',   urlPlaceholder: 'https://youtube.com/watch?v=...' },
  { val: 'PDF',       label: 'PDF',       icon: FileType2,          color: 'text-orange-500', urlRequired: true,  urlLabel: 'URL del PDF',     urlPlaceholder: 'https://ejemplo.com/documento.pdf' },
  { val: 'ARCHIVO',   label: 'Archivo',   icon: FileArchive,        color: 'text-blue-500',   urlRequired: true,  urlLabel: 'URL de descarga', urlPlaceholder: 'https://ejemplo.com/recurso.zip' },
  { val: 'EXAMEN',    label: 'Examen',    icon: ClipboardList,      color: 'text-purple-600', urlRequired: false, urlLabel: 'URL (opcional)',   urlPlaceholder: 'Enlace al examen o déjalo vacío' },
  { val: 'SEPARADOR', label: 'Separador', icon: SeparatorHorizontal, color: 'text-slate-400',  urlRequired: false, urlLabel: 'Descripción (opcional)', urlPlaceholder: 'Texto descriptivo del separador' },
]

export function tipoConfig(tipo: string) {
  return TIPOS.find(t => t.val === tipo) ?? TIPOS[0]
}

interface Props {
  open: boolean
  onClose: () => void
  initial: ItemFormData
  title: string
  onSave: (d: ItemFormData) => void
  loading: boolean
}

export function ItemSheet({ open, onClose, initial, title, onSave, loading }: Props) {
  const [d, setD] = useState<ItemFormData>(initial)
  useEffect(() => { if (open) setD(initial) }, [open])

  const cfg = tipoConfig(d.tipo)
  const urlRequired = cfg.urlRequired
  const isSeparador = d.tipo === 'SEPARADOR'

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-slate-900 dark:text-white">{title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 py-5">
          {/* Tipo */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Tipo de contenido</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map(t => {
                const Icon = t.icon
                const active = d.tipo === t.val
                return (
                  <button key={t.val} type="button" onClick={() => setD(p => ({ ...p, tipo: t.val }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                      active ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                    }`}>
                    <Icon className={`h-4 w-4 ${active ? '' : t.color}`} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Título *</Label>
            <Input value={d.titulo} onChange={e => setD(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Título del contenido"
              className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
          </div>

          {/* URL */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {cfg.urlLabel} {urlRequired ? '*' : ''}
            </Label>
            {isSeparador ? (
              <textarea value={d.url} onChange={e => setD(p => ({ ...p, url: e.target.value }))}
                placeholder={cfg.urlPlaceholder} rows={2}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm resize-none" />
            ) : (
              <Input value={d.url} onChange={e => setD(p => ({ ...p, url: e.target.value }))}
                placeholder={cfg.urlPlaceholder}
                className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs" />
            )}
            {d.tipo === 'PDF' && d.url && <p className="text-xs text-slate-400 mt-1">El PDF se mostrará incrustado en el navegador</p>}
            {d.tipo === 'VIDEO' && d.url && <p className="text-xs text-slate-400 mt-1">El video se incrustará directamente en el aula</p>}
            {d.tipo === 'EXAMEN' && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">El examen se enlaza desde la sección de evaluaciones del curso</p>}
          </div>

          {/* Estado */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Estado</Label>
            <div className="flex gap-2">
              {[{ val: 1, label: 'Activo' }, { val: 0, label: 'Inactivo' }].map(opt => (
                <button key={opt.val} type="button" onClick={() => setD(p => ({ ...p, estado: opt.val }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    d.estado === opt.val ? 'bg-amber-500 text-slate-950 border-amber-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </button>
          <button type="button" disabled={loading || !d.titulo.trim() || (urlRequired && !d.url.trim())}
            onClick={() => onSave(d)}
            className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
