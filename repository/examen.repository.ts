import 'server-only'

import { supabase } from '@/lib/supabase'
import {
  ExamenListDto,
  ExamenDetailDto,
  IntentoExamenDto,
  SubmitExamenRequestDto,
  RespuestaEstudianteDto,
  InfraccionExamenDto,
} from '@/dto/examen.dto'
import { Database } from '@/types/db'

export class ExamenRepository {
  static async getExamenesByCurso(cursoId: string): Promise<ExamenListDto[]> {
    const { data, error } = await supabase
      .from('examen')
      .select(`
        exam_id_int,
        exam_uuid,
        exam_durac_int,
        exam_puntaj_int,
        exam_desc_vac
      `)
      .eq('curso_id', cursoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as ExamenListDto[]
  }

  static async getExamenById(examenId: string): Promise<ExamenDetailDto | null> {
    const { data, error } = await supabase
      .from('examen')
      .select(`
        exam_id_int,
        exam_uuid,
        exam_durac_int,
        exam_puntaj_int,
        exam_desc_vac,
        preguntas:pregunta(
          preg_id_int,
          preg_uuid,
          preg_tipo_vac,
          preg_enun_vac,
          preg_url_vac,
          preg_puntaj_int,
          opciones:opcion_pregunta(
            opc_pre_id_int,
            opc_pre_uuid,
            opc_pre_text_vac
          )
        )
      `)
      .eq('exam_uuid', examenId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as ExamenDetailDto | null
  }

  static async createExamen(examen: {
    curso_id: string
    exam_desc_vac: string
    exam_durac_int: number
    exam_puntaj_int: number
  }): Promise<ExamenListDto> {
    const { data, error } = await supabase
      .from('examen')
      .insert({
        curso_id: examen.curso_id,
        exam_desc_vac: examen.exam_desc_vac,
        exam_durac_int: examen.exam_durac_int,
        exam_puntaj_int: examen.exam_puntaj_int,
      })
      .select(`
        exam_id_int,
        exam_uuid,
        exam_durac_int,
        exam_puntaj_int,
        exam_desc_vac
      `)
      .single()

    if (error) throw error
    return data as ExamenListDto
  }

  static async createIntento(
    estudianteId: string,
    examenId: string
  ): Promise<IntentoExamenDto> {
    const { data, error } = await supabase
      .from('intento_examen')
      .insert({
        estudiante_id: estudianteId,
        examen_id: examenId,
        int_exam_inic_tmp: new Date().toISOString(),
        int_exam_estad_tmp: 'EN_PROGRESO',
        int_exam_ult_hrtbeat_tmp: new Date().toISOString(),
      })
      .select(`
        int_exam_id_int,
        int_exam_uuid,
        int_exam_inic_tmp,
        int_exam_fin_tmp,
        int_exam_nota_auto_tmp,
        int_exam_nota_man_tmp,
        int_exam_estad_tmp,
        int_exam_ult_hrtbeat_tmp,
        infracciones:infraccion_examen(
          inf_exam_id_int,
          inf_exam_uuid,
          inf_exam_tipo_vac,
          inf_exam_salid_tmp,
          inf_exam_retorn_tmp,
          inf_exam_durac_tmp
        )
      `)
      .single()

    if (error) throw error
    return data as IntentoExamenDto
  }

  static async getIntentoByUuid(uuid: string): Promise<IntentoExamenDto | null> {
    const { data, error } = await supabase
      .from('intento_examen')
      .select(`
        int_exam_id_int,
        int_exam_uuid,
        int_exam_inic_tmp,
        int_exam_fin_tmp,
        int_exam_nota_auto_tmp,
        int_exam_nota_man_tmp,
        int_exam_estad_tmp,
        int_exam_ult_hrtbeat_tmp,
        infracciones:infraccion_examen(
          inf_exam_id_int,
          inf_exam_uuid,
          inf_exam_tipo_vac,
          inf_exam_salid_tmp,
          inf_exam_retorn_tmp,
          inf_exam_durac_tmp
        )
      `)
      .eq('int_exam_uuid', uuid)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as IntentoExamenDto | null
  }

  static async registerInfraction(
    intentoId: string,
    tipo: string,
    duracion: number
  ): Promise<void> {
    const { error } = await supabase
      .from('infraccion_examen')
      .insert({
        intento_examen_id: intentoId,
        inf_exam_tipo_vac: tipo,
        inf_exam_salid_tmp: new Date().toISOString(),
        inf_exam_durac_tmp: duracion,
      })

    if (error) throw error
  }

  static async updateHeartbeat(intentoId: string): Promise<void> {
    const { error } = await supabase
      .from('intento_examen')
      .update({
        int_exam_ult_hrtbeat_tmp: new Date().toISOString(),
      })
      .eq('int_exam_id_int', parseInt(intentoId))

    if (error) throw error
  }

  static async submitExamen(
    intentoId: string,
    respuestas: RespuestaEstudianteDto[],
    infracciones: { tipo: string; duracion: number }[]
  ): Promise<void> {
    // Guardar respuestas
    const respuestasData = respuestas.map((r) => ({
      intento_examen_id: intentoId,
      pregunta_id: r.preg_id_int,
      opcion_pregunta_id: r.opc_pre_id_int,
      rpta_estu_text_vac: r.rpta_estu_text_vac,
      rpta_estu_num: r.rpta_estu_num,
    }))

    const { error: respuestasError } = await supabase
      .from('respuesta_estudiante')
      .insert(respuestasData)

    if (respuestasError) throw respuestasError

    // Guardar infracciones (máx 50 para prevenir DoS)
    const infraccionesLimitadas = infracciones.slice(0, 50)
    for (const infraccion of infraccionesLimitadas) {
      const { error } = await supabase
        .from('infraccion_examen')
        .insert({
          intento_examen_id: intentoId,
          inf_exam_tipo_vac: infraccion.tipo,
          inf_exam_salid_tmp: new Date().toISOString(),
          inf_exam_durac_tmp: infraccion.duracion,
        })

      if (error) throw error
    }

    // Marcar como completado
    const { error: updateError } = await supabase
      .from('intento_examen')
      .update({
        int_exam_fin_tmp: new Date().toISOString(),
        int_exam_estad_tmp: infracciones.length > 0 ? 'FRAUDE' : 'COMPLETADO',
      })
      .eq('int_exam_id_int', parseInt(intentoId))

    if (updateError) throw updateError
  }

  static async getRespuestasByIntento(
    intentoId: string
  ): Promise<RespuestaEstudianteDto[]> {
    const { data, error } = await supabase
      .from('respuesta_estudiante')
      .select('*')
      .eq('intento_examen_id', intentoId)

    if (error) throw error
    return data as RespuestaEstudianteDto[]
  }

  static async calificarExamen(
    intentoId: string,
    nota: number
  ): Promise<void> {
    const { error } = await supabase
      .from('intento_examen')
      .update({
        int_exam_nota_auto_tmp: nota,
      })
      .eq('int_exam_id_int', parseInt(intentoId))

    if (error) throw error
  }
}
