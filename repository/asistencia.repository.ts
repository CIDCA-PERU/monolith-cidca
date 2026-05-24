import 'server-only'

import { supabase } from '@/lib/supabase'
import { SesionClaseDto, AsistenciaRegistroDto, ReporteAsistenciaDto } from '@/dto/asistencia.dto'

export class AsistenciaRepository {

  /**
   * Obtiene las sesiones de clase de un curso usando cur_id_int.
   * La sesion_clase se relaciona con curso via cur_id_int (entero), no uuid.
   */
  static async getSesionesByCurso(cursoUuid: string): Promise<SesionClaseDto[]> {
    // Primero obtener cur_id_int del uuid
    const { data: cursoData, error: cursoError } = await supabase
      .from('curso')
      .select('cur_id_int')
      .eq('cur_uuid', cursoUuid)
      .single()

    if (cursoError || !cursoData) return []

    const { data, error } = await supabase
      .from('sesion_clase')
      .select(`
        ses_id_int,
        asist_uuid,
        ses_fecha_dat,
        ses_hora_inic_tmp,
        ses_hora_fin_tmp,
        ses_estado_vac,
        cur_id_int,
        hor_cur_id_int
      `)
      .eq('cur_id_int', cursoData.cur_id_int)
      .order('ses_fecha_dat', { ascending: false })

    if (error) throw error

    return (data || []).map((sesion: any) => ({
      ses_id_int: sesion.ses_id_int,
      asist_uuid: sesion.asist_uuid,
      ses_fecha_dat: sesion.ses_fecha_dat,
      ses_hora_inic_tmp: sesion.ses_hora_inic_tmp,
      ses_hora_fin_tmp: sesion.ses_hora_fin_tmp,
      ses_estado_vac: sesion.ses_estado_vac ?? 'PROGRAMADA',
      puede_asistir: false,
      minutos_antes_inicio: 0,
      minutos_desde_inicio: 0,
    }))
  }

  static async getSesionById(sesionId: number): Promise<SesionClaseDto | null> {
    const { data, error } = await supabase
      .from('sesion_clase')
      .select(`
        ses_id_int,
        asist_uuid,
        ses_fecha_dat,
        ses_hora_inic_tmp,
        ses_hora_fin_tmp,
        ses_estado_vac
      `)
      .eq('ses_id_int', sesionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      ses_id_int: data.ses_id_int,
      asist_uuid: data.asist_uuid,
      ses_fecha_dat: data.ses_fecha_dat,
      ses_hora_inic_tmp: data.ses_hora_inic_tmp,
      ses_hora_fin_tmp: data.ses_hora_fin_tmp,
      ses_estado_vac: data.ses_estado_vac ?? 'PROGRAMADA',
      puede_asistir: false,
      minutos_antes_inicio: 0,
      minutos_desde_inicio: 0,
    }
  }

  /**
   * Obtiene las asistencias de una sesión con datos del estudiante.
   */
  static async getAsistenciaBySesion(sesionId: number): Promise<AsistenciaRegistroDto[]> {
    const { data, error } = await supabase
      .from('asistencia')
      .select(`
        asist_id_int,
        asist_uuid,
        asist_est_int,
        ses_id_int,
        asist_cre_tmp,
        usuarios!usr_id_int (
          usr_nomb_vac,
          estudiante!usr_id_int (
            estu_nomb_vac,
            estu_apell_pat_vac
          )
        )
      `)
      .eq('ses_id_int', sesionId)

    if (error) throw error

    return (data || []).map((registro: any) => ({
      asist_id_int: registro.asist_id_int,
      asist_uuid: registro.asist_uuid,
      asist_est_int: registro.asist_est_int,
      ses_id_int: registro.ses_id_int,
      estu_nomb_vac: registro.usuarios?.estudiante?.estu_nomb_vac ?? registro.usuarios?.usr_nomb_vac ?? '',
      estu_apell_pat_vac: registro.usuarios?.estudiante?.estu_apell_pat_vac ?? '',
      asist_cre_tmp: registro.asist_cre_tmp,
    }))
  }

  /**
   * Actualiza el estado de una asistencia + registra en historial.
   */
  static async updateAsistencia(
    asistenciaId: number,
    nuevoEstado: number,
    usuarioId: number,
    valorAnterior: string,
    valorNuevo: string
  ): Promise<void> {
    const { error: updateError } = await supabase
      .from('asistencia')
      .update({
        asist_est_int: nuevoEstado,
        asist_upd_tmp: new Date().toISOString(),
      })
      .eq('asist_id_int', asistenciaId)

    if (updateError) throw updateError

    // Registrar en historial
    await supabase
      .from('historial_asistencia')
      .insert({
        asist_id_int: asistenciaId,
        usr_id_int: usuarioId,
        hist_asist_acc_vac: 'UPDATE',
        hist_asist_old_val_vac: valorAnterior,
        hist_asist_new_val_vac: valorNuevo,
        hist_asist_cre_tmp: new Date().toISOString(),
      })
  }

  /**
   * Obtiene reporte completo de asistencia de una sesión.
   */
  static async getReporteAsistencia(sesionId: number): Promise<ReporteAsistenciaDto> {
    const sesion = await this.getSesionById(sesionId)
    if (!sesion) throw new Error('Sesión no encontrada')

    const registros = await this.getAsistenciaBySesion(sesionId)

    const presentes = registros.filter((r) => r.asist_est_int === 1).length
    const tardios = registros.filter((r) => r.asist_est_int === 2).length
    const ausentes = registros.filter((r) => r.asist_est_int === 0).length
    const total = registros.length

    return {
      ses_id_int: sesion.ses_id_int,
      ses_fecha_dat: sesion.ses_fecha_dat,
      total_estudiantes: total,
      presentes,
      ausentes,
      tardios,
      porcentaje_asistencia: total > 0 ? Math.round((presentes / total) * 100) : 0,
      registros,
    }
  }

  /**
   * Crea una nueva sesión de clase manualmente.
   */
  static async crearSesion(
    curIdInt: number,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    horCurIdInt?: number
  ): Promise<number> {
    const { data, error } = await supabase
      .from('sesion_clase')
      .insert({
        cur_id_int: curIdInt,
        ses_fecha_dat: fecha,
        ses_hora_inic_tmp: horaInicio,
        ses_hora_fin_tmp: horaFin,
        ses_estado_vac: 'PROGRAMADA',
        hor_cur_id_int: horCurIdInt ?? null,
      })
      .select('ses_id_int')
      .single()

    if (error) throw error
    return data.ses_id_int
  }
}
