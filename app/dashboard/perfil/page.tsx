import { redirect } from 'next/navigation'
import { getPerfilAdmin } from '@/actions/admin.actions'
import { PerfilEditForm } from '@/components/dashboard/perfil/perfil-edit-form'
import {
  User, Mail, ShieldCheck, CalendarDays,
  CheckCircle2, XCircle, Monitor, Key,
  Activity, Clock, Sparkles,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const PERMISO_LABELS: Record<string, string> = {
  DASHBOARD:     'Dashboard',
  ADMIN:         'Administración',
  GESTIONAR_AULA:'Gestionar aula',
  VER_AULA:      'Ver aula',
  REGISTRO:      'Registro',
  CERTIFICADOS:  'Certificados',
  PAGOS:         'Pagos',
}

// ─── Sección con encabezado ───────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        <Icon className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// ─── Fila de dato ─────────────────────────────────────────────────────────────

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">
        {children}
      </span>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

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
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Información de tu cuenta en el sistema
        </p>
      </div>

      {/* ── Tarjeta de identidad ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Franja ámbar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-2xl font-bold text-slate-950">{iniciales}</span>
              </div>
              {/* Indicador activo */}
              {u.usr_est_int === 1 && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              )}
            </div>

            {/* Nombre + rol + email */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {u.usr_nomb_vac}
                </h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${rolColor}`}>
                  {u.rol_nam_vc}
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
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

          {/* Stats rápidas */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            {[
              {
                icon: Key,
                label: 'Permisos',
                value: u.permiso_cod_vac.length,
                color: 'text-amber-500',
              },
              {
                icon: Activity,
                label: 'Sesiones activas',
                value: u.sesiones_count,
                color: 'text-emerald-500',
              },
              {
                icon: Monitor,
                label: 'Modo oscuro',
                value: u.usr_mod_bol ? 'Activado' : 'Desactivado',
                color: 'text-blue-500',
              },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className={`h-5 w-5 mx-auto mb-1.5 ${s.color}`} />
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Editar perfil (nombre + tema) ── */}
      <PerfilEditForm perfil={u} />

      {/* ── Datos de la cuenta ── */}
      <Section icon={User} title="Datos de la cuenta">
        <DataRow label="Nombre completo">
          {u.usr_nomb_vac || '—'}
        </DataRow>
        <DataRow label="Correo electrónico">
          {u.usr_email_vac}
        </DataRow>
        <DataRow label="Rol">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${rolColor}`}>
            <ShieldCheck className="h-3 w-3" />
            {u.rol_nam_vc}
          </span>
        </DataRow>
        <DataRow label="Estado">
          {u.usr_est_int === 1 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
              <XCircle className="h-3.5 w-3.5" /> Inactivo
            </span>
          )}
        </DataRow>
        <DataRow label="Preferencia de tema">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Monitor className="h-3.5 w-3.5 text-slate-400" />
            {u.usr_mod_bol ? 'Modo oscuro' : 'Modo claro'}
          </span>
        </DataRow>
        <DataRow label="Fecha de registro">
          <span className="flex items-center gap-1 justify-end">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(u.usr_cre_tmp)}
          </span>
        </DataRow>
        <DataRow label="Última actualización">
          <span className="flex items-center gap-1 justify-end">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(u.usr_upd_tmp)}
          </span>
        </DataRow>
      </Section>

      {/* ── Permisos ── */}
      <Section icon={Sparkles} title="Permisos asignados">
        {u.permiso_cod_vac.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Sin permisos asignados</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {u.permiso_cod_vac.map((cod) => (
              <span
                key={cod}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <Key className="h-3 w-3 text-amber-500" />
                {PERMISO_LABELS[cod] ?? cod}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* ── UUID técnico ── */}
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 px-5 py-3.5 flex items-center justify-between gap-4">
        <span className="text-xs text-slate-400 font-medium">UUID de cuenta</span>
        <code className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
          {u.usr_uuid}
        </code>
      </div>
    </div>
  )
}
