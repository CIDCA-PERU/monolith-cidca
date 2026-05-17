import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/actions/auth.actions'
import { getEstudianteByUserId, getPagosByEstudiante } from '@/repository/aula.repository'
import { PagoFilter } from '@/components/aula/pagos/pago-filter'

export default async function AulaPagosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams
  const estadoFiltro = resolvedSearchParams.estado || 'TODOS'
  
  const estudiante = await getEstudianteByUserId(user.usr_id_int)
  const pagos = estudiante ? await getPagosByEstudiante(estudiante.estu_id_int) : []
  
  const pagosFiltrados = pagos.filter((pago) => {
    if (estadoFiltro === 'TODOS') return true
    const estadoActual = pago.pago_estad_vac || 'PENDIENTE'
    return estadoActual === estadoFiltro
  })
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ordenes de pago</h1>
          <p className="text-sm text-white">
            Gestiona tus pagos pendientes.
          </p>
        </div>
        <PagoFilter />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pagosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No se encontraron pagos con el estado: {estadoFiltro}
          </div>
        ) : (
          pagosFiltrados.map((pago) => {
            const curso = Array.isArray(pago.curso) ? pago.curso[0] : (pago.curso as any);
            const cursoNombre = (
              curso?.cur_nomb_vac?.toString().trim() ||
              (curso as any)?.nombre ||
              (curso as any)?.cur_nom_vac ||
              (Array.isArray(pago.curso) ? pago.curso?.[0]?.cur_nomb_vac : undefined) ||
              'Curso sin nombre'
            );
            const montoAMostrar = pago.pago_mont_num ?? curso?.cur_precio_num ?? 0;
            const estadoPago = pago.pago_estad_vac || 'PENDIENTE';
            
            return (
              <Card key={pago.pago_id_int} className="p-4 space-y-4 flex flex-col h-full">
                <div className="flex-1 space-y-3">
                  {/* Encabezado */}
                  <div>
                    <div className="text-xs text-white">Orden de pago</div>
                    <div className="text-base font-semibold line-clamp-2">
                      {cursoNombre}
                    </div>
                  </div>

                {/* Estado */}
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                   estadoPago === 'ACEPTADO'
                      ? 'bg-green-100 text-green-700' 
                      : estadoPago === 'OBSERVADO' 
                      ? 'bg-amber-100 text-amber-700'
                      : estadoPago === 'ENVIADO'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700' // PENDIENTE
                  }`}>
                    {estadoPago}
                  </span>
                </div>

                {/* Monto a pagar */}
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-white">Total a pagar</p>
                  <p className="text-2xl font-bold text-white">
                    S/ {Number(montoAMostrar).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Botón de acción */}
              <Link href={`/aula/pagos/${pago.pago_uuid || pago.pago_id_int}`}>
                <Button 
                    className="cursor-pointer w-full hover:text-white hover:bg-slate-800" 
                    size="sm"
                    variant={estadoPago === 'ACEPTADO' ? 'outline' : estadoPago === 'OBSERVADO' ? 'secondary' : 'default'}
                  >
                    {estadoPago === 'ACEPTADO'
                      ? 'Ver Detalles' 
                      : estadoPago === 'OBSERVADO' 
                      ? 'Revisar Observación' 
                      : estadoPago === 'ENVIADO'
                      ? 'En Revisión'
                      : 'Enviar Comprobante'}
                  </Button>
                </Link>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
