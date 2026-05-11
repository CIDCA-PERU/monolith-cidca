import 'server-only'

import { ExamenRepository } from '@/repository/examen.repository'
import { CursoRepository } from '@/repository/curso.repository'
import { UsuarioRepository } from '@/repository/usuario.repository'
import {
  ExamenListDto,
  ExamenDetailDto,
  IntentoExamenDto,
  RespuestaEstudianteDto,
  ExamenResultDto,
} from '@/dto/examen.dto'
import { BusinessError } from '@/lib/errors'

export class ExamenService {
  static async getExamenesByDocente(
    cursoId: string,
    usuarioId: string
  ): Promise<ExamenListDto[]> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Solo docente propietario puede ver exámenes
    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver estos exámenes')
    }

    return ExamenRepository.getExamenesByCurso(cursoId)
  }

  static async getExamenParaEstudiante(
    examenId: string,
    estudianteId: string
  ): Promise<ExamenDetailDto | null> {
    const examen = await ExamenRepository.getExamenById(examenId)

    if (!examen) {
      throw new BusinessError('Examen no encontrado', 404)
    }

    // Verificar que estudiante está inscrito en curso
    // (Implementar según necesidad)

    return examen
  }

  static async crearIntento(
    examenId: string,
    estudianteId: string
  ): Promise<IntentoExamenDto> {
    const examen = await ExamenRepository.getExamenById(examenId)

    if (!examen) {
      throw new BusinessError('Examen no encontrado', 404)
    }

    // Crear intento
    return ExamenRepository.createIntento(estudianteId, examenId)
  }

  static async obtenerIntento(
    intentoId: string,
    estudianteId: string
  ): Promise<IntentoExamenDto | null> {
    const intento = await ExamenRepository.getIntentoByUuid(intentoId)

    if (!intento) {
      return null
    }

    // Verificar que el intento pertenece al estudiante
    // (Implementar verificación según schema)

    return intento
  }

  static async registrarInfraccion(
    intentoId: string,
    tipo: 'TAB_CHANGE' | 'FOCUS_LOSS' | 'PAGE_UNLOAD' | 'TIMEOUT',
    duracion: number
  ): Promise<void> {
    const intento = await ExamenRepository.getIntentoByUuid(intentoId)

    if (!intento) {
      throw new BusinessError('Intento no encontrado', 404)
    }

    if (intento.int_exam_estad_tmp !== 'EN_PROGRESO') {
      throw new BusinessError('El examen ya no está en progreso')
    }

    // Contar infracciones previas
    const infraccionesTotal = (intento.infracciones || []).length + 1

    // Si hay más de 2 infracciones, marcar como fraude
    if (infraccionesTotal > 2) {
      await ExamenRepository.updateHeartbeat(intentoId)
      // El sistema puede marcar automáticamente como fraude
      return
    }

    await ExamenRepository.registerInfraction(intentoId, tipo, duracion)
    await ExamenRepository.updateHeartbeat(intentoId)
  }

  static async enviarRespuestas(
    intentoId: string,
    respuestas: RespuestaEstudianteDto[],
    infracciones: { tipo: string; duracion: number }[]
  ): Promise<void> {
    const intento = await ExamenRepository.getIntentoByUuid(intentoId)

    if (!intento) {
      throw new BusinessError('Intento no encontrado', 404)
    }

    if (intento.int_exam_estad_tmp !== 'EN_PROGRESO') {
      throw new BusinessError('El examen ya no está activo')
    }

    // Registrar respuestas y calificar automáticamente
    await ExamenRepository.submitExamen(intentoId, respuestas, infracciones)

    // Calcular nota automática
    // (Implementar lógica de calificación según necesidad)
  }

  static async obtenerResultados(
    intentoId: string,
    usuarioId: string
  ): Promise<ExamenResultDto> {
    const intento = await ExamenRepository.getIntentoByUuid(intentoId)

    if (!intento) {
      throw new BusinessError('Intento no encontrado', 404)
    }

    // Verificar permisos
    // (Implementar según schema)

    return {
      int_exam_id_int: intento.int_exam_id_int,
      nota_auto: intento.int_exam_nota_auto_tmp || 0,
      nota_final: intento.int_exam_nota_man_tmp || intento.int_exam_nota_auto_tmp || 0,
      estado: intento.int_exam_estad_tmp,
      fecha_calificacion: intento.int_exam_fin_tmp || new Date().toISOString(),
      tiene_infracciones: (intento.infracciones || []).length > 0,
    }
  }

  /**
   * Validar que el examen no ha excedido el tiempo permitido
   * Se ejecuta frecuentemente como heartbeat
   */
  static async validarTiempoExamen(intentoId: string): Promise<boolean> {
    const intento = await ExamenRepository.getIntentoByUuid(intentoId)

    if (!intento) return false

    if (intento.int_exam_estad_tmp !== 'EN_PROGRESO') return false

    // Calcular tiempo transcurrido
    const inicio = new Date(intento.int_exam_inic_tmp)
    const ahora = new Date()
    const minutosTrans = (ahora.getTime() - inicio.getTime()) / (1000 * 60)

    // Obtener duración permitida del examen
    // Por ahora retornamos true (asumir duración suficiente)
    // En producción, verificar con el examen

    return true
  }

  /**
   * Spy mode: obtener respuestas correctas (SOLO PARA DOCENTES)
   */
  static async obtenerClavesRespuestas(
    examenId: string,
    usuarioId: string
  ): Promise<any> {
    const examen = await ExamenRepository.getExamenById(examenId)

    if (!examen) {
      throw new BusinessError('Examen no encontrado', 404)
    }

    // Verificar que el usuario es docente del curso
    // (Implementar según schema)

    // Retornar claves (solo para docentes)
    // En producción, asegurar que las respuestas correctas están protegidas
    return null
  }
}
