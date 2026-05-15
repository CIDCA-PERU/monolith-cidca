/**
 * Repository: Operaciones DB sobre la tabla `sesiones`
 * Gestión de sesiones con soporte de revocación y auditoría
 */

import 'server-only'

import { supabase } from '@/lib/supabase'

export interface SesionRecord {
  ses_uuid: string
  usr_id_int: number
  ses_exp_tmp: string
  ses_act_bol: boolean
  ses_ult_act_tmp: string
}

/**
 * Crea una nueva sesión en la BD.
 * Almacena el HASH del token, nunca el token plano.
 */
export async function createSesion(data: {
  tokenHash: string
  userId: number
  ip: string
  userAgent: string
  expiresAt: Date
}): Promise<{ ses_uuid: string } | null> {
  const { data: sesion, error } = await supabase
    .from('sesiones')
    .insert({
      ses_token_hash:  data.tokenHash,
      usr_id_int:      data.userId,
      ses_ip_vac:      data.ip,
      ses_ua_vac:      data.userAgent,
      ses_exp_tmp:     data.expiresAt.toISOString(), // UTC
    })
    .select('ses_uuid')
    .single()

  if (error) {
    console.error('[sesion.repository] createSesion - Error:', error.message)
    return null
  }

  return sesion
}

/**
 * Busca una sesión activa y no expirada por su hash.
 * Retorna null si no existe, fue revocada o expiró.
 */
export async function findActiveSesionByHash(
  tokenHash: string
): Promise<SesionRecord | null> {
  const { data, error } = await supabase
    .from('sesiones')
    .select('ses_uuid, usr_id_int, ses_exp_tmp, ses_act_bol, ses_ult_act_tmp')
    .eq('ses_token_hash', tokenHash)
    .eq('ses_act_bol', true)
    .single()

  if (error || !data) return null

  // Verificar expiración (comparación UTC)
  if (new Date(data.ses_exp_tmp) < new Date()) {
    // Marcar como inactiva en segundo plano
    await supabase
      .from('sesiones')
      .update({ ses_act_bol: false })
      .eq('ses_uuid', data.ses_uuid)
    return null
  }

  return data as SesionRecord
}

/**
 * Actualiza la última actividad de una sesión.
 * Llamar en cada request autenticado para mantener la sesión viva.
 */
export async function updateSesionLastActivity(sesUuid: string): Promise<void> {
  await supabase
    .from('sesiones')
    .update({ ses_ult_act_tmp: new Date().toISOString() }) // UTC
    .eq('ses_uuid', sesUuid)
}

/**
 * Revoca una sesión específica por su hash (logout).
 */
export async function revokeSesionByHash(tokenHash: string): Promise<void> {
  await supabase
    .from('sesiones')
    .update({ ses_act_bol: false })
    .eq('ses_token_hash', tokenHash)
}

/**
 * Revoca TODAS las sesiones activas de un usuario.
 * Usar al bloquear usuario, cambiar contraseña o por el admin.
 */
export async function revokeAllUserSesiones(userId: number): Promise<void> {
  await supabase
    .from('sesiones')
    .update({ ses_act_bol: false })
    .eq('usr_id_int', userId)
    .eq('ses_act_bol', true)
}

/**
 * Lista las sesiones activas de un usuario (para panel "mis dispositivos").
 */
export async function getActiveSesionesByUser(userId: number) {
  const { data, error } = await supabase
    .from('sesiones')
    .select('ses_uuid, ses_ip_vac, ses_ua_vac, ses_cre_tmp, ses_ult_act_tmp, ses_exp_tmp')
    .eq('usr_id_int', userId)
    .eq('ses_act_bol', true)
    .gt('ses_exp_tmp', new Date().toISOString())
    .order('ses_ult_act_tmp', { ascending: false })

  if (error) return []
  return data || []
}
