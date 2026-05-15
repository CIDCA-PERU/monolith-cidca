import 'server-only'
import { supabase } from '@/lib/supabase'

export type Recuperacion = {
  rec_id_int: number
  rec_uuid: string
  rec_tok_vac: string
  usr_id_int: number
  rec_est_int: number   // 0 = pendiente, 1 = usado
  rec_exp_tmp: string
  rec_cre_tmp: string
}

/**
 * Crea un nuevo token de recuperación para el usuario.
 * Invalida los anteriores pendientes del mismo usuario.
 */
export async function createRecuperacionToken(
  usrId: number,
  token: string,
  expiresAt: Date
): Promise<Recuperacion | null> {
  // Invalida tokens anteriores pendientes del mismo usuario
  await supabase
    .from('recuperacion')
    .update({ rec_est_int: 2 }) // 2 = invalidado
    .eq('usr_id_int', usrId)
    .eq('rec_est_int', 0)

  const { data, error } = await supabase
    .from('recuperacion')
    .insert({
      rec_tok_vac: token,
      usr_id_int: usrId,
      rec_est_int: 0,
      rec_exp_tmp: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[recuperacion.repository] createRecuperacionToken - Error:', error)
    return null
  }

  return data as Recuperacion
}

/**
 * Busca un token válido (pendiente y no expirado).
 */
export async function findValidToken(token: string): Promise<Recuperacion | null> {
  const { data, error } = await supabase
    .from('recuperacion')
    .select('*')
    .eq('rec_tok_vac', token)
    .eq('rec_est_int', 0)
    .single()

  if (error || !data) return null

  // Verificar expiración en código (doble seguridad)
  if (new Date(data.rec_exp_tmp) < new Date()) return null

  return data as Recuperacion
}

/**
 * Marca un token como usado (rec_est_int = 1).
 */
export async function markTokenAsUsed(recId: number): Promise<void> {
  await supabase
    .from('recuperacion')
    .update({ rec_est_int: 1 })
    .eq('rec_id_int', recId)
}
