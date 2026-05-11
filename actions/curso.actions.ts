'use server'

import { CursoService } from '@/service/curso.service'
import { getCurrentUser } from '@/actions/auth.actions'
import { CursoDTO, CreateCursoRequest } from '@/dto/curso.dto'
import { AppError } from '@/lib/errors'

export async function getCursosByDocente(): Promise<{
  success: boolean
  data?: CursoDTO[]
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const cursos = await CursoService.getCursosByDocente(
      user.usr_id_int.toString(),
      user.usr_id_int.toString()
    )
    return { success: true, data: cursos }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function getCursoById(cursoId: string): Promise<{
  success: boolean
  data?: CursoDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const curso = await CursoService.getCursoById(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: curso }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function createCurso(request: CreateCursoRequest): Promise<{
  success: boolean
  data?: CursoDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const curso = await CursoService.createCurso(
      request,
      user.usr_id_int.toString()
    )
    return { success: true, data: curso }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function updateCurso(
  cursoId: string,
  updates: Partial<CursoDTO>
): Promise<{
  success: boolean
  data?: CursoDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const curso = await CursoService.updateCurso(
      cursoId,
      updates,
      user.usr_id_int.toString()
    )
    return { success: true, data: curso }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function deleteCurso(cursoId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    await CursoService.deleteCurso(cursoId, user.usr_id_int.toString())
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function addEstudianteToCurso(
  cursoId: string,
  estudianteId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    await CursoService.addEstudiante(
      cursoId,
      estudianteId,
      user.usr_id_int.toString()
    )
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

export async function removeEstudianteFromCurso(
  cursoId: string,
  estudianteId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    await CursoService.removeEstudiante(
      cursoId,
      estudianteId,
      user.usr_id_int.toString()
    )
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}
