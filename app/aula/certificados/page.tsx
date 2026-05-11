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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mis certificados</h1>
        <p className="text-sm text-muted-foreground">
          Descarga tus certificados cuando esten disponibles.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Codigo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificados.map((cert) => (
              <TableRow key={cert.cert_id_int}>
                <TableCell>{cert.curso?.cur_nomb_vac || 'Curso'}</TableCell>
                <TableCell>{cert.cert_cod_vac || '-'}</TableCell>
                <TableCell>{cert.cert_fec_emi_tmp || '-'}</TableCell>
                <TableCell>
                  {cert.cert_url_vac ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={cert.cert_url_vac} target="_blank" rel="noreferrer">
                        Descargar
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Pendiente
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
