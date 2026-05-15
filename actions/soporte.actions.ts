'use server'

import { supabase } from '@/lib/supabase'
import { getCurrentUser } from './auth.actions'
import { createSoporte } from '@/repository/soporte.repository'
import { revalidatePath } from 'next/cache'

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

function generateSoporteFilename(userId: number, ext: string): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}-${String(now.getMilliseconds()).padStart(3, '0')}`
  return `USR-${userId}-${ts}.${ext}`
}

// ──────────────────────────────────────────────────
// Crear ticket de soporte
// ──────────────────────────────────────────────────

export async function crearTicketSoporte(formData: FormData): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    // 1. Autenticación
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'No estás autenticado' }

    // 2. Extraer y validar campos
    const titulo = (formData.get('titulo') as string | null)?.trim()
    const descripcion = (formData.get('descripcion') as string | null)?.trim()
    const file = formData.get('file') as File | null

    if (!titulo || titulo.length < 3) {
      return { success: false, error: 'El título debe tener al menos 3 caracteres' }
    }
    if (titulo.length > 255) {
      return { success: false, error: 'El título no puede exceder los 255 caracteres' }
    }
    if (!descripcion || descripcion.length < 10) {
      return { success: false, error: 'La descripción debe tener al menos 10 caracteres' }
    }
    if (descripcion.length > 5000) {
      return { success: false, error: 'La descripción no puede exceder los 5000 caracteres' }
    }

    // 3. Subir imagen al bucket (opcional)
    let sop_url_vac: string | null = null

    if (file && file.size > 0) {
      // --- Validación de tipo MIME (capa 1) ---
      const allowedTypes = ['image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Solo se permiten imágenes JPG o PNG' }
      }
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'La imagen no debe exceder 5MB' }
      }

      // --- Validación de magic bytes (capa 2, anti-spoofing) ---
      const buffer = await file.slice(0, 8).arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
      const isPng  = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E &&
                     bytes[3] === 0x47 && bytes[4] === 0x0D && bytes[5] === 0x0A

      if (!isJpeg && !isPng) {
        return { success: false, error: 'El archivo no es una imagen válida (JPG o PNG)' }
      }

      const ext = isJpeg ? 'jpg' : 'png'
      const filename = generateSoporteFilename(user.usr_id_int, ext)
      const path = `soporte/${filename}`

      const { error: uploadError } = await supabase.storage
        .from('student-private')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('[soporte.actions] Upload error:', uploadError)
        return { success: false, error: `Error al subir la imagen: ${uploadError.message}` }
      }

      sop_url_vac = path
    }

    // 4. Crear el ticket en BD
    const ticket = await createSoporte({
      sop_titulo_vac: titulo,
      sop_desc_vac: descripcion,
      sop_url_vac,
      usr_id_int: user.usr_id_int,
    })

    if (!ticket) {
      if (sop_url_vac) {
        await supabase.storage.from('student-private').remove([sop_url_vac])
      }
      return { success: false, error: 'Error al registrar el ticket. Inténtalo de nuevo.' }
    }

    revalidatePath('/aula/soporte')

    return {
      success: true,
      message: 'Tu solicitud de soporte ha sido enviada. Nos pondremos en contacto contigo a la brevedad.',
    }
  } catch (error) {
    console.error('[soporte.actions] crearTicketSoporte - Exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
