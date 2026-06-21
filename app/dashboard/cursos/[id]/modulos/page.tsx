import { Card } from '@/components/ui/card'
import { getModulosByCursoAdmin } from '@/actions/admin.actions'
import { getCursoById } from '@/actions/curso.actions'
import { ModulosManager } from '@/components/dashboard/cursos/modulos/modulos-manager'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Layers } from 'lucide-react'

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

  const totalModulos = modulos.length
  const totalApartados = modulos.reduce((acc, m) => acc + (m.apartados?.length || 0), 0)
  const isActivo = curso?.estado === 'activo'

  return (
    <div className="py-8 px-4">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/cursos/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {curso?.nombre ?? 'Volver al curso'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Modulos) */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Módulos del curso
            </h1>
            {modulosRes.error && (
              <p className="mt-2 text-sm text-destructive">
                Error: {modulosRes.error}
              </p>
            )}
          </div>

          <ModulosManager curUuid={id} initialModulos={modulos} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Card className="!py-3 !gap-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-foreground">Estado del Curso</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isActivo
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
              }`}>
                {isActivo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isActivo
                ? 'Los estudiantes pueden ver este curso y su contenido.'
                : 'El curso está oculto para los estudiantes.'}
            </p>
          </Card>

          <Card className="!py-3 !gap-2 px-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Resumen de Contenido
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Total Módulos</span>
                </div>
                <span className="font-bold text-foreground">{totalModulos}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Total Apartados</span>
                </div>
                <span className="font-bold text-foreground">{totalApartados}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-900">
            <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-300 mb-2">
              Organización del Curso
            </h3>
            <p className="text-xs text-sky-700 dark:text-sky-400 leading-relaxed">
              Los módulos son los bloques principales del curso. Dentro de cada módulo, puedes crear "apartados" (temas o clases), y dentro de cada apartado puedes agregar "items" como videos, lecturas, PDFs, o enlaces de Zoom.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
