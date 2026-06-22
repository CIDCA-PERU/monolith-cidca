'use server'

import { sql } from '@/lib/db'
import { assertAuthenticated, assertDashboard } from '@/lib/auth-guards'
import { HorarioDto } from '@/dto/curso.dto'
import { handleActionError } from '@/lib/errors'

// --- Helpers -------------------------------------------------------------------

async function getCurIdInt(cursoUuid: string): Promise<number | null> {
  try {
    const rows = await sql`
      SELECT cur_id_int FROM curso
      WHERE cur_uuid = ${cursoUuid}
      LIMIT 1
    `
    return rows.length > 0 ? rows[0].cur_id_int : null
  } catch (error) {
    return null
  }
}

// --- Obtener horarios de un curso ----------------------------------------------

export async function getHorariosByCurso(cursoUuid: string): Promise<{
  success: boolean
  data?: HorarioDto[]
  error?: string
}> {
  try {
    await assertAuthenticated()

    const curIdInt = await getCurIdInt(cursoUuid)
    if (!curIdInt) return { success: false, error: 'Curso no encontrado' }

    const data = await sql`
      SELECT hor_cur_id_int, hor_cur_dia_int, hor_cur_inic_tmp, hor_cur_fin_tmp
      FROM horario_curso
      WHERE cur_id_int = ${curIdInt}
      ORDER BY hor_cur_dia_int ASC
    `

    const mapped: HorarioDto[] = data.map((row: any) => ({
      hor_cur_id_int: row.hor_cur_id_int,
      hor_cur_dia_int: row.hor_cur_dia_int,
      hor_cur_inic_tmp: (row.hor_cur_inic_tmp as string)?.slice(0, 5) ?? '',
      hor_cur_fin_tmp:  (row.hor_cur_fin_tmp as string)?.slice(0, 5) ?? '',
    }))

    return { success: true, data: mapped }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}

// --- Guardar horarios (upsert + soft-delete seguro con FK) ---------------------

export async function saveHorariosByCurso(
  cursoUuid: string,
  horarios: Array<{
    hor_cur_id_int?: number
    hor_cur_dia_int: number
    hor_cur_inic_tmp: string
    hor_cur_fin_tmp: string
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const curIdInt = await getCurIdInt(cursoUuid)
    if (!curIdInt) return { success: false, error: 'Curso no encontrado' }

    await sql.begin(async sql => {
      const existingRows = await sql`
        SELECT hor_cur_id_int
        FROM horario_curso
        WHERE cur_id_int = ${curIdInt}
      `

      const existingIds = new Set(existingRows.map((r: any) => r.hor_cur_id_int as number))
      const incomingIds = new Set(
        horarios.filter((h) => h.hor_cur_id_int != null).map((h) => h.hor_cur_id_int as number)
      )

      const toDeleteIds = [...existingIds].filter((id) => !incomingIds.has(id))

      for (const horId of toDeleteIds) {
        await sql`
          UPDATE sesion_clase
          SET hor_cur_id_int = null
          WHERE hor_cur_id_int = ${horId}
        `
        await sql`
          DELETE FROM horario_curso
          WHERE hor_cur_id_int = ${horId}
        `
      }

      const toUpdate = horarios.filter((h) => h.hor_cur_id_int != null)
      for (const h of toUpdate) {
        await sql`
          UPDATE horario_curso
          SET 
            hor_cur_dia_int = ${h.hor_cur_dia_int},
            hor_cur_inic_tmp = ${h.hor_cur_inic_tmp},
            hor_cur_fin_tmp = ${h.hor_cur_fin_tmp}
          WHERE hor_cur_id_int = ${h.hor_cur_id_int!}
        `
      }

      const toInsert = horarios.filter((h) => h.hor_cur_id_int == null)
      if (toInsert.length > 0) {
        for (const h of toInsert) {
          await sql`
            INSERT INTO horario_curso (
              cur_id_int,
              hor_cur_dia_int,
              hor_cur_inic_tmp,
              hor_cur_fin_tmp
            ) VALUES (
              ${curIdInt},
              ${h.hor_cur_dia_int},
              ${h.hor_cur_inic_tmp},
              ${h.hor_cur_fin_tmp}
            )
          `
        }
      }
    })

    return { success: true }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}
