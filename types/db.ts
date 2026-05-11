/**
 * Tipos base para las entidades de la base de datos
 * Reflejan el esquema SQL exacto de CIDCA
 */

export interface Usuario {
  usr_id_int: number;
  usr_uuid: string;
  usr_email_vac: string;
  usr_nomb_vac: string;
  usr_ant_email_vac: string | null;
  usr_pass_vac: string;
  usr_ant_pass_vac: string | null;
  usr_est_int: number;
  usr_cre_tmp: string;
  usr_upd_tmp: string;
  rol_id: number;
}

export interface Rol {
  rol_id: number;
  rol_nam_vc: string;
  rol_cre_tmp: string;
  rol_upd_tmp: string;
}

export interface Permiso {
  perm_id_int: number;
  perm_cod_vac: string;
  perm_desc_vac: string;
}

export interface RolPermiso {
  rol_perm_id_int: number;
  rol_id: number;
  perm_id_int: number;
}

export interface Estudiante {
  estu_id_int: number;
  estu_uuid: string;
  estu_nomb_vac: string;
  estu_apell_pat_vac: string;
  estu_apell_mat_vac: string;
  estu_gen_vac: string | null;
  estu_cre_tmp: string;
  estu_upd_tmp: string;
  usr_id_int: number;
}

export interface Curso {
  cur_id_int: number;
  cur_uuid: string;
  cur_nomb_vac: string;
  cur_desc_vac: string;
  cur_est_int: number;
  cur_fec_inic_tmp: string;
  cur_fec_fin_tmp: string;
  cur_cre_tmp: string;
  cur_upd_tmp: string;
  usr_id_int: number;
}

export interface Modulo {
  mod_id_int: number;
  mod_uuid: string;
  mod_nomb_vac: string;
  mod_desc_vac: string;
  mod_est_int: number;
  mod_cre_tmp: string;
  mod_upd_tmp: string;
  cur_id_int: number;
}

export interface Apartado {
  apar_id_int: number;
  apar_uuid: string;
  apar_nomb_vac: string;
  apar_desc_vac: string;
  apar_est_int: number;
  apar_cre_tmp: string;
  apar_upd_tmp: string;
  mod_id_int: number;
}

export interface ItemApartado {
  item_apar_id_int: number;
  item_apar_uuid: string;
  item_apar_tipo_vac: string;
  item_apar_titulo_vac: string;
  item_apar_est_int: number;
  item_apar_url_vac: string | null;
  item_apar_ordn_inte: number;
  item_apar_cre_tmp: string;
  item_apar_upd_tmp: string;
  apar_id_int: number;
}

export interface Examen {
  exam_id_int: number;
  exam_uuid: string;
  exam_durac_int: number;
  exam_desc_vac: string;
  exam_puntaj_int: number;
  exam_cre_tmp: string;
  exam_upd_tmp: string;
  mod_id_int: number;
}

export interface Pregunta {
  preg_id_int: number;
  preg_uuid: string;
  preg_tipo_vac: string;
  preg_enun_vac: string;
  preg_url_vac: string | null;
  preg_puntaj_int: number;
  preg_cre_tmp: string;
  preg_upd_tmp: string;
  exam_id_int: number;
}

export interface OpcionPregunta {
  opc_pre_id_int: number;
  opc_pre_uuid: string;
  opc_pre_text_vac: string;
  opc_pre_correct_bol: boolean;
  opc_pre_cre_tmp: string;
  opc_pre_upd_tmp: string;
  preg_id_int: number;
}

export interface IntentoExamen {
  int_exam_id_int: number;
  int_exam_uuid: string;
  int_exam_inic_tmp: string;
  int_exam_fin_tmp: string | null;
  int_exam_nota_auto_tmp: number | null;
  int_exam_nota_man_tmp: number | null;
  int_exam_estad_tmp: string;
  int_exam_ult_hrtbeat_tmp: string;
  int_exam_cre_tmp: string;
  int_exam_upd_tmp: string;
  exam_id_int: number;
  estu_id_int: number;
}

export interface RespuestaEstudiante {
  rpta_estu_id_int: number;
  rpta_estu_uuid: string;
  rpta_estu_text_vac: string | null;
  rpta_estu_num: number | null;
  rpta_estu_cre_tmp: string;
  rpta_estu_upd_tmp: string;
  preg_id_int: number;
  int_exam_id_int: number;
  opc_pre_id_int: number | null;
}

export interface InfraccionExamen {
  inf_exam_id_int: number;
  inf_exam_uuid: string;
  inf_exam_tipo_vac: string;
  inf_exam_salid_tmp: string;
  inf_exam_retorn_tmp: string | null;
  inf_exam_durac_tmp: number;
  int_exam_id_int: number;
}

export interface SesionClase {
  ses_id_int: number;
  asist_uuid: string;
  ses_fecha_dat: string;
  ses_hora_inic_tmp: string;
  ses_hora_fin_tmp: string;
  ses_estado_vac: string;
  cur_id_int: number;
  hor_cur_id_int: number;
}

export interface Asistencia {
  asist_id_int: number;
  asist_uuid: string;
  asist_est_int: number;
  asist_cre_tmp: string;
  asist_upd_tmp: string;
  ses_id_int: number;
  usr_id_int: number;
}

export interface HorarioCurso {
  hor_cur_id_int: number;
  hor_cur_dia_int: number;
  hor_cur_inic_tmp: string;
  hor_cur_fin_tmp: string;
  hor_cur_cre_tmp: string;
  hor_cur_upd_tmp: string;
  cur_id_int: number;
}
