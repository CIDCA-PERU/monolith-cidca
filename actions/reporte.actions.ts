'use server'

import { ReporteService } from '@/service/reporte.service'
import { assertAuthenticated, assertDashboard, assertEstudiante } from '@/lib/auth-guards'
import {
  CalificacionesReporteDTO,
  DesempenoEstudianteDTO,
  ReporteCursoDTO,
  CertificadoDTO,
  CreateCertificadoRequest,
} from '@/dto/reporte.dto'
import { AppError } from '@/lib/errors'

/**
 * Calificaciones de un curso.
 * Solo ADMIN, DOCENTE, COORDINADOR (vista del dashboard).
 */
export async function getCalificacionesByCurso(cursoId: string): Promise<{
  success: boolean
  data?: CalificacionesReporteDTO[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const calificaciones = await ReporteService.getCalificacionesByCurso(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: calificaciones }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Desempeño de un estudiante específico.
 * Solo ESTUDIANTE puede ver su propio desempeño.
 */
export async function getDesempenoEstudiante(
  estudianteId: string,
  cursoId: string
): Promise<{
  success: boolean
  data?: DesempenoEstudianteDTO | null
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    const desempen = await ReporteService.getDesempenoEstudiante(
      estudianteId,
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: desempen }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Reporte general de un curso.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getReporteCurso(cursoId: string): Promise<{
  success: boolean
  data?: ReporteCursoDTO | null
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const reporte = await ReporteService.getReporteCurso(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: reporte }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Crea un certificado para un estudiante.
 * Solo ADMIN, DOCENTE, COORDINADOR (el staff emite certificados).
 */
export async function crearCertificado(request: CreateCertificadoRequest): Promise<{
  success: boolean
  data?: CertificadoDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const certificado = await ReporteService.crearCertificado(
      request,
      user.usr_id_int.toString()
    )
    return { success: true, data: certificado }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Obtiene el certificado de un estudiante para un curso.
 * Solo ESTUDIANTE puede ver su propio certificado desde el aula.
 */
export async function getCertificadoEstudiante(
  estudianteId: string,
  cursoId: string
): Promise<{
  success: boolean
  data?: CertificadoDTO | null
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    const certificado = await ReporteService.getCertificadoEstudiante(
      estudianteId,
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: certificado }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Verifica un certificado por código.
 * Público — cualquier persona puede verificar la autenticidad de un certificado.
 */
export async function verificarCertificado(codigo: string): Promise<{
  success: boolean
  data?: CertificadoDTO | null
  error?: string
}> {
  try {
    const certificado = await ReporteService.verificarCertificado(codigo)
    return { success: true, data: certificado }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Obtiene todos los certificados emitidos por un docente.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getCertificadosByDocente(): Promise<{
  success: boolean
  data?: CertificadoDTO[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const certificados = await ReporteService.getCertificadosByDocente(
      user.usr_id_int.toString()
    )
    return { success: true, data: certificados }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Estadísticas de actividad del sistema.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getEstadisticasActividad(
  fechaInicio: string,
  fechaFin: string
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const estadisticas = await ReporteService.getEstadisticasActividad(
      user.usr_id_int.toString(),
      fechaInicio,
      fechaFin
    )
    return { success: true, data: estadisticas }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}
