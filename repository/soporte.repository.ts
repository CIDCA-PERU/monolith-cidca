import 'server-only'

import { supabase } from '@/lib/supabase'

export type Soporte = {
  sop_id_int: number
  sop_uuid: string
  sop_titulo_vac: string
  sop_desc_vac: string
  sop_estad_vac: string | null
  sop_url_vac: string | null
  usr_id_int: number
  sop_cre_tmp: string | null
  sop_upd_tmp: string | null
}

const SELECT_FIELDS = `
  sop_id_int,
  sop_uuid,
  sop_titulo_vac,
  sop_desc_vac,
  sop_estad_vac,
  sop_url_vac,
  usr_id_int,
  sop_cre_tmp,
  sop_upd_tmp
`

/**
 * Obtiene todos los tickets de soporte del usuario autenticado
 */
export async function getSoportesByUsuario(userId: number): Promise<Soporte[]> {
  const { data, error } = await supabase
    .from('soporte')
    .select(SELECT_FIELDS)
    .eq('usr_id_int', userId)
    .order('sop_cre_tmp', { ascending: false })

  if (error) {
    console.error('[soporte.repository] getSoportesByUsuario - Error:', error)
    return []
  }

  return (data || []) as Soporte[]
}

/**
 * Obtiene un ticket por su UUID
 */
export async function getSoporteByUuid(uuid: string): Promise<Soporte | null> {
  if (!uuid) return null

  const { data, error } = await supabase
    .from('soporte')
    .select(SELECT_FIELDS)
    .eq('sop_uuid', uuid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('[soporte.repository] getSoporteByUuid - Error:', error)
    return null
  }

  return data as Soporte
}

/**
 * Crea un nuevo ticket de soporte
 */
export async function createSoporte(payload: {
  sop_titulo_vac: string
  sop_desc_vac: string
  sop_url_vac?: string | null
  usr_id_int: number
}): Promise<Soporte | null> {
  const { data, error } = await supabase
    .from('soporte')
    .insert(payload)
    .select(SELECT_FIELDS)
    .single()

  if (error) {
    console.error('[soporte.repository] createSoporte - Error:', error)
    return null
  }

  return data as Soporte
}

/**
 * Actualiza la URL del adjunto de un ticket
 */
export async function updateSoporteUrl(
  sopId: number,
  url: string
): Promise<boolean> {
  const { error } = await supabase
    .from('soporte')
    .update({ sop_url_vac: url, sop_upd_tmp: new Date().toISOString() })
    .eq('sop_id_int', sopId)

  if (error) {
    console.error('[soporte.repository] updateSoporteUrl - Error:', error)
    return false
  }

  return true
}
