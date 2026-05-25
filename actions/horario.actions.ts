'use server'

import { supabase } from '@/lib/supabase'
import { assertAuthenticated, assertDashboard } from '@/lib/auth-guards'
import { AppError } from '@/lib/errors'
import { HorarioDto } from '@/dto/curso.dto'

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getCurIdInt(cursoUuid: string): Promise<number | null> {
  const { data } = await supabase
    .from('curso')
    .select('cur_id_int')
    .eq('cur_uuid', cursoUuid)
    .single()
  return data?.cur_id_int ?? null
}

// ─── Obtener horarios de un curso ──────────────────────────────────────────────

export async function getHorariosByCurso(cursoUuid: string): Promise<{
  success: boolean
  data?: HorarioDto[]
  error?: string
}> {
  try {
    await assertAuthenticated()

    const curIdInt = await getCurIdInt(cursoUuid)
    if (!curIdInt) return { success: false, error: 'Curso no encontrado' }

    const { data, error } = await supabase
      .from('horario_curso')
      .select('hor_cur_id_int, hor_cur_dia_int, hor_cur_inic_tmp, hor_cur_fin_tmp')
      .eq('cur_id_int', curIdInt)
      .order('hor_cur_dia_int', { ascending: true })

    if (error) throw error

    const mapped: HorarioDto[] = (data ?? []).map((row: any) => ({
      hor_cur_id_int: row.hor_cur_id_int,
      hor_cur_dia_int: row.hor_cur_dia_int,
      // Supabase devuelve "HH:MM:SS" para columnas time → normalizar a "HH:MM"
      hor_cur_inic_tmp: (row.hor_cur_inic_tmp as string)?.slice(0, 5) ?? '',
      hor_cur_fin_tmp:  (row.hor_cur_fin_tmp as string)?.slice(0, 5) ?? '',
    }))

    return { success: true, data: mapped }
  } catch (error: any) {
    const msg = error?.message ?? 'Error al obtener horarios'
    return { success: false, error: msg }
  }
}

// ─── Guardar horarios (upsert + soft-delete seguro con FK) ─────────────────────

/**
 * Estrategia segura con FK:
 * - Rows que ya existen (tienen hor_cur_id_int): UPDATE
 * - Rows nuevas (sin id):                        INSERT
 * - Rows eliminadas (tenían id pero ya no están):
 *     1. NULL out hor_cur_id_int en sesion_clase
 *     2. DELETE el horario
 */
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

    // Horarios actuales en BD
    const { data: existingRows, error: fetchError } = await supabase
      .from('horario_curso')
      .select('hor_cur_id_int')
      .eq('cur_id_int', curIdInt)

    if (fetchError) throw fetchError

    const existingIds = new Set((existingRows ?? []).map((r: any) => r.hor_cur_id_int as number))
    const incomingIds = new Set(
      horarios.filter((h) => h.hor_cur_id_int != null).map((h) => h.hor_cur_id_int as number)
    )

    // IDs a eliminar = estaban en BD pero ya no vienen en el form
    const toDeleteIds = [...existingIds].filter((id) => !incomingIds.has(id))

    // 1. Para los eliminados: nullear FK en sesion_clase antes de borrar
    for (const horId of toDeleteIds) {
      const { error: nullErr } = await supabase
        .from('sesion_clase')
        .update({ hor_cur_id_int: null })
        .eq('hor_cur_id_int', horId)

      if (nullErr) {
        console.error('[saveHorariosByCurso] Error nulling sesion_clase FK:', nullErr)
        throw nullErr
      }

      const { error: delErr } = await supabase
        .from('horario_curso')
        .delete()
        .eq('hor_cur_id_int', horId)

      if (delErr) {
        console.error('[saveHorariosByCurso] DELETE error:', delErr)
        throw delErr
      }
    }

    // 2. UPDATE los que ya existen
    const toUpdate = horarios.filter((h) => h.hor_cur_id_int != null)
    for (const h of toUpdate) {
      const { error: updErr } = await supabase
        .from('horario_curso')
        .update({
          hor_cur_dia_int:  h.hor_cur_dia_int,
          hor_cur_inic_tmp: h.hor_cur_inic_tmp,
          hor_cur_fin_tmp:  h.hor_cur_fin_tmp,
        })
        .eq('hor_cur_id_int', h.hor_cur_id_int!)

      if (updErr) {
        console.error('[saveHorariosByCurso] UPDATE error:', updErr)
        throw updErr
      }
    }

    // 3. INSERT los nuevos (sin id)
    const toInsert = horarios.filter((h) => h.hor_cur_id_int == null)
    if (toInsert.length > 0) {
      const rows = toInsert.map((h) => ({
        cur_id_int:       curIdInt,
        hor_cur_dia_int:  h.hor_cur_dia_int,
        hor_cur_inic_tmp: h.hor_cur_inic_tmp,
        hor_cur_fin_tmp:  h.hor_cur_fin_tmp,
      }))

      const { error: insErr } = await supabase
        .from('horario_curso')
        .insert(rows)

      if (insErr) {
        console.error('[saveHorariosByCurso] INSERT error:', insErr)
        throw insErr
      }
    }

    return { success: true }
  } catch (error: any) {
    const msg = error?.message ?? error?.error_description ?? 'Error al guardar horarios'
    console.error('[saveHorariosByCurso] Error:', msg)
    return { success: false, error: msg }
  }
}
