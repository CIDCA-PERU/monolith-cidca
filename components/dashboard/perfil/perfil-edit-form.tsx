'use client'

import { useState, useTransition, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { actualizarPerfilAdmin, PerfilUsuarioDto } from '@/actions/admin.actions'
import {
  Pencil, Save, X, Sun, Moon, Loader2, CheckCircle2, User, ShieldCheck, CalendarDays, Clock, XCircle
} from 'lucide-react'
import { toast } from 'sonner'

// --- Helpers ------------------------------------------------------------------

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Lima',
  }).format(new Date(iso))
}

const ROL_COLORS: Record<string, string> = {
  ADMINISTRADOR: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
  COORDINADOR:   'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  DOCENTE:       'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  ESTUDIANTE:    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
}

// --- Toggle de modo oscuro ----------------------------------------------------

function DarkModeToggle({
  initialValue,
}: {
  initialValue: boolean
}) {
  const { setTheme, resolvedTheme } = useTheme()
  const [isPending, start] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === 'dark' : initialValue

  const handleToggle = () => {
    const newDark = !isDark
    // 1) cambio visual inmediato
    setTheme(newDark ? 'dark' : 'light')
    // 2) persistir en BD
    start(async () => {
      const res = await actualizarPerfilAdmin({ usrModBol: newDark })
      if (!res.success) {
        toast.error(res.error ?? 'Error al guardar preferencia')
        // revertir si falla
        setTheme(isDark ? 'dark' : 'light')
      }
    })
  }

  void initialValue // lo recibimos por si el tema aún no está resuelto (SSR)

  return (
    <div className="flex items-center justify-between py-3 border-b border-sky-200 dark:border-sky-900">
      <span className="text-sm text-black dark:text-white">Modo de pantalla</span>
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label="Cambiar tema"
        className={`
          relative inline-flex h-7 w-14 items-center rounded-full border-2 transition-all duration-300
          ${isDark
            ? 'bg-sky-100 dark:bg-sky-900 border-sky-200 dark:border-sky-900'
            : 'bg-amber-100 border-amber-300'
          }
          disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
          focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2
        `}
      >
        {/* Pill deslizante */}
        <span
          className={`
            inline-flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-300
            ${isDark
              ? 'translate-x-7 bg-sky-100 dark:bg-sky-900'
              : 'translate-x-0.5 bg-white'
            }
          `}
        >
          {isPending
            ? <Loader2 className="h-3 w-3 animate-spin text-black dark:text-white" />
            : isDark
              ? <Moon className="h-3 w-3 text-amber-400" />
              : <Sun className="h-3 w-3 text-amber-500" />
          }
        </span>

        {/* Etiqueta */}
        <span className={`
          absolute text-[10px] font-bold transition-all duration-300
          ${isDark ? 'left-2 text-black dark:text-white' : 'right-2 text-amber-600'}
        `}>
          {isDark ? 'OSC' : 'CLA'}
        </span>
      </button>
    </div>
  )
}

// --- Formulario de edición ----------------------------------------------------

export function PerfilEditForm({ perfil }: { perfil: PerfilUsuarioDto }) {
  const [editMode, setEditMode] = useState(false)
  const [nombre, setNombre] = useState(perfil.usr_nomb_vac)
  const [email, setEmail] = useState(perfil.usr_email_vac)
  const [isPending, start] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGuardar = () => {
    if (!nombre.trim() || !email.trim()) {
      toast.error('Nombre y correo son obligatorios')
      return
    }
    start(async () => {
      const res = await actualizarPerfilAdmin({ 
        usrNombVac: nombre.trim(),
        usrEmailVac: email.trim()
      })
      if (res.success) {
        toast.success('Perfil actualizado correctamente')
        setEditMode(false)
      } else {
        toast.error(res.error ?? 'Error al guardar')
      }
    })
  }

  const handleCancelar = () => {
    setNombre(perfil.usr_nomb_vac)
    setEmail(perfil.usr_email_vac)
    setEditMode(false)
  }

  const rolColor = ROL_COLORS[perfil.rol_nam_vc?.toUpperCase()] ?? ROL_COLORS.ESTUDIANTE

  return (
    <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 shadow-sm overflow-hidden">
      {/* Encabezado sección */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
            Datos de la cuenta
          </h2>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar datos
          </button>
        )}
      </div>

      <div className="p-6 space-y-1">

        {/* Nombre */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-sky-200 dark:border-sky-900">
          <span className="text-sm text-black dark:text-white flex-shrink-0">
            Nombre de usuario
          </span>

          {editMode ? (
            <input
              autoFocus
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGuardar() }}
              className="flex-1 max-w-[280px] rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-3 py-1.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
            />
          ) : (
            <span className="text-sm font-medium text-black dark:text-white text-right">
              {nombre || '—'}
            </span>
          )}
        </div>

        {/* Correo */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-sky-200 dark:border-sky-900">
          <span className="text-sm text-black dark:text-white flex-shrink-0">
            Correo
          </span>

          {editMode ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGuardar() }}
              className="flex-1 max-w-[280px] rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 px-3 py-1.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
            />
          ) : (
            <span className="text-sm font-medium text-black dark:text-white text-right">
              {perfil.usr_email_vac}
            </span>
          )}
        </div>

        {/* Rol */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-sky-200 dark:border-sky-900">
          <span className="text-sm text-black dark:text-white flex-shrink-0">
            Rol
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${rolColor}`}>
            <ShieldCheck className="h-3 w-3" />
            {perfil.rol_nam_vc}
          </span>
        </div>

        {/* Estado */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-sky-200 dark:border-sky-900">
          <span className="text-sm text-black dark:text-white flex-shrink-0">
            Estado
          </span>
          {perfil.usr_est_int === 1 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
              <XCircle className="h-3.5 w-3.5" /> Inactivo
            </span>
          )}
        </div>

        {/* Fecha de registro */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-sky-200 dark:border-sky-900">
          <span className="text-sm text-black dark:text-white flex-shrink-0">
            Fecha de registro
          </span>
          <span className="flex items-center gap-1 justify-end text-sm font-medium text-black dark:text-white text-right">
            <CalendarDays className="h-3.5 w-3.5" />
            {mounted ? formatDate(perfil.usr_cre_tmp) : '...'}
          </span>
        </div>

        {/* Última actualización */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-sky-200 dark:border-sky-900">
          <span className="text-sm text-black dark:text-white flex-shrink-0">
            Última actualización
          </span>
          <span className="flex items-center gap-1 justify-end text-sm font-medium text-black dark:text-white text-right">
            <Clock className="h-3.5 w-3.5" />
            {mounted ? formatDate(perfil.usr_upd_tmp) : '...'}
          </span>
        </div>

        {/* Toggle tema claro / oscuro */}
        <DarkModeToggle initialValue={perfil.usr_mod_bol} />

        {/* Botones generales de guardado (solo en modo edición) */}
        {editMode && (
          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-sky-200 dark:border-sky-900">
            <button
              onClick={handleCancelar}
              disabled={isPending}
              className="px-4 py-2 rounded-lg border border-sky-200 dark:border-sky-900 text-sm font-semibold text-black dark:text-white hover:bg-sky-50 dark:hover:bg-sky-900/40 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
