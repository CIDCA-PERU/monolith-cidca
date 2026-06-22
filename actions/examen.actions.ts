'use server'

import { ExamenService } from '@/service/examen.service'
import { assertAuthenticated, assertEstudiante } from '@/lib/auth-guards'
import { RespuestaEstudianteDto } from '@/dto/examen.dto'
import { AppError } from '@/lib/errors'
import { handleActionError } from '@/lib/errors'

export async function crearIntento(examenId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    const intento = await ExamenService.crearIntento(
      examenId,
      user.usr_id_int.toString()
    )
    return { success: true, data: intento }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

export async function obtenerIntento(intentoId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    const intento = await ExamenService.obtenerIntento(
      intentoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: intento }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

export async function registrarInfraccion(
  intentoId: string,
  tipo: 'TAB_CHANGE' | 'FOCUS_LOSS' | 'PAGE_UNLOAD' | 'TIMEOUT'
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    await ExamenService.registrarInfraccion(intentoId, tipo, 0)
    return { success: true }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

export async function enviarRespuestas(
  intentoId: string,
  respuestas: RespuestaEstudianteDto[],
  infracciones: { tipo: string; duracion: number }[]
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    await ExamenService.enviarRespuestas(intentoId, respuestas, infracciones)
    return { success: true }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

export async function obtenerResultados(intentoId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    const resultados = await ExamenService.obtenerResultados(
      intentoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: resultados }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

export async function validarTiempoExamen(intentoId: string): Promise<{
  success: boolean
  valid?: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    const valid = await ExamenService.validarTiempoExamen(intentoId)
    return { success: true, valid }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}
