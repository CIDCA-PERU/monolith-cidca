'use client'

import { ModuloDTO } from '@/dto/modulo.dto'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Edit2, Trash2, BookOpen } from 'lucide-react'

interface ModuloListProps {
  cursoId: string
  modulos: ModuloDTO[]
  onDelete?: (moduloId: string) => void
}

export function ModuloList({ cursoId, modulos, onDelete }: ModuloListProps) {
  if (modulos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No hay módulos creados</p>
        <Link href={`/dashboard/cursos/${cursoId}/modulos/nuevo`}>
          <Button className="bg-accent text-primary hover:bg-accent/90">
            Crear Primer Módulo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {modulos.map((modulo) => (
        <Card
          key={modulo.id}
          className="p-6 hover:border-accent transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">
                  Módulo {modulo.numero}: {modulo.titulo}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {modulo.descripcion}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Inicio: {new Date(modulo.fecha_inicio).toLocaleDateString()}
                </span>
                <span>
                  Fin: {new Date(modulo.fecha_fin).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    modulo.estado === 'publicado'
                      ? 'bg-green-900 text-green-100'
                      : modulo.estado === 'borrador'
                      ? 'bg-yellow-900 text-yellow-100'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {modulo.estado}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/dashboard/cursos/${cursoId}/modulos/${modulo.id}`}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Ver Apartados
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(modulo.id)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
