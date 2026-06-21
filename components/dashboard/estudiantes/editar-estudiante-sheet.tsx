'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { editarEstudianteAdmin, EstudianteAdminDto } from '@/actions/admin.actions'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Pencil, Mail, User, Loader2, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export function EditarEstudianteSheet({ estudiante }: { estudiante: EstudianteAdminDto }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, start] = useTransition()

  const [email, setEmail] = useState(estudiante.usr_email_vac)
  const [nombre, setNombre] = useState(estudiante.estu_nomb_vac)
  const [apellidoPat, setApellidoPat] = useState(estudiante.estu_apell_pat_vac)
  const [apellidoMat, setApellidoMat] = useState(estudiante.estu_apell_mat_vac)

  const reset = () => {
    setEmail(estudiante.usr_email_vac)
    setNombre(estudiante.estu_nomb_vac)
    setApellidoPat(estudiante.estu_apell_pat_vac)
    setApellidoMat(estudiante.estu_apell_mat_vac)
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !nombre || !apellidoPat) {
      toast.error('Completa todos los campos obligatorios')
      return
    }

    start(async () => {
      const res = await editarEstudianteAdmin({
        estu_uuid: estudiante.estu_uuid,
        usr_uuid: estudiante.usr_uuid,
        email,
        nombre,
        apellidoPat,
        apellidoMat,
      })

      if (res.success) {
        toast.success(res.message || 'Estudiante actualizado correctamente')
        handleClose()
        router.refresh()
      } else {
        toast.error(res.error || 'Error al editar estudiante')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md text-black dark:text-white hover:text-amber-600 hover:bg-sky-50 dark:hover:bg-amber-500/10 transition-colors"
        title="Editar perfil"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent className="w-full sm:max-w-md bg-white dark:bg-sky-950 border-sky-200 dark:border-sky-900 overflow-y-auto">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-sky-200 dark:border-sky-900">
            <SheetTitle className="text-black dark:text-white flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-500" />
              Editar Estudiante
            </SheetTitle>
            <SheetDescription className="text-black dark:text-white">
              Modifica los datos del perfil del alumno.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>¡Atención!</strong> Editar estos datos afectará directamente la información visible para este usuario. Si el usuario ya usa este correo electrónico, el cambio podría deshabilitar su acceso si no se le notifica del nuevo correo.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                <Mail className="h-3.5 w-3.5" /> Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno@ejemplo.com"
                className="w-full rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
              />
            </div>

            {/* Nombres */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                <User className="h-3.5 w-3.5" /> Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese nombres"
                className="w-full rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
              />
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  Ap. Paterno <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={apellidoPat}
                  onChange={(e) => setApellidoPat(e.target.value)}
                  placeholder="Ingrese apellido paterno"
                  className="w-full rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  Ap. Materno
                </label>
                <input
                  type="text"
                  value={apellidoMat}
                  onChange={(e) => setApellidoMat(e.target.value)}
                  placeholder="Ingrese apellido materno"
                  className="w-full rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black dark:text-white font-bold transition-all shadow-md hover:shadow-lg mt-4"
            >
              {isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                : <><Pencil className="h-4 w-4" /> Guardar cambios</>
              }
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
