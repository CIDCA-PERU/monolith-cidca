import 'server-only'

import { sql } from '@/lib/db'
import {
  ExamenListDto,
  ExamenDetailDto,
  IntentoExamenDto,
  SubmitExamenRequestDto,
  RespuestaEstudianteDto,
  InfraccionExamenDto,
} from '@/dto/examen.dto'

export class ExamenRepository {
  static async getExamenesByCurso(cursoId: string): Promise<ExamenListDto[]> {
    const rows = await sql<ExamenListDto[]>`
      SELECT 
        exam_id_int,
        exam_uuid,
        exam_durac_int,
        exam_puntaj_int,
        exam_desc_vac
      FROM examen
      WHERE curso_id = ${cursoId}
      ORDER BY exam_cre_tmp DESC
    `
    return rows
  }

  static async getExamenById(examenId: string): Promise<ExamenDetailDto | null> {
    const rows = await sql`
      SELECT 
        e.exam_id_int,
        e.exam_uuid,
        e.exam_durac_int,
        e.exam_puntaj_int,
        e.exam_desc_vac,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'preg_id_int', p.preg_id_int,
              'preg_uuid', p.preg_uuid,
              'preg_tipo_vac', p.preg_tipo_vac,
              'preg_enun_vac', p.preg_enun_vac,
              'preg_url_vac', p.preg_url_vac,
              'preg_puntaj_int', p.preg_puntaj_int,
              'opciones', (
                SELECT COALESCE(json_agg(
                  json_build_object(
                    'opc_pre_id_int', o.opc_pre_id_int,
                    'opc_pre_uuid', o.opc_pre_uuid,
                    'opc_pre_text_vac', o.opc_pre_text_vac
                  )
                ), '[]'::json)
                FROM opcion_pregunta o 
                WHERE o.preg_id_int = p.preg_id_int
              )
            )
          ), '[]'::json)
          FROM pregunta p 
          WHERE p.exam_id_int = e.exam_id_int
        ) as preguntas
      FROM examen e
      WHERE e.exam_uuid = ${examenId}
      LIMIT 1
    `

    if (!rows.length) return null
    return rows[0] as ExamenDetailDto
  }

  static async createExamen(examen: {
    curso_id: string
    exam_desc_vac: string
    exam_durac_int: number
    exam_puntaj_int: number
  }): Promise<ExamenListDto> {
    const rows = await sql<ExamenListDto[]>`
      INSERT INTO examen (
        curso_id,
        exam_desc_vac,
        exam_durac_int,
        exam_puntaj_int
      ) VALUES (
        ${examen.curso_id},
        ${examen.exam_desc_vac},
        ${examen.exam_durac_int},
        ${examen.exam_puntaj_int}
      )
      RETURNING 
        exam_id_int,
        exam_uuid,
        exam_durac_int,
        exam_puntaj_int,
        exam_desc_vac
    `
    return rows[0]
  }

  static async createIntento(
    estudianteId: string,
    examenId: string
  ): Promise<IntentoExamenDto> {
    const rows = await sql`
      INSERT INTO intento_examen (
        estudiante_id,
        examen_id,
        int_exam_inic_tmp,
        int_exam_estad_tmp,
        int_exam_ult_hrtbeat_tmp
      ) VALUES (
        ${estudianteId},
        ${examenId},
        NOW(),
        'EN_PROGRESO',
        NOW()
      )
      RETURNING 
        int_exam_id_int,
        int_exam_uuid,
        int_exam_inic_tmp,
        int_exam_fin_tmp,
        int_exam_nota_auto_tmp,
        int_exam_nota_man_tmp,
        int_exam_estad_tmp,
        int_exam_ult_hrtbeat_tmp
    `
    
    // An intento has 0 infracciones initially
    return {
      ...(rows[0] as any),
      infracciones: []
    } as IntentoExamenDto
  }

