'use client'

import { useEffect, useState, use } from 'react'
import { getCursoById } from '@/actions/curso.actions'
import { CursoDTO } from '@/dto/curso.dto'
import { CursoForm } from '@/components/dashboard/cursos/nuevo/curso-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface CursoDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CursoDetailPage({ params }: CursoDetailPageProps) {
  const { id } = use(params)
  const [curso, setCurso] = useState<CursoDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCurso()
  }, [id])

  const loadCurso = async () => {
    try {
      const result = await getCursoById(id)
      if (result.success && result.data) {
        setCurso(result.data)
      } else {
        toast.error(result.error || 'Error al cargar curso')
      }
    } catch (error) {
      toast.error('Error al cargar curso')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <p className="text-muted-foreground">Cargando curso...</p>
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="py-8 px-4">
        <p className="text-destructive mb-4">Curso no encontrado</p>
        <Link href="/dashboard/cursos">
          <Button variant="outline">Volver a Cursos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <Link href="/dashboard/cursos" className="mb-6 inline-block">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CursoForm curso={curso} onSuccess={loadCurso} />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Información
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Estado</p>
                <p className="text-foreground font-medium">{curso.estado}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estudiantes</p>
                <p className="text-foreground font-medium">
                  {curso.cantidad_estudiantes}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de Inicio</p>
                <p className="text-foreground font-medium">
                  {new Date(curso.fecha_inicio).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de Fin</p>
                <p className="text-foreground font-medium">
                  {new Date(curso.fecha_fin).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Módulos
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Los módulos aparecerán aquí
            </p>
            <Link href={`/dashboard/cursos/${curso.id}/modulos`}>
              <Button
                variant="outline"
                className="w-full"
              >
                Gestionar Módulos
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
