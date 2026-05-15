'use server'

import { supabase } from '@/lib/supabase'
import { assertAuthenticated, assertEstudiante } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'

/**
 * Crea un comentario en un apartado del aula.
 * Solo ESTUDIANTE puede comentar (los comentarios son parte de la experiencia del aula).
 */
export async function crearComentario(formData: FormData): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    const texto = (formData.get('texto') as string | null)?.trim()
    const aparIdRaw = formData.get('apar_id_int') as string | null
    const pathRevalidate = formData.get('path') as string | null

    if (!texto || texto.length < 2) {
      return { success: false, error: 'El comentario debe tener al menos 2 caracteres' }
    }
    if (texto.length > 2000) {
      return { success: false, error: 'El comentario no puede exceder 2000 caracteres' }
    }

    const aparId = aparIdRaw ? parseInt(aparIdRaw, 10) : null
    if (!aparId || isNaN(aparId)) {
      return { success: false, error: 'Apartado no válido' }
    }

    const { error } = await supabase
      .from('comentarios_curso')
      .insert({
        com_cur_text_vac: texto,
        apar_id_int: aparId,
        usr_id_int: user.usr_id_int,
        com_cur_cre_tmp: new Date().toISOString(),
      })

    if (error) {
      console.error('[comentario.actions] crearComentario - Error:', error)
      return { success: false, error: 'Error al guardar el comentario' }
    }

    if (pathRevalidate) revalidatePath(pathRevalidate)

    return { success: true, message: 'Comentario publicado' }
  } catch (err) {
    console.error('[comentario.actions] crearComentario - Exception:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Error de conexión' }
  }
}
