import { getEstudiantesAdmin } from '@/actions/admin.actions'
import Link from 'next/link'
import { Users, Search, Eye, GraduationCap, CheckCircle2, XCircle } from 'lucide-react'

function genBadge(genero: string | null) {
  if (!genero) return null
  const g = genero.toUpperCase()
  if (g === 'M' || g === 'MASCULINO')
    return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">M</span>
  if (g === 'F' || g === 'FEMENINO')
    return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400">F</span>
  return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{genero}</span>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function EstudiantesPage() {
  const res = await getEstudiantesAdmin()
  const estudiantes = res.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Estudiantes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {estudiantes.length} alumno{estudiantes.length !== 1 ? 's' : ''} registrado{estudiantes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {estudiantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No hay estudiantes registrados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Correo
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    Género
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Cursos
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                    Registrado
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {estudiantes.map((est) => (
                  <tr
                    key={est.estu_uuid}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Nombre completo */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {est.estu_nomb_vac?.charAt(0)?.toUpperCase() ?? '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {[est.estu_apell_pat_vac, est.estu_apell_mat_vac].filter(Boolean).join(' ')}{' '}
                            {est.estu_nomb_vac}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 md:hidden">
                            {est.usr_email_vac}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-slate-600 dark:text-slate-400">
                        {est.usr_email_vac}
                      </span>
                    </td>

                    {/* Género */}
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      {genBadge(est.estu_gen_vac)}
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
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span className="font-semibold">{est.cursos_count}</span>
                      </div>
                    </td>

                    {/* Fecha registro */}
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(est.estu_cre_tmp)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/dashboard/estudiantes/${est.estu_uuid}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          title="Ver perfil"
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
    </div>
  )
}
