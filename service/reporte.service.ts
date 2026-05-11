import 'server-only'

import { ReporteRepository } from '@/repository/reporte.repository'
import { CursoRepository } from '@/repository/curso.repository'
import { UsuarioRepository } from '@/repository/usuario.repository'
import {
  CalificacionesReporteDTO,
  DesempenoEstudianteDTO,
  ReporteCursoDTO,
  CertificadoDTO,
  CreateCertificadoRequest,
} from '@/dto/reporte.dto'
import { BusinessError } from '@/lib/errors'

export class ReporteService {
  /**
   * Obtener reporte de calificaciones de un curso
   */
  static async getCalificacionesByCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<CalificacionesReporteDTO[]> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Solo docente propietario puede ver calificaciones
    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver estas calificaciones')
    }

    return ReporteRepository.getCalificacionesByCurso(cursoId)
  }

  /**
   * Obtener desempeño de un estudiante
   */
  static async getDesempenoEstudiante(
    estudianteId: string,
    cursoId: string,
    usuarioId: string
  ): Promise<DesempenoEstudianteDTO | null> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Validar permisos: docente o estudiante mismo
    if (curso.docente_id !== usuarioId && estudianteId !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver este desempeño')
    }

    return ReporteRepository.getDesempenoEstudiante(estudianteId, cursoId)
  }

  /**
   * Obtener reporte completo del curso
   */
  static async getReporteCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<ReporteCursoDTO | null> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Solo docente propietario puede ver reporte
    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver este reporte')
    }

    return ReporteRepository.getReporteCurso(cursoId)
  }

  /**
   * Crear certificado para estudiante
   */
  static async crearCertificado(
    request: CreateCertificadoRequest,
    usuarioId: string
  ): Promise<CertificadoDTO> {
    // Obtener datos del estudiante y curso
    const usuario = await UsuarioRepository.getUsuarioById(request.estudiante_id)

    if (!usuario) {
      throw new BusinessError('Estudiante no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(request.curso_id)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Solo docente propietario puede crear certificados
    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para crear certificados en este curso')
    }

    // Verificar que el estudiante está aprobado
    const desempen = await ReporteRepository.getDesempenoEstudiante(
      request.estudiante_id,
      request.curso_id
    )

    if (!desempen) {
      throw new BusinessError('No se encontraron registros del estudiante en el curso')
    }

    if (desempen.promedio_notas < 13) {
      throw new BusinessError(
        'El estudiante no tiene la nota mínima para obtener certificado'
      )
    }

    // Crear certificado
    return ReporteRepository.createCertificado({
      estudiante_id: request.estudiante_id,
      curso_id: request.curso_id,
      docente_id: usuarioId,
      nota_final: desempen.promedio_notas,
      asistencia_porcentaje: desempen.asistencia_porcentaje,
    })
  }

  /**
   * Obtener certificado de estudiante
   */
  static async getCertificadoEstudiante(
    estudianteId: string,
    cursoId: string,
    usuarioId: string
  ): Promise<CertificadoDTO | null> {
    const certificado = await ReporteRepository.getCertificadoByEstudiante(
      estudianteId,
      cursoId
    )

    if (!certificado) return null

    // Validar permisos
    if (certificado.estudiante_id !== usuarioId) {
      const usuario = await UsuarioRepository.getUsuarioById(usuarioId)
      if (usuario?.rol !== 'docente' && usuario?.rol !== 'admin') {
        throw new BusinessError('No tienes permiso para ver este certificado')
      }
    }

    return certificado
  }

  /**
   * Verificar certificado por código
   */
  static async verificarCertificado(codigo: string): Promise<CertificadoDTO | null> {
    return ReporteRepository.getCertificadoByCode(codigo)
  }

  /**
   * Obtener certificados emitidos por docente
   */
  static async getCertificadosByDocente(
    usuarioId: string
  ): Promise<CertificadoDTO[]> {
    return ReporteRepository.getCertificadosByDocente(usuarioId)
  }

  /**
   * Obtener estadísticas generales de actividad
   */
  static async getEstadisticasActividad(
    usuarioId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<any> {
    const usuario = await UsuarioRepository.getUsuarioById(usuarioId)

    if (usuario?.rol !== 'admin') {
      throw new BusinessError('Solo administradores pueden acceder a estadísticas generales')
    }

    return ReporteRepository.getEstadisticasGenerales(fechaInicio, fechaFin)
  }
}
