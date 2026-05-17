'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

interface ModuloNavProps {
  modId: number
  modUuid?: string
  modName: string
  idx: number
  isCurrentModule: boolean
  apartadosCount: number
  cursoId: string
  cursoUuid?: string
  children: React.ReactNode
}

export function ModuloNav({
  modId,
  modUuid,
  modName,
  idx,
  isCurrentModule,
  apartadosCount,
  cursoId,
  cursoUuid,
  children,
}: ModuloNavProps) {
  const navLink = `/aula/cursos/${cursoUuid || cursoId}/modulos/${modUuid || modId}`

  return (
    <AccordionItem
      value={`mod-${modId}`}
      className={`border rounded-lg overflow-hidden transition-all ${
        isCurrentModule ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
      }`}
    >
      <AccordionTrigger
        className={`px-4 py-4 hover:no-underline transition-colors text-base group ${
          isCurrentModule ? 'bg-accent/10' : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <div
            className={`p-2 rounded ${
              isCurrentModule ? 'bg-accent/20' : 'bg-muted'
            }`}
          >
            <BookOpen
              className={`h-5 w-5 ${
                isCurrentModule ? 'text-accent' : 'text-muted-foreground'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-muted-foreground">
              Módulo {idx + 1}
            </div>
            <div
              className={`text-base font-bold truncate ${
                isCurrentModule ? 'text-accent' : 'text-foreground'
              }`}
            >
              {modName || `Módulo ${modId}`}
            </div>
          </div>
          {apartadosCount > 0 && (
            <span className="text-sm bg-muted text-muted-foreground rounded-full px-3 py-1 font-medium">
              {apartadosCount}
            </span>
          )}
          <Link
            href={navLink}
            className="p-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-all opacity-0 group-hover:opacity-100 ml-2"
            title="Ir a este módulo"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-3 bg-muted/30 space-y-3">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}
