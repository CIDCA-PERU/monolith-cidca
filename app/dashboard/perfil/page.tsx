import { redirect } from 'next/navigation'
import { getPerfilAdmin } from '@/actions/admin.actions'
import { PerfilEditForm } from '@/components/dashboard/perfil/perfil-edit-form'
import { Mail, CheckCircle2, XCircle } from 'lucide-react'

// --- Helpers ------------------------------------------------------------------

const ROL_COLORS: Record<string, string> = {
  ADMINISTRADOR: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
  COORDINADOR:   'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  DOCENTE:       'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  ESTUDIANTE:    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
}

// --- Página -------------------------------------------------------------------

export default async function PerfilPage() {
  const res = await getPerfilAdmin()
  if (!res.success || !res.data) redirect('/dashboard')

  const u = res.data
  const iniciales = u.usr_nomb_vac
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase() || '?'

  const rolColor = ROL_COLORS[u.rol_nam_vc?.toUpperCase()] ?? ROL_COLORS.ESTUDIANTE

  return (
    <div className="space-y-6 max-w-3xl">
      {/* -- Header -- */}
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Mi perfil</h1>
        <p className="mt-1 text-sm text-black dark:text-white">
          Información de tu cuenta en el sistema
        </p>
      </div>

      {/* -- Tarjeta de identidad -- */}
      <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 shadow-sm overflow-hidden">
        {/* Franja ámbar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-2xl font-bold text-black dark:text-white">{iniciales}</span>
              </div>
              {/* Indicador activo */}
              {u.usr_est_int === 1 && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-sky-800" />
              )}
            </div>

            {/* Nombre + rol + email */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-black dark:text-white">
                  {u.usr_nomb_vac}
                </h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${rolColor}`}>
                  {u.rol_nam_vc}
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-black dark:text-white">
                <Mail className="h-3.5 w-3.5" />
                {u.usr_email_vac}
              </p>
            </div>

            {/* Estado cuenta */}
            {u.usr_est_int === 1 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex-shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cuenta activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 flex-shrink-0">
                <XCircle className="h-3.5 w-3.5" />
                Cuenta inactiva
              </span>
            )}
          </div>
        </div>
      </div>

      {/* -- Datos de la cuenta unificados (edición + vista) -- */}
      <PerfilEditForm perfil={u} />
    </div>
  )
}
