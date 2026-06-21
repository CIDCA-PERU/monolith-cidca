import Link from 'next/link'
import { getCursosConCertificadosAdmin } from '@/actions/admin.actions'
import { Award, Users, ChevronRight, BookOpen } from 'lucide-react'
import { SearchBar } from '@/components/ui/search-bar'
import { Pagination } from '@/components/ui/pagination'

function formatFecha(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })
}

export default async function CertificadosDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = typeof params.search === 'string' ? params.search : undefined

  const res = await getCursosConCertificadosAdmin(page, limit, search)
  const cursos = res.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            Certificados
          </h1>
          <p className="mt-1 text-sm text-black dark:text-white">
            Gestiona los certificados de los alumnos por curso. Haz clic en un curso para emitir o editar certificados.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <SearchBar placeholder="Buscar curso..." />
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Cursos activos',
            value: cursos.length,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
          },
          {
            label: 'Cert. emitidos',
            value: cursos.reduce((a, c) => a + c.certs_emitidos, 0),
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
          },
          {
            label: 'Pendientes',
            value: cursos.reduce((a, c) => a + (c.total_inscritos - c.certs_emitidos), 0),
            color: 'text-black dark:text-white',
            bg: 'bg-white dark:bg-sky-950',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-sky-200 dark:border-sky-900 p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-black dark:text-white mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de cursos */}
      {cursos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed border-sky-200 dark:border-sky-900">
          <BookOpen className="h-10 w-10 text-black dark:text-white mb-3" />
          <p className="text-black dark:text-white font-medium">No hay cursos activos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cursos.map((curso) => {
            const pct = curso.total_inscritos > 0
              ? Math.round((curso.certs_emitidos / curso.total_inscritos) * 100)
              : 0
            const completado = pct === 100 && curso.total_inscritos > 0

            return (
              <Link
                key={curso.cur_id_int}
                href={`/dashboard/certificados/${curso.cur_id_int}`}
                className="group flex items-center gap-4 p-4 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-md transition-all"
              >
                {/* Icono */}
                <div className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${
                  completado
                    ? 'bg-emerald-100 dark:bg-emerald-500/20'
                    : 'bg-amber-100 dark:bg-amber-500/20'
                }`}>
                  <Award className={`h-5 w-5 ${completado ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-black dark:text-white text-sm leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                      {curso.cur_nomb_vac}
                    </p>
                    <span className="flex-shrink-0 text-xs font-bold text-black dark:text-white">
                      {pct}%
                    </span>
                  </div>

                  {/* Sub-info */}
                  <div className="flex items-center gap-3 mt-1 text-xs text-black dark:text-white">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {curso.total_inscritos} alumnos
                    </span>
                    <span>
                      {curso.certs_emitidos}/{curso.total_inscritos} emitidos
                    </span>
                    {(curso.cur_fec_inic_tmp || curso.cur_fec_fin_tmp) && (
                      <span>
                        {formatFecha(curso.cur_fec_inic_tmp)}
                        {curso.cur_fec_fin_tmp ? ` — ${formatFecha(curso.cur_fec_fin_tmp)}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-2.5 w-full bg-white dark:bg-sky-950 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        completado
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Flecha */}
                <ChevronRight className="flex-shrink-0 h-4 w-4 text-black dark:text-white group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}
        </div>
      )}

      <Pagination totalPages={res.meta?.totalPages ?? 1} />
    </div>
  )
}
