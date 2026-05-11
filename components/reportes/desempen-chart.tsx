'use client'

import { DesempenoEstudianteDTO } from '@/dto/reporte.dto'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface DesempenChartProps {
  desempen: DesempenoEstudianteDTO
}

export function DesempenChart({ desempen }: DesempenChartProps) {
  const chartData = [
    {
      categoria: 'Asistencia',
      porcentaje: desempen.asistencia_porcentaje,
    },
    {
      categoria: 'Notas',
      porcentaje: (desempen.promedio_notas / 20) * 100,
    },
    {
      categoria: 'Módulos',
      porcentaje:
        (desempen.modulos_completados / desempen.modulos_totales) * 100 || 0,
    },
  ]

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-blue-900 text-blue-100'
      case 'completado':
        return 'bg-green-900 text-green-100'
      case 'suspendido':
        return 'bg-red-900 text-red-100'
      default:
        return 'bg-gray-700 text-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Card de Estado General */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {desempen.nombre}
            </h3>
            <p className="text-sm text-muted-foreground">{desempen.email}</p>
          </div>
          <Badge className={getEstadoColor(desempen.estado_curso)}>
            {desempen.estado_curso.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Promedio</p>
            <p className="text-2xl font-bold text-accent">
              {desempen.promedio_notas.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">/20</p>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Asistencia</p>
            <p className="text-2xl font-bold text-accent">
              {desempen.asistencia_porcentaje.toFixed(0)}%
            </p>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Exámenes</p>
            <p className="text-2xl font-bold text-foreground">
              {desempen.examenes_completados}
            </p>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Módulos</p>
            <p className="text-2xl font-bold text-foreground">
              {desempen.modulos_completados}/{desempen.modulos_totales}
            </p>
          </div>
        </div>
      </Card>

      {/* Gráfico de Desempeño */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Desempeño General
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="categoria" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a3a50',
                border: '1px solid #2a4a60',
                borderRadius: '8px',
              }}
              formatter={(value) => `${(value as number).toFixed(0)}%`}
            />
            <Bar dataKey="porcentaje" fill="#E1A81B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Alertas */}
      {desempen.examenes_con_fraude > 0 && (
        <Card className="p-6 border-destructive/50">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Exámenes con Infracciones
              </h4>
              <p className="text-sm text-muted-foreground">
                Se han detectado {desempen.examenes_con_fraude} examen(es) con
                infracciones de integridad académica.
              </p>
            </div>
          </div>
        </Card>
      )}

      {desempen.promedio_notas >= 17 && (
        <Card className="p-6 border-green-700/50 bg-green-900/10">
          <div className="flex gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Excelente Desempeño
              </h4>
              <p className="text-sm text-muted-foreground">
                Has demostrado un desempeño sobresaliente en este curso.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Último acceso */}
      <Card className="p-4 bg-secondary">
        <p className="text-xs text-muted-foreground mb-1">Último Acceso</p>
        <p className="text-sm text-foreground">
          {new Date(desempen.ultimo_acceso).toLocaleString()}
        </p>
      </Card>
    </div>
  )
}
