import 'server-only'

import { supabase } from '@/lib/supabase'
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
      cantidad_estudiantes: (row.estudiante_curso ?? []).length,
      imagen_url: row.cur_url_vac ?? null,
      zoom_url: row.cur_zoom_url_vac ?? null,
      created_at: row.cur_cre_tmp ?? '',
    }
  }

  static async getCursosByDocente(docenteId: string): Promise<CursoDTO[]> {
    const { data, error } = await supabase
      .from('curso')
      .select(`
        cur_uuid,
        cur_nomb_vac,
        cur_desc_vac,
        cur_est_int,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp,
        cur_url_vac,
        cur_zoom_url_vac,
        cur_cre_tmp,
        usr_id_int,
        estudiante_curso ( est_cur_id_int )
      `)
      .eq('usr_id_int', docenteId)
      .order('cur_cre_tmp', { ascending: false })

    if (error) throw error

    return (data ?? []).map((c: any) => CursoRepository.mapCursoRow(c))
  }

  static async getCursoById(cursoUuid: string): Promise<CursoDTO | null> {
    const { data, error } = await supabase
      .from('curso')
      .select(`
        cur_uuid,
        cur_nomb_vac,
        cur_desc_vac,
        cur_est_int,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp,
        cur_url_vac,
        cur_zoom_url_vac,
        cur_cre_tmp,
        cur_precio_num,
        usr_id_int,
        estudiante_curso ( est_cur_id_int )
      `)
      .eq('cur_uuid', cursoUuid)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('[getCursoById] Supabase error:', error.message)
      throw error
    }
    if (!data) return null

    return CursoRepository.mapCursoRow(data as any)
  }

  static async createCurso(curso: Omit<CursoDTO, 'id' | 'created_at'>): Promise<CursoDTO> {
    const { data, error } = await supabase
      .from('curso')
      .insert({
        cur_nomb_vac: curso.nombre,
        cur_desc_vac: curso.descripcion,
        usr_id_int: curso.docente_id,
        cur_est_int: curso.estado === 'activo' ? 1 : 0,
        cur_fec_inic_tmp: curso.fecha_inicio,
        cur_fec_fin_tmp: curso.fecha_fin,
        cur_url_vac: curso.imagen_url ?? null,
        cur_zoom_url_vac: curso.zoom_url ?? null,
      })
      .select(`
        cur_uuid,
        cur_nomb_vac,
        cur_desc_vac,
        cur_est_int,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp,
        cur_url_vac,
        cur_zoom_url_vac,
        cur_cre_tmp,
        usr_id_int,
        estudiante_curso ( est_cur_id_int )
      `)
      .single()

    if (error) throw error
    return CursoRepository.mapCursoRow(data as any)
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

    const { data, error } = await supabase
      .from('curso')
      .update(updatePayload)
      .eq('cur_uuid', cursoId)
      .select(`
        cur_uuid,
        cur_nomb_vac,
        cur_desc_vac,
        cur_est_int,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp,
        cur_url_vac,
        cur_zoom_url_vac,
        cur_cre_tmp,
        usr_id_int,
        estudiante_curso ( est_cur_id_int )
      `)
      .single()

    if (error) throw error
    return CursoRepository.mapCursoRow(data as any)
  }

  static async deleteCurso(cursoId: string): Promise<void> {
    const { error } = await supabase
      .from('curso')
      .delete()
      .eq('cur_uuid', cursoId)

    if (error) throw error
  }

  /**
   * Obtiene la lista de estudiantes inscritos a un curso.
   * Usa la tabla real: estudiante_curso, con join a estudiante y usuarios.
   */
  static async getEstudiantesByCurso(cursoUuid: string): Promise<EstudianteCursoDto[]> {
    // Primero obtener el cur_id_int a partir del uuid
    const { data: cursoData, error: cursoError } = await supabase
      .from('curso')
      .select('cur_id_int')
      .eq('cur_uuid', cursoUuid)
      .single()

    if (cursoError || !cursoData) return []

    const { data, error } = await supabase
      .from('estudiante_curso')
      .select(`
        est_cur_id_int,
        cur_id_int,
        est_id_int,
        est_cur_estado_bol,
        est_cur_cre_tmp,
        estudiante!est_id_int (
          estu_id_int,
          estu_uuid,
          estu_nomb_vac,
          estu_apell_pat_vac,
          estu_apell_mat_vac,
          usuarios!usr_id_int (
            usr_email_vac
          )
        )
      `)
      .eq('cur_id_int', cursoData.cur_id_int)
      .order('est_cur_cre_tmp', { ascending: true })

    if (error) throw error

    return (data ?? []).map((row: any) => ({
      est_cur_id_int: row.est_cur_id_int,
      cur_id_int: row.cur_id_int,
      est_id_int: row.est_id_int,
      est_cur_estado_bol: row.est_cur_estado_bol,
      est_cur_cre_tmp: row.est_cur_cre_tmp,
      estu_nomb_vac: row.estudiante?.estu_nomb_vac ?? '',
      estu_apell_pat_vac: row.estudiante?.estu_apell_pat_vac ?? '',
      estu_apell_mat_vac: row.estudiante?.estu_apell_mat_vac ?? '',
      usr_email_vac: row.estudiante?.usuarios?.usr_email_vac ?? '',
      estu_uuid: row.estudiante?.estu_uuid ?? '',
    }))
  }

  /**
   * Habilita o deshabilita a un estudiante en el curso (est_cur_estado_bol).
   */
  static async toggleEstudianteCurso(
    estCurId: number,
    estado: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('estudiante_curso')
      .update({ est_cur_estado_bol: estado, est_cur_upd_tmp: new Date().toISOString() })
      .eq('est_cur_id_int', estCurId)

    if (error) throw error
  }

  /**
   * Inscribe un estudiante a un curso por sus IDs enteros.
   */
  static async addEstudianteToCurso(
    curIdInt: number,
    estIdInt: number
  ): Promise<void> {
    const { error } = await supabase
      .from('estudiante_curso')
      .insert({
        cur_id_int: curIdInt,
        est_id_int: estIdInt,
        est_cur_estado_bol: true,
        est_cur_cre_tmp: new Date().toISOString(),
        est_cur_upd_tmp: new Date().toISOString(),
      })

    if (error) throw error
  }

  /**
   * Elimina la relación estudiante-curso por el ID de la relación.
   */
  static async removeEstudianteFromCurso(estCurId: number): Promise<void> {
    const { error } = await supabase
      .from('estudiante_curso')
      .delete()
      .eq('est_cur_id_int', estCurId)

    if (error) throw error
  }
}
