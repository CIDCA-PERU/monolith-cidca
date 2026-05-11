/**
 * DTOs para Cursos
 */

// DTO usado en UI y actions (schema simplificado de la app)
export interface CursoDTO {
  id: string;
  nombre: string;
  descripcion: string;
  docente_id: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_estudiantes: number;
  created_at: string;
}

export interface CreateCursoRequest {
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface CursoListDto {
  cur_id_int: number;
  cur_uuid: string;
  cur_nomb_vac: string;
  cur_desc_vac: string;
  cur_est_int: number;
  cur_fec_inic_tmp: string;
  cur_fec_fin_tmp: string;
  docente_nomb: string;
  docente_email: string;
}

export interface CursoDetailDto extends CursoListDto {
  modulos: ModuloDto[];
  horarios: HorarioDto[];
  estudiantes_count: number;
}

export interface CrearCursoRequestDto {
  cur_nomb_vac: string;
  cur_desc_vac: string;
  cur_fec_inic_tmp: string;
  cur_fec_fin_tmp: string;
}

export interface ActualizarCursoRequestDto extends Partial<CrearCursoRequestDto> {
  cur_est_int?: number;
}

export interface ModuloDto {
  mod_id_int: number;
  mod_uuid: string;
  mod_nomb_vac: string;
  mod_desc_vac: string;
  mod_est_int: number;
  apartados: ApartadoDto[];
}

export interface ApartadoDto {
  apar_id_int: number;
  apar_uuid: string;
  apar_nomb_vac: string;
  apar_desc_vac: string;
  apar_est_int: number;
  items: ItemApartadoDto[];
}

export interface ItemApartadoDto {
  item_apar_id_int: number;
  item_apar_uuid: string;
  item_apar_tipo_vac: 'SEPARADOR' | 'PDF' | 'VIDEO' | 'EXAMEN';
  item_apar_titulo_vac: string;
  item_apar_url_vac: string | null;
  item_apar_ordn_inte: number;
  item_apar_est_int: number;
}

export interface HorarioDto {
  hor_cur_id_int: number;
  hor_cur_dia_int: number; // 0=Lunes, 6=Domingo
  hor_cur_inic_tmp: string; // HH:MM
  hor_cur_fin_tmp: string;  // HH:MM
}
