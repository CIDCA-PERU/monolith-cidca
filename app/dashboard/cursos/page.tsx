import { getCursosAdmin } from '@/actions/admin.actions'
import Link from 'next/link'
import { Plus, BookOpen, Users, Eye, Pencil } from 'lucide-react'

export default async function CursosAdminPage() {
  const res = await getCursosAdmin()
  const cursos = res.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Cursos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <Link
          href="/dashboard/cursos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-semibold shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo curso
        </Link>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {cursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No hay cursos registrados
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Crea el primer curso para comenzar
            </p>
            <Link
              href="/dashboard/cursos/nuevo"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-semibold transition-all"
            >
              <Plus className="h-4 w-4" /> Crear curso
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Docente
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    Alumnos
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Precio
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cursos.map((curso) => (
                  <tr
                    key={curso.cur_uuid}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Nombre + imagen */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {curso.cur_url_vac ? (
                          <img
                            src={curso.cur_url_vac}
                            alt={curso.cur_nomb_vac}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {curso.cur_nomb_vac}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                            {curso.cur_desc_vac}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Docente */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {curso.docente_nombre}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {curso.docente_email}
                      </p>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        curso.cur_est_int === 1
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          curso.cur_est_int === 1 ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        {curso.cur_est_int === 1 ? 'Activo' : 'Borrador'}
                      </span>
                    </td>

                    {/* Alumnos */}
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-semibold">{curso.estudiantes_count}</span>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-4 text-right hidden lg:table-cell">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {curso.cur_precio_num > 0
                          ? `S/ ${Number(curso.cur_precio_num).toFixed(2)}`
                          : 'Gratuito'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/dashboard/cursos/${curso.cur_uuid}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/cursos/${curso.cur_uuid}/editar`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="Editar curso"
                        >
                          <Pencil className="h-4 w-4" />
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
    </div>
  )
}
