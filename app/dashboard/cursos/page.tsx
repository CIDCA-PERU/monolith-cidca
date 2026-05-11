'use client'

import { useEffect, useState } from 'react'
import { getCursosByDocente, deleteCurso } from '@/actions/curso.actions'
import { CursoList } from '@/components/cursos/curso-list'
import { Button } from '@/components/ui/button'
import { CursoDTO } from '@/dto/curso.dto'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function CursosPage() {
  const [cursos, setCursos] = useState<CursoDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCursos()
  }, [])

  const loadCursos = async () => {
    try {
      const result = await getCursosByDocente()
      if (result.success && result.data) {
        setCursos(result.data)
      } else {
        toast.error(result.error || 'Error al cargar cursos')
      }
    } catch (error) {
      toast.error('Error al cargar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (cursoId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return

    try {
      const result = await deleteCurso(cursoId)
      if (result.success) {
        toast.success('Curso eliminado correctamente')
        setCursos(cursos.filter((c) => c.id !== cursoId))
      } else {
        toast.error(result.error || 'Error al eliminar curso')
      }
    } catch (error) {
      toast.error('Error al eliminar curso')
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona todos tus cursos desde aquí
          </p>
        </div>
        <Link href="/dashboard/cursos/nuevo">
          <Button className="gap-2 bg-accent text-primary hover:bg-accent/90">
            <Plus className="w-5 h-5" />
            Nuevo Curso
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando cursos...</p>
        </div>
      ) : (
        <CursoList cursos={cursos} onDelete={handleDelete} />
      )}
    </div>
  )
}
