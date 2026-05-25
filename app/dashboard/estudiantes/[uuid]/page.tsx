import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getEstudiantePerfilAdmin,
  CursoPerfilDto,
} from '@/actions/admin.actions'
import {
  ArrowLeft, User, Mail, GraduationCap, CalendarDays,
  CheckCircle2, XCircle, CreditCard, Award, BookOpen,
  Clock, AlertCircle, Download, ExternalLink,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'America/Lima',
  }).format(new Date(iso))
}

function PagoBadge({ estado }: { estado: string | null }) {
  if (!estado) return <span className="text-xs text-slate-400">Sin pago</span>
  const cfg: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    ACEPTADO:  { label: 'Aceptado',  cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
    PAGADO:    { label: 'Aceptado',  cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
    PENDIENTE: { label: 'Pendiente', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', icon: Clock },
    OBSERVADO: { label: 'Observado', cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20', icon: AlertCircle },
    ENVIADO:   { label: 'Enviado',   cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', icon: CreditCard },
  }
  const c = cfg[estado] ?? cfg.PENDIENTE
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${c.cls}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  )
}

// ─── Tarjeta de curso ─────────────────────────────────────────────────────────

function CursoCard({ curso }: { curso: CursoPerfilDto }) {
  const tieneCert = Boolean(curso.cert_url_vac)
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
      {/* Nombre del curso */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">
            {curso.cur_nomb_vac}
          </p>
        </div>
        <PagoBadge estado={curso.pago_estad_vac} />
      </div>

      {/* Periodo */}
      {(curso.cur_fec_inic_tmp || curso.cur_fec_fin_tmp) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(curso.cur_fec_inic_tmp)}
          {curso.cur_fec_fin_tmp && ` — ${formatDate(curso.cur_fec_fin_tmp)}`}
        </div>
      )}

      {/* Pago */}
      {curso.pago_mont_num !== null && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CreditCard className="h-3.5 w-3.5" />
          S/ {Number(curso.pago_mont_num).toFixed(2)}
          {curso.pago_nro_vac && (
            <span className="font-mono text-slate-400">· {curso.pago_nro_vac}</span>
          )}
        </div>
      )}

      {/* Certificado */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        {tieneCert ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Award className="h-3.5 w-3.5" />
              <span className="font-semibold">Certificado emitido</span>
              {curso.cert_cod_vac && (
                <span className="font-mono text-xs text-slate-400 ml-1">{curso.cert_cod_vac}</span>
              )}
            </div>
            <a
              href={curso.cert_url_vac!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <Download className="h-3 w-3" />
              Descargar
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Award className="h-3.5 w-3.5" />
            Sin certificado
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function EstudiantePerfilPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = await params
  const res = await getEstudiantePerfilAdmin(uuid)

  if (!res.success || !res.data) notFound()

  const est = res.data
  const nombreCompleto = [est.estu_nomb_vac, est.estu_apell_pat_vac, est.estu_apell_mat_vac]
    .filter(Boolean).join(' ')
  const iniciales = [est.estu_nomb_vac?.charAt(0), est.estu_apell_pat_vac?.charAt(0)]
    .filter(Boolean).join('').toUpperCase() || '?'

  const certCount = est.cursos.filter((c) => c.cert_url_vac).length
  const pagoAceptado = est.cursos.filter((c) =>
    c.pago_estad_vac === 'ACEPTADO' || c.pago_estad_vac === 'PAGADO'
  ).length

  const generoLabel =
    est.estu_gen_vac?.toUpperCase() === 'M' || est.estu_gen_vac?.toUpperCase() === 'MASCULINO'
      ? 'Masculino'
      : est.estu_gen_vac?.toUpperCase() === 'F' || est.estu_gen_vac?.toUpperCase() === 'FEMENINO'
        ? 'Femenino'
        : est.estu_gen_vac ?? '—'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/dashboard/estudiantes"
          className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Estudiantes
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{nombreCompleto}</span>
      </div>

      {/* Tarjeta de perfil */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Franja superior */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
              <span className="text-xl font-bold text-slate-950">{iniciales}</span>
            </div>

            {/* Info principal */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{nombreCompleto}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  {est.usr_email_vac || '—'}
                </span>
                {est.estu_gen_vac && (
                  <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <User className="h-3.5 w-3.5" />
                    {generoLabel}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Desde {formatDate(est.estu_cre_tmp)}
                </span>
              </div>
            </div>

            {/* Badge estado cuenta */}
            {est.usr_est_int === 1 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cuenta activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                <XCircle className="h-3.5 w-3.5" />
                Cuenta inactiva
              </span>
            )}
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            {[
              { icon: GraduationCap, label: 'Cursos inscritos', value: est.cursos_count, color: 'text-amber-500' },
              { icon: CreditCard,    label: 'Pagos aceptados',  value: pagoAceptado,     color: 'text-emerald-500' },
              { icon: Award,         label: 'Certificados',     value: certCount,         color: 'text-blue-500' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cursos */}
      <div>
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-amber-500" />
          Cursos inscritos
        </h2>

        {est.cursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Sin cursos inscritos</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {est.cursos.map((curso) => (
              <CursoCard key={curso.cur_id_int} curso={curso} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
