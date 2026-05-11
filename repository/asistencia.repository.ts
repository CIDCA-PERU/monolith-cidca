import 'server-only'

import { createClient } from '@supabase/supabase-js'
import {
  SesionClaseDto,
  AsistenciaRegistroDto,
  ReporteAsistenciaDto,
} from '@/dto/asistencia.dto'
import { Database } from '@/types/db'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class AsistenciaRepository {
  static async getSesionesByCurso(cursoId: string): Promise<SesionClaseDto[]> {
    const { data, error } = await supabase
      .from('sesion_clase')
      .select(`
        ses_id_int,
        asist_uuid,
        ses_fecha_dat,
        ses_hora_inic_tmp,
        ses_hora_fin_tmp,
        ses_estado_vac
      `)
      .eq('curso_id', cursoId)
      .order('ses_fecha_dat', { ascending: false })

    if (error) throw error

    return (data || []).map((sesion: any) => ({
      ...sesion,
      puede_asistir: false,
      minutos_antes_inicio: 0,
      minutos_desde_inicio: 0,
    }))
  }

  static async getSesionById(sesionId: string): Promise<SesionClaseDto | null> {
    const { data, error } = await supabase
      .from('sesion_clase')
      .select(`
        ses_id_int,
        asist_uuid,
        ses_fecha_dat,
        ses_hora_inic_tmp,
        ses_hora_fin_tmp,
        ses_estado_vac
      `)
      .eq('ses_id_int', parseInt(sesionId))
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      ...data,
      puede_asistir: false,
      minutos_antes_inicio: 0,
      minutos_desde_inicio: 0,
    }
  }

  static async registrarAsistencia(
    sesionId: string,
    estudianteId: string,
    estado: number, // 1=Presente, 2=Ausente, 3=Tardío
    observaciones?: string
  ): Promise<number> {
    const { data, error } = await supabase
      .from('asistencia')
      .insert({
        sesion_clase_id: parseInt(sesionId),
        estudiante_id: estudianteId,
        asist_est_int: estado,
        observaciones,
        asist_cre_tmp: new Date().toISOString(),
      })
      .select('asist_id_int')
      .single()

    if (error) throw error
    return data.asist_id_int
  }

  static async getAsistenciaBySesion(sesionId: string): Promise<AsistenciaRegistroDto[]> {
    const { data, error } = await supabase
      .from('asistencia')
      .select(`
        asist_id_int,
        asist_uuid,
        asist_est_int,
        ses_id_int,
        usuario:estudiante_id(
          nombre: nombre,
          apellido_paterno: apellido_paterno
        ),
        asist_cre_tmp
      `)
      .eq('sesion_clase_id', parseInt(sesionId))

    if (error) throw error

    return (data || []).map((registro: any) => ({
      asist_id_int: registro.asist_id_int,
      asist_uuid: registro.asist_uuid,
      asist_est_int: registro.asist_est_int,
      ses_id_int: registro.ses_id_int,
      estu_nomb_vac: registro.usuario?.nombre || '',
      estu_apell_pat_vac: registro.usuario?.apellido_paterno || '',
      asist_cre_tmp: registro.asist_cre_tmp,
    }))
  }

  static async getReporteAsistencia(sesionId: string): Promise<ReporteAsistenciaDto> {
    const { data: sesion, error: sesionError } = await supabase
      .from('sesion_clase')
      .select('ses_fecha_dat, ses_id_int')
      .eq('ses_id_int', parseInt(sesionId))
      .single()

    if (sesionError) throw sesionError

    const registros = await this.getAsistenciaBySesion(sesionId)

    const presentes = registros.filter((r) => r.asist_est_int === 1).length
    const tardios = registros.filter((r) => r.asist_est_int === 3).length
    const ausentes = registros.filter((r) => r.asist_est_int === 2).length
    const total = registros.length

    return {
      ses_id_int: sesion.ses_id_int,
      ses_fecha_dat: sesion.ses_fecha_dat,
      total_estudiantes: total,
      presentes,
      ausentes,
      tardios,
      porcentaje_asistencia: total > 0 ? (presentes / total) * 100 : 0,
      registros,
    }
  }

  static async updateAsistencia(
    asistenciaId: string,
    estado: number,
    observaciones?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('asistencia')
      .update({
        asist_est_int: estado,
        observaciones,
      })
      .eq('asist_id_int', parseInt(asistenciaId))

    if (error) throw error
  }

  static async deleteAsistencia(asistenciaId: string): Promise<void> {
    const { error } = await supabase
      .from('asistencia')
      .delete()
      .eq('asist_id_int', parseInt(asistenciaId))

    if (error) throw error
  }

  static async getReporteGeneralCurso(cursoId: string): Promise<any> {
    const { data, error } = await supabase
      .from('sesion_clase')
      .select(`
        ses_id_int,
        ses_fecha_dat,
        asistencias:asistencia(asist_est_int),
        estudiantes_total:curso_estudiante(count)
      `)
      .eq('curso_id', cursoId)

    if (error) throw error

    return data
  }
}
