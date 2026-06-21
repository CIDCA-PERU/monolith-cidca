import 'server-only'

import { sql } from '@/lib/db'
import { CursoDTO } from '@/dto/curso.dto'
import { EstudianteCursoDto } from '@/dto/estudiante-curso.dto'

export class CursoRepository {
  private static mapCursoRow(row: any): CursoDTO {
    return {
      id: row.cur_uuid,
      nombre: row.cur_nomb_vac ?? '',
      descripcion: row.cur_desc_vac ?? '',
      docente_id: row.usr_id_int,
      estado: row.cur_est_int === 1 ? 'activo' : 'borrador',
      fecha_inicio: row.cur_fec_inic_tmp ?? '',
      fecha_fin: row.cur_fec_fin_tmp ?? '',
      cantidad_estudiantes: row.cantidad_estudiantes ?? 0,
      imagen_url: row.cur_url_vac ?? null,
      zoom_url: row.cur_zoom_url_vac ?? null,
      created_at: row.cur_cre_tmp ?? '',
    }
  }

  static async getCursosByDocente(docenteId: string): Promise<CursoDTO[]> {
    const rows = await sql`
      SELECT 
        c.cur_uuid,
        c.cur_nomb_vac,
        c.cur_desc_vac,
        c.cur_est_int,
        c.cur_fec_inic_tmp,
        c.cur_fec_fin_tmp,
        c.cur_url_vac,
        c.cur_zoom_url_vac,
        c.cur_cre_tmp,
        c.usr_id_int,
        COUNT(ec.est_cur_id_int) as cantidad_estudiantes
      FROM curso c
      LEFT JOIN estudiante_curso ec ON c.cur_id_int = ec.cur_id_int
      WHERE c.usr_id_int = ${parseInt(docenteId)}
      GROUP BY c.cur_id_int
      ORDER BY c.cur_cre_tmp DESC
    `

    return rows.map((c: any) => CursoRepository.mapCursoRow(c))
  }

  static async getCursoById(cursoUuid: string): Promise<CursoDTO | null> {
    const rows = await sql`
      SELECT 
        c.cur_uuid,
        c.cur_nomb_vac,
        c.cur_desc_vac,
        c.cur_est_int,
        c.cur_fec_inic_tmp,
        c.cur_fec_fin_tmp,
        c.cur_url_vac,
        c.cur_zoom_url_vac,
        c.cur_cre_tmp,
        c.cur_precio_num,
        c.usr_id_int,
        COUNT(ec.est_cur_id_int) as cantidad_estudiantes
      FROM curso c
      LEFT JOIN estudiante_curso ec ON c.cur_id_int = ec.cur_id_int
      WHERE c.cur_uuid = ${cursoUuid}
      GROUP BY c.cur_id_int
      LIMIT 1
    `

    if (!rows.length) return null

    return CursoRepository.mapCursoRow(rows[0])
  }

  static async createCurso(curso: Omit<CursoDTO, 'id' | 'created_at'>): Promise<CursoDTO> {
    const rows = await sql`
      INSERT INTO curso (
        cur_nomb_vac,
        cur_desc_vac,
        usr_id_int,
        cur_est_int,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp,
        cur_url_vac,
        cur_zoom_url_vac,
        cur_precio_num
      ) VALUES (
        ${curso.nombre},
        ${curso.descripcion},
        ${curso.docente_id},
        ${curso.estado === 'activo' ? 1 : 0},
        ${curso.fecha_inicio},
        ${curso.fecha_fin},
        ${curso.imagen_url ?? null},
        ${curso.zoom_url ?? null},
        ${curso.precio ?? 0}
      )
      RETURNING *
    `

    return CursoRepository.mapCursoRow(rows[0])
  }

