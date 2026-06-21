'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearEstudianteManualAdmin } from '@/actions/admin.actions'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  PlusCircle, UserPlus, Mail, Lock, User, Key, Loader2
} from 'lucide-react'
import { toast } from 'sonner'

export function NuevoEstudianteSheet() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, start] = useTransition()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellidoPat, setApellidoPat] = useState('')
  const [apellidoMat, setApellidoMat] = useState('')
  const [docTipo, setDocTipo] = useState('DNI')
  const [docNumero, setDocNumero] = useState('')

  const reset = () => {
    setEmail('')
    setPassword('')
    setNombre('')
    setApellidoPat('')
    setApellidoMat('')
    setDocTipo('DNI')
    setDocNumero('')
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !nombre || !apellidoPat || !docNumero) {
      toast.error('Completa todos los campos obligatorios')
      return
    }

    start(async () => {
      const res = await crearEstudianteManualAdmin({
        email,
        password,
        nombre,
        apellidoPat,
        apellidoMat,
        docTipo,
        docNumero,
      })

      if (res.success) {
        toast.success(res.message || 'Estudiante creado correctamente')
        handleClose()
        router.refresh()
      } else {
        toast.error(res.error || 'Error al crear estudiante')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black dark:text-white text-sm font-semibold shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 self-start sm:self-auto"
      >
        <PlusCircle className="h-4 w-4" />
        Nuevo estudiante
      </button>

      <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent className="w-full sm:max-w-md bg-white dark:bg-sky-950 border-sky-200 dark:border-sky-900 overflow-y-auto">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-sky-200 dark:border-sky-900">
            <SheetTitle className="text-black dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-500" />
              Registrar nuevo estudiante
            </SheetTitle>
            <SheetDescription className="text-black dark:text-white">
              Crea una cuenta de estudiante de forma manual. El origen quedará registrado como MANUAL.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                <Lock className="h-3.5 w-3.5" /> Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caracteres"
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

            {/* Documento */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                <Key className="h-3.5 w-3.5" /> Documento <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={docTipo}
                  onChange={(e) => setDocTipo(e.target.value)}
                  className="w-1/3 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-3 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASAPORTE">PAS</option>
                </select>
                <input
                  type="text"
                  value={docNumero}
                  onChange={(e) => {
                    let val = e.target.value
                    if (docTipo === 'DNI') val = val.replace(/\D/g, '')
                    setDocNumero(val)
                  }}
                  maxLength={docTipo === 'DNI' ? 8 : undefined}
                  placeholder="Número"
                  className="w-2/3 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
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
                : <><UserPlus className="h-4 w-4" /> Crear estudiante</>
              }
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
