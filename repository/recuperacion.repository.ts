import 'server-only'
import { sql } from '@/lib/db'

export type Recuperacion = {
  rec_id_int: number
  rec_uuid: string
  rec_tok_vac: string
  usr_id_int: number
  rec_est_int: number   // 0 = pendiente, 1 = usado
  rec_exp_tmp: string
  rec_cre_tmp: string
}

export async function createRecuperacionToken(
  usrId: number,
  token: string,
  expiresAt: Date
): Promise<Recuperacion | null> {
  try {
    await sql.begin(async sql => {
      await sql`
        UPDATE recuperacion
        SET rec_est_int = 2
        WHERE usr_id_int = ${usrId}
        AND rec_est_int = 0
      `
    })

    const rows = await sql<Recuperacion[]>`
      INSERT INTO recuperacion (
        rec_tok_vac,
        usr_id_int,
        rec_est_int,
        rec_exp_tmp
      ) VALUES (
        ${token},
        ${usrId},
        0,
        ${expiresAt.toISOString()}
      )
      RETURNING *
    `

    return rows[0]
  } catch (error) {
    console.error('[recuperacion.repository] createRecuperacionToken - Error:', error)
    return null
  }
}

export async function findValidToken(token: string): Promise<Recuperacion | null> {
  try {
    const rows = await sql<Recuperacion[]>`
      SELECT * FROM recuperacion
      WHERE rec_tok_vac = ${token}
      AND rec_est_int = 0
      LIMIT 1
    `

    if (!rows.length) return null
    const data = rows[0]

    if (new Date(data.rec_exp_tmp) < new Date()) return null

    return data
  } catch (error) {
    return null
  }
}

export async function markTokenAsUsed(recId: number): Promise<void> {
  try {
    await sql`
      UPDATE recuperacion
      SET rec_est_int = 1
      WHERE rec_id_int = ${recId}
    `
  } catch (error) {
    console.error(error)
  }
}
