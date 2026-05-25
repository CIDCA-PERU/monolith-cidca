'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  EstudianteCertificadoDto,
  upsertCertificado,
} from '@/actions/admin.actions'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Award, CheckCircle2, Clock, Link2, Hash,
  CalendarDays, Loader2, ExternalLink, Search,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Badge ────────────────────────────────────────────────────────────────────

function CertBadge({ emitido }: { emitido: boolean }) {
  if (emitido) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
        <CheckCircle2 className="h-3 w-3" />
        Emitido
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">
      <Clock className="h-3 w-3" />
      Pendiente
    </span>
  )
}

// ─── Sheet de emisión ─────────────────────────────────────────────────────────

function CertSheet({
  estudiante,
  curIdInt,
  open,
  onClose,
  onSave,
}: {
  estudiante: EstudianteCertificadoDto | null
  curIdInt: number
  open: boolean
  onClose: () => void
  onSave: (estu: EstudianteCertificadoDto) => void
}) {
  const [codigo, setCodigo]     = useState('')
  const [url, setUrl]           = useState('')
  const [fecha, setFecha]       = useState('')
  const [isPending, start]      = useTransition()

  // Obtiene la fecha de hoy en Lima (YYYY-MM-DD) sin conversión UTC
  const todayLima = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date())

  // Convierte un ISO timestamp a YYYY-MM-DD en Lima
  const isoToLimaDate = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date(iso))

  // Rellenar el formulario cuando cambia el estudiante seleccionado
  useEffect(() => {
    if (!estudiante) return
    setCodigo(estudiante.cert_cod_vac ?? '')
    setUrl(estudiante.cert_url_vac ?? '')
    setFecha(
      estudiante.cert_fec_emi_tmp
        ? isoToLimaDate(estudiante.cert_fec_emi_tmp)  // ← fecha real en Lima
        : todayLima()                                  // ← hoy en Lima
    )
  }, [estudiante?.estu_id_int])

  if (!estudiante) return null

  const nombreCompleto = [
    estudiante.estu_nomb_vac,
    estudiante.estu_apell_pat_vac,
    estudiante.estu_apell_mat_vac,
  ].filter(Boolean).join(' ')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast.error('El enlace del certificado es obligatorio')
      return
    }
    start(async () => {
      // Interpretar la fecha del input como mediodía Lima (UTC-5)
      // para evitar desfase al convertir a ISO (ej: "2025-05-24" → "2025-05-24T17:00:00Z")
      const isoFecha = `${fecha}T12:00:00-05:00`
      const res = await upsertCertificado({
        estuIdInt:    estudiante.estu_id_int,
        curIdInt,
        certCodVac:   codigo.trim(),
        certUrlVac:   url.trim(),
        certFecEmiTmp: isoFecha,
      })
      if (res.success) {
        toast.success(`Certificado ${estudiante.cert_id_int ? 'actualizado' : 'emitido'} correctamente`)
        onSave({
          ...estudiante,
          cert_cod_vac:     codigo.trim() || null,
          cert_url_vac:     url.trim()    || null,
          cert_fec_emi_tmp: isoFecha,
        })
        onClose()
      } else {
        toast.error(res.error ?? 'Error al guardar')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            {estudiante.cert_id_int ? 'Editar certificado' : 'Emitir certificado'}
          </SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400 font-medium">
            {nombreCompleto}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-5">
          {/* Código */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Hash className="h-3.5 w-3.5" />
              Código del certificado
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="CIDCA-2025-001"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-mono transition"
            />
          </div>

          {/* URL de descarga */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Link2 className="h-3.5 w-3.5" />
              Enlace de descarga <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
            />
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline mt-1"
              >
                <ExternalLink className="h-3 w-3" />
                Verificar enlace
              </a>
            )}
            <p className="text-xs text-slate-400">
              Puede ser un enlace de Google Drive, Dropbox, servidor propio, etc.
            </p>
          </div>

          {/* Fecha de emisión */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <CalendarDays className="h-3.5 w-3.5" />
              Fecha de emisión
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
            />
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-md hover:shadow-lg"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              <><Award className="h-4 w-4" /> {estudiante.cert_id_int ? 'Actualizar certificado' : 'Emitir certificado'}</>
            )}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ─── Manager principal ────────────────────────────────────────────────────────

export function CertificadosManager({
  curIdInt,
  cursoNombre,
  initialEstudiantes,
}: {
  curIdInt: number
  cursoNombre: string
  initialEstudiantes: EstudianteCertificadoDto[]
}) {
  const [estudiantes, setEstudiantes] = useState(initialEstudiantes)
  const [selected, setSelected]       = useState<EstudianteCertificadoDto | null>(null)
  const [query, setQuery]             = useState('')
  const [filtro, setFiltro]           = useState<'TODOS' | 'EMITIDO' | 'PENDIENTE'>('TODOS')

  const counts = {
    TODOS:     estudiantes.length,
    EMITIDO:   estudiantes.filter((e) => e.cert_url_vac).length,
    PENDIENTE: estudiantes.filter((e) => !e.cert_url_vac).length,
  }

  const pct = counts.TODOS > 0 ? Math.round((counts.EMITIDO / counts.TODOS) * 100) : 0

  const filtrados = estudiantes.filter((e) => {
    const nombre = [e.estu_nomb_vac, e.estu_apell_pat_vac, e.estu_apell_mat_vac]
      .filter(Boolean).join(' ').toLowerCase()
    const matchQuery  = !query || nombre.includes(query.toLowerCase())
    const matchFiltro = filtro === 'TODOS'
      ? true
      : filtro === 'EMITIDO' ? Boolean(e.cert_url_vac) : !e.cert_url_vac
    return matchQuery && matchFiltro
  })

  const handleSave = (actualizado: EstudianteCertificadoDto) => {
    setEstudiantes((prev) =>
      prev.map((e) => e.estu_id_int === actualizado.estu_id_int ? actualizado : e)
    )
  }

  return (
    <div className="space-y-5">
      {/* Progreso */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progreso de emisión</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cursoNombre}</p>
          </div>
          <span className="text-2xl font-bold text-amber-500">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
          <span><span className="font-bold text-emerald-600 dark:text-emerald-400">{counts.EMITIDO}</span> emitidos</span>
          <span><span className="font-bold text-amber-600 dark:text-amber-400">{counts.PENDIENTE}</span> pendientes</span>
          <span><span className="font-bold text-slate-700 dark:text-slate-300">{counts.TODOS}</span> total</span>
        </div>
      </div>

      {/* Filtros + búsqueda */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar alumno..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
          />
        </div>
        {(['TODOS', 'EMITIDO', 'PENDIENTE'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              filtro === f
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/40'
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Award className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No hay alumnos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alumno</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Código</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Fecha emisión</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtrados.map((est) => {
                  const emitido = Boolean(est.cert_url_vac)
                  const nombre = [est.estu_nomb_vac, est.estu_apell_pat_vac, est.estu_apell_mat_vac]
                    .filter(Boolean).join(' ')
                  return (
                    <tr
                      key={est.estu_id_int}
                      className="hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{nombre}</p>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        {est.cert_cod_vac ? (
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                            {est.cert_cod_vac}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400">
                        {est.cert_fec_emi_tmp
                          ? new Intl.DateTimeFormat('es-PE', {
                              timeZone: 'America/Lima',
                              day: '2-digit', month: 'short', year: 'numeric',
                            }).format(new Date(est.cert_fec_emi_tmp))
                          : '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <CertBadge emitido={emitido} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setSelected(est)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                            emitido
                              ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400'
                              : 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                          }`}
                        >
                          {emitido ? 'Editar' : '+ Emitir'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CertSheet
        estudiante={selected}
        curIdInt={curIdInt}
        open={!!selected}
        onClose={() => setSelected(null)}
        onSave={handleSave}
      />
    </div>
  )
}
