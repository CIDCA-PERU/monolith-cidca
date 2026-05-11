import 'server-only'

import { supabase } from '@/lib/supabase'

export type AulaCurso = {
  cur_id_int: number
  cur_uuid?: string | null
  cur_nomb_vac: string
  cur_desc_vac: string | null
  cur_est_int: number
  cur_fec_inic_tmp: string | null
  cur_fec_fin_tmp: string | null
  cur_precio_num?: number | null
}

export type AulaModulo = {
  mod_id_int: number
  mod_uuid?: string | null
  mod_nomb_vac: string | null
  mod_desc_vac: string | null
  mod_est_int: number
  cur_id_int: number
}

export type AulaApartado = {
  apar_id_int: number
  apar_nomb_vac: string | null
  apar_desc_vac: string | null
  apar_est_int: number
  mod_id_int: number
}

export type AulaItemApartado = {
  item_apar_id_int: number
  item_apar_tipo_vac: string | null
  item_apar_titulo_vac: string | null
  item_apar_url_vac: string | null
  item_apar_ordn_inte: number | null
  apar_id_int: number
}

export type AulaComentario = {
  com_cur_id_int: number
  com_cur_text_vac: string | null
  com_cur_cre_tmp: string | null
  usr_id_int: number | null
  apar_id_int: number | null
  autor_nombre: string | null
}

export type AulaPago = {
  pago_id_int: number
  pago_uuid?: string | null
  pago_nro_vac: string | null
  pago_url_vac: string | null
  pago_estad_vac: string | null
  pago_obs_vac: string | null
  pago_mont_num?: number | null
  pago_cre_tmp?: string | null
  cur_id_int: number | null
  curso?: Pick<AulaCurso, 'cur_id_int' | 'cur_nomb_vac' | 'cur_precio_num' | 'cur_desc_vac' | 'cur_fec_inic_tmp' | 'cur_fec_fin_tmp'> | null
}

export type AulaCertificado = {
  cert_id_int: number
  cert_uuid?: string | null
  cert_cod_vac: string | null
  cert_fec_emi_tmp: string | null
  cert_url_vac: string | null
  cur_id_int: number | null
  curso?: Pick<AulaCurso, 'cur_id_int' | 'cur_nomb_vac'> | null
}

