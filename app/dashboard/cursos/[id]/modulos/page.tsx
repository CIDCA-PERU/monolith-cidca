import { getModulosByCursoAdmin } from '@/actions/admin.actions'
import { getCursoById } from '@/actions/curso.actions'
import { ModulosManager } from '@/components/dashboard/cursos/modulos/modulos-manager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModulosPage({ params }: Props) {
  const { id } = await params

  const [cursoRes, modulosRes] = await Promise.all([
    getCursoById(id),
    getModulosByCursoAdmin(id),
  ])

  const curso = cursoRes.data
  const modulos = modulosRes.data ?? []

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
          Módulos del curso
        </h1>
        {modulosRes.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Error: {modulosRes.error}
          </p>
        )}
      </div>

      {/* CRUD Manager (Client Component) */}
      <ModulosManager curUuid={id} initialModulos={modulos} />
    </div>
  )
}
