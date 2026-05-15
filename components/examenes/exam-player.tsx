'use client'

import { useState, useCallback } from 'react'
import { useExamProctoring } from '@/hooks/use-exam-proctoring'
import { ExamenDetailDto } from '@/dto/examen.dto'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Clock } from 'lucide-react'
import { enviarRespuestas, registrarInfraccion } from '@/actions/examen.actions'
import { toast } from 'sonner'

interface ExamPlayerProps {
  examen: ExamenDetailDto
  intentoId: string
  duracionMinutos: number
}

export function ExamPlayer({
  examen,
  intentoId,
  duracionMinutos,
}: ExamPlayerProps) {
  const [respuestas, setRespuestas] = useState<Record<number, any>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const { infractions, timeRemaining, formattedTime, infractionCount, isTimeUp } =
    useExamProctoring({
      intentoId,
      duracionMinutos,
      onInfraction: async (type) => {
        const result = await registrarInfraccion(intentoId, type)
        if (!result.success) {
          toast.error('Error al registrar infracción')
        }
      },
      onTimeout: handleTimeUp,
    })

  async function handleTimeUp() {
    await handleSubmit()
  }

  const handleRespuesta = useCallback((preguntaId: number, valor: any) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: valor,
    }))
  }, [])

  const handleSubmit = async () => {
    if (loading) return

    setLoading(true)

    try {
      const respuestasArray = examen.preguntas.map((preg) => ({
        preg_id_int: preg.preg_id_int,
        opc_pre_id_int: respuestas[preg.preg_id_int]?.opcionId,
        rpta_estu_text_vac: respuestas[preg.preg_id_int]?.texto,
        rpta_estu_num: respuestas[preg.preg_id_int]?.numero,
      }))

      const infraccionesArray = infractions.map((inf) => ({
        tipo: inf.type,
        duracion: 0,
      }))

      const result = await enviarRespuestas(
        intentoId,
        respuestasArray,
        infraccionesArray
      )

      if (result.success) {
        toast.success('Examen enviado correctamente')
        // Redirigir a resultados
        window.location.href = `/examenes/${intentoId}/resultados`
      } else {
        toast.error(result.error || 'Error al enviar examen')
      }
    } finally {
      setLoading(false)
    }
  }

  const preguntaActual = examen.preguntas[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header con información */}
      <Card className="p-4 mb-6 bg-card border-border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {examen.exam_desc_vac}
            </h1>
            <p className="text-muted-foreground">
              Pregunta {currentQuestion + 1} de {examen.preguntas.length}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Clock className="w-6 h-6 text-accent" />
              <span
                className={
                  timeRemaining < 300 ? 'text-destructive' : 'text-accent'
                }
              >
                {formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / examen.preguntas.length) * 100}%`,
            }}
          />
        </div>
      </Card>

      {/* Alertas de infracciones */}
      {infractionCount > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Se han detectado {infractionCount} infracción(es) de integridad.
            Continúa siguiendo las reglas del examen.
          </AlertDescription>
        </Alert>
      )}

      {isTimeUp && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            El tiempo del examen ha terminado. El examen será enviado
            automáticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Pregunta actual */}
      <Card className="p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {preguntaActual.preg_enun_vac}
          </h2>
          <p className="text-sm text-muted-foreground">
            Puntuación: {preguntaActual.preg_puntaj_int} puntos
          </p>
        </div>

        {preguntaActual.preg_url_vac && (
          <img
            src={preguntaActual.preg_url_vac}
            alt="Imagen de pregunta"
            className="max-w-full mb-6 rounded"
          />
        )}

        {/* Opciones de respuesta */}
        <div className="space-y-3">
          {preguntaActual.opciones.map((opcion) => (
            <label
              key={opcion.opc_pre_id_int}
              className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors"
            >
              <input
                type="radio"
                name={`pregunta-${preguntaActual.preg_id_int}`}
                value={opcion.opc_pre_id_int}
                checked={
                  respuestas[preguntaActual.preg_id_int]?.opcionId ===
                  opcion.opc_pre_id_int
                }
                onChange={() =>
                  handleRespuesta(preguntaActual.preg_id_int, {
                    opcionId: opcion.opc_pre_id_int,
                  })
                }
                className="w-4 h-4 text-accent"
              />
              <span className="ml-3 text-foreground">
                {opcion.opc_pre_text_vac}
              </span>
            </label>
          ))}
        </div>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Pregunta Anterior
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            setCurrentQuestion(Math.min(examen.preguntas.length - 1, currentQuestion + 1))
          }
          disabled={currentQuestion === examen.preguntas.length - 1}
        >
          Siguiente Pregunta
        </Button>

        <Button
          className="bg-accent text-primary hover:bg-accent/90"
          onClick={handleSubmit}
          disabled={loading || isTimeUp}
        >
          {loading ? 'Enviando...' : 'Finalizar Examen'}
        </Button>
      </div>
    </div>
  )
}
