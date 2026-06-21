'use server'

import { assertAuthenticated, assertEstudiante } from '@/lib/auth-guards'
import { sql } from '@/lib/db'
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
  modoOscuro?: boolean
}

export interface UpdatePasswordData {
  current: string
  new: string
  repeat: string
}

export async function updateStudentProfile(
  profileData: UpdateProfileData,
  passwordData: UpdatePasswordData
) {
  try {
    const user = await assertAuthenticated()
    assertEstudiante(user)

    if (!profileData.nombre?.trim()) throw new Error('Nombre es requerido')
    if (!profileData.email?.trim()) throw new Error('Email es requerido')
    if (!profileData.tipoDocumento) throw new Error('Tipo de documento es requerido')
    if (!profileData.numeroDocumento?.trim()) throw new Error('Número de documento es requerido')

    const emailNormalizado = profileData.email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailNormalizado)) throw new Error('Formato de email inválido')

    if (passwordData.new && passwordData.new !== passwordData.repeat) {
      throw new Error('Las contraseñas no coinciden')
    }

    const estudiantes = await sql`
      SELECT estu_id_int FROM estudiante WHERE usr_id_int = ${user.usr_id_int}
    `
    if (estudiantes.length === 0) throw new Error('Perfil de estudiante no encontrado')
    const estudianteId = estudiantes[0].estu_id_int

    const usuarios = await sql`
      SELECT usr_pass_vac, usr_email_vac FROM usuarios WHERE usr_id_int = ${user.usr_id_int}
    `
    if (usuarios.length === 0) throw new Error('Datos de usuario no encontrados')
    const userData = usuarios[0]

    if (passwordData.new) {
      if (!passwordData.current) throw new Error('Se requiere la contraseña actual')
      if (passwordData.new.length < 8) throw new Error('La nueva contraseña debe tener al menos 8 caracteres')

      const passwordMatch = await compare(passwordData.current, userData.usr_pass_vac || '')
      if (!passwordMatch) throw new Error('La contraseña actual es incorrecta')
    }

    await sql`
      UPDATE estudiante
      SET estu_nomb_vac = ${profileData.nombre},
          estu_apell_pat_vac = ${profileData.apellidoPaterno},
          estu_apell_mat_vac = ${profileData.apellidoMaterno},
          estu_gen_vac = ${profileData.genero},
          estu_upd_tmp = NOW()
      WHERE usr_id_int = ${user.usr_id_int}
    `

    if (passwordData.new) {
      const hashedPassword = await hash(passwordData.new, 10)
      await sql`
        UPDATE usuarios
        SET usr_ant_pass_vac = ${userData.usr_pass_vac},
            usr_pass_vac = ${hashedPassword},
            usr_upd_tmp = NOW()
        WHERE usr_id_int = ${user.usr_id_int}
      `
    }

    if (emailNormalizado !== userData.usr_email_vac?.toLowerCase()) {
      const emailsList = await sql`
        SELECT usr_id_int FROM usuarios 
        WHERE LOWER(usr_email_vac) = ${emailNormalizado} 
        AND usr_id_int != ${user.usr_id_int}
      `
      if (emailsList.length > 0) {
        throw new Error('Este correo ya está registrado por otro usuario')
      }

      await sql`
        UPDATE usuarios
        SET usr_ant_email_vac = ${userData.usr_email_vac},
            usr_email_vac = ${emailNormalizado},
            usr_upd_tmp = NOW()
        WHERE usr_id_int = ${user.usr_id_int}
      `
    }

    if (profileData.numeroDocumento) {
      const existingDocs = await sql`
        SELECT det_doc_id_int FROM detalle_documento WHERE estu_id_int = ${estudianteId}
      `
      if (existingDocs.length > 0) {
        await sql`
          UPDATE detalle_documento
          SET dtdoc_num_vac = ${profileData.numeroDocumento},
              doc_id_int = ${parseInt(profileData.tipoDocumento)},
              dtdoc_doc_upd_tmp = NOW()
          WHERE det_doc_id_int = ${existingDocs[0].det_doc_id_int}
        `
      } else {
        await sql`
          INSERT INTO detalle_documento (estu_id_int, dtdoc_num_vac, doc_id_int, dtdoc_cre_tmp)
          VALUES (${estudianteId}, ${profileData.numeroDocumento}, ${parseInt(profileData.tipoDocumento)}, NOW())
        `
      }
    }

    if (profileData.telefono) {
      const existingPhones = await sql`
        SELECT tel_id_int FROM telefono WHERE estu_id_int = ${estudianteId}
      `
      const phoneStr = profileData.telefono.replace(/\D/g, '')
      const countryCode = phoneStr.slice(0, 2)
      const phoneNumber = phoneStr.slice(2)

      if (existingPhones.length > 0) {
        await sql`
          UPDATE telefono
          SET tel_cod_pai_int = ${parseInt(countryCode) || null},
              tel_num_int = ${parseInt(phoneNumber) || null},
              doc_upd_tmp = NOW()
          WHERE tel_id_int = ${existingPhones[0].tel_id_int}
        `
      } else if (phoneNumber) {
        await sql`
          INSERT INTO telefono (estu_id_int, tel_cod_pai_int, tel_num_int, doc_cre_tmp)
          VALUES (${estudianteId}, ${parseInt(countryCode) || null}, ${parseInt(phoneNumber) || null}, NOW())
        `
      }
    }

    if (typeof profileData.modoOscuro === 'boolean') {
      await sql`
        UPDATE usuarios
        SET usr_mod_bol = ${profileData.modoOscuro},
            usr_upd_tmp = NOW()
        WHERE usr_id_int = ${user.usr_id_int}
      `
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
