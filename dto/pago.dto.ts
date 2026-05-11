/**
 * DTO: Orden de Pago
 */
export interface PagoDto {
  pago_id_int: number;
  pago_uuid: string;
  estu_id_int: number;
  cur_id_int: number;
  pago_nro_vac?: string;
  pago_mont_num: number;
  pago_estad_vac: 'PENDIENTE' | 'PAGADO' | 'OBSERVADO';
  pago_url_vac?: string; // URL o path del archivo
  pago_obs_vac?: string; // Observaciones del admin
  pago_cre_tmp: string;
  pago_upd_tmp: string;
  curso_nomb_vac?: string;
  curso_ciclo_vac?: string;
}

/**
 * DTO: Usuario para obtener datos de renombrado
 */
export interface UsuarioPagoDto {
  usr_id_int: number;
  usr_nomb_vac: string;
  usr_ape1_vac?: string;
  usr_ape2_vac?: string;
}

/**
 * DTO: Estudiante
 */
export interface EstudianteDto {
  estu_id_int: number;
  estu_nomb_vac: string;
  estu_apell_pat_vac?: string;
  estu_apell_mat_vac?: string;
  usr_id_int: number;
}

/**
 * DTO: Respuesta de subida de archivo
 */
export interface UploadVoucherResponse {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
  filename?: string;
}
