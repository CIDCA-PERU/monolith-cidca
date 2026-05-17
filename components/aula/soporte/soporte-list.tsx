'use client'

import { useState } from 'react'
import { Clock, ExternalLink, MessageSquare, CheckCircle2, AlertCircle, Hourglass, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Soporte } from '@/repository/soporte.repository'

// ── Tipo extendido con URL firmada ────────────────────────────────────────────

export type SoporteConUrl = Soporte & { sop_signed_url: string | null }

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ── Estado badge ──────────────────────────────────────────────────────────────

type EstadoKey = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'CERRADO'

const ESTADO_CONFIG: Record<EstadoKey, {
  label: string
  Icon: React.ElementType
  classes: string
}> = {
  PENDIENTE: {
    label: 'Pendiente',
    Icon: Hourglass,
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  EN_REVISION: {
    label: 'En revisión',
    Icon: Search,
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  RESUELTO: {
    label: 'Resuelto',
    Icon: CheckCircle2,
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  CERRADO: {
    label: 'Cerrado',
    Icon: AlertCircle,
    classes: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  },
}

function EstadoBadge({ estado }: { estado: string | null | undefined }) {
  const key = (estado ?? 'PENDIENTE') as EstadoKey
  const cfg = ESTADO_CONFIG[key] ?? ESTADO_CONFIG['PENDIENTE']
  const { Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

// ── Ticket individual (con estado "expandido") ─────────────────────────────────

const CLAMP_THRESHOLD = 200 // caracteres antes de mostrar "Ver más"

function TicketCard({ ticket }: { ticket: SoporteConUrl }) {
  const [expanded, setExpanded] = useState(false)
  const needsClamp = (ticket.sop_desc_vac?.length ?? 0) > CLAMP_THRESHOLD

  return (
    <Card className="p-4 space-y-3 hover:shadow-sm transition-shadow w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5 overflow-hidden">
          {/* Título */}
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug [overflow-wrap:anywhere]">
            {ticket.sop_titulo_vac}
          </p>

          {/* Meta: ID + estado */}
          <div className="flex items-center gap-2 flex-wrap"> 
            <EstadoBadge estado={ticket.sop_estad_vac} />
          </div>

          {/* Fecha */}
          <p className="text-xs text-slate-400 dark:text-white flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            {formatFecha(ticket.sop_cre_tmp)}
          </p>
        </div>

        {/* Adjunto (URL firmada del bucket privado) */}
        {ticket.sop_signed_url && (
          <a
            href={ticket.sop_signed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 underline dark:text-white font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Adjunto
          </a>
        )}
      </div>

      {/* Descripción con expandir/colapsar */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 w-full min-w-0 overflow-hidden">
        <p
          className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed [overflow-wrap:anywhere] transition-all ${
            !expanded && needsClamp ? 'line-clamp-3' : ''
          }`}
        >
          {ticket.sop_desc_vac || '—'}
        </p>

        {needsClamp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 -ml-1"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Ver menos</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Ver más</>
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}

// ── Lista completa ─────────────────────────────────────────────────────────────

interface SoporteListProps {
  tickets: SoporteConUrl[]
}

export function SoporteList({ tickets }: SoporteListProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
          <MessageSquare className="h-8 w-8 text-slate-400 dark:text-white" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-white">
          No tienes solicitudes de soporte
        </p>
        <p className="text-xs text-slate-400 dark:text-white max-w-xs">
          Cuando envíes una solicitud, aparecerá aquí con su estado actualizado.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.sop_id_int} ticket={ticket} />
      ))}
    </div>
  )
}
