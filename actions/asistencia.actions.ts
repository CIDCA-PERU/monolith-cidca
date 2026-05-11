'use server'

import { AsistenciaService } from '@/service/asistencia.service'
import { getCurrentUser } from '@/actions/auth.actions'
import { SesionClaseDto, RegistrarAsistenciaResponseDto } from '@/dto/asistencia.dto'
import { AppError } from '@/lib/errors'

export async function getSesionesByCurso(cursoId: string): Promise<{
  success: boolean
  data?: SesionClaseDto[]
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function registrarAsistencia(
  sesionId: string
): Promise<RegistrarAsistenciaResponseDto> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        razon_rechazo: 'Usuario no autenticado',
      }
    }

    const resultado = await AsistenciaService.registrarAsistencia(
      sesionId,
      user.usr_id_int.toString()
    )
    return resultado
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return {
      success: false,
      razon_rechazo: message,
    }
  }
}

export async function getReporteAsistencia(sesionId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function updateAsistencia(
  asistenciaId: string,
  estado: number,
  observaciones?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function getReporteGeneralCurso(cursoId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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
