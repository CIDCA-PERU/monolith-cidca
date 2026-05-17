'use client'

import { ReporteAsistenciaDto } from '@/dto/asistencia.dto'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface AsistenciaReporteProps {
  reporte: ReporteAsistenciaDto
  onUpdateAsistencia?: (asistenciaId: string, nuevoEstado: number) => void
}

export function AsistenciaReporte({
  reporte,
  onUpdateAsistencia,
}: AsistenciaReporteProps) {
  const getEstadoLabel = (estado: number) => {
    switch (estado) {
      case 1:
        return 'Presente'
      case 2:
        return 'Ausente'
      case 3:
        return 'Tardío'
      default:
        return 'Desconocido'
    }
  }

  const getEstadoColor = (estado: number) => {
    switch (estado) {
      case 1:
        return 'bg-green-900 text-green-100'
      case 2:
        return 'bg-red-900 text-red-100'
      case 3:
        return 'bg-yellow-900 text-yellow-100'
      default:
        return 'bg-gray-700 text-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Resumen de Asistencia
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <Users className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {reporte.total_estudiantes}
            </p>
            <p className="text-xs text-muted-foreground">Total Estudiantes</p>
          </div>

          <div className="text-center p-4 bg-secondary rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {reporte.presentes}
            </p>
            <p className="text-xs text-muted-foreground">Presentes</p>
          </div>

          <div className="text-center p-4 bg-secondary rounded-lg">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {reporte.tardios}
            </p>
            <p className="text-xs text-muted-foreground">Tardíos</p>
          </div>

          <div className="text-center p-4 bg-secondary rounded-lg">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {reporte.ausentes}
            </p>
            <p className="text-xs text-muted-foreground">Ausentes</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">
              Porcentaje de Asistencia
            </span>
            <span className="text-2xl font-bold text-accent">
              {reporte.porcentaje_asistencia.toFixed(1)}%
            </span>
          </div>
          <div className="mt-3 w-full bg-secondary rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{
                width: `${reporte.porcentaje_asistencia}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tabla de registros */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Detalle de Asistencia
        </h3>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground">Estudiante</TableHead>
                <TableHead className="text-foreground">Estado</TableHead>
                <TableHead className="text-foreground">Hora Registro</TableHead>
                <TableHead className="text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reporte.registros.map((registro) => (
                <TableRow
                  key={registro.asist_id_int}
                  className="border-border hover:bg-secondary"
                >
                  <TableCell className="text-foreground">
                    {registro.estu_nomb_vac} {registro.estu_apell_pat_vac}
                  </TableCell>
                  <TableCell>
                    <Badge className={getEstadoColor(registro.asist_est_int)}>
                      {getEstadoLabel(registro.asist_est_int)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(registro.asist_cre_tmp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {onUpdateAsistencia && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateAsistencia(registro.asist_id_int.toString(), 1)}
                            disabled={registro.asist_est_int === 1}
                            className="text-xs"
                          >
                            P
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateAsistencia(registro.asist_id_int.toString(), 3)}
                            disabled={registro.asist_est_int === 3}
                            className="text-xs"
                          >
                            T
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateAsistencia(registro.asist_id_int.toString(), 2)}
                            disabled={registro.asist_est_int === 2}
                            className="text-xs"
                          >
                            A
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
