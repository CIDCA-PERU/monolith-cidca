import 'server-only'

import { supabase } from '@/lib/supabase'
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
    const { data, error } = await supabase
      .from('calificaciones_reporte')
      .select('*')
      .eq('curso_id', cursoId)
      .order('promedio_examenes', { ascending: false })

    if (error) throw error
    return (data || []) as CalificacionesReporteDTO[]
  }

  static async getDesempenoEstudiante(
    estudianteId: string,
    cursoId: string
  ): Promise<DesempenoEstudianteDTO | null> {
    const { data, error } = await supabase
      .from('desempen_estudiante_view')
      .select('*')
      .eq('estudiante_id', estudianteId)
      .eq('curso_id', cursoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as DesempenoEstudianteDTO | null
  }

  static async getReporteCurso(cursoId: string): Promise<ReporteCursoDTO | null> {
    const { data, error } = await supabase
      .from('reporte_curso_general')
      .select('*')
      .eq('curso_id', cursoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    // Obtener estudiantes del curso
    const { data: estudiantes } = await supabase
      .from('desempen_estudiante_view')
      .select('*')
      .eq('curso_id', cursoId)

    return {
      ...(data as any),
      estudiantes: (estudiantes || []) as DesempenoEstudianteDTO[],
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

    const { data, error } = await supabase
      .from('certificado')
      .insert({
        estudiante_id: certificado.estudiante_id,
        curso_id: certificado.curso_id,
        docente_id: certificado.docente_id,
        fecha_emision: new Date().toISOString(),
        nota_final: certificado.nota_final,
        asistencia_porcentaje: certificado.asistencia_porcentaje,
        codigo_verificacion: codigo,
        estado: 'emitido',
      })
      .select('*')
      .single()

    if (error) throw error
    return data as CertificadoDTO
  }

  static async getCertificadoByEstudiante(
    estudianteId: string,
    cursoId: string
  ): Promise<CertificadoDTO | null> {
    const { data, error } = await supabase
      .from('certificado')
      .select('*')
      .eq('estudiante_id', estudianteId)
      .eq('curso_id', cursoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as CertificadoDTO | null
  }

  static async getCertificadoByCode(codigo: string): Promise<CertificadoDTO | null> {
    const { data, error } = await supabase
      .from('certificado')
      .select('*')
      .eq('codigo_verificacion', codigo)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as CertificadoDTO | null
  }

  static async getCertificadosByDocente(docenteId: string): Promise<CertificadoDTO[]> {
    const { data, error } = await supabase
      .from('certificado')
      .select('*')
      .eq('docente_id', docenteId)
      .order('fecha_emision', { ascending: false })

    if (error) throw error
    return (data || []) as CertificadoDTO[]
  }

  static async updateCertificado(
    certificadoId: string,
    updates: Partial<CertificadoDTO>
  ): Promise<void> {
    const { error } = await supabase
      .from('certificado')
      .update(updates)
      .eq('certificado_id', certificadoId)

    if (error) throw error
  }

  static async getEstadisticasGenerales(fechaInicio: string, fechaFin: string) {
    const { data, error } = await supabase
      .from('estadisticas_generales')
      .select('*')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)

    if (error) throw error
    return data
  }

  private static generarCodigoVerificacion(): string {
    const fecha = new Date()
    const timestamp = fecha.getTime()
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    return `CERT-${timestamp}-${random}`
  }
}
