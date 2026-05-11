'use server'

import { getCurrentUser } from './auth.actions'
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
}

export interface UpdatePasswordData {
  current: string
  new: string
  repeat: string
}

/**
 * Update student profile information
 * Saves changes to estudiante table
 */
export async function updateStudentProfile(
  profileData: UpdateProfileData,
  passwordData: UpdatePasswordData
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Validate input
    if (!profileData.nombre?.trim()) {
      throw new Error('Nombre is required')
    }

    if (!profileData.email?.trim()) {
      throw new Error('Email is required')
    }

    if (!profileData.tipoDocumento) {
      throw new Error('Tipo de documento is required')
    }

    if (!profileData.numeroDocumento?.trim()) {
      throw new Error('Número de documento is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileData.email)) {
      throw new Error('Invalid email format')
    }

    // Validate password match if new password is provided
    if (passwordData.new && passwordData.new !== passwordData.repeat) {
      throw new Error('Passwords do not match')
    }

    // Get current student data
    const { data: estudiante, error: estuError } = await supabase
      .from('estudiante')
      .select('estu_id_int')
      .eq('usr_id_int', user.usr_id_int)
      .single()

    if (estuError || !estudiante) {
      throw new Error('Student profile not found')
    }

    const estudianteId = estudiante.estu_id_int

    // Get current user password data for verification
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('usr_pass_vac, usr_email_vac')
      .eq('usr_id_int', user.usr_id_int)
      .single()

    if (userError || !userData) {
      throw new Error('User data not found')
    }

    // Verify current password if new password is provided
    if (passwordData.new) {
      if (!passwordData.current) {
        throw new Error('Current password is required to set a new password')
      }

      if (passwordData.new.length < 8) {
        throw new Error('New password must be at least 8 characters long')
      }

      // Compare current password with stored hash
      const passwordMatch = await compare(
        passwordData.current,
        userData.usr_pass_vac || ''
      )

      if (!passwordMatch) {
        throw new Error('Current password is incorrect')
      }
    }

    // Update student profile data
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

    if (updateError) {
      throw new Error(`Error updating student profile: ${updateError.message}`)
    }

    // Update password if new password provided
    if (passwordData.new) {
      const hashedPassword = await hash(passwordData.new, 10)

      const { error: passUpdateError } = await supabase
        .from('usuarios')
        .update({
          usr_ant_pass_vac: userData.usr_pass_vac, // Save current as old
          usr_pass_vac: hashedPassword, // Set new hashed password
          usr_upd_tmp: new Date().toISOString(),
        })
        .eq('usr_id_int', user.usr_id_int)

      if (passUpdateError) {
        throw new Error(`Error updating password: ${passUpdateError.message}`)
      }
    }

    // Update email if changed
    if (profileData.email && profileData.email !== userData.usr_email_vac) {
      const { error: emailUpdateError } = await supabase
        .from('usuarios')
        .update({
          usr_ant_email_vac: userData.usr_email_vac, // Save current as old
          usr_email_vac: profileData.email, // Set new email
          usr_upd_tmp: new Date().toISOString(),
        })
        .eq('usr_id_int', user.usr_id_int)

      if (emailUpdateError) {
        throw new Error(`Error updating email: ${emailUpdateError.message}`)
      }
    }

    // Update document number in detalle_documento
    if (profileData.numeroDocumento) {
      const { data: existingDoc, error: docCheckError } = await supabase
        .from('detalle_documento')
        .select('det_doc_id_int')
        .eq('estu_id_int', estudianteId)
        .single()

      if (docCheckError && docCheckError.code !== 'PGRST116') {
        throw docCheckError
      }

      if (existingDoc) {
        // Update existing document record
        const { error: docUpdateError } = await supabase
          .from('detalle_documento')
          .update({
            dtdoc_num_vac: profileData.numeroDocumento,
            doc_id_int: parseInt(profileData.tipoDocumento),
            dtdoc_doc_upd_tmp: new Date().toISOString(),
          })
          .eq('det_doc_id_int', existingDoc.det_doc_id_int)

        if (docUpdateError) {
          throw new Error(`Error updating document: ${docUpdateError.message}`)
        }
      } else {
        // Create new document record
        const { error: docCreateError } = await supabase
          .from('detalle_documento')
          .insert({
            estu_id_int: estudianteId,
            dtdoc_num_vac: profileData.numeroDocumento,
            doc_id_int: parseInt(profileData.tipoDocumento),
            dtdoc_cre_tmp: new Date().toISOString(),
          })

        if (docCreateError) {
          throw new Error(`Error creating document: ${docCreateError.message}`)
        }
      }
    }

    // Update phone number in telefono
    if (profileData.telefono) {
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('telefono')
        .select('tel_id_int')
        .eq('estu_id_int', estudianteId)
        .single()

      if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
        throw phoneCheckError
      }

      // Parse phone number (assuming format: +51999999999 or similar)
      const phoneStr = profileData.telefono.replace(/\D/g, '')
      const countryCode = phoneStr.slice(0, 2) // First 2 digits as country code
      const phoneNumber = phoneStr.slice(2) // Rest as phone number

      if (existingPhone) {
        // Update existing phone record
        const { error: phoneUpdateError } = await supabase
          .from('telefono')
          .update({
            tel_cod_pai_int: parseInt(countryCode) || null,
            tel_num_int: parseInt(phoneNumber) || null,
            doc_upd_tmp: new Date().toISOString(),
          })
          .eq('tel_id_int', existingPhone.tel_id_int)

        if (phoneUpdateError) {
          throw new Error(`Error updating phone: ${phoneUpdateError.message}`)
        }
      } else if (phoneNumber) {
        // Create new phone record
        const { error: phoneCreateError } = await supabase
          .from('telefono')
          .insert({
            estu_id_int: estudianteId,
            tel_cod_pai_int: parseInt(countryCode) || null,
            tel_num_int: parseInt(phoneNumber) || null,
            doc_cre_tmp: new Date().toISOString(),
          })

        if (phoneCreateError) {
          throw new Error(`Error creating phone: ${phoneCreateError.message}`)
        }
      }
    }

    console.log('Profile updated successfully:', {
      userId: user.usr_id_int,
      estudianteId: estudianteId,
      profileData: {
        nombre: profileData.nombre,
        apellidoPaterno: profileData.apellidoPaterno,
        apellidoMaterno: profileData.apellidoMaterno,
        genero: profileData.genero,
        numeroDocumento: profileData.numeroDocumento,
        tipoDocumento: profileData.tipoDocumento,
        telefono: profileData.telefono,
      },
      passwordChanged: !!passwordData.new,
      emailChanged: profileData.email !== userData.usr_email_vac,
    })

    return {
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        ...profileData,
      },
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}
