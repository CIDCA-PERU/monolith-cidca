import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCurrentUser } from '@/actions/auth.actions'
import { getCertificadosByEstudiante, getEstudianteByUserId } from '@/repository/aula.repository'
import { Download, FileCheck, Clock } from 'lucide-react'

function formatearFechaBonita(isoString: string | null | undefined) {
  if (!isoString) return '-';
  
  try {
    const date = new Date(isoString);
    
    const formateador = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Lima'
    });

    return formateador.format(date);
  } catch (error) {
    return '-';
  }
}

export default async function AulaCertificadosPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const estudiante = await getEstudianteByUserId(user.usr_id_int)
  const certificados = estudiante
    ? await getCertificadosByEstudiante(estudiante.estu_id_int)
    : []

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mis certificados</h1>
        <p className="text-base text-slate-600 dark:text-slate-200">
          Descarga tus certificados cuando estén disponibles.
        </p>
      </div>

      {certificados.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/50 to-muted/25 p-16 text-center backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <FileCheck className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay certificados aún</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Tus certificados aparecerán aquí cuando estén disponibles. Mantente atento.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-lg">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                <TableHead className="font-bold text-slate-900 dark:text-slate-50 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                    Curso
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-900 dark:text-slate-50 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                    Código
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-900 dark:text-slate-50 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-pink-500 rounded-full"></div>
                    Fecha de emisión
                  </div>
                </TableHead>
                <TableHead className="text-right font-bold text-slate-900 dark:text-slate-50 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    Acciones
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificados.map((cert) => (
                <TableRow 
                  key={cert.cert_id_int} 
                  className="border-b border-border/30 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 dark:hover:from-blue-500/10 dark:hover:to-purple-500/10 transition-all duration-200 group"
                >
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                      <span className="font-semibold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cert.curso?.cur_nomb_vac || 'Curso sin nombre'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-100">
                        {cert.cert_cod_vac || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
                      <Clock className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                      <span className="text-sm font-medium">
                        {formatearFechaBonita(cert.cert_fec_emi_tmp)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right py-5">
                    {cert.cert_url_vac ? (
                      <Button 
                        size="sm" 
                        className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        asChild
                      >
                        <a href={cert.cert_url_vac} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4" />
                          Descargar
                        </a>
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          Pendiente
                        </span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="px-6 py-4 border-t border-border/50 bg-gradient-to-r from-slate-50/30 to-slate-100/30 dark:from-slate-900/20 dark:to-slate-800/20 text-xs text-slate-600 dark:text-slate-300">
            Total de certificados: <span className="font-semibold text-slate-900 dark:text-slate-50">{certificados.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}