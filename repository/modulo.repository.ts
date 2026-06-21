import 'server-only'

import { sql } from '@/lib/db'
import { ModuloDTO, ApartadoDTO } from '@/dto/modulo.dto'

export class ModuloRepository {
  static async getModulosByCurso(cursoId: string): Promise<ModuloDTO[]> {
    const rows = await sql<ModuloDTO[]>`
      SELECT * FROM modulo
      WHERE curso_id = ${cursoId}
      ORDER BY orden ASC
    `
    return rows
  }

  static async getModuloById(moduloId: string): Promise<ModuloDTO | null> {
    const rows = await sql<ModuloDTO[]>`
      SELECT * FROM modulo
      WHERE id = ${moduloId}
      LIMIT 1
    `
    return rows[0] || null
  }

  static async createModulo(
    cursoId: string,
    modulo: Omit<ModuloDTO, 'id' | 'created_at' | 'numero'>
  ): Promise<ModuloDTO> {
    const lastRows = await sql`
      SELECT numero FROM modulo
      WHERE curso_id = ${cursoId}
      ORDER BY numero DESC
      LIMIT 1
    `
    const numero = (lastRows[0]?.numero || 0) + 1

    const rows = await sql<ModuloDTO[]>`
      INSERT INTO modulo (
        curso_id,
        numero,
        titulo,
        descripcion,
        estado,
        fecha_inicio,
        fecha_fin,
        orden
      ) VALUES (
        ${cursoId},
        ${numero},
        ${modulo.titulo},
        ${modulo.descripcion},
        ${modulo.estado},
        ${modulo.fecha_inicio},
        ${modulo.fecha_fin},
        ${modulo.orden}
      )
      RETURNING *
    `
    return rows[0]
  }

  static async updateModulo(
    moduloId: string,
    updates: Partial<ModuloDTO>
  ): Promise<ModuloDTO> {
    const columns = Object.keys(updates)
    if (columns.length === 0) {
      const rows = await sql<ModuloDTO[]>`SELECT * FROM modulo WHERE id = ${moduloId}`
      return rows[0]
    }

    const rows = await sql<ModuloDTO[]>`
      UPDATE modulo
      SET ${sql(updates as any)}
      WHERE id = ${moduloId}
      RETURNING *
    `
    return rows[0]
  }

  static async deleteModulo(moduloId: string): Promise<void> {
    await sql`
      DELETE FROM modulo
      WHERE id = ${moduloId}
    `
  }

  // Apartados
  static async getApartadosByModulo(moduloId: string): Promise<ApartadoDTO[]> {
    const rows = await sql<ApartadoDTO[]>`
      SELECT * FROM apartado
      WHERE modulo_id = ${moduloId}
      ORDER BY orden ASC
    `
    return rows
  }

  static async getApartadoById(apartadoId: string): Promise<ApartadoDTO | null> {
    const rows = await sql<ApartadoDTO[]>`
      SELECT * FROM apartado
      WHERE id = ${apartadoId}
      LIMIT 1
    `
    return rows[0] || null
  }

  static async createApartado(
    moduloId: string,
    apartado: Omit<ApartadoDTO, 'id' | 'created_at' | 'numero'>
  ): Promise<ApartadoDTO> {
    const lastRows = await sql`
      SELECT numero FROM apartado
      WHERE modulo_id = ${moduloId}
      ORDER BY numero DESC
      LIMIT 1
    `
    const numero = (lastRows[0]?.numero || 0) + 1

    const rows = await sql`
      INSERT INTO apartado (
        modulo_id,
        numero,
        titulo,
        contenido,
        tipo,
        orden,
        duracion_estimada,
        url_recurso
      ) VALUES (
        ${moduloId},
        ${numero},
        ${apartado.titulo ?? null},
        ${apartado.contenido ?? null},
        ${apartado.tipo ?? null},
        ${apartado.orden ?? numero},
        ${apartado.duracion_estimada ?? null},
        ${apartado.url_recurso ?? null}
      )
      RETURNING *
    `
    return rows[0] as unknown as ApartadoDTO
  }

  static async updateApartado(
    apartadoId: string,
    updates: Partial<ApartadoDTO>
  ): Promise<ApartadoDTO> {
    const columns = Object.keys(updates)
    if (columns.length === 0) {
      const rows = await sql<ApartadoDTO[]>`SELECT * FROM apartado WHERE id = ${apartadoId}`
      return rows[0]
    }

    const rows = await sql<ApartadoDTO[]>`
      UPDATE apartado
      SET ${sql(updates as any)}
      WHERE id = ${apartadoId}
      RETURNING *
    `
    return rows[0]
  }

  static async deleteApartado(apartadoId: string): Promise<void> {
    await sql`
      DELETE FROM apartado
      WHERE id = ${apartadoId}
    `
  }
}
