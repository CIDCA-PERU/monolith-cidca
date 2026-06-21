import 'server-only'

import { sql } from '@/lib/db'

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

export async function getSoportesByUsuario(userId: number): Promise<Soporte[]> {
  try {
    const rows = await sql<Soporte[]>`
      SELECT 
        sop_id_int,
        sop_uuid,
        sop_titulo_vac,
        sop_desc_vac,
        sop_estad_vac,
        sop_url_vac,
        usr_id_int,
        sop_cre_tmp,
        sop_upd_tmp
      FROM soporte
      WHERE usr_id_int = ${userId}
      ORDER BY sop_cre_tmp DESC
    `
    return rows
  } catch (error) {
    console.error('[soporte.repository] getSoportesByUsuario - Error:', error)
    return []
  }
}

export async function getSoporteByUuid(uuid: string): Promise<Soporte | null> {
  if (!uuid) return null

  try {
    const rows = await sql<Soporte[]>`
      SELECT 
        sop_id_int,
        sop_uuid,
        sop_titulo_vac,
        sop_desc_vac,
        sop_estad_vac,
        sop_url_vac,
        usr_id_int,
        sop_cre_tmp,
        sop_upd_tmp
      FROM soporte
      WHERE sop_uuid = ${uuid}
      LIMIT 1
    `
    return rows[0] || null
  } catch (error) {
    console.error('[soporte.repository] getSoporteByUuid - Error:', error)
    return null
  }
}

export async function createSoporte(payload: {
  sop_titulo_vac: string
  sop_desc_vac: string
  sop_url_vac?: string | null
  usr_id_int: number
}): Promise<Soporte | null> {
  try {
    const rows = await sql<Soporte[]>`
      INSERT INTO soporte (
        sop_titulo_vac,
        sop_desc_vac,
        sop_url_vac,
        usr_id_int
      ) VALUES (
        ${payload.sop_titulo_vac},
        ${payload.sop_desc_vac},
        ${payload.sop_url_vac ?? null},
        ${payload.usr_id_int}
      )
      RETURNING 
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
    return rows[0]
  } catch (error) {
    console.error('[soporte.repository] createSoporte - Error:', error)
    return null
  }
}

export async function updateSoporteUrl(
  sopId: number,
  url: string
): Promise<boolean> {
  try {
    await sql`
      UPDATE soporte
      SET 
        sop_url_vac = ${url},
        sop_upd_tmp = NOW()
      WHERE sop_id_int = ${sopId}
    `
    return true
  } catch (error) {
    console.error('[soporte.repository] updateSoporteUrl - Error:', error)
    return false
  }
}
