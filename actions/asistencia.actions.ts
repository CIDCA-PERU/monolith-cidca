'use server'

import { AsistenciaService } from '@/service/asistencia.service'
import { assertAuthenticated, assertDashboard } from '@/lib/auth-guards'
import { SesionClaseDto, RegistrarAsistenciaResponseDto } from '@/dto/asistencia.dto'
import { AppError } from '@/lib/errors'

/**
 * Obtiene las sesiones de clase de un curso.
 * Solo ADMIN, DOCENTE, COORDINADOR (gestión de asistencia es del staff).
 */
export async function getSesionesByCurso(cursoId: string): Promise<{
  success: boolean
  data?: SesionClaseDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const sesiones = await AsistenciaService.getSesionesByCurso(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: sesiones }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Registra la asistencia de un estudiante a una sesión.
 * Solo ADMIN, DOCENTE, COORDINADOR pueden registrar asistencia.
 */
export async function registrarAsistencia(
  sesionId: string
): Promise<RegistrarAsistenciaResponseDto> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const resultado = await AsistenciaService.registrarAsistencia(
      sesionId,
      user.usr_id_int.toString()
    )
    return resultado
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, razon_rechazo: message }
  }
}

/**
 * Obtiene el reporte de asistencia de una sesión.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getReporteAsistencia(sesionId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const reporte = await AsistenciaService.getReporteAsistencia(
      sesionId,
      user.usr_id_int.toString()
    )
    return { success: true, data: reporte }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Actualiza el estado de asistencia de un estudiante.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function updateAsistencia(
  asistenciaId: string,
  estado: number,
  observaciones?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    await AsistenciaService.updateAsistencia(
      asistenciaId,
      estado,
      user.usr_id_int.toString(),
      observaciones
    )
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Obtiene el reporte general de asistencia de un curso.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getReporteGeneralCurso(cursoId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const reporte = await AsistenciaService.getReporteGeneralCurso(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: reporte }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}
