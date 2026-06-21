import { getEstudiantesAdmin } from '@/actions/admin.actions'
import Link from 'next/link'
import { Users, Search, Eye, GraduationCap, CheckCircle2, XCircle, Globe, UserCog } from 'lucide-react'
import { NuevoEstudianteSheet } from '@/components/dashboard/estudiantes/nuevo-estudiante-sheet'
import { EditarEstudianteSheet } from '@/components/dashboard/estudiantes/editar-estudiante-sheet'
import { SearchBar } from '@/components/ui/search-bar'
import { Pagination } from '@/components/ui/pagination'


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function EstudiantesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = typeof params.search === 'string' ? params.search : undefined

  const res = await getEstudiantesAdmin(page, limit, search)
  const estudiantes = res.data ?? []
  const total = res.meta?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Estudiantes
          </h1>
          <p className="mt-1 text-sm text-black dark:text-white">
            {total} alumno{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <SearchBar placeholder="Buscar por nombre o apellidos..." />
          <NuevoEstudianteSheet />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 shadow-sm overflow-hidden">
        {estudiantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-12 w-12 text-black dark:text-white mb-4" />
            <p className="text-black dark:text-white font-medium">
              No hay estudiantes registrados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden md:table-cell">
                    Correo
                  </th>

                  <th className="text-center px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden sm:table-cell">
                    Cursos inscritos
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden xl:table-cell">
                    Registrado
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden lg:table-cell">
                    Origen
                  </th>
                  <th className="text-center px-5 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-200 dark:divide-sky-900 dark:divide-sky-200 dark:divide-sky-900">
                {estudiantes.map((est) => (
                  <tr
                    key={est.estu_uuid}
                    className="hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors group"
                  >
                    {/* Nombre completo */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-black dark:text-white">
                            {est.estu_nomb_vac?.charAt(0)?.toUpperCase() ?? '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black dark:text-white">
                            {[est.estu_apell_pat_vac, est.estu_apell_mat_vac].filter(Boolean).join(' ')}{' '}
                            {est.estu_nomb_vac}
                          </p>
                          <p className="text-xs text-black dark:text-white md:hidden">
                            {est.usr_email_vac}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-black dark:text-white">
                        {est.usr_email_vac}
                      </span>
                    </td>



                    {/* Estado cuenta */}
                    <td className="px-4 py-4 text-center">
                      {est.usr_est_int === 1 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                          <XCircle className="h-3 w-3" /> Inactivo
                        </span>
                      )}
                    </td>

                    {/* Cursos */}
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <div className="inline-flex items-center gap-1.5 text-black dark:text-white">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span className="font-semibold">{est.cursos_count}</span>
                      </div>
                    </td>

                    {/* Fecha registro */}
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="text-black dark:text-white text-xs">
                        {formatDate(est.estu_cre_tmp)}
                      </span>
                    </td>

                    {/* Origen */}
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      {est.usr_origen_vac === 'MANUAL' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <UserCog className="h-3 w-3" /> Manual
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400">
                          <Globe className="h-3 w-3" /> Web
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/dashboard/estudiantes/${est.estu_uuid}`}
                          className="p-1.5 rounded-md text-black dark:text-white hover:text-amber-600 hover:bg-sky-50 dark:hover:bg-amber-500/10 transition-colors"
                          title="Ver perfil"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <EditarEstudianteSheet estudiante={est} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination totalPages={res.meta?.totalPages ?? 1} />
    </div>
  )
}
