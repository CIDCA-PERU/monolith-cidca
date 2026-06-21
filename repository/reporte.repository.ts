import 'server-only'

import { sql } from '@/lib/db'
import {
  CalificacionesReporteDTO,
  DesempenoEstudianteDTO,
  ReporteCursoDTO,
  CertificadoDTO,
} from '@/dto/reporte.dto'

export class ReporteRepository {
  static async getCalificacionesByCurso(
    cursoId: string
  ): Promise<CalificacionesReporteDTO[]> {
    const rows = await sql<CalificacionesReporteDTO[]>`
      SELECT * FROM calificaciones_reporte
      WHERE curso_id = ${cursoId}
      ORDER BY promedio_examenes DESC
    `
    return rows
  }

  static async getDesempenoEstudiante(
    estudianteId: string,
    cursoId: string
  ): Promise<DesempenoEstudianteDTO | null> {
    const rows = await sql<DesempenoEstudianteDTO[]>`
      SELECT * FROM desempen_estudiante_view
      WHERE estudiante_id = ${estudianteId}
      AND curso_id = ${cursoId}
      LIMIT 1
    `
    return rows[0] || null
  }

  static async getReporteCurso(cursoId: string): Promise<ReporteCursoDTO | null> {
    const rows = await sql`
      SELECT * FROM reporte_curso_general
      WHERE curso_id = ${cursoId}
      LIMIT 1
    `
    if (!rows.length) return null

    const estudiantes = await sql<DesempenoEstudianteDTO[]>`
      SELECT * FROM desempen_estudiante_view
      WHERE curso_id = ${cursoId}
    `

    return {
      ...(rows[0] as any),
      estudiantes,
    }
  }

  static async createCertificado(certificado: {
    estudiante_id: string
    curso_id: string
    docente_id: string
    nota_final: number
    asistencia_porcentaje: number
  }): Promise<CertificadoDTO> {
    const codigo = this.generarCodigoVerificacion()

    const rows = await sql<CertificadoDTO[]>`
      INSERT INTO certificado (
        estudiante_id,
        curso_id,
        docente_id,
        fecha_emision,
        nota_final,
        asistencia_porcentaje,
        codigo_verificacion,
        estado
      ) VALUES (
        ${certificado.estudiante_id},
        ${certificado.curso_id},
        ${certificado.docente_id},
        NOW(),
        ${certificado.nota_final},
        ${certificado.asistencia_porcentaje},
        ${codigo},
        'emitido'
      )
      RETURNING *
    `
    return rows[0]
  }

  static async getCertificadoByEstudiante(
    estudianteId: string,
    cursoId: string
  ): Promise<CertificadoDTO | null> {
    const rows = await sql<CertificadoDTO[]>`
      SELECT * FROM certificado
      WHERE estudiante_id = ${estudianteId}
      AND curso_id = ${cursoId}
      LIMIT 1
    `
    return rows[0] || null
  }

  static async getCertificadoByCode(codigo: string): Promise<CertificadoDTO | null> {
    const rows = await sql<CertificadoDTO[]>`
      SELECT * FROM certificado
      WHERE codigo_verificacion = ${codigo}
      LIMIT 1
    `
    return rows[0] || null
  }

  static async getCertificadosByDocente(docenteId: string): Promise<CertificadoDTO[]> {
    const rows = await sql<CertificadoDTO[]>`
      SELECT * FROM certificado
      WHERE docente_id = ${docenteId}
      ORDER BY fecha_emision DESC
    `
    return rows
  }

  static async updateCertificado(
    certificadoId: string,
    updates: Partial<CertificadoDTO>
  ): Promise<void> {
    const columns = Object.keys(updates)
    if (columns.length === 0) return

    await sql`
      UPDATE certificado
      SET ${sql(updates as any)}
      WHERE certificado_id = ${certificadoId}
    `
  }

  static async getEstadisticasGenerales(fechaInicio: string, fechaFin: string) {
    const rows = await sql`
      SELECT * FROM estadisticas_generales
      WHERE fecha >= ${fechaInicio}
      AND fecha <= ${fechaFin}
    `
    return rows
  }

  private static generarCodigoVerificacion(): string {
    const fecha = new Date()
    const timestamp = fecha.getTime()
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    return `CERT-${timestamp}-${random}`
  }
}
