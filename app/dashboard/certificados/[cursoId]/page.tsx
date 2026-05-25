import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEstudiantesParaCertificado } from '@/actions/admin.actions'
import { CertificadosManager } from '@/components/dashboard/certificados/certificados-manager'
import { Award, ArrowLeft } from 'lucide-react'

export default async function CertificadosCursoPage({
  params,
}: {
  params: Promise<{ cursoId: string }>
}) {
  const { cursoId } = await params
  const curIdInt = Number(cursoId)

  if (isNaN(curIdInt)) notFound()

  const res = await getEstudiantesParaCertificado(curIdInt)

  if (!res.success) notFound()

  const estudiantes = res.data ?? []
  const cursoNombre = res.cursoNombre ?? '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Link
              href="/dashboard/certificados"
              className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Certificados
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">
              {cursoNombre}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            {cursoNombre}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {estudiantes.length} alumno{estudiantes.length !== 1 ? 's' : ''} inscrito{estudiantes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Manager con estado cliente */}
      <CertificadosManager
        curIdInt={curIdInt}
        cursoNombre={cursoNombre}
        initialEstudiantes={estudiantes}
      />
    </div>
  )
}
