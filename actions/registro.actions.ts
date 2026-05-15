'use server'

import { supabase } from '@/lib/supabase'
import { registerService } from '@/service/auth.service'
import { getUsuarioRol, getUsuarioByEmail, getUsuarioById, updateUsuarioPassword } from '@/repository/usuario.repository'
import { createRecuperacionToken, findValidToken, markTokenAsUsed } from '@/repository/recuperacion.repository'
import { existeDocumento, crearDetalleDocumento } from '@/repository/documento.repository'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { sendEmail, buildRecuperacionEmail, buildBienvenidaEmail } from '@/lib/email'

// ── Registro de estudiante ────────────────────────────────────────────────────

export async function registrarEstudiante(formData: FormData): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const email       = (formData.get('email') as string | null)?.trim().toLowerCase()
    const password    = (formData.get('password') as string | null) ?? ''
    const confirm     = (formData.get('confirm') as string | null) ?? ''
    const nombre      = (formData.get('nombre') as string | null)?.trim()
    const apellidoPat = (formData.get('apellidoPat') as string | null)?.trim()
    const apellidoMat = (formData.get('apellidoMat') as string | null)?.trim() ?? ''
    const docTipo     = (formData.get('docTipo') as string | null)?.trim()
    const docNumero   = (formData.get('docNumero') as string | null)?.trim().toUpperCase()
    const docIdRaw    = (formData.get('docId') as string | null)
    const docId       = docIdRaw ? parseInt(docIdRaw, 10) : -1

    // Validaciones básicas
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { success: false, error: 'Ingresa un email válido' }
    if (!nombre || nombre.length < 2)
      return { success: false, error: 'El nombre debe tener al menos 2 caracteres' }
    if (!apellidoPat || apellidoPat.length < 2)
      return { success: false, error: 'El apellido paterno debe tener al menos 2 caracteres' }
    if (!docTipo)
      return { success: false, error: 'Selecciona un tipo de documento' }
    if (!docNumero || docNumero.length < 4)
      return { success: false, error: 'Ingresa un número de documento válido' }
    if (password.length < 6)
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    if (password !== confirm)
      return { success: false, error: 'Las contraseñas no coinciden' }

    // Validar unicidad de tipo + número de documento
    const documentoDuplicado = await existeDocumento(docTipo, docNumero)
    if (documentoDuplicado) {
      return {
        success: false,
        error: `Ya existe una cuenta registrada con ${docTipo} N° ${docNumero}`,
      }
    }

    // 1. Crear usuario (rol 4 = ESTUDIANTE)
    const userSession = await registerService(email, password, confirm, 4)

    // 2. Crear registro en tabla estudiante
    const { data: estudianteData, error: estudianteError } = await supabase
      .from('estudiante')
      .insert({
        estu_nomb_vac: nombre,
        estu_apell_pat_vac: apellidoPat,
        estu_apell_mat_vac: apellidoMat || null,
        usr_id_int: userSession.usr_id_int,
      })
      .select('estu_id_int')
      .single()

    if (estudianteError || !estudianteData) {
      console.error('[registro.actions] Error al crear estudiante:', estudianteError)
    }

    // 3. Crear detalle_documento
    if (estudianteData?.estu_id_int) {
      await crearDetalleDocumento(
        estudianteData.estu_id_int,
        docId,
        docTipo,
        docNumero
      )
    }

    // 4. Guardar sesión en cookie
    await getUsuarioRol(userSession.usr_id_int)
    const cookieStore = await cookies()
    cookieStore.set('userId', userSession.usr_id_int.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    // 5. Email de bienvenida (no bloqueante)
    try {
      const { subject, html, text } = buildBienvenidaEmail(nombre, email!)
      await sendEmail({ to: email!, subject, html, text })
    } catch (emailErr) {
      console.error('[registro.actions] Error al enviar bienvenida:', emailErr)
    }

    return { success: true, message: `Bienvenido, ${nombre}!` }
  } catch (err: any) {
    const msg = err?.message ?? 'Error al registrarse'
    return { success: false, error: msg.includes('registrado') ? 'Ese email ya está registrado' : msg }
  }
}

// ── Solicitar recuperación de contraseña ─────────────────────────────────────

export async function solicitarRecuperacion(formData: FormData): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { success: false, error: 'Ingresa un email válido' }

  // Por seguridad: siempre devolvemos éxito aunque el email no exista
  const usuario = await getUsuarioByEmail(email)
  if (!usuario) {
    return {
      success: true,
      message: 'Si ese email está registrado, recibirás instrucciones de recuperación.',
    }
  }

  // Genera token y lo guarda en la tabla recuperacion
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

  const rec = await createRecuperacionToken(usuario.usr_id_int, token, expiresAt)
  if (!rec) {
    // Fallo silencioso por seguridad: no revelar que el email existe
    return {
      success: true,
      message: 'Si ese email está registrado, recibirás instrucciones de recuperación.',
    }
  }

  // Enviar email real con Gmail SMTP
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resetUrl = `${appUrl}/recuperar-password?token=${token}`
  const nombreUsuario = usuario.usr_nomb_vac ?? ''

  try {
    const { subject, html, text } = buildRecuperacionEmail(nombreUsuario, resetUrl)
    await sendEmail({ to: email, subject, html, text })
  } catch (emailErr) {
    console.error('[recuperacion.actions] Error al enviar email:', emailErr)
  }

  return {
    success: true,
    message: 'Si ese email está registrado, recibirás instrucciones de recuperación.',
  }
}

// ── Cambiar contraseña con token ──────────────────────────────────────────────

export async function cambiarPasswordConToken(formData: FormData): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  const token    = (formData.get('token') as string | null)?.trim()
  const password = (formData.get('password') as string | null) ?? ''
  const confirm  = (formData.get('confirm') as string | null) ?? ''

  if (!token) return { success: false, error: 'Token inválido' }
  if (password.length < 6) return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
  if (password !== confirm) return { success: false, error: 'Las contraseñas no coinciden' }

  // Buscar token válido en la tabla recuperacion
  const rec = await findValidToken(token)
  if (!rec) return { success: false, error: 'El enlace ha expirado o no es válido' }

  // Leer la contraseña actual para guardarla como anterior
  const usuarioActual = await getUsuarioById(rec.usr_id_int)
  const oldHash = usuarioActual?.usr_pass_vac ?? undefined

  // Actualizar contraseña (guarda la anterior en usr_ant_pass_vac)
  const hash = await bcrypt.hash(password, 10)
  await updateUsuarioPassword(rec.usr_id_int, hash, oldHash)

  // Marcar token como usado
  await markTokenAsUsed(rec.rec_id_int)

  return { success: true, message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' }
}
