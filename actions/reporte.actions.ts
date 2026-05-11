'use server'

import { ReporteService } from '@/service/reporte.service'
import { getCurrentUser } from '@/actions/auth.actions'
import {
  CalificacionesReporteDTO,
  DesempenoEstudianteDTO,
  ReporteCursoDTO,
  CertificadoDTO,
  CreateCertificadoRequest,
} from '@/dto/reporte.dto'
import { AppError } from '@/lib/errors'

export async function getCalificacionesByCurso(cursoId: string): Promise<{
  success: boolean
  data?: CalificacionesReporteDTO[]
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function getDesempenoEstudiante(
  estudianteId: string,
  cursoId: string
): Promise<{
  success: boolean
  data?: DesempenoEstudianteDTO | null
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function getReporteCurso(cursoId: string): Promise<{
  success: boolean
  data?: ReporteCursoDTO | null
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function crearCertificado(request: CreateCertificadoRequest): Promise<{
  success: boolean
  data?: CertificadoDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function getCertificadoEstudiante(
  estudianteId: string,
  cursoId: string
): Promise<{
  success: boolean
  data?: CertificadoDTO | null
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function getCertificadosByDocente(): Promise<{
  success: boolean
  data?: CertificadoDTO[]
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const certificados = await ReporteService.getCertificadosByDocente(
      user.usr_id_int.toString()
    )
    return { success: true, data: certificados }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function getEstadisticasActividad(
  fechaInicio: string,
  fechaFin: string
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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