  static async updateCurso(
    cursoId: string,
    updates: Partial<CursoDTO>
  ): Promise<CursoDTO> {
    const updatePayload: Record<string, any> = {
      cur_upd_tmp: new Date().toISOString(),
    }

    if (updates.nombre !== undefined) updatePayload.cur_nomb_vac = updates.nombre
    if (updates.descripcion !== undefined) updatePayload.cur_desc_vac = updates.descripcion
    if (updates.docente_id !== undefined) updatePayload.usr_id_int = updates.docente_id
    if (updates.estado !== undefined) {
      updatePayload.cur_est_int = updates.estado === 'activo' ? 1 : 0
    }
    if (updates.fecha_inicio !== undefined) updatePayload.cur_fec_inic_tmp = updates.fecha_inicio
    if (updates.fecha_fin !== undefined) updatePayload.cur_fec_fin_tmp = updates.fecha_fin
    if (updates.imagen_url !== undefined) updatePayload.cur_url_vac = updates.imagen_url
    if (updates.zoom_url !== undefined) updatePayload.cur_zoom_url_vac = updates.zoom_url
    if (updates.precio !== undefined) updatePayload.cur_precio_num = updates.precio

    const rows = await sql`
      UPDATE curso
      SET ${sql(updatePayload)}
      WHERE cur_uuid = ${cursoId}
      RETURNING *
    `

    return CursoRepository.mapCursoRow(rows[0])
  }

  static async deleteCurso(cursoId: string): Promise<void> {
    await sql`
      DELETE FROM curso
      WHERE cur_uuid = ${cursoId}
    `
  }

  /**
   * Obtiene la lista de estudiantes inscritos a un curso.
   */
  static async getEstudiantesByCurso(cursoUuid: string): Promise<EstudianteCursoDto[]> {
    const cursoRows = await sql`SELECT cur_id_int FROM curso WHERE cur_uuid = ${cursoUuid} LIMIT 1`
    if (!cursoRows.length) return []
    const cur_id_int = cursoRows[0].cur_id_int

    const rows = await sql`
      SELECT 
        ec.est_cur_id_int,
        ec.cur_id_int,
        ec.est_id_int,
        ec.est_cur_estado_bol,
        ec.est_cur_cre_tmp,
        e.estu_id_int,
        e.estu_uuid,
        e.estu_nomb_vac,
        e.estu_apell_pat_vac,
        e.estu_apell_mat_vac,
        u.usr_email_vac
      FROM estudiante_curso ec
      JOIN estudiante e ON ec.est_id_int = e.estu_id_int
      JOIN usuarios u ON e.usr_id_int = u.usr_id_int
      WHERE ec.cur_id_int = ${cur_id_int}
      ORDER BY ec.est_cur_cre_tmp ASC
    `

    return rows.map((row: any) => ({
      est_cur_id_int: row.est_cur_id_int,
      cur_id_int: row.cur_id_int,
      est_id_int: row.est_id_int,
      est_cur_estado_bol: row.est_cur_estado_bol,
      est_cur_cre_tmp: row.est_cur_cre_tmp,
      estu_nomb_vac: row.estu_nomb_vac ?? '',
      estu_apell_pat_vac: row.estu_apell_pat_vac ?? '',
      estu_apell_mat_vac: row.estu_apell_mat_vac ?? '',
      usr_email_vac: row.usr_email_vac ?? '',
      estu_uuid: row.estu_uuid ?? '',
    }))
  }

  static async toggleEstudianteCurso(
    estCurId: number,
    estado: boolean
  ): Promise<void> {
    await sql`
      UPDATE estudiante_curso
      SET 
        est_cur_estado_bol = ${estado}, 
        est_cur_upd_tmp = NOW()
      WHERE est_cur_id_int = ${estCurId}
    `
  }

  static async addEstudianteToCurso(
    curIdInt: number,
    estIdInt: number
  ): Promise<void> {
    await sql`
      INSERT INTO estudiante_curso (
        cur_id_int,
        est_id_int,
        est_cur_estado_bol,
        est_cur_cre_tmp,
        est_cur_upd_tmp
      ) VALUES (
        ${curIdInt},
        ${estIdInt},
        true,
        NOW(),
        NOW()
      )
    `
  }

  static async removeEstudianteFromCurso(estCurId: number): Promise<void> {
    await sql`
      DELETE FROM estudiante_curso
      WHERE est_cur_id_int = ${estCurId}
    `
  }
}
