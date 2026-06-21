'use client'

import { useEffect, useState, use } from 'react'
import { getCursoById, updateCurso } from '@/actions/curso.actions'
import { CursoDTO } from '@/dto/curso.dto'
import { CursoForm } from '@/components/dashboard/cursos/nuevo/curso-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Users, CalendarCheck, Power, PowerOff, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CursoDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CursoDetailPage({ params }: CursoDetailPageProps) {
  const { id } = use(params)
  const [curso, setCurso] = useState<CursoDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingEstado, setTogglingEstado] = useState(false)
  const [confirmEstado, setConfirmEstado] = useState<{nuevoEstado: string, accion: string} | null>(null)

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

  const handleToggleEstado = async () => {
    if (!curso) return
    const nuevoEstado = curso.estado === 'activo' ? 'borrador' : 'activo'
    const accion = nuevoEstado === 'activo' ? 'habilitar' : 'deshabilitar'

    setConfirmEstado({ nuevoEstado, accion })
  }

  const executeToggleEstado = async () => {
    if (!curso || !confirmEstado) return
    const { nuevoEstado } = confirmEstado
    setConfirmEstado(null)

    setTogglingEstado(true)
    try {
      const result = await updateCurso(id, { estado: nuevoEstado })
      if (result.success) {
        setCurso((prev) => prev ? { ...prev, estado: nuevoEstado } : prev)
        toast.success(`Curso ${nuevoEstado === 'activo' ? 'habilitado' : 'deshabilitado'} correctamente`)
      } else {
        toast.error(result.error || 'Error al cambiar estado del curso')
      }
    } catch {
      toast.error('Error al cambiar estado del curso')
    } finally {
      setTogglingEstado(false)
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

  const isActivo = curso.estado === 'activo'

  return (
    <div className="py-8 px-4">
      <Link href="/dashboard/cursos" className="mb-6 inline-block">
        <Button variant="ghost" className="cursor-pointer gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Formulario principal */}
        <div className="lg:col-span-2 w-full">
          <CursoForm curso={curso} onSuccess={loadCurso} />
        </div>

        {/* Columna lateral */}
        <div className="space-y-3">

          {/* Card: Estado del Curso */}
          <Card className="!py-3 !gap-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-foreground">Estado</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isActivo
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
              }`}>
                {isActivo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {isActivo
                ? 'El curso es visible para los estudiantes.'
                : 'El curso está deshabilitado y no es visible.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleEstado}
              disabled={togglingEstado}
              className={`cursor-pointer w-full gap-2 text-xs font-semibold ${
                isActivo
                  ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-500/10'
                  : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
              }`}
            >
              {isActivo ? (
                <><PowerOff className="h-3.5 w-3.5" /> Deshabilitar Curso</>
              ) : (
                <><Power className="h-3.5 w-3.5" /> Habilitar Curso</>
              )}
            </Button>
          </Card>

          {/* Card: Información */}
          <Card className="!py-3 !gap-2 px-4">
            <h3 className="text-sm font-semibold text-foreground">
              Información
            </h3>
            <div className="space-y-1 text-sm px-0">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estudiantes</span>
                <span className="text-foreground font-medium">{curso.cantidad_estudiantes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Inicio</span>
                <span className="text-foreground font-medium">
                  {new Date(curso.fecha_inicio).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Fin</span>
                <span className="text-foreground font-medium">
                  {new Date(curso.fecha_fin).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Card: Módulos */}
          <Card className="!py-3 !gap-2 px-4">
            <h3 className="text-sm font-semibold text-foreground">Módulos</h3>
            <p className="text-muted-foreground text-xs">
              Gestiona el contenido y estructura del curso.
            </p>
            <Link href={`/dashboard/cursos/${curso.id}/modulos`}>
              <Button variant="outline" className="cursor-pointer w-full gap-2 text-xs">
                Gestionar Módulos
              </Button>
            </Link>
          </Card>

          {/* Card: Estudiantes */}
          <Card className="!py-3 !gap-2 px-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Estudiantes
            </h3>
            <p className="text-muted-foreground text-xs">
              Gestiona los alumnos inscritos, su estado y asistencias.
            </p>
            <Link href={`/dashboard/cursos/${curso.id}/estudiantes`}>
              <Button variant="outline" className="cursor-pointer w-full gap-2 text-xs">
                Gestionar Estudiantes
              </Button>
            </Link>
          </Card>

          {/* Card: Asistencias */}
          <Card className="!py-3 !gap-2 px-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" /> Asistencias
            </h3>
            <p className="text-muted-foreground text-xs">
              Registro de sesiones y control de asistencia por alumno.
            </p>
            <Link href={`/dashboard/cursos/${curso.id}/asistencias`}>
              <Button variant="outline" className="cursor-pointer w-full gap-2 text-xs">
                Ver Asistencias
              </Button>
            </Link>
          </Card>

        </div>
      </div>

      <AlertDialog open={!!confirmEstado} onOpenChange={(open) => !open && setConfirmEstado(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmar acción
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de {confirmEstado?.accion} el curso <strong>&quot;{curso?.nombre}&quot;</strong>?
              <br/><br/>
              {confirmEstado?.nuevoEstado === 'activo' 
                ? 'El curso volverá a estar visible y accesible para los estudiantes.' 
                : 'El curso se ocultará y los estudiantes no podrán acceder a él.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeToggleEstado} className="bg-sky-600 hover:bg-sky-700 text-white">
              Sí, confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
