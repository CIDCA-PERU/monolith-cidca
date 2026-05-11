import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { CursoDTO } from '@/dto/curso.dto'
import { Database } from '@/types/db'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class CursoRepository {
  static async getCursosByDocente(docenteId: string): Promise<CursoDTO[]> {
    const { data, error } = await supabase
      .from('curso')
      .select(`
        id,
        nombre,
        descripcion,
        docente_id,
        estado,
        fecha_inicio,
        fecha_fin,
        cantidad_estudiantes,
        created_at
      `)
      .eq('docente_id', docenteId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as CursoDTO[]
  }

  static async getCursoById(cursoId: string): Promise<CursoDTO | null> {
    const { data, error } = await supabase
      .from('curso')
      .select(`
        id,
        nombre,
        descripcion,
        docente_id,
        estado,
        fecha_inicio,
        fecha_fin,
        cantidad_estudiantes,
        created_at
      `)
      .eq('id', cursoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as CursoDTO | null
  }

  static async createCurso(curso: Omit<CursoDTO, 'id' | 'created_at'>): Promise<CursoDTO> {
    const { data, error } = await supabase
      .from('curso')
      .insert({
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        docente_id: curso.docente_id,
        estado: curso.estado,
        fecha_inicio: curso.fecha_inicio,
        fecha_fin: curso.fecha_fin,
        cantidad_estudiantes: 0,
      })
      .select()
      .single()

    if (error) throw error
    return data as CursoDTO
  }

  static async updateCurso(
    cursoId: string,
    updates: Partial<CursoDTO>
  ): Promise<CursoDTO> {
    const { data, error } = await supabase
      .from('curso')
      .update(updates)
      .eq('id', cursoId)
      .select()
      .single()

    if (error) throw error
    return data as CursoDTO
  }

  static async deleteCurso(cursoId: string): Promise<void> {
    const { error } = await supabase
      .from('curso')
      .delete()
      .eq('id', cursoId)

    if (error) throw error
  }

  static async getEstudiantesByCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('curso_estudiante')
      .select(`
        estudiante_id,
        usuario:usuario_id (
          id,
          nombre,
          email,
          numero_documento
        ),
        fecha_inscripcion
      `)
      .eq('curso_id', cursoId)

    if (error) throw error
    return data
  }

  static async addEstudianteToCurso(
    cursoId: string,
    estudianteId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('curso_estudiante')
      .insert({
        curso_id: cursoId,
        estudiante_id: estudianteId,
        fecha_inscripcion: new Date().toISOString(),
      })

    if (error) throw error
  }

  static async removeEstudianteFromCurso(
    cursoId: string,
    estudianteId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('curso_estudiante')
      .delete()
      .eq('curso_id', cursoId)
      .eq('estudiante_id', estudianteId)

    if (error) throw error
  }
}
