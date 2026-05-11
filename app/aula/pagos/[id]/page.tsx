import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PagoVerificado } from '@/components/pago/pago-verificado';
import { ObservacionesAlert } from '@/components/pago/observaciones-alert';
import { PagoUploadForm } from '@/components/pago/pago-upload-form';
import { getPagoById, getPagoByUuid } from '@/repository/aula.repository';
import { supabase } from '@/lib/supabase';

export default async function AulaPagoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pagoId = Number(id);
  
  const pago = Number.isNaN(pagoId)
    ? await getPagoByUuid(id)
    : await getPagoById(pagoId);

  if (!pago) {
    notFound();
  }

  const isPagado = pago.pago_estad_vac === 'PAGADO';
  const isAceptado = pago.pago_estad_vac === 'ACEPTADO';
  const isObservado = pago.pago_estad_vac === 'OBSERVADO';

  // Generar URL fresca si hay un archivo guardado
  let urlFrescaParaMostrar: string | null = null;
  if (pago.pago_url_vac) {
    const { data } = await supabase.storage
      .from('student-private')
      .createSignedUrl(pago.pago_url_vac, 3600); // 1 hora
    urlFrescaParaMostrar = data?.signedUrl || null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {(isPagado || isAceptado) ? 'Pago Verificado' : 'Subir voucher de pago'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Orden {pago.pago_nro_vac || pago.pago_id_int}
          </p>
        </div>
        <Link href="/aula/pagos">
          <Button variant="ghost" size="sm">Volver</Button>
        </Link>
      </div>

      {/* SIEMPRE mostrar el resumen + formulario en grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Columna Izquierda: Resumen */}
        <div className="space-y-4">
          <Card className="p-6 space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Resumen de la orden
              </h3>
              {/* Estado como badge */}
              <div className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                pago.pago_estad_vac === 'PAGADO' || pago.pago_estad_vac === 'ACEPTADO'
                  ? 'bg-green-100 text-green-700' 
                  : pago.pago_estad_vac === 'OBSERVADO' 
                  ? 'bg-amber-100 text-amber-700'
                  : pago.pago_estad_vac === 'ENVIADO'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {pago.pago_estad_vac || 'PENDIENTE'}
              </div>
            </div>

            <div className="space-y-3 text-sm border-t border-border pt-4">
              {/* Nombre del curso */}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Curso</span>
                <span className="font-semibold text-base">
                  {(Array.isArray(pago.curso) ? pago.curso[0]?.cur_nomb_vac : (pago.curso as any)?.cur_nomb_vac) || 'Curso CIDCA'}
                </span>
              </div>

              {/* Descripción del curso */}
              {((Array.isArray(pago.curso) ? pago.curso[0]?.cur_desc_vac : (pago.curso as any)?.cur_desc_vac)) && (
                <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                  <span className="text-muted-foreground">Descripción</span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {Array.isArray(pago.curso) ? pago.curso[0]?.cur_desc_vac : (pago.curso as any)?.cur_desc_vac}
                  </p>
                </div>
              )}

              {/* Fechas */}
              <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                <span className="text-muted-foreground">Período del curso</span>
                <div className="space-y-1">
                  {((Array.isArray(pago.curso) ? pago.curso[0]?.cur_fec_inic_tmp : (pago.curso as any)?.cur_fec_inic_tmp)) && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Inicio: </span>
                      <span className="font-medium">
                        {new Date(Array.isArray(pago.curso) ? pago.curso[0]?.cur_fec_inic_tmp : (pago.curso as any)?.cur_fec_inic_tmp).toLocaleDateString('es-PE', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </p>
                  )}
                  {((Array.isArray(pago.curso) ? pago.curso[0]?.cur_fec_fin_tmp : (pago.curso as any)?.cur_fec_fin_tmp)) && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Fin: </span>
                      <span className="font-medium">
                        {new Date(Array.isArray(pago.curso) ? pago.curso[0]?.cur_fec_fin_tmp : (pago.curso as any)?.cur_fec_fin_tmp).toLocaleDateString('es-PE', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-sm font-medium text-muted-foreground mb-2">Total a Pagar</div>
              <div className="text-4xl font-bold text-foreground">
                S/ {Number(pago.pago_mont_num || 0).toFixed(2)}
              </div>
            </div>
          </Card>

          {/* Si está observado, la alerta sale debajo del resumen */}
          {isObservado && pago.pago_obs_vac && (
            <ObservacionesAlert observacion={pago.pago_obs_vac} />
          )}
        </div>

        {/* Columna Derecha: Formulario si NO está PAGADO o ACEPTADO, o Verificado si lo está */}
        {!isPagado && !isAceptado ? (
          <PagoUploadForm 
            pagoId={pago.pago_id_int} 
            currentUrl={urlFrescaParaMostrar}
            pagoEstado={pago.pago_estad_vac}
          />
        ) : (
          <PagoVerificado
            voucherUrl={urlFrescaParaMostrar || undefined}
            fechaPago={pago.pago_cre_tmp || undefined}
          />
        )}
      </div>
    </div>
  );
}