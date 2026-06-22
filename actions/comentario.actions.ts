'use server'

import { sql } from '@/lib/db'
import { assertAuthenticated, assertEstudiante } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'
import { handleActionError } from '@/lib/errors'

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

    try {
      await sql`
        INSERT INTO comentarios_curso (
          com_cur_text_vac,
          apar_id_int,
          usr_id_int
        ) VALUES (
          ${texto},
          ${aparId},
          ${user.usr_id_int}
        )
      `
    } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }

    if (pathRevalidate) revalidatePath(pathRevalidate)

    return { success: true, message: 'Comentario publicado' }
  } catch (error: any) {
    const errorResponse = handleActionError(error)
    return { success: false, error: errorResponse.error }
  }
}