  static async getIntentoByUuid(uuid: string): Promise<IntentoExamenDto | null> {
    const rows = await sql`
      SELECT 
        i.int_exam_id_int,
        i.int_exam_uuid,
        i.int_exam_inic_tmp,
        i.int_exam_fin_tmp,
        i.int_exam_nota_auto_tmp,
        i.int_exam_nota_man_tmp,
        i.int_exam_estad_tmp,
        i.int_exam_ult_hrtbeat_tmp,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'inf_exam_id_int', inf.inf_exam_id_int,
              'inf_exam_uuid', inf.inf_exam_uuid,
              'inf_exam_tipo_vac', inf.inf_exam_tipo_vac,
              'inf_exam_salid_tmp', inf.inf_exam_salid_tmp,
              'inf_exam_retorn_tmp', inf.inf_exam_retorn_tmp,
              'inf_exam_durac_tmp', inf.inf_exam_durac_tmp
            )
          ), '[]'::json)
          FROM infraccion_examen inf
          WHERE inf.intento_examen_id = i.int_exam_id_int
        ) as infracciones
      FROM intento_examen i
      WHERE i.int_exam_uuid = ${uuid}
      LIMIT 1
    `

    if (!rows.length) return null
    return rows[0] as IntentoExamenDto
  }

  static async registerInfraction(
    intentoId: string,
    tipo: string,
    duracion: number
  ): Promise<void> {
    await sql`
      INSERT INTO infraccion_examen (
        intento_examen_id,
        inf_exam_tipo_vac,
        inf_exam_salid_tmp,
        inf_exam_durac_tmp
      ) VALUES (
        ${intentoId},
        ${tipo},
        NOW(),
        ${duracion}
      )
    `
  }

  static async updateHeartbeat(intentoId: string): Promise<void> {
    await sql`
      UPDATE intento_examen
      SET int_exam_ult_hrtbeat_tmp = NOW()
      WHERE int_exam_id_int = ${parseInt(intentoId)}
    `
  }

  static async submitExamen(
    intentoId: string,
    respuestas: RespuestaEstudianteDto[],
    infracciones: { tipo: string; duracion: number }[]
  ): Promise<void> {
    await sql.begin(async sql => {
      if (respuestas.length > 0) {
        const insertData = respuestas.map(r => ({
          intento_examen_id: intentoId,
          pregunta_id: r.preg_id_int,
          opcion_pregunta_id: r.opc_pre_id_int,
          rpta_estu_text_vac: r.rpta_estu_text_vac,
          rpta_estu_num: r.rpta_estu_num,
        }))
        await sql`INSERT INTO respuesta_estudiante ${sql(insertData)}`
      }

      const infraccionesLimitadas = infracciones.slice(0, 50)
      if (infraccionesLimitadas.length > 0) {
        const infData = infraccionesLimitadas.map(inf => ({
          intento_examen_id: intentoId,
          inf_exam_tipo_vac: inf.tipo,
          inf_exam_salid_tmp: new Date().toISOString(), // Usar ISO desde Node para el array
          inf_exam_durac_tmp: inf.duracion
        }))
        await sql`INSERT INTO infraccion_examen ${sql(infData)}`
      }

      await sql`
        UPDATE intento_examen
        SET 
          int_exam_fin_tmp = NOW(),
          int_exam_estad_tmp = ${infracciones.length > 0 ? 'FRAUDE' : 'COMPLETADO'}
        WHERE int_exam_id_int = ${parseInt(intentoId)}
      `
    })
  }

  static async getRespuestasByIntento(
    intentoId: string
  ): Promise<RespuestaEstudianteDto[]> {
    const rows = await sql<RespuestaEstudianteDto[]>`
      SELECT * FROM respuesta_estudiante
      WHERE intento_examen_id = ${intentoId}
    `
    return rows
  }

  static async calificarExamen(
    intentoId: string,
    nota: number
  ): Promise<void> {
    await sql`
      UPDATE intento_examen
      SET int_exam_nota_auto_tmp = ${nota}
      WHERE int_exam_id_int = ${parseInt(intentoId)}
    `
  }
}
