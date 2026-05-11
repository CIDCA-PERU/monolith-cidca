export interface CalificacionesReporteDTO {
  estudiante_id: string
  estudiante_nombre: string
  estudiante_email: string
  curso_id: string
  curso_nombre: string
  promedio_examenes: number
  total_tareas: number
  participacion: number
  nota_final: number
  estado: 'aprobado' | 'reprobado' | 'pendiente'
  fecha_actualizacion: string
}

export interface DesempenoEstudianteDTO {
  estudiante_id: string
  nombre: string
  email: string
  asistencia_porcentaje: number
  promedio_notas: number
  examenes_completados: number
  examenes_con_fraude: number
  modulos_completados: number
  modulos_totales: number
  ultimo_acceso: string
  estado_curso: 'activo' | 'completado' | 'suspendido'
}

export interface ReporteCursoDTO {
  curso_id: string
  curso_nombre: string
  docente_id: string
  docente_nombre: string
  total_estudiantes: number
  promedio_asistencia: number
  promedio_calificaciones: number
  estudiantes_aprobados: number
  estudiantes_reprobados: number
  estudiantes_pendientes: number
  modulos_publicados: number
  examenes_realizados: number
  fecha_reporte: string
  estudiantes: DesempenoEstudianteDTO[]
}

export interface CertificadoDTO {
  certificado_id: string
  estudiante_id: string
  estudiante_nombre: string
  curso_id: string
  curso_nombre: string
  docente_nombre: string
  fecha_emision: string
  fecha_completacion: string
  nota_final: number
  asistencia_porcentaje: number
  estado: 'emitido' | 'pendiente' | 'rechazado'
  codigo_verificacion: string
  url_certificado?: string
}

export interface CreateCertificadoRequest {
  estudiante_id: string
  curso_id: string
}

export interface VerificarCertificadoRequest {
  codigo_verificacion: string
}

export interface EstadisticasCursoDTO {
  curso_id: string
  total_estudiantes: number
  estudiantes_activos: number
  promedio_asistencia: number
  promedio_calificaciones: number
  tasa_completacion: number
  examenes_promedio_tiempo: number
  examenes_fraudes_detectados: number
}

export interface ReporteActivosDTO {
  fecha_inicio: string
  fecha_fin: string
  usuarios_activos: number
  estudiantes_activos: number
  docentes_activos: number
  sesiones_totales: number
  examenes_realizados: number
  certificados_emitidos: number
}
