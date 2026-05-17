'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ThumbsUp, ChevronDown, ChevronUp, ArrowUpDown, Send, Loader2, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { crearComentario } from '@/actions/comentario.actions'
import { toast } from 'sonner'
import type { AulaComentario } from '@/repository/aula.repository'

function formatRelativo(iso: string | null | undefined): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const seg = Math.floor(diff / 1000)
  if (seg < 60) return 'Hace un momento'
  const min = Math.floor(seg / 60)
  if (min < 60) return `Hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  const dias = Math.floor(hrs / 24)
  if (dias < 30) return `Hace ${dias} día${dias > 1 ? 's' : ''}`
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-emerald-600',
  'bg-rose-600', 'bg-amber-600', 'bg-cyan-600',
]
function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function Avatar({ name }: { name: string }) {
  const initials = getInitials(name)
  const color = avatarColor(name)
  return (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold select-none`}>
      {initials || <UserCircle2 className="h-4 w-4" />}
    </div>
  )
}

const CLAMP_CHARS = 250

function ComentarioItem({ comentario }: { comentario: AulaComentario }) {
  const [expanded, setExpanded] = useState(false)
  const texto = comentario.com_cur_text_vac ?? ''
  const needsClamp = texto.length > CLAMP_CHARS
  const autor = comentario.autor_nombre ?? 'Usuario CIDCA'

  return (
    <div className="flex gap-3 group">
      <Avatar name={autor} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {autor}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {formatRelativo(comentario.com_cur_cre_tmp)}
          </span>
        </div>

        <p className={`text-sm text-slate-700 dark:text-white leading-relaxed [overflow-wrap:anywhere] ${!expanded && needsClamp ? 'line-clamp-3' : ''}`}>
          {texto}
        </p>

        {needsClamp && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-0.5"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>
    </div>
  )
}

function NuevoComentarioForm({
  aparId,
  currentPath,
}: {
  aparId: number
  currentPath: string
}) {
  const [texto, setTexto] = useState('')
  const [focused, setFocused] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSubmit = texto.trim().length >= 2 && !isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    const fd = new FormData()
    fd.append('texto', texto)
    fd.append('apar_id_int', String(aparId))
    fd.append('path', currentPath)

    startTransition(async () => {
      const result = await crearComentario(fd) as { success: boolean; message?: string; error?: string }
      if (result.success) {
        toast.success('Comentario publicado')
        setTexto('')
        setFocused(false)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Error al publicar')
      }
    })
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
        <UserCircle2 className="h-5 w-5 text-slate-500 dark:text-white" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <textarea
          ref={textareaRef}
          rows={focused ? 3 : 1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Añade un comentario…"
          maxLength={2000}
          className="w-full resize-none bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-1.5 transition-all duration-200 leading-relaxed"
        />

        {focused && (
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs ${texto.length > 1800 ? 'text-amber-500 font-medium' : 'text-slate-500 dark:text-slate-300'}`}>
              {texto.length}/2000
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setTexto(''); setFocused(false) }}
                disabled={isPending}
                className="h-8 px-3 text-xs text-slate-600 dark:text-white"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <><Send className="h-3.5 w-3.5 mr-1.5" />Comentar</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type Orden = 'reciente' | 'antiguo'
const INICIAL = 5
const POR_PAGINA = 10

interface ComentariosSectionProps {
  comentarios: AulaComentario[]
  aparId: number
  currentPath: string
}

export function ComentariosSection({ comentarios, aparId, currentPath }: ComentariosSectionProps) {
  const [orden, setOrden] = useState<Orden>('reciente')
  const [visible, setVisible] = useState(INICIAL)

  const sorted = [...comentarios].sort((a, b) => {
    const ta = new Date(a.com_cur_cre_tmp ?? 0).getTime()
    const tb = new Date(b.com_cur_cre_tmp ?? 0).getTime()
    return orden === 'reciente' ? tb - ta : ta - tb
  })

  const shown = sorted.slice(0, visible)
  const hasMore = visible < sorted.length
  const hasLess = visible > INICIAL

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-blue-500" />
          {comentarios.length} comentario{comentarios.length !== 1 ? 's' : ''}
        </h3>

        {comentarios.length > 1 && (
          <button
            onClick={() => setOrden(o => o === 'reciente' ? 'antiguo' : 'reciente')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {orden === 'reciente' ? 'Más recientes primero' : 'Más antiguos primero'}
          </button>
        )}
      </div>

      <NuevoComentarioForm aparId={aparId} currentPath={currentPath} />

      {comentarios.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800" />
      )}

      {comentarios.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
          Sé el primero en comentar en este módulo.
        </p>
      ) : (
        <div className="space-y-5">
          {shown.map((c) => (
            <ComentarioItem key={c.com_cur_id_int} comentario={c} />
          ))}

          <div className="flex flex-col items-start gap-1">
            {hasMore && (
              <button
                onClick={() => setVisible(v => v + POR_PAGINA)}
                className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Ver {Math.min(POR_PAGINA, sorted.length - visible)} comentarios más
              </button>
            )}
            {hasLess && (
              <button
                onClick={() => setVisible(INICIAL)}
                className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Ver menos
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
