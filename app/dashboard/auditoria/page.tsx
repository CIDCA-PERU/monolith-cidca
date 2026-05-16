import { getAuditoriaAdmin } from '@/actions/admin.actions'
import { ScrollText, CreditCard, BookOpen, GraduationCap } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const tipoConfig = {
  PAGO: {
    icon: CreditCard,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    label: 'Pago',
  },
  CURSO: {
    icon: BookOpen,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    label: 'Curso',
  },
  MATRICULA: {
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    label: 'Matrícula',
  },
} as const

export default async function AuditoriaPage() {
  const res = await getAuditoriaAdmin()
  const items = res.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Auditoría de Negocio
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Historial de cambios relevantes en pagos, cursos y matrículas
        </p>
      </div>

      {/* Feed */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ScrollText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No hay registros de auditoría aún
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Los cambios en pagos, cursos y matrículas aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Cabecera */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50">
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</span>
                <span className="col-span-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</span>
                <span className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Responsable</span>
                <span className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Fecha</span>
              </div>
            </div>

            {/* Items */}
            {items.map((item, idx) => {
              const cfg = tipoConfig[item.tipo] ?? tipoConfig.CURSO
              const Icon = cfg.icon
              return (
                <div
                  key={idx}
                  className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Tipo */}
                    <div className="col-span-1">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="col-span-7 lg:col-span-6 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.descripcion}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Acción: {item.accion || '—'}
                      </p>
                    </div>

                    {/* Responsable */}
                    <div className="col-span-3 hidden lg:block">
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {item.responsable}
                      </p>
                    </div>

                    {/* Fecha */}
                    <div className="col-span-4 lg:col-span-2 text-right">
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                        {formatDate(item.fecha)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
