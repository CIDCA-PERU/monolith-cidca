'use server'

import { ModuloService } from '@/service/modulo.service'
import { getCurrentUser } from '@/actions/auth.actions'
import { ModuloDTO, ApartadoDTO, CreateModuloRequest, CreateApartadoRequest } from '@/dto/modulo.dto'
import { AppError } from '@/lib/errors'

export async function getModulosByCurso(cursoId: string): Promise<{
  success: boolean
  data?: ModuloDTO[]
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function getModuloById(moduloId: string): Promise<{
  success: boolean
  data?: ModuloDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function createModulo(
  cursoId: string,
  request: CreateModuloRequest
): Promise<{
  success: boolean
  data?: ModuloDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function updateModulo(
  moduloId: string,
  updates: Partial<ModuloDTO>
): Promise<{
  success: boolean
  data?: ModuloDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function deleteModulo(moduloId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    await ModuloService.deleteModulo(moduloId, user.usr_id_int.toString())
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

// Apartados
export async function getApartadosByModulo(moduloId: string): Promise<{
  success: boolean
  data?: ApartadoDTO[]
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function getApartadoById(apartadoId: string): Promise<{
  success: boolean
  data?: ApartadoDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function createApartado(
  moduloId: string,
  request: CreateApartadoRequest
): Promise<{
  success: boolean
  data?: ApartadoDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function updateApartado(
  apartadoId: string,
  updates: Partial<ApartadoDTO>
): Promise<{
  success: boolean
  data?: ApartadoDTO
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

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

export async function deleteApartado(apartadoId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    await ModuloService.deleteApartado(apartadoId, user.usr_id_int.toString())
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}
