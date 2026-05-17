'use client';

import { CheckCircle, Eye, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PagoVerificadoProps {
  voucherUrl?: string;
  fechaPago?: string;
}

export function PagoVerificado({ voucherUrl, fechaPago }: PagoVerificadoProps) {
  return (
    <div className="space-y-4">
      {/* Vista previa de la imagen */}
      {voucherUrl && (
        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
          <img
            src={voucherUrl}
            alt="Comprobante verificado"
            className="w-full h-auto object-cover max-h-96"
          />
        </div>
      )}

      {/* Card de verificación */}
      <Card className="p-6 space-y-4 border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">
              Pago Verificado con Éxito
            </h3>
            {fechaPago && (
              <p className="text-sm text-green-700">
                Fecha de pago:{' '}
                {new Date(fechaPago).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {voucherUrl && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.open(voucherUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver en otra pestaña
          </Button>
        )}
      </Card>
    </div>
  );
}
