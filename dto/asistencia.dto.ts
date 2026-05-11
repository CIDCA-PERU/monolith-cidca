/**
 * DTOs para Asistencia
 */

export interface SesionClaseDto {
  ses_id_int: number;
  asist_uuid: string;
  ses_fecha_dat: string; // YYYY-MM-DD
  ses_hora_inic_tmp: string; // HH:MM
  ses_hora_fin_tmp: string;
  ses_estado_vac: 'PROGRAMADA' | 'EN_PROGRESO' | 'FINALIZADA';
  puede_asistir: boolean;
  minutos_antes_inicio: number;
  minutos_desde_inicio: number;
}

export interface RegistrarAsistenciaRequestDto {
  ses_id_int: number;
  estu_id_int: number;
  zona_horaria: string; // 'America/Lima'
}

export interface RegistrarAsistenciaResponseDto {
  success: boolean;
  mensaje: string;
  asist_id_int?: number;
  razon_rechazo?: string;
}

export interface AsistenciaRegistroDto {
  asist_id_int: number;
  asist_uuid: string;
  asist_est_int: number; // 1=Presente, 2=Ausente, 3=Tardío
  ses_id_int: number;
  estu_nomb_vac: string;
  estu_apell_pat_vac: string;
  asist_cre_tmp: string;
}

export interface ReporteAsistenciaDto {
  ses_id_int: number;
  ses_fecha_dat: string;
  total_estudiantes: number;
  presentes: number;
  ausentes: number;
  tardios: number;
  porcentaje_asistencia: number;
  registros: AsistenciaRegistroDto[];
}
