'use server'

import { CursoService } from '@/service/curso.service'
import { assertAuthenticated, assertDashboard, assertAdminOrCoordinador } from '@/lib/auth-guards'
import { CursoDTO, CreateCursoRequest } from '@/dto/curso.dto'
import { AppError } from '@/lib/errors'

/**
 * Obtiene los cursos del docente autenticado.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getCursosByDocente(): Promise<{
  success: boolean
  data?: CursoDTO[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

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

/**
 * Obtiene un curso por ID.
 * Cualquier usuario autenticado puede ver un curso.
 */
export async function getCursoById(cursoId: string): Promise<{
  success: boolean
  data?: CursoDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()

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

/**
 * Crea un nuevo curso.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function createCurso(request: CreateCursoRequest): Promise<{
  success: boolean
  data?: CursoDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

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

/**
 * Actualiza un curso existente.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function updateCurso(
  cursoId: string,
  updates: Partial<CursoDTO>
): Promise<{
  success: boolean
  data?: CursoDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

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

/**
 * Elimina un curso.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function deleteCurso(cursoId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    await CursoService.deleteCurso(cursoId, user.usr_id_int.toString())
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Agrega un estudiante a un curso.
 * Solo ADMIN o COORDINADOR (gestión de matrículas).
 */
export async function addEstudianteToCurso(
  cursoId: string,
  estudianteId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

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

/**
 * Elimina un estudiante de un curso.
 * Solo ADMIN o COORDINADOR (gestión de matrículas).
 */
export async function removeEstudianteFromCurso(
  cursoId: string,
  estudianteId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

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
