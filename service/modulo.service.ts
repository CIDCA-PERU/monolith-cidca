import 'server-only'

import { ModuloRepository } from '@/repository/modulo.repository'
import { CursoRepository } from '@/repository/curso.repository'
import { ModuloDTO, ApartadoDTO, CreateModuloRequest, CreateApartadoRequest } from '@/dto/modulo.dto'
import { AppError, BusinessError } from '@/lib/errors'

export class ModuloService {
  static async getModulosByCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<ModuloDTO[]> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Solo el docente propietario puede ver módulos
    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver estos módulos')
    }

    return ModuloRepository.getModulosByCurso(cursoId)
  }

  static async getModuloById(
    moduloId: string,
    usuarioId: string
  ): Promise<ModuloDTO> {
    const modulo = await ModuloRepository.getModuloById(moduloId)

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver este módulo')
    }

    return modulo
  }

  static async createModulo(
    cursoId: string,
    request: CreateModuloRequest,
    usuarioId: string
  ): Promise<ModuloDTO> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    if (curso.docente_id !== usuarioId) {
      throw new BusinessError('Solo el docente propietario puede crear módulos')
    }

    return ModuloRepository.createModulo(cursoId, {
      curso_id: cursoId,
      titulo: request.titulo,
      descripcion: request.descripcion,
      estado: 'borrador',
      fecha_inicio: request.fecha_inicio,
      fecha_fin: request.fecha_fin,
      orden: 0,
    })
  }

  static async updateModulo(
    moduloId: string,
    updates: Partial<ModuloDTO>,
    usuarioId: string
  ): Promise<ModuloDTO> {
    const modulo = await ModuloRepository.getModuloById(moduloId)

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para actualizar este módulo')
    }

    return ModuloRepository.updateModulo(moduloId, updates)
  }

  static async deleteModulo(
    moduloId: string,
    usuarioId: string
  ): Promise<void> {
    const modulo = await ModuloRepository.getModuloById(moduloId)

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para eliminar este módulo')
    }

    await ModuloRepository.deleteModulo(moduloId)
  }

  // Apartados
  static async getApartadosByModulo(
    moduloId: string,
    usuarioId: string
  ): Promise<ApartadoDTO[]> {
    const modulo = await ModuloRepository.getModuloById(moduloId)

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver estos apartados')
    }

    return ModuloRepository.getApartadosByModulo(moduloId)
  }

  static async getApartadoById(
    apartadoId: string,
    usuarioId: string
  ): Promise<ApartadoDTO> {
    const apartado = await ModuloRepository.getApartadoById(apartadoId)

    if (!apartado) {
      throw new BusinessError('Apartado no encontrado', 404)
    }

    const modulo = await ModuloRepository.getModuloById(apartado.modulo_id)!

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para ver este apartado')
    }

    return apartado
  }

  static async createApartado(
    moduloId: string,
    request: CreateApartadoRequest,
    usuarioId: string
  ): Promise<ApartadoDTO> {
    const modulo = await ModuloRepository.getModuloById(moduloId)

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('Solo el docente propietario puede crear apartados')
    }

    return ModuloRepository.createApartado(moduloId, {
      modulo_id: moduloId,
      titulo: request.titulo,
      contenido: request.contenido,
      tipo: request.tipo,
      orden: 0,
      duracion_estimada: request.duracion_estimada,
      url_recurso: request.url_recurso,
    })
  }

  static async updateApartado(
    apartadoId: string,
    updates: Partial<ApartadoDTO>,
    usuarioId: string
  ): Promise<ApartadoDTO> {
    const apartado = await ModuloRepository.getApartadoById(apartadoId)

    if (!apartado) {
      throw new BusinessError('Apartado no encontrado', 404)
    }

    const modulo = await ModuloRepository.getModuloById(apartado.modulo_id)!

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para actualizar este apartado')
    }

    return ModuloRepository.updateApartado(apartadoId, updates)
  }

  static async deleteApartado(
    apartadoId: string,
    usuarioId: string
  ): Promise<void> {
    const apartado = await ModuloRepository.getApartadoById(apartadoId)

    if (!apartado) {
      throw new BusinessError('Apartado no encontrado', 404)
    }

    const modulo = await ModuloRepository.getModuloById(apartado.modulo_id)!

    if (!modulo) {
      throw new BusinessError('Módulo no encontrado', 404)
    }

    const curso = await CursoRepository.getCursoById(modulo.curso_id)

    if (!curso || curso.docente_id !== usuarioId) {
      throw new BusinessError('No tienes permiso para eliminar este apartado')
    }

    await ModuloRepository.deleteApartado(apartadoId)
  }
}
