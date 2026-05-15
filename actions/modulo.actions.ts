'use server'

import { ModuloService } from '@/service/modulo.service'
import { assertAuthenticated, assertDashboard } from '@/lib/auth-guards'
import { ModuloDTO, ApartadoDTO, CreateModuloRequest, CreateApartadoRequest } from '@/dto/modulo.dto'
import { AppError } from '@/lib/errors'

// ─── Módulos ──────────────────────────────────────────────────────────────────

/**
 * Obtiene los módulos de un curso.
 * Cualquier usuario autenticado puede consultar (estudiantes lo necesitan en el aula).
 */
export async function getModulosByCurso(cursoId: string): Promise<{
  success: boolean
  data?: ModuloDTO[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()

    const modulos = await ModuloService.getModulosByCurso(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: modulos }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Obtiene un módulo por ID.
 * Cualquier usuario autenticado puede consultar.
 */
export async function getModuloById(moduloId: string): Promise<{
  success: boolean
  data?: ModuloDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()

    const modulo = await ModuloService.getModuloById(
      moduloId,
      user.usr_id_int.toString()
    )
    return { success: true, data: modulo }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Crea un nuevo módulo.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function createModulo(
  cursoId: string,
  request: CreateModuloRequest
): Promise<{
  success: boolean
  data?: ModuloDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const modulo = await ModuloService.createModulo(
      cursoId,
      request,
      user.usr_id_int.toString()
    )
    return { success: true, data: modulo }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Actualiza un módulo.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function updateModulo(
  moduloId: string,
  updates: Partial<ModuloDTO>
): Promise<{
  success: boolean
  data?: ModuloDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const modulo = await ModuloService.updateModulo(
      moduloId,
      updates,
      user.usr_id_int.toString()
    )
    return { success: true, data: modulo }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Elimina un módulo.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function deleteModulo(moduloId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    await ModuloService.deleteModulo(moduloId, user.usr_id_int.toString())
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

// ─── Apartados ────────────────────────────────────────────────────────────────

/**
 * Obtiene los apartados de un módulo.
 * Cualquier usuario autenticado puede consultar (estudiantes lo usan en el aula).
 */
export async function getApartadosByModulo(moduloId: string): Promise<{
  success: boolean
  data?: ApartadoDTO[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()

    const apartados = await ModuloService.getApartadosByModulo(
      moduloId,
      user.usr_id_int.toString()
    )
    return { success: true, data: apartados }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Obtiene un apartado por ID.
 * Cualquier usuario autenticado puede consultar.
 */
export async function getApartadoById(apartadoId: string): Promise<{
  success: boolean
  data?: ApartadoDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()

    const apartado = await ModuloService.getApartadoById(
      apartadoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: apartado }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Crea un apartado dentro de un módulo.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function createApartado(
  moduloId: string,
  request: CreateApartadoRequest
): Promise<{
  success: boolean
  data?: ApartadoDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const apartado = await ModuloService.createApartado(
      moduloId,
      request,
      user.usr_id_int.toString()
    )
    return { success: true, data: apartado }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Actualiza un apartado.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function updateApartado(
  apartadoId: string,
  updates: Partial<ApartadoDTO>
): Promise<{
  success: boolean
  data?: ApartadoDTO
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const apartado = await ModuloService.updateApartado(
      apartadoId,
      updates,
      user.usr_id_int.toString()
    )
    return { success: true, data: apartado }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Elimina un apartado.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function deleteApartado(apartadoId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    await ModuloService.deleteApartado(apartadoId, user.usr_id_int.toString())
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}
