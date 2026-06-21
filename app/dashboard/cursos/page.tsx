import { getCursosAdmin } from '@/actions/admin.actions'
import Link from 'next/link'
import { Plus, BookOpen, Users, Eye, Pencil } from 'lucide-react'
import { SearchBar } from '@/components/ui/search-bar'
import { Pagination } from '@/components/ui/pagination'

export default async function CursosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = typeof params.search === 'string' ? params.search : undefined

  const res = await getCursosAdmin(page, limit, search)
  const cursos = res.data ?? []
  const total = res.meta?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Cursos
          </h1>
          <p className="mt-1 text-sm text-black dark:text-white">
            {total} curso{total !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <SearchBar placeholder="Buscar curso..." />
          <Link
            href="/dashboard/cursos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black dark:text-white text-sm font-semibold shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo curso
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950 shadow-sm overflow-hidden">
        {cursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-black dark:text-white mb-4" />
            <p className="text-black dark:text-white font-medium">
              No hay cursos registrados
            </p>
            <p className="text-sm text-black dark:text-white mt-1">
              Crea el primer curso para comenzar
            </p>
            <Link
              href="/dashboard/cursos/nuevo"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black dark:text-white text-sm font-semibold transition-all"
            >
              <Plus className="h-4 w-4" /> Crear curso
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sky-200 dark:border-sky-900 bg-white dark:bg-sky-950">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden md:table-cell">
                    Docente
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden sm:table-cell">
                    Alumnos
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider hidden lg:table-cell">
                    Precio
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-200 dark:divide-sky-900 dark:divide-sky-200 dark:divide-sky-900">
                {cursos.map((curso) => (
                  <tr
                    key={curso.cur_uuid}
                    className="hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors group"
                  >
                    {/* Nombre + imagen */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {curso.cur_url_vac ? (
                          <img
                            src={curso.cur_url_vac}
                            alt={curso.cur_nomb_vac}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-sky-200 dark:border-sky-900"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-black dark:text-white truncate max-w-[200px]">
                            {curso.cur_nomb_vac}
                          </p>
                          <p className="text-xs text-black dark:text-white truncate max-w-[200px]">
                            {curso.cur_desc_vac}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Docente */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-black dark:text-white font-medium">
                        {curso.docente_nombre}
                      </p>
                      <p className="text-xs text-black dark:text-white">
                        {curso.docente_email}
                      </p>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        curso.cur_est_int === 1
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-white dark:bg-sky-950 text-black dark:text-white'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          curso.cur_est_int === 1 ? 'bg-emerald-500' : 'bg-white dark:bg-sky-950'
                        }`} />
                        {curso.cur_est_int === 1 ? 'Activo' : 'Borrador'}
                      </span>
                    </td>

                    {/* Alumnos */}
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <div className="inline-flex items-center gap-1.5 text-black dark:text-white">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-semibold">{curso.estudiantes_count}</span>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-4 text-right hidden lg:table-cell">
                      <span className="font-semibold text-black dark:text-white">
                        {curso.cur_precio_num > 0
                          ? `S/ ${Number(curso.cur_precio_num).toFixed(2)}`
                          : 'Gratuito'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/cursos/${curso.cur_uuid}`}
                          className="p-1.5 rounded-md text-black dark:text-white hover:text-amber-600 hover:bg-sky-50 dark:hover:bg-amber-500/10 transition-colors"
                          title="Gestionar curso"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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