export async function getEstudianteByUserId(userId: number) {
  const { data, error } = await supabase
    .from('estudiante')
    .select(
      'estu_id_int, estu_nomb_vac, estu_apell_pat_vac, estu_apell_mat_vac, estu_gen_vac, usr_id_int'
    )
    .eq('usr_id_int', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function getCursosByEstudiante(estuId: number): Promise<AulaCurso[]> {
  const { data, error } = await supabase
    .from('estudiante_curso')
    .select(
      `
      cur_id_int,
      curso:cur_id_int (
        cur_id_int,
        cur_uuid,
        cur_nomb_vac,
        cur_desc_vac,
        cur_est_int,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp
      )
    `
    )
    .eq('est_id_int', estuId)
    .eq('est_cur_estado_bol', true)

  if (error) throw error

  return (data || [])
    .map((row: any) => row.curso)
    .filter(Boolean) as AulaCurso[]
}

export async function getCursoById(curId: number): Promise<AulaCurso | null> {
  const { data, error } = await supabase
    .from('curso')
    .select(
      'cur_id_int, cur_uuid, cur_nomb_vac, cur_desc_vac, cur_est_int, cur_fec_inic_tmp, cur_fec_fin_tmp'
    )
    .eq('cur_id_int', curId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AulaCurso
}

export async function getCursoByUuid(curUuid: string): Promise<AulaCurso | null> {
  if (!curUuid) {
    return null
  }
  const { data, error } = await supabase
    .from('curso')
    .select(
      'cur_id_int, cur_uuid, cur_nomb_vac, cur_desc_vac, cur_est_int, cur_fec_inic_tmp, cur_fec_fin_tmp'
    )
    .eq('cur_uuid', curUuid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AulaCurso
}

export async function getModulosByCurso(curId: number): Promise<AulaModulo[]> {
  const { data, error } = await supabase
    .from('modulo')
    .select('mod_id_int, mod_uuid, mod_nomb_vac, mod_desc_vac, mod_est_int, cur_id_int')
    .eq('cur_id_int', curId)
    .order('mod_id_int', { ascending: true })

  if (error) throw error
  return (data || []) as AulaModulo[]
}

export async function getModuloById(modId: number): Promise<AulaModulo | null> {
  const { data, error } = await supabase
    .from('modulo')
    .select('mod_id_int, mod_uuid, mod_nomb_vac, mod_desc_vac, mod_est_int, cur_id_int')
    .eq('mod_id_int', modId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AulaModulo
}

export async function getModuloByUuid(modUuid: string): Promise<AulaModulo | null> {
  if (!modUuid) {
    return null
  }
  const { data, error } = await supabase
    .from('modulo')
    .select('mod_id_int, mod_uuid, mod_nomb_vac, mod_desc_vac, mod_est_int, cur_id_int')
    .eq('mod_uuid', modUuid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AulaModulo
}

export async function getApartadosByModulo(modId: number): Promise<AulaApartado[]> {
  const { data, error } = await supabase
    .from('apartado')
    .select('apar_id_int, apar_nomb_vac, apar_desc_vac, apar_est_int, mod_id_int')
    .eq('mod_id_int', modId)
    .order('apar_id_int', { ascending: true })

  if (error) throw error
  return (data || []) as AulaApartado[]
}

export async function getApartadosByModuloIds(
  moduloIds: number[]
): Promise<AulaApartado[]> {
  if (moduloIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('apartado')
    .select('apar_id_int, apar_nomb_vac, apar_desc_vac, apar_est_int, mod_id_int')
    .in('mod_id_int', moduloIds)
    .order('apar_id_int', { ascending: true })

  if (error) throw error
  return (data || []) as AulaApartado[]
}

export async function getItemsByApartados(
  apartadosIds: number[]
): Promise<AulaItemApartado[]> {
  if (apartadosIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('item_apartado')
    .select(
      'item_apar_id_int, item_apar_tipo_vac, item_apar_titulo_vac, item_apar_url_vac, item_apar_ordn_inte, apar_id_int'
    )
    .in('apar_id_int', apartadosIds)
    .order('item_apar_ordn_inte', { ascending: true })

  if (error) throw error
  return (data || []) as AulaItemApartado[]
}

export async function getComentariosByApartados(
  apartadosIds: number[]
): Promise<AulaComentario[]> {
  if (apartadosIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('comentarios_curso')
    .select(`
      com_cur_id_int, 
      com_cur_text_vac, 
      com_cur_cre_tmp, 
      apar_id_int,
      usr_id_int, 
      usuarios:usr_id_int (
        usr_nomb_vac,
        estudiante:estudiante(estu_nomb_vac, estu_apell_pat_vac)
      )
    `)
    .in('apar_id_int', apartadosIds)
    .order('com_cur_cre_tmp', { ascending: false });

  if (error) throw error;
  const comentarios: AulaComentario[] = (data || []).map((row: any) => {
    const estudianteData = row.usuarios?.estudiante?.[0];
    let autor = "Usuario CIDCA"; // Variable directa
    
    if (estudianteData && estudianteData.estu_nomb_vac) {
      autor = `${estudianteData.estu_nomb_vac} ${estudianteData.estu_apell_pat_vac || ''}`.trim();
    } else if (row.usuarios?.usr_nomb_vac) {
      autor = row.usuarios.usr_nomb_vac;
    }

    return {
      com_cur_id_int: row.com_cur_id_int,
      com_cur_text_vac: row.com_cur_text_vac,
      com_cur_cre_tmp: row.com_cur_cre_tmp,
      apar_id_int: row.apar_id_int,
      usr_id_int: row.usr_id_int,
      autor_nombre: autor
    };
  });

  return comentarios;
}

export async function getPagosByEstudiante(estuId: number): Promise<AulaPago[]> {
  const { data, error } = await supabase
    .from('pago')
    .select(
      `
      pago_id_int,
      pago_uuid,
      pago_nro_vac,
      pago_url_vac,
      pago_estad_vac,
      pago_obs_vac,
      pago_mont_num,
      cur_id_int,
      curso:cur_id_int (
        cur_id_int,
        cur_nomb_vac,
        cur_precio_num,
        cur_desc_vac,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp
      )
    `
    )
    .eq('estu_id_int', estuId)
    .order('pago_cre_tmp', { ascending: false })

  if (error) throw error
  return (data || []) as AulaPago[]
}

export async function getPagoById(pagoId: number): Promise<AulaPago | null> {
  const { data, error } = await supabase
    .from('pago')
    .select(
      `
      pago_id_int,
      pago_uuid,
      pago_nro_vac,
      pago_url_vac,
      pago_estad_vac,
      pago_obs_vac,
      pago_mont_num,
      cur_id_int,
      curso:cur_id_int (
        cur_id_int,
        cur_nomb_vac,
        cur_precio_num,
        cur_desc_vac,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp
      )
    `
    )
    .eq('pago_id_int', pagoId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AulaPago
}

export async function getPagoByUuid(pagoUuid: string): Promise<AulaPago | null> {
  if (!pagoUuid) {
    return null
  }

  const { data, error } = await supabase
    .from('pago')
    .select(
      `
      pago_id_int,
      pago_uuid,
      pago_nro_vac,
      pago_url_vac,
      pago_estad_vac,
      pago_obs_vac,
      pago_mont_num,
      cur_id_int,
      curso:cur_id_int (
        cur_id_int,
        cur_nomb_vac,
        cur_precio_num,
        cur_desc_vac,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp
      )
    `
    )
    .eq('pago_uuid', pagoUuid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as AulaPago
}

export async function getCertificadosByEstudiante(
  estuId: number
): Promise<AulaCertificado[]> {
  const { data, error } = await supabase
    .from('certificado')
    .select(
      `
      cert_id_int,
      cert_uuid,
      cert_cod_vac,
      cert_fec_emi_tmp,
      cert_url_vac,
      cur_id_int,
      curso:cur_id_int (
        cur_id_int,
        cur_nomb_vac
      )
    `
    )
    .eq('estu_id_int', estuId)
    .order('cert_fec_emi_tmp', { ascending: false })

  if (error) throw error
  return (data || []) as AulaCertificado[]
}
