import { getSesionesConAsistencia } from '@/actions/asistencia.actions'
import { getCursoById } from '@/actions/curso.actions'
import { AsistenciasManager } from '@/components/dashboard/cursos/asistencias/asistencias-manager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AsistenciasPage({ params }: Props) {
  const { id } = await params

  const [cursoRes, sesionesRes] = await Promise.all([
    getCursoById(id),
    getSesionesConAsistencia(id),
  ])

  const curso = cursoRes.data
  const sesiones = sesionesRes.data ?? []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/cursos/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {curso?.nombre ?? 'Volver al curso'}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Asistencias
        </h1>
        {sesionesRes.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Error: {sesionesRes.error}
          </p>
        )}
      </div>

      <AsistenciasManager cursoId={id} initialSesiones={sesiones} />
    </div>
  )
}
