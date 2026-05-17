'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface OrdenCardProps {
  pagoId: number;
  cursoNomb: string;
  ciclo?: string;
  monto: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'OBSERVADO' | 'ACEPTADO' | 'ENVIADO';
}

export function OrdenCard({
  pagoId,
  cursoNomb,
  ciclo,
  monto,
  estado,
}: OrdenCardProps) {
  const getBadgeColor = () => {
    switch (estado) {
      case 'PAGADO':
      case 'ACEPTADO':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'OBSERVADO':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      case 'ENVIADO':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'PENDIENTE':
      default:
        return 'bg-red-500/20 text-red-700 border-red-500/30';
    }
  };

  const getButtonText = () => {
    switch (estado) {
      case 'PAGADO':
      case 'ACEPTADO':
        return 'Ver Detalles';
      case 'OBSERVADO':
        return 'Revisar Observación';
      case 'ENVIADO':
        return 'En Revisión';
      case 'PENDIENTE':
      default:
        return 'Cargar Comprobante';
    }
  };

  const getButtonVariant = () => {
    if (estado === 'PAGADO' || estado === 'ACEPTADO') return 'outline';
    if (estado === 'OBSERVADO') return 'secondary';
    return 'default';
  };

  return (
    <Card className="p-5 h-full flex flex-col">
      <div className="space-y-3 flex-1">
        <div>
          <h3 className="font-semibold text-base line-clamp-2">
            {cursoNomb}
          </h3>
          {ciclo && (
            <p className="text-xs text-muted-foreground mt-1">{ciclo}</p>
          )}
        </div>

        <div>
          <Badge
            variant="outline"
            className={`${getBadgeColor()} font-medium`}
          >
            {estado}
          </Badge>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-sm text-slate-500 dark:text-slate-300">Total a pagar</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            S/ {monto.toFixed(2)}
          </p>
        </div>
      </div>

      <Button
        asChild
        variant={getButtonVariant() as any}
        className="w-full mt-4"
      >
        <Link href={`/estudiante/pagos/${pagoId}`} className="flex items-center justify-center gap-2">
          {getButtonText()}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}
