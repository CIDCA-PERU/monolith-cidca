'use client'

import { CertificadoDTO } from '@/dto/reporte.dto'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CertificadoViewerProps {
  certificado: CertificadoDTO
}

export function CertificadoViewer({ certificado }: CertificadoViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(certificado.codigo_verificacion)
    setCopied(true)
    toast.success('Código copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    // Aquí iría la descarga del PDF
    toast.info('Descarga en construcción')
  }

  return (
    <Card className="p-8 bg-card border-border max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 pb-8 border-b border-border">
        <div className="mb-4">
          <span className="inline-block px-4 py-2 bg-accent text-primary rounded-lg font-bold text-sm">
            CERTIFICADO OFICIAL
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {certificado.curso_nombre}
        </h1>
      </div>

      {/* Contenido */}
      <div className="space-y-6 mb-8">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-2">Se otorga el presente</p>
          <p className="text-2xl font-bold text-foreground">
            {certificado.estudiante_nombre}
          </p>
          <p className="text-muted-foreground text-sm mt-4">
            Por haber completado satisfactoriamente el curso
          </p>
        </div>

        {/* Información */}
        <div className="grid grid-cols-2 gap-6 py-6 border-y border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Nota Final
            </p>
            <p className="text-xl font-bold text-accent">
              {certificado.nota_final.toFixed(2)}/20
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Asistencia
            </p>
            <p className="text-xl font-bold text-accent">
              {certificado.asistencia_porcentaje.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Docente
            </p>
            <p className="text-sm text-foreground">{certificado.docente_nombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Emitido
            </p>
            <p className="text-sm text-foreground">
              {new Date(certificado.fecha_emision).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Estado */}
        <div className="text-center">
          <Badge
            className={
              certificado.estado === 'emitido'
                ? 'bg-green-900 text-green-100'
                : 'bg-yellow-900 text-yellow-100'
            }
          >
            {certificado.estado.toUpperCase()}
          </Badge>
        </div>

        {/* Código de verificación */}
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Código de Verificación
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-foreground font-mono">
              {certificado.codigo_verificacion}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleDownload}
          className="gap-2 bg-accent text-primary hover:bg-accent/90"
        >
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
        <Button variant="outline">Ver en Portal</Button>
      </div>

      {/* Pie */}
      <div className="mt-8 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Este certificado puede ser verificado ingresando el código en nuestro portal
        </p>
      </div>
    </Card>
  )
}
