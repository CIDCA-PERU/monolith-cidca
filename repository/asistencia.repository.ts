import 'server-only'

import { sql } from '@/lib/db'
import { SesionClaseDto, AsistenciaRegistroDto, ReporteAsistenciaDto } from '@/dto/asistencia.dto'

export class AsistenciaRepository {

  /**
   * Obtiene las sesiones de clase de un curso usando cur_id_int.
   */
  static async getSesionesByCurso(cursoUuid: string): Promise<SesionClaseDto[]> {
    const cursoRows = await sql`SELECT cur_id_int FROM curso WHERE cur_uuid = ${cursoUuid} LIMIT 1`
    if (!cursoRows.length) return []
    const cur_id_int = cursoRows[0].cur_id_int

    const rows = await sql`
      SELECT 
        ses_id_int,
        asist_uuid,
        ses_fecha_dat,
        ses_hora_inic_tmp,
        ses_hora_fin_tmp,
        ses_estado_vac,
        cur_id_int,
        hor_cur_id_int
      FROM sesion_clase
      WHERE cur_id_int = ${cur_id_int}
      ORDER BY ses_fecha_dat DESC
    `

    return rows.map((sesion: any) => ({
      ses_id_int: sesion.ses_id_int,
      asist_uuid: sesion.asist_uuid,
      ses_fecha_dat: (sesion.ses_fecha_dat && typeof sesion.ses_fecha_dat.toISOString === 'function') 
        ? sesion.ses_fecha_dat.toISOString().split('T')[0] 
        : String(sesion.ses_fecha_dat).split('T')[0],
      ses_hora_inic_tmp: sesion.ses_hora_inic_tmp,
      ses_hora_fin_tmp: sesion.ses_hora_fin_tmp,
      ses_estado_vac: sesion.ses_estado_vac ?? 'PROGRAMADA',
      puede_asistir: false,
      minutos_antes_inicio: 0,
      minutos_desde_inicio: 0,
    }))
  }

  static async getSesionById(sesionId: number): Promise<SesionClaseDto | null> {
    const rows = await sql`
      SELECT 
        ses_id_int,
        asist_uuid,
        ses_fecha_dat,
        ses_hora_inic_tmp,
        ses_hora_fin_tmp,
        ses_estado_vac
      FROM sesion_clase
      WHERE ses_id_int = ${sesionId}
      LIMIT 1
    `

    if (!rows.length) return null
    const data = rows[0]

    return {
      ses_id_int: data.ses_id_int,
      asist_uuid: data.asist_uuid,
      ses_fecha_dat: (data.ses_fecha_dat && typeof data.ses_fecha_dat.toISOString === 'function') 
        ? data.ses_fecha_dat.toISOString().split('T')[0] 
        : String(data.ses_fecha_dat).split('T')[0],
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
    const rows = await sql`
      SELECT 
        a.asist_id_int,
        a.asist_uuid,
        a.asist_est_int,
        a.ses_id_int,
        a.asist_cre_tmp,
        u.usr_uuid,
        e.estu_nomb_vac,
        e.estu_apell_pat_vac,
        e.estu_apell_mat_vac
      FROM asistencia a
      JOIN usuarios u ON a.usr_id_int = u.usr_id_int
      LEFT JOIN estudiante e ON u.usr_id_int = e.usr_id_int
      WHERE a.ses_id_int = ${sesionId}
    `

    return rows.map((registro: any) => ({
      asist_id_int:       registro.asist_id_int,
      asist_uuid:         registro.asist_uuid,
      usr_uuid:           registro.usr_uuid,
      asist_est_int:      registro.asist_est_int,
      ses_id_int:         registro.ses_id_int,
      estu_nomb_vac:      registro.estu_nomb_vac      ?? '',
      estu_apell_pat_vac: registro.estu_apell_pat_vac ?? '',
      estu_apell_mat_vac: registro.estu_apell_mat_vac ?? '',
      asist_cre_tmp: (registro.asist_cre_tmp && typeof registro.asist_cre_tmp.toISOString === 'function')
        ? registro.asist_cre_tmp.toISOString()
        : String(registro.asist_cre_tmp),
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
    await sql.begin(async sql => {
      await sql`
        UPDATE asistencia
        SET 
          asist_est_int = ${nuevoEstado},
          asist_upd_tmp = NOW()
        WHERE asist_id_int = ${asistenciaId}
      `

      await sql`
        INSERT INTO historial_asistencia (
          asist_id_int,
          usr_id_int,
          hist_asist_acc_vac,
          hist_asist_old_val_vac,
          hist_asist_new_val_vac,
          hist_asist_cre_tmp
        ) VALUES (
          ${asistenciaId},
          ${usuarioId},
          'UPDATE',
          ${valorAnterior},
          ${valorNuevo},
          NOW()
        )
      `
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
    return await sql.begin(async (sql) => {
      const rows = await sql`
        INSERT INTO sesion_clase (
          cur_id_int,
          ses_fecha_dat,
          ses_hora_inic_tmp,
          ses_hora_fin_tmp,
          ses_estado_vac,
          hor_cur_id_int
        ) VALUES (
          ${curIdInt},
          ${fecha},
          ${horaInicio},
          ${horaFin},
          'PROGRAMADA',
          ${horCurIdInt ?? null}
        )
        RETURNING ses_id_int
      `
      const sesId = rows[0].ses_id_int

      await sql`
        INSERT INTO asistencia (
          ses_id_int,
          usr_id_int,
          asist_est_int,
          asist_cre_tmp,
          asist_upd_tmp
        )
        SELECT 
          ${sesId},
          e.usr_id_int,
          0,
          NOW(),
          NOW()
        FROM estudiante_curso ec
        JOIN estudiante e ON ec.est_id_int = e.estu_id_int
        WHERE ec.cur_id_int = ${curIdInt} 
          AND ec.est_cur_estado_bol = true
          AND e.usr_id_int IS NOT NULL
      `

      return sesId
    })
  }
}
