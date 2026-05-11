/**
 * DTOs para Exámenes (Anti-trampas)
 * CRUCIAL: Las opciones NO incluyen opc_pre_correct_bol
 */

export interface ExamenListDto {
  exam_id_int: number;
  exam_uuid: string;
  exam_durac_int: number; // minutos
  exam_puntaj_int: number;
  exam_desc_vac: string;
}

export interface ExamenDetailDto extends ExamenListDto {
  preguntas: PreguntaDto[];
}

export interface PreguntaDto {
  preg_id_int: number;
  preg_uuid: string;
  preg_tipo_vac: 'MULTIPLE' | 'VERDADERO_FALSO' | 'RESPUESTA_CORTA' | 'NUMERICA';
  preg_enun_vac: string;
  preg_url_vac: string | null;
  preg_puntaj_int: number;
  opciones: OpcionPreguntaDto[];
}

export interface OpcionPreguntaDto {
  opc_pre_id_int: number;
  opc_pre_uuid: string;
  opc_pre_text_vac: string;
  // PROHIBIDO: opc_pre_correct_bol - Se verifica en el servidor
}

export interface IntentoExamenDto {
  int_exam_id_int: number;
  int_exam_uuid: string;
  int_exam_inic_tmp: string;
  int_exam_fin_tmp: string | null;
  int_exam_nota_auto_tmp: number | null;
  int_exam_nota_man_tmp: number | null;
  int_exam_estad_tmp: 'EN_PROGRESO' | 'COMPLETADO' | 'SUSPENDIDO' | 'FRAUDE';
  int_exam_ult_hrtbeat_tmp: string;
  infracciones: InfraccionExamenDto[];
}

export interface InfraccionExamenDto {
  inf_exam_id_int: number;
  inf_exam_uuid: string;
  inf_exam_tipo_vac: 'TAB_CHANGE' | 'FOCUS_LOSS' | 'PAGE_UNLOAD' | 'TIMEOUT';
  inf_exam_salid_tmp: string;
  inf_exam_retorn_tmp: string | null;
  inf_exam_durac_tmp: number; // segundos
}

export interface RespuestaEstudianteDto {
  preg_id_int: number;
  opc_pre_id_int?: number; // Para opciones múltiples
  rpta_estu_text_vac?: string; // Para respuestas cortas
  rpta_estu_num?: number; // Para respuestas numéricas
}

export interface SubmitExamenRequestDto {
  int_exam_id_int: number;
  respuestas: RespuestaEstudianteDto[];
  infracciones: { tipo: string; duracion: number }[];
}

export interface ExamenResultDto {
  int_exam_id_int: number;
  nota_auto: number;
  nota_final?: number;
  estado: string;
  fecha_calificacion: string;
  tiene_infracciones: boolean;
}
