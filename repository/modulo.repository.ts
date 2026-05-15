import 'server-only'

import { supabase } from '@/lib/supabase'
import { ModuloDTO, ApartadoDTO } from '@/dto/modulo.dto'

export class ModuloRepository {
  static async getModulosByCurso(cursoId: string): Promise<ModuloDTO[]> {
    const { data, error } = await supabase
      .from('modulo')
      .select('*')
      .eq('curso_id', cursoId)
      .order('orden', { ascending: true })

    if (error) throw error
    return data as ModuloDTO[]
  }

  static async getModuloById(moduloId: string): Promise<ModuloDTO | null> {
    const { data, error } = await supabase
      .from('modulo')
      .select('*')
      .eq('id', moduloId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as ModuloDTO | null
  }

  static async createModulo(
    cursoId: string,
    modulo: Omit<ModuloDTO, 'id' | 'created_at' | 'numero'>
  ): Promise<ModuloDTO> {
    // Obtener el siguiente número de módulo
    const { data: lastModulo } = await supabase
      .from('modulo')
      .select('numero')
      .eq('curso_id', cursoId)
      .order('numero', { ascending: false })
      .limit(1)
      .single()

    const numero = (lastModulo?.numero || 0) + 1

    const { data, error } = await supabase
      .from('modulo')
      .insert({
        curso_id: cursoId,
        numero,
        titulo: modulo.titulo,
        descripcion: modulo.descripcion,
        estado: modulo.estado,
        fecha_inicio: modulo.fecha_inicio,
        fecha_fin: modulo.fecha_fin,
        orden: modulo.orden,
      })
      .select()
      .single()

    if (error) throw error
    return data as ModuloDTO
  }

  static async updateModulo(
    moduloId: string,
    updates: Partial<ModuloDTO>
  ): Promise<ModuloDTO> {
    const { data, error } = await supabase
      .from('modulo')
      .update(updates)
      .eq('id', moduloId)
      .select()
      .single()

    if (error) throw error
    return data as ModuloDTO
  }

  static async deleteModulo(moduloId: string): Promise<void> {
    const { error } = await supabase
      .from('modulo')
      .delete()
      .eq('id', moduloId)

    if (error) throw error
  }

  // Apartados
  static async getApartadosByModulo(moduloId: string): Promise<ApartadoDTO[]> {
    const { data, error } = await supabase
      .from('apartado')
      .select('*')
      .eq('modulo_id', moduloId)
      .order('orden', { ascending: true })

    if (error) throw error
    return data as ApartadoDTO[]
  }

  static async getApartadoById(apartadoId: string): Promise<ApartadoDTO | null> {
    const { data, error } = await supabase
      .from('apartado')
      .select('*')
      .eq('id', apartadoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as ApartadoDTO | null
  }

  static async createApartado(
    moduloId: string,
    apartado: Omit<ApartadoDTO, 'id' | 'created_at' | 'numero'>
  ): Promise<ApartadoDTO> {
    // Obtener el siguiente número de apartado
    const { data: lastApartado } = await supabase
      .from('apartado')
      .select('numero')
      .eq('modulo_id', moduloId)
      .order('numero', { ascending: false })
      .limit(1)
      .single()

    const numero = (lastApartado?.numero || 0) + 1

    const { data, error } = await supabase
      .from('apartado')
      .insert({
        modulo_id: moduloId,
        numero,
        titulo: apartado.titulo,
        contenido: apartado.contenido,
        tipo: apartado.tipo,
        orden: apartado.orden,
        duracion_estimada: apartado.duracion_estimada,
        url_recurso: apartado.url_recurso,
      })
      .select()
      .single()

    if (error) throw error
    return data as ApartadoDTO
  }

  static async updateApartado(
    apartadoId: string,
    updates: Partial<ApartadoDTO>
  ): Promise<ApartadoDTO> {
    const { data, error } = await supabase
      .from('apartado')
      .update(updates)
      .eq('id', apartadoId)
      .select()
      .single()

    if (error) throw error
    return data as ApartadoDTO
  }

  static async deleteApartado(apartadoId: string): Promise<void> {
    const { error } = await supabase
      .from('apartado')
      .delete()
      .eq('id', apartadoId)

    if (error) throw error
  }
}
