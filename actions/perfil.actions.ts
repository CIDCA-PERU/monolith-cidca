'use server'

import { assertAuthenticated, assertEstudiante } from '@/lib/auth-guards'
import { supabase } from '@/lib/supabase'
import { compare, hash } from 'bcrypt'

export interface UpdateProfileData {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  genero: string
  telefono: string
  tipoDocumento: string
  numeroDocumento: string
  //true = dark mode, false = light mode
  modoOscuro?: boolean
}

export interface UpdatePasswordData {
  current: string
  new: string
  repeat: string
}

/**
 * Actualiza el perfil del estudiante autenticado.
 * Solo ESTUDIANTE puede editar su propio perfil de estudiante.
 */
export async function updateStudentProfile(
  profileData: UpdateProfileData,
  passwordData: UpdatePasswordData
) {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    // Validar campos obligatorios
    if (!profileData.nombre?.trim()) throw new Error('Nombre es requerido')
    if (!profileData.email?.trim()) throw new Error('Email es requerido')
    if (!profileData.tipoDocumento) throw new Error('Tipo de documento es requerido')
    if (!profileData.numeroDocumento?.trim()) throw new Error('Número de documento es requerido')

    // Normalizar email a minúsculas y validar formato
    const emailNormalizado = profileData.email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailNormalizado)) throw new Error('Formato de email inválido')

    // Validar coincidencia de contraseñas
    if (passwordData.new && passwordData.new !== passwordData.repeat) {
      throw new Error('Las contraseñas no coinciden')
    }

    // Obtener datos actuales del estudiante
    const { data: estudiante, error: estuError } = await supabase
      .from('estudiante')
      .select('estu_id_int')
      .eq('usr_id_int', user.usr_id_int)
      .single()

    if (estuError || !estudiante) throw new Error('Perfil de estudiante no encontrado')

    const estudianteId = estudiante.estu_id_int

    // Obtener datos del usuario para verificación de contraseña
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('usr_pass_vac, usr_email_vac')
      .eq('usr_id_int', user.usr_id_int)
      .single()

    if (userError || !userData) throw new Error('Datos de usuario no encontrados')

    // Verificar contraseña actual si se va a cambiar
    if (passwordData.new) {
      if (!passwordData.current) throw new Error('Se requiere la contraseña actual')
      if (passwordData.new.length < 8) throw new Error('La nueva contraseña debe tener al menos 8 caracteres')

      const passwordMatch = await compare(passwordData.current, userData.usr_pass_vac || '')
      if (!passwordMatch) throw new Error('La contraseña actual es incorrecta')
    }

    // Actualizar datos del estudiante
    const { error: updateError } = await supabase
      .from('estudiante')
      .update({
        estu_nomb_vac: profileData.nombre,
        estu_apell_pat_vac: profileData.apellidoPaterno,
        estu_apell_mat_vac: profileData.apellidoMaterno,
        estu_gen_vac: profileData.genero,
        estu_upd_tmp: new Date().toISOString(),
      })
      .eq('usr_id_int', user.usr_id_int)

    if (updateError) throw new Error(`Error al actualizar perfil: ${updateError.message}`)

    // Actualizar contraseña si se proporcionó una nueva
    if (passwordData.new) {
      const hashedPassword = await hash(passwordData.new, 10)

      const { error: passUpdateError } = await supabase
        .from('usuarios')
        .update({
          usr_ant_pass_vac: userData.usr_pass_vac,
          usr_pass_vac: hashedPassword,
          usr_upd_tmp: new Date().toISOString(),
        })
        .eq('usr_id_int', user.usr_id_int)

      if (passUpdateError) throw new Error(`Error al actualizar contraseña: ${passUpdateError.message}`)
    }

    // Actualizar email si cambió
    if (emailNormalizado !== userData.usr_email_vac?.toLowerCase()) {

      // Verificar que el nuevo email no esté en uso por OTRO usuario
      const { data: emailExistente } = await supabase
        .from('usuarios')
        .select('usr_id_int')
        .ilike('usr_email_vac', emailNormalizado)  // comparación case-insensitive
        .neq('usr_id_int', user.usr_id_int)         // excluir al usuario actual
        .maybeSingle()

      if (emailExistente) {
        throw new Error('Este correo ya está registrado por otro usuario')
      }

      const { error: emailUpdateError } = await supabase
        .from('usuarios')
        .update({
          usr_ant_email_vac: userData.usr_email_vac,
          usr_email_vac: emailNormalizado,           // guardar en minúsculas
          usr_upd_tmp: new Date().toISOString(),
        })
        .eq('usr_id_int', user.usr_id_int)

      if (emailUpdateError) throw new Error(`Error al actualizar email: ${emailUpdateError.message}`)
    }

    // Actualizar documento de identidad
    if (profileData.numeroDocumento) {
      const { data: existingDoc, error: docCheckError } = await supabase
        .from('detalle_documento')
        .select('det_doc_id_int')
        .eq('estu_id_int', estudianteId)
        .single()

      if (docCheckError && docCheckError.code !== 'PGRST116') throw docCheckError

      if (existingDoc) {
        const { error: docUpdateError } = await supabase
          .from('detalle_documento')
          .update({
            dtdoc_num_vac: profileData.numeroDocumento,
            doc_id_int: parseInt(profileData.tipoDocumento),
            dtdoc_doc_upd_tmp: new Date().toISOString(),
          })
          .eq('det_doc_id_int', existingDoc.det_doc_id_int)

        if (docUpdateError) throw new Error(`Error al actualizar documento: ${docUpdateError.message}`)
      } else {
        const { error: docCreateError } = await supabase
          .from('detalle_documento')
          .insert({
            estu_id_int: estudianteId,
            dtdoc_num_vac: profileData.numeroDocumento,
            doc_id_int: parseInt(profileData.tipoDocumento),
            dtdoc_cre_tmp: new Date().toISOString(),
          })

        if (docCreateError) throw new Error(`Error al crear documento: ${docCreateError.message}`)
      }
    }

    // Actualizar teléfono
    if (profileData.telefono) {
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('telefono')
        .select('tel_id_int')
        .eq('estu_id_int', estudianteId)
        .single()

      if (phoneCheckError && phoneCheckError.code !== 'PGRST116') throw phoneCheckError

      const phoneStr = profileData.telefono.replace(/\D/g, '')
      const countryCode = phoneStr.slice(0, 2)
      const phoneNumber = phoneStr.slice(2)

      if (existingPhone) {
        const { error: phoneUpdateError } = await supabase
          .from('telefono')
          .update({
            tel_cod_pai_int: parseInt(countryCode) || null,
            tel_num_int: parseInt(phoneNumber) || null,
            doc_upd_tmp: new Date().toISOString(),
          })
          .eq('tel_id_int', existingPhone.tel_id_int)

        if (phoneUpdateError) throw new Error(`Error al actualizar teléfono: ${phoneUpdateError.message}`)
      } else if (phoneNumber) {
        const { error: phoneCreateError } = await supabase
          .from('telefono')
          .insert({
            estu_id_int: estudianteId,
            tel_cod_pai_int: parseInt(countryCode) || null,
            tel_num_int: parseInt(phoneNumber) || null,
            doc_cre_tmp: new Date().toISOString(),
          })

        if (phoneCreateError) throw new Error(`Error al crear teléfono: ${phoneCreateError.message}`)
      }
    }

    // Persistir preferencia de tema del usuario
    if (typeof profileData.modoOscuro === 'boolean') {
      const { error: themeUpdateError } = await supabase
        .from('usuarios')
        .update({
          usr_mod_bol: profileData.modoOscuro,
          usr_upd_tmp: new Date().toISOString(),
        })
        .eq('usr_id_int', user.usr_id_int)

      if (themeUpdateError) throw new Error(`Error al actualizar preferencia de tema: ${themeUpdateError.message}`)
    }

    return {
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { ...profileData },
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}
