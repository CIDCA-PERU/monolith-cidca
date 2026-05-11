import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/actions/auth.actions'
import { getEstudianteByUserId, getPagosByEstudiante } from '@/repository/aula.repository'

export default async function AulaPagosPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const estudiante = await getEstudianteByUserId(user.usr_id_int)
  const pagos = estudiante ? await getPagosByEstudiante(estudiante.estu_id_int) : []
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ordenes de pago</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus pagos pendientes.
          </p>
        </div>
        <Button variant="outline" size="sm">Pendientes</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pagos.map((pago) => {
          const curso = Array.isArray(pago.curso) ? pago.curso[0] : (pago.curso as any);
          const montoAMostrar = pago.pago_mont_num || curso?.cur_precio_num || 0;
          
          return (
            <Card key={pago.pago_id_int} className="p-4 space-y-4 flex flex-col h-full">
              <div className="flex-1 space-y-3">
                {/* Encabezado */}
                <div>
                  <div className="text-xs text-muted-foreground">Orden de pago</div>
                  <div className="text-base font-semibold line-clamp-2">
                    {curso?.cur_nomb_vac || 'Curso sin nombre'}
                  </div>
                </div>

                {/* Estado */}
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pago.pago_estad_vac === 'PAGADO' || pago.pago_estad_vac === 'ACEPTADO'
                      ? 'bg-green-100 text-green-700' 
                      : pago.pago_estad_vac === 'OBSERVADO' 
                      ? 'bg-amber-100 text-amber-700'
                      : pago.pago_estad_vac === 'ENVIADO'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {pago.pago_estad_vac || 'PENDIENTE'}
                  </span>
                </div>

                {/* Monto a pagar */}
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">Total a pagar</p>
                  <p className="text-2xl font-bold text-foreground">
                    S/ {Number(montoAMostrar).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Botón de acción */}
              <Link href={`/aula/pagos/${pago.pago_uuid || pago.pago_id_int}`}>
                <Button 
                  className="w-full" 
                  size="sm"
                  variant={pago.pago_estad_vac === 'PAGADO' || pago.pago_estad_vac === 'ACEPTADO' ? 'outline' : pago.pago_estad_vac === 'OBSERVADO' ? 'secondary' : 'default'}
                >
                  {pago.pago_estad_vac === 'PAGADO' || pago.pago_estad_vac === 'ACEPTADO'
                    ? 'Ver Detalles' 
                    : pago.pago_estad_vac === 'OBSERVADO' 
                    ? 'Revisar' 
                    : pago.pago_estad_vac === 'ENVIADO'
                    ? 'En Revisión'
                    : 'Enviar Comprobante'}
                </Button>
              </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
