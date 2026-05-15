import 'server-only'

import { AsistenciaRepository } from '@/repository/asistencia.repository'
import { CursoRepository } from '@/repository/curso.repository'
import { SesionClaseDto, RegistrarAsistenciaResponseDto } from '@/dto/asistencia.dto'
import { BusinessError } from '@/lib/errors'
import { getCurrentTimeInCIDCA } from '@/lib/timezone'

export class AsistenciaService {
  static async getSesionesByCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<SesionClaseDto[]> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Solo docente propietario puede ver sesiones
    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver estas sesiones')
    }

    const sesiones = await AsistenciaRepository.getSesionesByCurso(cursoId)

    // Enriquecer sesiones con datos de ventanas de asistencia
    return sesiones.map((sesion) => ({
      ...sesion,
      ...this.calcularVentanaAsistencia(sesion),
    }))
  }

  /**
   * Calcular si el estudiante puede registrar asistencia
   * Reglas:
   * - Se puede registrar 15 minutos antes de la hora de inicio
   * - Se puede registrar hasta 30 minutos después de la hora de fin
   * - Después de 15 minutos de inicio = TARDÍO
   */
  private static calcularVentanaAsistencia(sesion: SesionClaseDto) {
    const ahora = getCurrentTimeInCIDCA()
    const sesionFecha = new Date(sesion.ses_fecha_dat)
    const sesionInicio = new Date(`${sesion.ses_fecha_dat}T${sesion.ses_hora_inic_tmp}`)
    const sesionFin = new Date(`${sesion.ses_fecha_dat}T${sesion.ses_hora_fin_tmp}`)

    // Convertir a hora de Perú
    const inicioLima = this.convertToLimaTime(sesionInicio)
    const finLima = this.convertToLimaTime(sesionFin)

    const minutosBefore = Math.floor(
      (inicioLima.getTime() - ahora.getTime()) / (1000 * 60)
    )
    const minutosAfter = Math.floor(
      (ahora.getTime() - inicioLima.getTime()) / (1000 * 60)
    )

    const puedeAsistir =
      minutosBefore >= -15 && // Hasta 15 minutos antes
      minutosAfter <= 30 // Hasta 30 minutos después

    const minutosDesdeFin = Math.floor(
      (ahora.getTime() - finLima.getTime()) / (1000 * 60)
    )

    let estado: 'PROGRAMADA' | 'EN_PROGRESO' | 'FINALIZADA' = 'PROGRAMADA'
    if (minutosAfter > 0 && minutosAfter <= 120) {
      estado = 'EN_PROGRESO'
    } else if (minutosDesdeFin > 0) {
      estado = 'FINALIZADA'
    }

    return {
      puede_asistir: puedeAsistir,
      minutos_antes_inicio: minutosBefore,
      minutos_desde_inicio: minutosAfter,
      ses_estado_vac: estado,
    }
  }

  private static convertToLimaTime(date: Date): Date {
    const formatter = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const parts = formatter.formatToParts(date)
    const values: Record<string, string> = {}

    parts.forEach(({ type, value }) => {
      values[type] = value
    })

    return new Date(
      `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
    )
  }

  static async registrarAsistencia(
    sesionId: string,
    estudianteId: string
  ): Promise<RegistrarAsistenciaResponseDto> {
    const sesion = await AsistenciaRepository.getSesionById(sesionId)

    if (!sesion) {
      return {
        success: false,
        mensaje: 'Sesión no encontrada',
        razon_rechazo: 'Sesión no encontrada',
      }
    }

    // Validar ventana de asistencia
    const ventana = this.calcularVentanaAsistencia(sesion)

    if (!ventana.puede_asistir) {
      return {
        success: false,
        mensaje: this.obtenerRazonRechazo(ventana),
        razon_rechazo: this.obtenerRazonRechazo(ventana),
      }
    }

    // Determinar estado: PRESENTE o TARDÍO
    const estado = ventana.minutos_desde_inicio > 15 ? 3 : 1 // 1=Presente, 3=Tardío

    try {
      const asistenciaId = await AsistenciaRepository.registrarAsistencia(
        sesionId,
        estudianteId,
        estado
      )

      return {
        success: true,
        mensaje:
          estado === 1
            ? 'Asistencia registrada como PRESENTE'
            : 'Asistencia registrada como TARDÍO',
        asist_id_int: asistenciaId,
      }
    } catch (error) {
      return {
        success: false,
        mensaje: 'Error al registrar asistencia',
        razon_rechazo: 'Error al registrar asistencia',
      }
    }
  }

  private static obtenerRazonRechazo(ventana: any): string {
    if (ventana.minutos_antes_inicio > 15) {
      return `La sesión inicia en ${ventana.minutos_antes_inicio} minutos. Espera 15 minutos antes.`
    }

    if (ventana.minutos_desde_inicio > 30) {
      return 'La sesión finalizó hace más de 30 minutos. No se puede registrar asistencia.'
    }

    return 'No se puede registrar asistencia en este momento.'
  }

  static async getReporteAsistencia(
    sesionId: string,
    usuarioId: string
  ): Promise<any> {
    const sesion = await AsistenciaRepository.getSesionById(sesionId)

    if (!sesion) {
      throw new BusinessError('Sesión no encontrada', 404)
    }

    // Verificar permisos
    // (Implementar según necesidad)

    return AsistenciaRepository.getReporteAsistencia(sesionId)
  }

  static async updateAsistencia(
    asistenciaId: string,
    estado: number,
    usuarioId: string,
    observaciones?: string
  ): Promise<void> {
    // Solo docente puede actualizar asistencia
    // (Implementar verificación de permisos)

    await AsistenciaRepository.updateAsistencia(asistenciaId, estado, observaciones)
  }

  static async getReporteGeneralCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<any> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver este reporte')
    }

    return AsistenciaRepository.getReporteGeneralCurso(cursoId)
  }
}
