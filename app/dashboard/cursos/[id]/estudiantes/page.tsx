import { getEstudiantesByCurso } from '@/actions/curso.actions'
import { getCursoById } from '@/actions/curso.actions'
import { EstudiantesManager } from '@/components/dashboard/cursos/estudiantes/estudiantes-manager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EstudiantesPage({ params }: Props) {
  const { id } = await params

  const [cursoRes, estudiantesRes] = await Promise.all([
    getCursoById(id),
    getEstudiantesByCurso(id),
  ])

  const curso = cursoRes.data
  const estudiantes = estudiantesRes.data ?? []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/cursos/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {curso?.nombre ?? 'Volver al curso'}
        </Link>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Estudiantes del Curso
        </h1>
        {estudiantesRes.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Error: {estudiantesRes.error}
          </p>
        )}
      </div>

      <EstudiantesManager cursoId={id} initialEstudiantes={estudiantes} />
    </div>
  )
}
