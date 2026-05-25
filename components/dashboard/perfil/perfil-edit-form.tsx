'use client'

import { useState, useTransition } from 'react'
import { useTheme } from 'next-themes'
import { actualizarPerfilAdmin, PerfilUsuarioDto } from '@/actions/admin.actions'
import {
  Pencil, Save, X, Sun, Moon, Loader2, CheckCircle2, User,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Toggle de modo oscuro ────────────────────────────────────────────────────

function DarkModeToggle({
  initialValue,
}: {
  initialValue: boolean
}) {
  const { setTheme, resolvedTheme } = useTheme()
  const [isPending, start] = useTransition()
  const isDark = resolvedTheme === 'dark'

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
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">Modo de pantalla</span>
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label="Cambiar tema"
        className={`
          relative inline-flex h-7 w-14 items-center rounded-full border-2 transition-all duration-300
          ${isDark
            ? 'bg-slate-700 border-slate-600'
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
              ? 'translate-x-7 bg-slate-900'
              : 'translate-x-0.5 bg-white'
            }
          `}
        >
          {isPending
            ? <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
            : isDark
              ? <Moon className="h-3 w-3 text-amber-400" />
              : <Sun className="h-3 w-3 text-amber-500" />
          }
        </span>

        {/* Etiqueta */}
        <span className={`
          absolute text-[10px] font-bold transition-all duration-300
          ${isDark ? 'left-2 text-slate-400' : 'right-2 text-amber-600'}
        `}>
          {isDark ? 'OSC' : 'CLA'}
        </span>
      </button>
    </div>
  )
}

// ─── Formulario de edición ────────────────────────────────────────────────────

export function PerfilEditForm({ perfil }: { perfil: PerfilUsuarioDto }) {
  const [editMode, setEditMode]   = useState(false)
  const [nombre, setNombre]       = useState(perfil.usr_nomb_vac)
  const [isPending, start]        = useTransition()

  const handleGuardar = () => {
    if (!nombre.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    start(async () => {
      const res = await actualizarPerfilAdmin({ usrNombVac: nombre.trim() })
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
    setEditMode(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Encabezado sección */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Editar perfil
          </h2>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar nombre
          </button>
        )}
      </div>

      <div className="p-6 space-y-1">

        {/* Nombre */}
        <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
            Nombre completo
          </span>

          {editMode ? (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <input
                autoFocus
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGuardar() }}
                className="flex-1 max-w-[220px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
              />
              <button
                onClick={handleGuardar}
                disabled={isPending}
                className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white transition"
                title="Guardar"
              >
                {isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Save className="h-3.5 w-3.5" />
                }
              </button>
              <button
                onClick={handleCancelar}
                disabled={isPending}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {nombre}
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Correo (solo lectura) */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">Correo electrónico</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-500 italic">
            {perfil.usr_email_vac}
            <span className="ml-2 text-[10px] text-slate-400 not-italic">(no editable)</span>
          </span>
        </div>

        {/* Toggle tema claro / oscuro */}
        <DarkModeToggle initialValue={perfil.usr_mod_bol} />
      </div>
    </div>
  )
}
