/**
 * Repository: Operaciones DB sobre la tabla `sesiones`
 * Gestión de sesiones con soporte de revocación y auditoría
 */

import 'server-only'

import { sql } from '@/lib/db'

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
  try {
    const rows = await sql<{ ses_uuid: string }[]>`
      INSERT INTO sesiones (
        ses_token_hash,
        usr_id_int,
        ses_ip_vac,
        ses_ua_vac,
        ses_exp_tmp
      ) VALUES (
        ${data.tokenHash},
        ${data.userId},
        ${data.ip},
        ${data.userAgent},
        ${data.expiresAt.toISOString()}
      )
      RETURNING ses_uuid
    `
    return rows[0] || null
  } catch (error: any) {
    console.error('[sesion.repository] createSesion - Error:', error.message)
    return null
  }
}

/**
 * Busca una sesión activa y no expirada por su hash.
 * Retorna null si no existe, fue revocada o expiró.
 */
export async function findActiveSesionByHash(
  tokenHash: string
): Promise<SesionRecord | null> {
  try {
    const rows = await sql<SesionRecord[]>`
      SELECT ses_uuid, usr_id_int, ses_exp_tmp, ses_act_bol, ses_ult_act_tmp
      FROM sesiones
      WHERE ses_token_hash = ${tokenHash}
      AND ses_act_bol = true
      LIMIT 1
    `

    if (!rows.length) return null
    const data = rows[0]

    // Verificar expiración (comparación UTC)
    if (new Date(data.ses_exp_tmp) < new Date()) {
      // Marcar como inactiva en segundo plano
      sql`
        UPDATE sesiones
        SET ses_act_bol = false
        WHERE ses_uuid = ${data.ses_uuid}
      `.catch(console.error)
      
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

/**
 * Actualiza la última actividad de una sesión.
 * Llamar en cada request autenticado para mantener la sesión viva.
 */
export async function updateSesionLastActivity(sesUuid: string): Promise<void> {
  try {
    await sql`
      UPDATE sesiones
      SET ses_ult_act_tmp = NOW()
      WHERE ses_uuid = ${sesUuid}
    `
  } catch (error) {
    console.error(error)
  }
}

/**
 * Revoca una sesión específica por su hash (logout).
 */
export async function revokeSesionByHash(tokenHash: string): Promise<void> {
  try {
    await sql`
      UPDATE sesiones
      SET ses_act_bol = false
      WHERE ses_token_hash = ${tokenHash}
    `
  } catch (error) {
    console.error(error)
  }
}

/**
 * Revoca TODAS las sesiones activas de un usuario.
 * Usar al bloquear usuario, cambiar contraseña o por el admin.
 */
export async function revokeAllUserSesiones(userId: number): Promise<void> {
  try {
    await sql`
      UPDATE sesiones
      SET ses_act_bol = false
      WHERE usr_id_int = ${userId}
      AND ses_act_bol = true
    `
  } catch (error) {
    console.error(error)
  }
}

/**
 * Lista las sesiones activas de un usuario (para panel "mis dispositivos").
 */
export async function getActiveSesionesByUser(userId: number) {
  try {
    const rows = await sql`
      SELECT ses_uuid, ses_ip_vac, ses_ua_vac, ses_cre_tmp, ses_ult_act_tmp, ses_exp_tmp
      FROM sesiones
      WHERE usr_id_int = ${userId}
      AND ses_act_bol = true
      AND ses_exp_tmp > NOW()
      ORDER BY ses_ult_act_tmp DESC
    `
    return rows
  } catch (error) {
    return []
  }
}
