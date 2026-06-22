'use server'

import { CursoService } from '@/service/curso.service'
import { assertAuthenticated, assertDashboard, assertAdminOrCoordinador } from '@/lib/auth-guards'
import { CursoDTO, CreateCursoRequest } from '@/dto/curso.dto'
import { EstudianteCursoDto } from '@/dto/estudiante-curso.dto'
import { CursoRepository } from '@/repository/curso.repository'
import { AppError } from '@/lib/errors'
import { handleActionError } from '@/lib/errors'

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
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
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

    const rol = user.rol_nam_vc?.toUpperCase()
    const isStaffAdmin = rol === 'SISTEMAS' || rol === 'ADMINISTRADOR'

    let curso: CursoDTO | null = null

    if (isStaffAdmin) {
      // Admin/Sistemas: bypass del check de ownership, acceso directo al repo
      const { CursoRepository } = await import('@/repository/curso.repository')
      curso = await CursoRepository.getCursoById(cursoId)
    } else {
      // Docente: pasa por el service con validación de permisos
      curso = await CursoService.getCursoById(
        cursoId,
        user.usr_id_int.toString()
      )
    }

    if (!curso) return { success: false, error: 'Curso no encontrado' }
    return { success: true, data: curso }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
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

    const rol = user.rol_nam_vc?.toUpperCase()
    const isStaffAdmin = rol === 'SISTEMAS' || rol === 'ADMINISTRADOR'

    const curso = isStaffAdmin
      ? await (await import('@/repository/curso.repository')).CursoRepository.createCurso({
          nombre: request.nombre,
          descripcion: request.descripcion,
          docente_id: user.usr_id_int.toString(),
          estado: 'activo',
          fecha_inicio: request.fecha_inicio,
          fecha_fin: request.fecha_fin,
          cantidad_estudiantes: 0,
          imagen_url: request.imagen_url,
          zoom_url: request.zoom_url,
          precio: request.precio
        })
      : await CursoService.createCurso(
          request,
          user.usr_id_int.toString()
        )
    return { success: true, data: curso }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
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

    const rol = user.rol_nam_vc?.toUpperCase()
    const isStaffAdmin = rol === 'SISTEMAS' || rol === 'ADMINISTRADOR'

    const curso = isStaffAdmin
      ? await (await import('@/repository/curso.repository')).CursoRepository.updateCurso(
          cursoId,
          updates
        )
      : await CursoService.updateCurso(
          cursoId,
          updates,
          user.usr_id_int.toString()
        )
    return { success: true, data: curso }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
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
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
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
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
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
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

// --- Gestión de Estudiantes del Curso ------------------------------------------

/**
 * Obtiene la lista de estudiantes inscritos al curso.
 */
export async function getEstudiantesByCurso(cursoId: string): Promise<{
  success: boolean
  data?: EstudianteCursoDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)
    const data = await CursoRepository.getEstudiantesByCurso(cursoId)
    return { success: true, data }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

/**
 * Habilita o deshabilita un estudiante dentro de un curso.
 */
export async function toggleEstudianteCurso(
  estCurId: number,
  estado: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)
    await CursoRepository.toggleEstudianteCurso(estCurId, estado)
    return { success: true }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}
