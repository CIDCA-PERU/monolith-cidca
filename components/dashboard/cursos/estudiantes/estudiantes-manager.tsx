'use client'

import { useState } from 'react'
import { EstudianteCursoDto } from '@/dto/estudiante-curso.dto'
import { toggleEstudianteCurso } from '@/actions/curso.actions'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Search, UserCheck, UserX, Users, AlertTriangle } from 'lucide-react'
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

interface EstudiantesManagerProps {
  cursoId: string
  initialEstudiantes: EstudianteCursoDto[]
}

export function EstudiantesManager({ cursoId, initialEstudiantes }: EstudiantesManagerProps) {
  const [estudiantes, setEstudiantes] = useState<EstudianteCursoDto[]>(initialEstudiantes)
  const [busqueda, setBusqueda] = useState('')
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const [confirmToggle, setConfirmToggle] = useState<{ estCurId: number, estadoActual: boolean } | null>(null)

  const filtered = estudiantes.filter((e) => {
    const nombre = `${e.estu_nomb_vac} ${e.estu_apell_pat_vac} ${e.estu_apell_mat_vac}`.toLowerCase()
    const email = e.usr_email_vac.toLowerCase()
    const q = busqueda.toLowerCase()
    return nombre.includes(q) || email.includes(q)
  })

  const executeToggle = async () => {
    if (!confirmToggle) return
    const { estCurId, estadoActual } = confirmToggle
    const nuevoEstado = !estadoActual
    
    setConfirmToggle(null)
    setLoadingId(estCurId)
    try {
      const result = await toggleEstudianteCurso(estCurId, nuevoEstado)
      if (result.success) {
        setEstudiantes((prev) =>
          prev.map((e) =>
            e.est_cur_id_int === estCurId ? { ...e, est_cur_estado_bol: nuevoEstado } : e
          )
        )
        toast.success(`Estudiante ${nuevoEstado ? 'habilitado' : 'deshabilitado'} correctamente`)
      } else {
        toast.error(result.error || 'Error al cambiar estado')
      }
    } catch {
      toast.error('Error al cambiar estado del estudiante')
    } finally {
      setLoadingId(null)
    }
  }

  const totalActivos = estudiantes.filter((e) => e.est_cur_estado_bol).length

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="px-4 py-3 flex flex-col items-center justify-center text-center">
          <Users className="h-5 w-5 text-amber-500 mb-1" />
          <span className="text-2xl font-bold text-foreground">{estudiantes.length}</span>
          <span className="text-xs text-muted-foreground">Total inscritos</span>
        </Card>
        <Card className="px-4 py-3 flex flex-col items-center justify-center text-center">
          <UserCheck className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalActivos}</span>
          <span className="text-xs text-muted-foreground">Activos</span>
        </Card>
        <Card className="px-4 py-3 flex flex-col items-center justify-center text-center">
          <UserX className="h-5 w-5 text-red-500 mb-1" />
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">{estudiantes.length - totalActivos}</span>
          <span className="text-xs text-muted-foreground">Inactivos</span>
        </Card>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Estudiante</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Inscripción</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">
                    {busqueda ? 'No se encontraron resultados.' : 'No hay estudiantes inscritos.'}
                  </td>
                </tr>
              ) : (
                filtered.map((est) => (
                  <tr
                    key={est.est_cur_id_int}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {est.estu_apell_pat_vac} {est.estu_apell_mat_vac}, {est.estu_nomb_vac}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{est.usr_email_vac}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(est.est_cur_cre_tmp).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        est.est_cur_estado_bol
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {est.est_cur_estado_bol ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingId === est.est_cur_id_int}
                        onClick={() => setConfirmToggle({ estCurId: est.est_cur_id_int, estadoActual: est.est_cur_estado_bol })}
                        className={`cursor-pointer text-xs ${
                          est.est_cur_estado_bol
                            ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-500/10'
                            : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                        }`}
                      >
                        {loadingId === est.est_cur_id_int
                          ? '...'
                          : est.est_cur_estado_bol ? 'Deshabilitar' : 'Habilitar'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AlertDialog open={!!confirmToggle} onOpenChange={(open) => !open && setConfirmToggle(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmar acción
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas {confirmToggle && (!confirmToggle.estadoActual ? 'habilitar' : 'deshabilitar')} a este estudiante?
              <br/><br/>
              {confirmToggle && (!confirmToggle.estadoActual 
                ? 'El estudiante recuperará el acceso al curso.' 
                : 'El estudiante perderá el acceso al curso inmediatamente.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeToggle} className="bg-sky-600 hover:bg-sky-700 text-white">
              Sí, confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
