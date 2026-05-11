'use client'

import { useState } from 'react'
import { SesionClaseDto, RegistrarAsistenciaResponseDto } from '@/dto/asistencia.dto'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { registrarAsistencia } from '@/actions/asistencia.actions'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface AsistenciaRegistradorProps {
  sesion: SesionClaseDto
}

export function AsistenciaRegistrador({ sesion }: AsistenciaRegistradorProps) {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<RegistrarAsistenciaResponseDto | null>(null)

  const handleRegistrar = async () => {
    setLoading(true)
    try {
      const result = await registrarAsistencia(sesion.ses_id_int.toString())
      setResultado(result)

      if (result.success) {
        toast.success(result.mensaje)
      } else {
        toast.error(result.razon_rechazo)
      }
    } finally {
      setLoading(false)
    }
  }

  const puedeRegistrar = sesion.puede_asistir && !resultado?.success

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Registrar Asistencia
        </h3>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            <span className="text-foreground">
              {new Date(sesion.ses_fecha_dat).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hora Inicio:</span>
            <span className="text-foreground">{sesion.ses_hora_inic_tmp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hora Fin:</span>
            <span className="text-foreground">{sesion.ses_hora_fin_tmp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className={`font-medium ${
              sesion.ses_estado_vac === 'EN_PROGRESO'
                ? 'text-accent'
                : sesion.ses_estado_vac === 'PROGRAMADA'
                ? 'text-blue-400'
                : 'text-muted-foreground'
            }`}>
              {sesion.ses_estado_vac}
            </span>
          </div>
        </div>

        {/* Información de ventana de asistencia */}
        {sesion.minutos_antes_inicio > 15 && !resultado?.success && (
          <Alert className="mb-4">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              La sesión inicia en {sesion.minutos_antes_inicio} minutos. Puedes registrar tu
              asistencia 15 minutos antes.
            </AlertDescription>
          </Alert>
        )}

        {sesion.minutos_desde_inicio > 30 && !resultado?.success && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ha pasado más de 30 minutos desde el fin de la sesión. No se puede registrar
              asistencia.
            </AlertDescription>
          </Alert>
        )}

        {/* Resultado del registro */}
        {resultado?.success && (
          <Alert className="mb-4 bg-green-900 border-green-700">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-100">
              {resultado.mensaje}
            </AlertDescription>
          </Alert>
        )}

        {resultado && !resultado.success && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {resultado.razon_rechazo}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Button
        onClick={handleRegistrar}
        disabled={loading || !puedeRegistrar || resultado?.success}
        className="w-full bg-accent text-primary hover:bg-accent/90"
      >
        {loading
          ? 'Registrando...'
          : resultado?.success
          ? 'Asistencia Registrada'
          : 'Registrar Asistencia'}
      </Button>

      {!puedeRegistrar && !resultado?.success && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          No puedes registrar asistencia en este momento
        </p>
      )}
    </Card>
  )
}
