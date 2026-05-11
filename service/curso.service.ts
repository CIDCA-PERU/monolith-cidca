import 'server-only'

import { CursoRepository } from '@/repository/curso.repository'
import { PermisoService } from '@/service/permiso.service'
import { CursoDTO, CreateCursoRequest } from '@/dto/curso.dto'
import { AppError, BusinessError } from '@/lib/errors'
import { validateCursoData } from '@/lib/validators'

export class CursoService {
  static async getCursosByDocente(
    docenteId: string,
    usuarioId: string
  ): Promise<CursoDTO[]> {
    // Validar permisos
    const canView = await PermisoService.hasPermiso(
      Number(usuarioId),
      'VIEW_CURSOS',
      docenteId
    )

    if (!canView) {
      throw new BusinessError('No tienes permiso para ver estos cursos')
    }

    return CursoRepository.getCursosByDocente(docenteId)
  }

  static async getCursoById(
    cursoId: string,
    usuarioId: string
  ): Promise<CursoDTO> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Validar permisos
    const canView = await PermisoService.hasPermiso(
      Number(usuarioId),
      'VIEW_CURSO',
      String(curso.docente_id)
    )

    if (!canView) {
      throw new BusinessError('No tienes permiso para ver este curso')
    }

    return curso
  }

  static async createCurso(
    request: CreateCursoRequest,
    usuarioId: string
  ): Promise<CursoDTO> {
    // Validar permisos
    const canCreate = await PermisoService.hasPermiso(
      Number(usuarioId),
      'CREATE_CURSO'
    )

    if (!canCreate) {
      throw new BusinessError('No tienes permiso para crear cursos')
    }

    // Validar datos
    const validation = validateCursoData(request)
    if (!validation.valid) {
      throw new BusinessError(validation.errors.join(', '))
    }

    // Crear curso
    const curso = await CursoRepository.createCurso({
      nombre: request.nombre,
      descripcion: request.descripcion,
      docente_id: usuarioId,
      estado: 'activo',
      fecha_inicio: request.fecha_inicio,
      fecha_fin: request.fecha_fin,
      cantidad_estudiantes: 0,
      imagen_url: request.imagen_url,
    })

    return curso
  }

  static async updateCurso(
    cursoId: string,
    updates: Partial<CursoDTO>,
    usuarioId: string
  ): Promise<CursoDTO> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Validar que el usuario sea el docente propietario
    if (String(curso.docente_id) !== String(usuarioId)) {
      throw new BusinessError('Solo el docente propietario puede editar este curso')
    }

    return CursoRepository.updateCurso(cursoId, updates)
  }

  static async deleteCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<void> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Validar que el usuario sea el docente propietario
    if (String(curso.docente_id) !== String(usuarioId)) {
      throw new BusinessError('Solo el docente propietario puede eliminar este curso')
    }

    await CursoRepository.deleteCurso(cursoId)
  }

  static async addEstudiante(
    cursoId: string,
    estudianteId: string,
    usuarioId: string
  ): Promise<void> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Validar que el usuario sea el docente propietario
    if (String(curso.docente_id) !== String(usuarioId)) {
      throw new BusinessError('Solo el docente propietario puede agregar estudiantes')
    }

    await CursoRepository.addEstudianteToCurso(cursoId, estudianteId)
  }

  static async removeEstudiante(
    cursoId: string,
    estudianteId: string,
    usuarioId: string
  ): Promise<void> {
    const curso = await CursoRepository.getCursoById(cursoId)

    if (!curso) {
      throw new BusinessError('Curso no encontrado', 404)
    }

    // Validar que el usuario sea el docente propietario
    if (String(curso.docente_id) !== String(usuarioId)) {
      throw new BusinessError('Solo el docente propietario puede remover estudiantes')
    }

    await CursoRepository.removeEstudianteFromCurso(cursoId, estudianteId)
  }
}
