'use client'

import { CursoDTO } from '@/dto/curso.dto'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Edit2, Trash2, Users } from 'lucide-react'

interface CursoListProps {
  cursos: CursoDTO[]
  onDelete?: (cursoId: string) => void
}

export function CursoList({ cursos, onDelete }: CursoListProps) {
  if (cursos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No hay cursos creados</p>
        <Link href="/dashboard/cursos/nuevo">
          <Button className="bg-accent text-primary hover:bg-accent/90">
            Crear Primer Curso
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cursos.map((curso) => (
        <Card
          key={curso.id}
          className="p-0 overflow-hidden hover:border-accent transition-colors flex flex-col"
        >
          {curso.imagen_url ? (
            <img
              src={curso.imagen_url}
              alt={curso.nombre}
              className="w-full aspect-[16/9] object-cover"
            />
          ) : (
            <div className="aspect-[16/9] bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Sin imagen</span>
            </div>
          )}
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-4 flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {curso.nombre}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {curso.descripcion}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{curso.cantidad_estudiantes} estudiantes</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  curso.estado === 'activo'
                    ? 'bg-green-900 text-green-100'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {curso.estado}
              </span>
            </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/cursos/${curso.id}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Ver
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(curso.id)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
