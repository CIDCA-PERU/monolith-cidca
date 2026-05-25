/**
 * DTOs para la gestión de estudiantes dentro de un curso (tabla estudiante_curso)
 */

export interface EstudianteCursoDto {
  /** PK de la relación estudiante_curso */
  est_cur_id_int: number
  /** FK al curso */
  cur_id_int: number
  /** FK al estudiante */
  est_id_int: number
  /** Estado activo/inactivo del alumno en el curso */
  est_cur_estado_bol: boolean
  /** Fecha de inscripción */
  est_cur_cre_tmp: string
  /** Nombre del estudiante */
  estu_nomb_vac: string
  /** Apellido paterno */
  estu_apell_pat_vac: string
  /** Apellido materno */
  estu_apell_mat_vac: string
  /** Email del usuario del estudiante */
  usr_email_vac: string
  /** UUID del estudiante para referencias */
  estu_uuid: string
}

export interface ToggleEstudianteCursoRequest {
  est_cur_id_int: number
  estado: boolean
}
