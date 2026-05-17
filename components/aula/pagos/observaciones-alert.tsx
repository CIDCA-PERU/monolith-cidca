'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ObservacionesAlertProps {
  observacion?: string | null;
}

export function ObservacionesAlert({ observacion }: ObservacionesAlertProps) {
  // Solo renderizar si existe observación
  if (!observacion || observacion.trim() === '') return null;

  return (
    <Alert variant="destructive" className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">
        Observación:
      </AlertTitle>
      <AlertDescription className="text-amber-800 mt-2 font-bold">
        {observacion}
      </AlertDescription>
    </Alert>
  );
}