import { getCurrentUser } from '@/actions/auth.actions'
import { getCursosAdmin, getPagosAdmin, getEstudiantesAdmin } from '@/actions/admin.actions'
import { BookOpen, Users, CreditCard, TrendingUp, ArrowRight, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const rol = user?.rol_nam_vc?.toUpperCase() ?? ''
  const isAdmin = ['SISTEMAS', 'ADMINISTRADOR'].includes(rol)

  // Cargar métricas en paralelo (solo para admin/sistemas)
  const [cursosRes, pagosRes, estudiantesRes] = await Promise.all([
    getCursosAdmin(),
    isAdmin ? getPagosAdmin() : Promise.resolve({ success: true, data: [] }),
    isAdmin ? getEstudiantesAdmin() : Promise.resolve({ success: true, data: [] }),
  ])

  const cursos = cursosRes.data ?? []
  const pagos = pagosRes.data ?? []
  const estudiantes = estudiantesRes.data ?? []

  const pagosPendientes = pagos.filter((p) => p.pago_estad_vac === 'PENDIENTE').length
  const cursosActivos = cursos.filter((c) => c.cur_est_int === 1).length

  const metrics = [
    {
      label: 'Cursos activos',
      value: cursosActivos,
      total: cursos.length,
      icon: BookOpen,
      href: '/dashboard/cursos',
      color: 'amber',
      visible: true,
    },
    {
      label: 'Estudiantes',
      value: estudiantes.length,
      total: null,
      icon: Users,
      href: '/dashboard/estudiantes',
      color: 'blue',
      visible: isAdmin,
    },
    {
      label: 'Pagos pendientes',
      value: pagosPendientes,
      total: pagos.length,
      icon: CreditCard,
      href: '/dashboard/pagos',
      color: 'emerald',
      visible: isAdmin,
    },
    {
      label: 'Asistencias hoy',
      value: '—',
      total: null,
      icon: ClipboardList,
      href: '/dashboard/asistencias',
      color: 'violet',
      visible: true,
    },
  ]

  const colorMap: Record<string, { bg: string; icon: string; badge: string; border: string }> = {
    amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',   icon: 'text-amber-600 dark:text-amber-400',   badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-500/20' },
    blue:    { bg: 'bg-blue-50 dark:bg-blue-500/10',     icon: 'text-blue-600 dark:text-blue-400',     badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',     border: 'border-blue-200 dark:border-blue-500/20' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/20' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-500/10', icon: 'text-violet-600 dark:text-violet-400', badge: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-500/20' },
  }

  const quickLinks = [
    { label: 'Gestionar cursos', href: '/dashboard/cursos', visible: true },
    { label: 'Ver estudiantes', href: '/dashboard/estudiantes', visible: isAdmin },
    { label: 'Registrar asistencia', href: '/dashboard/asistencias', visible: true },
    { label: 'Revisar pagos', href: '/dashboard/pagos', visible: isAdmin },
    { label: 'Ver auditoría', href: '/dashboard/auditoria', visible: isAdmin },
  ].filter((l) => l.visible)

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bienvenido, {user?.usr_nomb_vac?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {rol === 'SISTEMAS'
            ? 'Acceso completo al sistema'
            : rol === 'ADMINISTRADOR'
            ? 'Panel de administración CIDCA'
            : 'Panel de gestión docente'}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.filter((m) => m.visible).map((m) => {
          const Icon = m.icon
          const c = colorMap[m.color]
          return (
            <Link
              key={m.label}
              href={m.href}
              className={`
                group relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900
                ${c.border} p-5 shadow-sm hover:shadow-md transition-all duration-200
                hover:-translate-y-0.5
              `}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${c.bg}`}>
                  <Icon className={`h-5 w-5 ${c.icon}`} />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors mt-1" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {m.value}
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {m.label}
                  {m.total !== null && (
                    <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                      / {m.total} total
                    </span>
                  )}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Accesos rápidos + Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accesos rápidos */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
            Accesos rápidos
          </h2>
          <div className="space-y-1.5">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-all duration-150 group"
              >
                <span>{l.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Últimos cursos */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Cursos recientes
            </h2>
            <Link href="/dashboard/cursos" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {cursos.slice(0, 5).map((c) => (
              <div
                key={c.cur_uuid}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                    backgroundColor: c.cur_est_int === 1 ? '#10b981' : '#94a3b8'
                  }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {c.cur_nomb_vac}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                      {c.docente_nombre}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {c.estudiantes_count} alumnos
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    c.cur_est_int === 1
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
                  }`}>
                    {c.cur_est_int === 1 ? 'Activo' : 'Borrador'}
                  </span>
                </div>
              </div>
            ))}
            {cursos.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                No hay cursos registrados
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pagos pendientes (solo admin) */}
      {isAdmin && pagosPendientes > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  {pagosPendientes} pago{pagosPendientes !== 1 ? 's' : ''} pendiente{pagosPendientes !== 1 ? 's' : ''} de revisión
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400/70">
                  Revisa y aprueba los comprobantes para matricular a los estudiantes
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/pagos"
              className="flex-shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:underline"
            >
              Revisar →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
