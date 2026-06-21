'use server'

import { supabase } from '@/lib/supabase'
import { assertAuthenticated, assertAdminOrCoordinador, assertDashboard } from '@/lib/auth-guards'
import { AppError } from '@/lib/errors'
import { registerService } from '@/service/auth.service'
import { existeDocumento, crearDetalleDocumento } from '@/repository/documento.repository'

// --- Tipos internos ------------------------------------------------------------

export interface CursoAdminDto {
  cur_uuid: string
  cur_nomb_vac: string
  cur_desc_vac: string
  cur_est_int: number
  cur_precio_num: number
  cur_fec_inic_tmp: string
  cur_fec_fin_tmp: string
  cur_url_vac: string | null
  cur_cre_tmp: string
  docente_nombre: string
  docente_email: string
  estudiantes_count: number
}

export interface EstudianteAdminDto {
  estu_uuid: string
  estu_nomb_vac: string
  estu_apell_pat_vac: string
  estu_apell_mat_vac: string
  estu_gen_vac: string | null
  estu_cre_tmp: string
  usr_uuid: string
  usr_email_vac: string
  usr_nomb_vac: string
  usr_est_int: number
  usr_origen_vac: string
  cursos_count: number
}

export interface PagoAdminDto {
  pago_uuid: string
  pago_id_int: number
  estu_id_int: number          // para chequeo de duplicados en cliente
  cur_id_int: number           // para chequeo de duplicados en cliente
  pago_nro_vac: string | null
  pago_mont_num: number
  pago_estad_vac: 'PENDIENTE' | 'ACEPTADO' | 'OBSERVADO'
  pago_url_vac: string | null   // path en storage privado
  pago_obs_vac: string | null
  pago_cre_tmp: string
  pago_upd_tmp: string
  estudiante_nombre: string
  estudiante_apellidos: string
  curso_nombre: string
}

export interface EstudianteSelectDto {
  estu_id_int: number
  nombre_completo: string
}

export interface CursoSelectDto {
  cur_id_int: number
  cur_uuid: string
  cur_nomb_vac: string
  cur_precio_num: number
}

export interface AuditoriaItemDto {
  tipo: 'PAGO' | 'CURSO' | 'MATRICULA'
  descripcion: string
  fecha: string
  responsable: string
  accion: string
}

// --- Certificados -------------------------------------------------------------

export interface CursoCertificadoDto {
  cur_id_int: number
  cur_uuid: string
  cur_nomb_vac: string
  cur_fec_inic_tmp: string | null
  cur_fec_fin_tmp: string | null
  total_inscritos: number
  certs_emitidos: number
}

export interface EstudianteCertificadoDto {
  estu_id_int: number
  estu_uuid: string
  estu_nomb_vac: string
  estu_apell_pat_vac: string
  estu_apell_mat_vac: string | null
  // Certificado (null si no existe aún)
  cert_id_int: number | null
  cert_uuid: string | null
  cert_cod_vac: string | null
  cert_url_vac: string | null
  cert_fec_emi_tmp: string | null
}

// --- Cursos --------------------------------------------------------------------

export async function getCursosAdmin(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{
  success: boolean
  data?: CursoAdminDto[]
  meta?: { total: number; page: number; limit: number; totalPages: number }
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    let query = supabase
      .from('curso')
      .select(`
        cur_uuid,
        cur_nomb_vac,
        cur_desc_vac,
        cur_est_int,
        cur_precio_num,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp,
        cur_url_vac,
        cur_cre_tmp,
        usuarios (
          usr_nomb_vac,
          usr_email_vac
        ),
        estudiante_curso ( est_cur_id_int )
      `, { count: 'exact' })

    if (search) {
      const term = `%${search}%`
      query = query.ilike('cur_nomb_vac', term)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('cur_cre_tmp', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('[getCursosAdmin] Supabase error:', error.message)
      throw new AppError(error.message, 'SERVER_ERROR', 500)
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    const result: CursoAdminDto[] = (data ?? []).map((c: any) => ({
      cur_uuid: c.cur_uuid,
      cur_nomb_vac: c.cur_nomb_vac,
      cur_desc_vac: c.cur_desc_vac,
      cur_est_int: c.cur_est_int,
      cur_precio_num: c.cur_precio_num ?? 0,
      cur_fec_inic_tmp: c.cur_fec_inic_tmp,
      cur_fec_fin_tmp: c.cur_fec_fin_tmp,
      cur_url_vac: c.cur_url_vac ?? null,
      cur_cre_tmp: c.cur_cre_tmp,
      docente_nombre: c.usuarios?.usr_nomb_vac ?? '—',
      docente_email: c.usuarios?.usr_email_vac ?? '—',
      estudiantes_count: (c.estudiante_curso ?? []).length,
    }))

    return { 
      success: true, 
      data: result,
      meta: { total, page, limit, totalPages }
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar cursos'
    return { success: false, error: msg }
  }
}

// --- Estudiantes ---------------------------------------------------------------

export async function getEstudiantesAdmin(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{
  success: boolean
  data?: EstudianteAdminDto[]
  meta?: { total: number; page: number; limit: number; totalPages: number }
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    let query = supabase
      .from('estudiante')
      .select(`
        estu_uuid,
        estu_nomb_vac,
        estu_apell_pat_vac,
        estu_apell_mat_vac,
        estu_gen_vac,
        estu_cre_tmp,
        usuarios (
          usr_uuid,
          usr_email_vac,
          usr_nomb_vac,
          usr_est_int,
          usr_origen_vac
        ),
        estudiante_curso ( est_cur_id_int )
      `, { count: 'exact' })

    if (search) {
      const term = `%${search}%`
      query = query.or(`estu_nomb_vac.ilike.${term},estu_apell_pat_vac.ilike.${term},estu_apell_mat_vac.ilike.${term}`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('estu_cre_tmp', { ascending: false })
      .range(from, to)

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    const result: EstudianteAdminDto[] = (data ?? []).map((e: any) => ({
      estu_uuid: e.estu_uuid,
      estu_nomb_vac: e.estu_nomb_vac ?? '',
      estu_apell_pat_vac: e.estu_apell_pat_vac ?? '',
      estu_apell_mat_vac: e.estu_apell_mat_vac ?? '',
      estu_gen_vac: e.estu_gen_vac ?? null,
      estu_cre_tmp: e.estu_cre_tmp,
      usr_uuid: e.usuarios?.usr_uuid ?? '',
      usr_email_vac: e.usuarios?.usr_email_vac ?? '',
      usr_nomb_vac: e.usuarios?.usr_nomb_vac ?? '',
      usr_est_int: e.usuarios?.usr_est_int ?? 0,
      usr_origen_vac: e.usuarios?.usr_origen_vac ?? 'WEB',
      cursos_count: (e.estudiante_curso ?? []).length,
    }))

    return { 
      success: true, 
      data: result,
      meta: { total, page, limit, totalPages }
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar estudiantes'
    return { success: false, error: msg }
  }
}

export async function getEstudianteByUuid(estuUuid: string): Promise<{
  success: boolean
  data?: EstudianteAdminDto
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data, error } = await supabase
      .from('estudiante')
      .select(`
        estu_uuid, estu_nomb_vac, estu_apell_pat_vac, estu_apell_mat_vac,
        estu_gen_vac, estu_cre_tmp,
        usuarios (
          usr_uuid, usr_email_vac, usr_nomb_vac, usr_est_int, usr_origen_vac
        ),
        estudiante_curso ( est_cur_id_int )
      `)
      .eq('estu_uuid', estuUuid)
      .single()

    if (error || !data) throw new AppError('Estudiante no encontrado', 'NOT_FOUND', 404)

    const e = data as any
    return {
      success: true,
      data: {
        estu_uuid: e.estu_uuid,
        estu_nomb_vac: e.estu_nomb_vac ?? '',
        estu_apell_pat_vac: e.estu_apell_pat_vac ?? '',
        estu_apell_mat_vac: e.estu_apell_mat_vac ?? '',
        estu_gen_vac: e.estu_gen_vac ?? null,
        estu_cre_tmp: e.estu_cre_tmp,
        usr_uuid: e.usuarios?.usr_uuid ?? '',
        usr_email_vac: e.usuarios?.usr_email_vac ?? '',
        usr_nomb_vac: e.usuarios?.usr_nomb_vac ?? '',
        usr_est_int: e.usuarios?.usr_est_int ?? 0,
        usr_origen_vac: e.usuarios?.usr_origen_vac ?? 'WEB',
        cursos_count: (e.estudiante_curso ?? []).length,
      },
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar estudiante'
    return { success: false, error: msg }
  }
}

export async function crearEstudianteManualAdmin(data: {
  email: string
  password: string
  nombre: string
  apellidoPat: string
  apellidoMat?: string
  docTipo: string
  docNumero: string
  docId?: number
}): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const email       = data.email.trim().toLowerCase()
    const password    = data.password
    const nombre      = data.nombre.trim()
    const apellidoPat = data.apellidoPat.trim()
    const apellidoMat = data.apellidoMat?.trim() ?? ''
    const docTipo     = data.docTipo.trim()
    const docNumero   = data.docNumero.trim().toUpperCase()
    const docId       = data.docId ?? -1

    if (!email || !nombre || !apellidoPat || !docTipo || !docNumero || !password) {
      return { success: false, error: 'Faltan campos obligatorios' }
    }

    const documentoDuplicado = await existeDocumento(docTipo, docNumero)
    if (documentoDuplicado) {
      return { success: false, error: `Ya existe una cuenta con ${docTipo} N° ${docNumero}` }
    }

    // 1. Crear usuario origen MANUAL
    const userSession = await registerService(email, password, password, 4, 'MANUAL')

    // 2. Crear estudiante
    const { data: estData, error: estError } = await supabase
      .from('estudiante')
      .insert({
        estu_nomb_vac: nombre,
        estu_apell_pat_vac: apellidoPat,
        estu_apell_mat_vac: apellidoMat || null,
        usr_id_int: userSession.usr_id_int,
      })
      .select('estu_id_int')
      .single()

    if (estError || !estData) {
      throw new AppError('Error al crear perfil de estudiante', 'SERVER_ERROR', 500)
    }

    // 3. Crear documento
    await crearDetalleDocumento(estData.estu_id_int, docId, docTipo, docNumero)

    return { success: true, message: 'Estudiante creado correctamente' }
  } catch (error: any) {
    const msg = error instanceof AppError ? error.message : error?.message || 'Error al crear estudiante'
    return { success: false, error: msg.includes('registrado') ? 'Ese email ya está registrado' : msg }
  }
}

export async function editarEstudianteAdmin(data: {
  estu_uuid: string
  usr_uuid: string
  email: string
  nombre: string
  apellidoPat: string
  apellidoMat?: string
}): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const email       = data.email.trim().toLowerCase()
    const nombre      = data.nombre.trim()
    const apellidoPat = data.apellidoPat.trim()
    const apellidoMat = data.apellidoMat?.trim() ?? ''

    if (!email || !nombre || !apellidoPat) {
      return { success: false, error: 'Faltan campos obligatorios' }
    }

    // 1. Actualizar usuario (email)
    const { error: usrErr } = await supabase
      .from('usuarios')
      .update({
        usr_email_vac: email,
        usr_upd_tmp: new Date().toISOString()
      })
      .eq('usr_uuid', data.usr_uuid)

    if (usrErr) throw new AppError(usrErr.message, 'SERVER_ERROR', 500)

    // 2. Actualizar estudiante (nombres)
    const { error: estErr } = await supabase
      .from('estudiante')
      .update({
        estu_nomb_vac: nombre,
        estu_apell_pat_vac: apellidoPat,
        estu_apell_mat_vac: apellidoMat || null,
      })
      .eq('estu_uuid', data.estu_uuid)

    if (estErr) throw new AppError(estErr.message, 'SERVER_ERROR', 500)

    return { success: true, message: 'Perfil de estudiante actualizado correctamente' }
  } catch (error: any) {
    const msg = error instanceof AppError ? error.message : 'Error al editar estudiante'
    return { success: false, error: msg }
  }
}

// --- Perfil completo de estudiante --------------------------------------------

export interface CursoPerfilDto {
  cur_id_int: number
  cur_uuid: string
  cur_nomb_vac: string
  cur_fec_inic_tmp: string | null
  cur_fec_fin_tmp: string | null
  // Pago asociado a este curso
  pago_estad_vac: string | null
  pago_mont_num: number | null
  pago_nro_vac: string | null
  // Certificado
  cert_url_vac: string | null
  cert_cod_vac: string | null
  cert_fec_emi_tmp: string | null
}

export interface EstudiantePerfilDto extends EstudianteAdminDto {
  estu_id_int: number
  cursos: CursoPerfilDto[]
}

/**
 * Perfil completo de un estudiante para el panel admin:
 * info personal + cursos inscritos + pago/certificado por curso.
 */
export async function getEstudiantePerfilAdmin(estuUuid: string): Promise<{
  success: boolean
  data?: EstudiantePerfilDto
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // -- 1. Datos básicos del estudiante --------------------------------------
    const { data: estData, error: estErr } = await supabase
      .from('estudiante')
      .select(`
        estu_id_int, estu_uuid, estu_nomb_vac, estu_apell_pat_vac,
        estu_apell_mat_vac, estu_gen_vac, estu_cre_tmp,
        usuarios (
          usr_uuid, usr_email_vac, usr_nomb_vac, usr_est_int, usr_origen_vac
        ),
        estudiante_curso ( est_cur_id_int )
      `)
      .eq('estu_uuid', estuUuid)
      .single()

    if (estErr || !estData) throw new AppError('Estudiante no encontrado', 'NOT_FOUND', 404)

    const e = estData as any
    const estuIdInt: number = e.estu_id_int

    // -- 2. Cursos en los que está inscrito -----------------------------------
    const { data: inscripciones } = await supabase
      .from('estudiante_curso')
      .select(`
        cur_id_int,
        curso:cur_id_int (
          cur_id_int, cur_uuid, cur_nomb_vac,
          cur_fec_inic_tmp, cur_fec_fin_tmp
        )
      `)
      .eq('est_id_int', estuIdInt)

    // -- 3. Pagos del estudiante -----------------------------------------------
    const { data: pagos } = await supabase
      .from('pago')
      .select('cur_id_int, pago_estad_vac, pago_mont_num, pago_nro_vac')
      .eq('estu_id_int', estuIdInt)
      .order('pago_cre_tmp', { ascending: false })

    // -- 4. Certificados del estudiante ----------------------------------------
    const { data: certs } = await supabase
      .from('certificado')
      .select('cur_id_int, cert_url_vac, cert_cod_vac, cert_fec_emi_tmp')
      .eq('estu_id_int', estuIdInt)

    // Indexar por cur_id_int (primer pago y primer cert por curso)
    const pagoMap = new Map<number, any>()
    ;(pagos ?? []).forEach((p: any) => {
      if (!pagoMap.has(p.cur_id_int)) pagoMap.set(p.cur_id_int, p)
    })
    const certMap = new Map<number, any>()
    ;(certs ?? []).forEach((c: any) => certMap.set(c.cur_id_int, c))

    // -- 5. Combinar -----------------------------------------------------------
    const cursos: CursoPerfilDto[] = (inscripciones ?? [])
      .map((row: any) => {
        const cur = Array.isArray(row.curso) ? row.curso[0] : row.curso
        if (!cur) return null
        const pago = pagoMap.get(cur.cur_id_int) ?? null
        const cert = certMap.get(cur.cur_id_int) ?? null
        return {
          cur_id_int:      cur.cur_id_int,
          cur_uuid:        cur.cur_uuid,
          cur_nomb_vac:    cur.cur_nomb_vac ?? '—',
          cur_fec_inic_tmp: cur.cur_fec_inic_tmp ?? null,
          cur_fec_fin_tmp:  cur.cur_fec_fin_tmp  ?? null,
          pago_estad_vac:  pago?.pago_estad_vac ?? null,
          pago_mont_num:   pago?.pago_mont_num   ?? null,
          pago_nro_vac:    pago?.pago_nro_vac    ?? null,
          cert_url_vac:    cert?.cert_url_vac    ?? null,
          cert_cod_vac:    cert?.cert_cod_vac    ?? null,
          cert_fec_emi_tmp: cert?.cert_fec_emi_tmp ?? null,
        } satisfies CursoPerfilDto
      })
      .filter((x): x is CursoPerfilDto => x !== null)

    return {
      success: true,
      data: {
        estu_id_int:        estuIdInt,
        estu_uuid:          e.estu_uuid,
        estu_nomb_vac:      e.estu_nomb_vac       ?? '',
        estu_apell_pat_vac: e.estu_apell_pat_vac  ?? '',
        estu_apell_mat_vac: e.estu_apell_mat_vac  ?? '',
        estu_gen_vac:       e.estu_gen_vac         ?? null,
        estu_cre_tmp:       e.estu_cre_tmp,
        usr_uuid:           e.usuarios?.usr_uuid   ?? '',
        usr_email_vac:      e.usuarios?.usr_email_vac ?? '',
        usr_nomb_vac:       e.usuarios?.usr_nomb_vac  ?? '',
        usr_est_int:        e.usuarios?.usr_est_int   ?? 0,
        usr_origen_vac:     e.usuarios?.usr_origen_vac ?? 'SISTEMA',
        cursos_count:       (e.estudiante_curso ?? []).length,
        cursos,
      },
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar perfil'
    return { success: false, error: msg }
  }
}

// --- Pagos ---------------------------------------------------------------------


export async function getPagosAdmin(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{
  success: boolean
  data?: PagoAdminDto[]
  meta?: { total: number; page: number; limit: number; totalPages: number }
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    let query = supabase
      .from('pago')
      .select(`
        pago_uuid,
        pago_id_int,
        estu_id_int,
        cur_id_int,
        pago_nro_vac,
        pago_mont_num,
        pago_estad_vac,
        pago_url_vac,
        pago_obs_vac,
        pago_cre_tmp,
        pago_upd_tmp,
        estudiante!inner (
          estu_nomb_vac,
          estu_apell_pat_vac,
          estu_apell_mat_vac
        ),
        curso ( cur_nomb_vac )
      `, { count: 'exact' })

    if (search) {
      const term = `%${search}%`
      query = query.or(`pago_nro_vac.ilike.${term},estudiante.estu_nomb_vac.ilike.${term},estudiante.estu_apell_pat_vac.ilike.${term}`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('pago_cre_tmp', { ascending: false })
      .range(from, to)

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    const result: PagoAdminDto[] = (data ?? []).map((p: any) => ({
      pago_uuid:           p.pago_uuid,
      pago_id_int:         p.pago_id_int,
      estu_id_int:         p.estu_id_int,
      cur_id_int:          p.cur_id_int,
      pago_nro_vac:        p.pago_nro_vac ?? null,
      pago_mont_num:       p.pago_mont_num ?? 0,
      pago_estad_vac:      p.pago_estad_vac ?? 'PENDIENTE',
      pago_url_vac:        p.pago_url_vac ?? null,
      pago_obs_vac:        p.pago_obs_vac ?? null,
      pago_cre_tmp:        p.pago_cre_tmp,
      pago_upd_tmp:        p.pago_upd_tmp,
      estudiante_nombre:   p.estudiante?.estu_nomb_vac ?? '—',
      estudiante_apellidos:
        [p.estudiante?.estu_apell_pat_vac, p.estudiante?.estu_apell_mat_vac]
          .filter(Boolean)
          .join(' ') || '—',
      curso_nombre: p.curso?.cur_nomb_vac ?? '—',
    }))

    return { 
      success: true, 
      data: result,
      meta: { total, page, limit, totalPages }
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar pagos'
    return { success: false, error: msg }
  }
}

export async function actualizarEstadoPago(
  pagoUuid: string,
  nuevoEstado: 'PENDIENTE' | 'ACEPTADO' | 'OBSERVADO',
  observacion?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Obtener pago actual para historial
    const { data: pagoActual, error: fetchErr } = await supabase
      .from('pago')
      .select('pago_id_int, pago_estad_vac, estu_id_int, cur_id_int')
      .eq('pago_uuid', pagoUuid)
      .single()

    if (fetchErr || !pagoActual) throw new AppError('Pago no encontrado', 'NOT_FOUND', 404)

    // Actualizar estado
    const updates: Record<string, any> = {
      pago_estad_vac: nuevoEstado,
      pago_upd_tmp: new Date().toISOString(),
    }
    if (observacion !== undefined) updates.pago_obs_vac = observacion

    const { error: updateErr } = await supabase
      .from('pago')
      .update(updates)
      .eq('pago_uuid', pagoUuid)

    if (updateErr) throw new AppError(updateErr.message, 'SERVER_ERROR', 500)

    // Si el pago es aceptado, matricular al estudiante
    if (nuevoEstado === 'ACEPTADO' && pagoActual.pago_estad_vac !== 'ACEPTADO') {
      const { createEstudianteCursoFromPago } = await import('@/repository/pago.repository')
      const matriculado = await createEstudianteCursoFromPago(pagoActual.estu_id_int, pagoActual.cur_id_int)
      if (!matriculado) {
        // Podríamos loguearlo, pero no bloqueamos el flujo
        console.error(`No se pudo crear la relación estudiante_curso para el pago ${pagoActual.pago_id_int}`)
      }
    }

    // Registrar en historial_pago
    await supabase.from('historial_pago').insert({
      hist_pag_acc_vac: `CAMBIO_ESTADO`,
      hist_pag_old_val_vac: pagoActual.pago_estad_vac,
      hist_pag_new_val_vac: nuevoEstado,
      pago_id_int: pagoActual.pago_id_int,
      usr_id_int: user.usr_id_int,
    })

    return { success: true }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al actualizar pago'
    return { success: false, error: msg }
  }
}

/**
 * Edita los campos de datos de un pago (monto, nro, observaciones).
 * El estado se maneja por separado con actualizarEstadoPago.
 */
export async function editarPagoAdmin(
  pagoUuid: string,
  input: {
    pagoMontNum: number
    pagoNroVac: string | null
    pagoObsVac: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { error } = await supabase
      .from('pago')
      .update({
        pago_mont_num: input.pagoMontNum,
        pago_nro_vac:  input.pagoNroVac  || null,
        pago_obs_vac:  input.pagoObsVac  || null,
        pago_upd_tmp:  new Date().toISOString(),
      })
      .eq('pago_uuid', pagoUuid)

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)
    return { success: true }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al editar pago'
    return { success: false, error: msg }
  }
}

/**
 * Elimina un pago. Solo permitido si:
 *   1. El estado es PENDIENTE.
 *   2. El alumno NO tiene un registro activo en estudiante_curso para ese curso.
 */
export async function eliminarPagoAdmin(
  pagoUuid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Obtener datos del pago
    const { data: pago, error: fetchErr } = await supabase
      .from('pago')
      .select('pago_id_int, pago_estad_vac, estu_id_int, cur_id_int')
      .eq('pago_uuid', pagoUuid)
      .maybeSingle()

    if (fetchErr || !pago) throw new AppError('Pago no encontrado', 'NOT_FOUND', 404)

    // Regla 1: solo PENDIENTE
    if (pago.pago_estad_vac !== 'PENDIENTE') {
      return {
        success: false,
        error: 'Solo se pueden eliminar pagos en estado PENDIENTE.',
      }
    }

    // Regla 2: sin relación activa en estudiante_curso
    const { data: inscripcion } = await supabase
      .from('estudiante_curso')
      .select('est_cur_id_int')
      .eq('est_id_int', pago.estu_id_int)
      .eq('cur_id_int', pago.cur_id_int)
      .maybeSingle()

    if (inscripcion) {
      return {
        success: false,
        error: 'No se puede eliminar: el alumno ya está inscrito en este curso.',
      }
    }

    // Eliminar
    const { error: delErr } = await supabase
      .from('pago')
      .delete()
      .eq('pago_uuid', pagoUuid)

    if (delErr) throw new AppError(delErr.message, 'SERVER_ERROR', 500)
    return { success: true }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al eliminar pago'
    return { success: false, error: msg }
  }
}

/**
 * Genera una URL firmada (1 hora) para que el admin pueda ver
 * el comprobante de pago almacenado en el bucket privado.
 */
export async function getVoucherSignedUrl(
  pagoUuid: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data: pago, error: fetchErr } = await supabase
      .from('pago')
      .select('pago_url_vac')
      .eq('pago_uuid', pagoUuid)
      .single()

    if (fetchErr || !pago?.pago_url_vac) {
      return { success: false, error: 'Comprobante no encontrado' }
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from('student-private')
      .createSignedUrl(pago.pago_url_vac, 3600) // 1 hora

    if (signErr || !signed?.signedUrl) {
      return { success: false, error: 'No se pudo generar el enlace' }
    }

    return { success: true, url: signed.signedUrl }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al obtener comprobante'
    return { success: false, error: msg }
  }
}

/**
 * Lista simplificada de estudiantes para el selector del formulario de nuevo pago.
 */
export async function getEstudiantesSelectAdmin(): Promise<{
  success: boolean
  data?: EstudianteSelectDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data, error } = await supabase
      .from('estudiante')
      .select('estu_id_int, estu_nomb_vac, estu_apell_pat_vac, estu_apell_mat_vac')
      .order('estu_apell_pat_vac', { ascending: true })

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

    const result: EstudianteSelectDto[] = (data ?? []).map((e: any) => ({
      estu_id_int: e.estu_id_int,
      nombre_completo: [e.estu_nomb_vac, e.estu_apell_pat_vac, e.estu_apell_mat_vac]
        .filter(Boolean).join(' '),
    }))

    return { success: true, data: result }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar estudiantes'
    return { success: false, error: msg }
  }
}

/**
 * Lista de cursos activos con precio para el selector del formulario de nuevo pago.
 */
export async function getCursosSelectAdmin(): Promise<{
  success: boolean
  data?: CursoSelectDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data, error } = await supabase
      .from('curso')
      .select('cur_id_int, cur_uuid, cur_nomb_vac, cur_precio_num')
      .eq('cur_est_int', 1)
      .order('cur_nomb_vac', { ascending: true })

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

    const result: CursoSelectDto[] = (data ?? []).map((c: any) => ({
      cur_id_int:    c.cur_id_int,
      cur_uuid:      c.cur_uuid,
      cur_nomb_vac:  c.cur_nomb_vac  ?? '—',
      cur_precio_num: Number(c.cur_precio_num ?? 0),
    }))

    return { success: true, data: result }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar cursos'
    return { success: false, error: msg }
  }
}

/**
 * Crea un nuevo pago generado por el admin.
 * Verifica que el alumno no tenga ya un pago registrado para ese curso.
 */
export async function crearPagoAdmin(input: {
  estuIdInt: number
  curIdInt: number
  pagoMontNum: number
  pagoNroVac?: string
  pagoEstadVac: 'PENDIENTE' | 'ACEPTADO'
  pagoObsVac?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Verificar duplicado: mismo alumno + mismo curso
    const { data: existing } = await supabase
      .from('pago')
      .select('pago_id_int')
      .eq('estu_id_int', input.estuIdInt)
      .eq('cur_id_int', input.curIdInt)
      .maybeSingle()

    if (existing) {
      return {
        success: false,
        error: 'Este alumno ya tiene un pago registrado para este curso.',
      }
    }

    const now = new Date().toISOString()
    const { error } = await supabase.from('pago').insert({
      estu_id_int:    input.estuIdInt,
      cur_id_int:     input.curIdInt,
      pago_mont_num:  input.pagoMontNum,
      pago_nro_vac:   input.pagoNroVac   || null,
      pago_estad_vac: input.pagoEstadVac,
      pago_obs_vac:   input.pagoObsVac   || null,
      pago_cre_tmp:   now,
      pago_upd_tmp:   now,
    })

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

    // Si el pago se crea directamente como ACEPTADO, matricular al estudiante
    if (input.pagoEstadVac === 'ACEPTADO') {
      const { createEstudianteCursoFromPago } = await import('@/repository/pago.repository')
      await createEstudianteCursoFromPago(input.estuIdInt, input.curIdInt)
    }

    return { success: true }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al crear pago'
    return { success: false, error: msg }
  }
}

// --- Auditoría -----------------------------------------------------------------


export async function getAuditoriaAdmin(): Promise<{
  success: boolean
  data?: AuditoriaItemDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const [pagosRes, cursosRes, matriculasRes] = await Promise.all([
      supabase
        .from('historial_pago')
        .select('hist_pag_acc_vac, hist_pag_old_val_vac, hist_pag_new_val_vac, hist_pag_cre_tmp, usuarios(usr_nomb_vac)')
        .order('hist_pag_cre_tmp', { ascending: false })
        .limit(50),
      supabase
        .from('historial_curso')
        .select('hist_cur_acc_vac, hist_cur_old_val_vac, hist_cur_new_val_vac, hist_cur_cre_tmp, usuarios(usr_nomb_vac)')
        .order('hist_cur_cre_tmp', { ascending: false })
        .limit(50),
      supabase
        .from('historial_estudiante_curso')
        .select('hist_estu_cur_acc_vac, hist_estu_old_val_vac, hist_estu_new_val_vac, hist_estu_cre_tmp, usuarios(usr_nomb_vac)')
        .order('hist_estu_cre_tmp', { ascending: false })
        .limit(50),
    ])

    const items: AuditoriaItemDto[] = []

    for (const p of pagosRes.data ?? []) {
      items.push({
        tipo: 'PAGO',
        descripcion: `Pago actualizado: ${p.hist_pag_old_val_vac} → ${p.hist_pag_new_val_vac}`,
        fecha: p.hist_pag_cre_tmp,
        responsable: (p as any).usuarios?.usr_nomb_vac ?? 'Sistema',
        accion: p.hist_pag_acc_vac ?? '',
      })
    }

    for (const c of cursosRes.data ?? []) {
      items.push({
        tipo: 'CURSO',
        descripcion: `Curso modificado: ${c.hist_cur_acc_vac}`,
        fecha: c.hist_cur_cre_tmp,
        responsable: (c as any).usuarios?.usr_nomb_vac ?? 'Sistema',
        accion: c.hist_cur_acc_vac ?? '',
      })
    }

    for (const m of matriculasRes.data ?? []) {
      items.push({
        tipo: 'MATRICULA',
        descripcion: `Matrícula ${m.hist_estu_cur_acc_vac?.toLowerCase() ?? 'actualizada'}`,
        fecha: m.hist_estu_cre_tmp,
        responsable: (m as any).usuarios?.usr_nomb_vac ?? 'Sistema',
        accion: m.hist_estu_cur_acc_vac ?? '',
      })
    }

    // Ordenar por fecha desc
    items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    return { success: true, data: items.slice(0, 100) }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar auditoría'
    return { success: false, error: msg }
  }
}

// --- Asistencia masiva ---------------------------------------------------------

export async function registrarAsistenciaMasiva(
  sesionIdInt: string,
  asistencias: { usuarioUuid: string; estado: number }[]
): Promise<{ success: boolean; registrados: number; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    // Resolver sesion_clase id
    const { data: sesion, error: sesErr } = await supabase
      .from('sesion_clase')
      .select('ses_id_int')
      .eq('ses_id_int', parseInt(sesionIdInt))
      .single()

    if (sesErr || !sesion) throw new AppError('Sesión no encontrada', 'NOT_FOUND', 404)

    // Resolver usr_id_int desde usr_uuid
    const uuids = asistencias.map((a) => a.usuarioUuid)
    const { data: usuarios, error: usrErr } = await supabase
      .from('usuarios')
      .select('usr_id_int, usr_uuid')
      .in('usr_uuid', uuids)

    if (usrErr) throw new AppError(usrErr.message, 'SERVER_ERROR', 500)

    const uuidToId: Record<string, number> = {}
    for (const u of usuarios ?? []) {
      uuidToId[u.usr_uuid] = u.usr_id_int
    }

    const inserts = asistencias
      .filter((a) => uuidToId[a.usuarioUuid])
      .map((a) => ({
        ses_id_int: sesion.ses_id_int,
        usr_id_int: uuidToId[a.usuarioUuid],
        asist_est_int: a.estado,
      }))

    if (inserts.length === 0) return { success: true, registrados: 0 }

    const { error: insErr } = await supabase
      .from('asistencia')
      .upsert(inserts, { onConflict: 'ses_id_int,usr_id_int' })

    if (insErr) throw new AppError(insErr.message, 'SERVER_ERROR', 500)

    return { success: true, registrados: inserts.length }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al registrar asistencia'
    return { success: false, registrados: 0, error: msg }
  }
}

// --- Upload imagen de curso -----------------------------------------------------

export async function uploadCursoImagen(formData: FormData): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const file = formData.get('file') as File | null
    const cursoNombre = (formData.get('cursoNombre') as string) || 'CURSO'
    if (!file) return { success: false, error: 'No se recibió ningún archivo' }

    // Validar tipo
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      return { success: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' }
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'La imagen no debe superar 5MB' }
    }

    // Generar nombre: NOMBRE-CURSO-DD-MM-YYYY-HH-mm-ss.ext
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    const hh = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')

    const cleanCurso = cursoNombre
      .toUpperCase()
      .substring(0, 30)
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9-]/g, '')

    const filename = `${cleanCurso}-${dd}-${mm}-${yyyy}-${hh}-${mins}-${ss}.${ext}`
    const path = `curso/${filename}`

    const { error: uploadErr } = await supabase.storage
      .from('public_assets')
      .upload(path, file, { cacheControl: '3600', upsert: true })

    if (uploadErr) {
      return { success: false, error: `Error al subir: ${uploadErr.message}` }
    }

    // URL pública permanente (bucket público)
    const { data } = supabase.storage.from('public_assets').getPublicUrl(path)

    return { success: true, url: data.publicUrl }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al subir imagen'
    return { success: false, error: msg }
  }
}

// --- Eliminar imagen de curso del bucket ----------------------------------------

export async function deleteCursoImagen(publicUrl: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Extraer el path relativo del bucket a partir de la URL pública
    // URL pública: https://xxx.supabase.co/storage/v1/object/public/public_assets/curso/FILENAME.ext
    const marker = '/public_assets/'
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return { success: false, error: 'URL no válida para este bucket' }

    const storagePath = publicUrl.substring(idx + marker.length) // "curso/FILENAME.ext"

    const { error } = await supabase.storage
      .from('public_assets')
      .remove([storagePath])

    if (error) {
      console.error('Error deleting curso image:', error)
      return { success: false, error: `Error al eliminar imagen: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al eliminar imagen'
    return { success: false, error: msg }
  }
}

// --- Módulos (admin) -----------------------------------------------------------

export interface ModuloAdminDto {
  mod_uuid: string
  mod_nomb_vac: string
  mod_desc_vac: string
  mod_est_int: number
  mod_cre_tmp: string
  apartados: ApartadoAdminDto[]
}

export interface ItemApartadoDto {
  item_uuid: string
  item_tipo_vac: string          // 'VIDEO' | 'ARCHIVO' | 'TEXTO' | 'LINK'
  item_titulo_vac: string
  item_url_vac: string | null
  item_est_int: number
  item_ordn_inte: number
}

export interface ApartadoAdminDto {
  apar_uuid: string
  apar_nomb_vac: string
  apar_desc_vac: string
  apar_est_int: number
  apar_ordn_int: number
  items: ItemApartadoDto[]
}


export async function getModulosByCursoAdmin(curUuid: string): Promise<{
  success: boolean
  data?: ModuloAdminDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Resolver cur_id_int desde cur_uuid
    const { data: curso, error: cErr } = await supabase
      .from('curso')
      .select('cur_id_int')
      .eq('cur_uuid', curUuid)
      .single()

    if (cErr || !curso) return { success: false, error: 'Curso no encontrado' }

    const { data, error } = await supabase
      .from('modulo')
      .select(`
        mod_uuid,
        mod_nomb_vac,
        mod_desc_vac,
        mod_est_int,
        mod_cre_tmp,
        apartado (
          apar_uuid,
          apar_nomb_vac,
          apar_desc_vac,
          apar_est_int,
          apar_ordn_int,
          item_apartado (
            item_apar_uuid,
            item_apar_tipo_vac,
            item_apar_titulo_vac,
            item_apar_url_vac,
            item_apar_est_int,
            item_apar_ordn_inte
          )
        )
      `)
      .eq('cur_id_int', curso.cur_id_int)
      .order('mod_cre_tmp', { ascending: true })

    if (error) {
      console.error('[getModulosByCursoAdmin] Supabase error:', error.message)
      return { success: false, error: error.message }
    }

    const result: ModuloAdminDto[] = (data ?? []).map((m: any) => ({
      mod_uuid: m.mod_uuid,
      mod_nomb_vac: m.mod_nomb_vac ?? '',
      mod_desc_vac: m.mod_desc_vac ?? '',
      mod_est_int: m.mod_est_int ?? 1,
      mod_cre_tmp: m.mod_cre_tmp ?? '',
      apartados: (m.apartado ?? [])
        .sort((x: any, y: any) => (x.apar_ordn_int ?? 0) - (y.apar_ordn_int ?? 0))
        .map((a: any) => ({
          apar_uuid: a.apar_uuid,
          apar_nomb_vac: a.apar_nomb_vac ?? '',
          apar_desc_vac: a.apar_desc_vac ?? '',
          apar_est_int: a.apar_est_int ?? 1,
          apar_ordn_int: a.apar_ordn_int ?? 0,
          items: (a.item_apartado ?? [])
            .sort((x: any, y: any) => (x.item_apar_ordn_inte ?? 0) - (y.item_apar_ordn_inte ?? 0))
            .map((it: any) => ({
              item_uuid: it.item_apar_uuid,
              item_tipo_vac: it.item_apar_tipo_vac ?? 'TEXTO',
              item_titulo_vac: it.item_apar_titulo_vac ?? '',
              item_url_vac: it.item_apar_url_vac ?? null,
              item_est_int: it.item_apar_est_int ?? 1,
              item_ordn_inte: it.item_apar_ordn_inte ?? 0,
            })),
        })),
    }))

    return { success: true, data: result }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar módulos'
    return { success: false, error: msg }
  }
}

// --- CRUD Módulos --------------------------------------------------------------

export async function crearModulo(
  curUuid: string,
  datos: { nombre: string; descripcion: string; estado: number }
): Promise<{ success: boolean; data?: ModuloAdminDto; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data: curso, error: cErr } = await supabase
      .from('curso').select('cur_id_int').eq('cur_uuid', curUuid).single()
    if (cErr || !curso) return { success: false, error: 'Curso no encontrado' }

    const { data, error } = await supabase
      .from('modulo')
      .insert({
        cur_id_int: curso.cur_id_int,
        mod_nomb_vac: datos.nombre,
        mod_desc_vac: datos.descripcion,
        mod_est_int: datos.estado,
      })
      .select('mod_uuid, mod_nomb_vac, mod_desc_vac, mod_est_int, mod_cre_tmp')
      .single()

    if (error) return { success: false, error: error.message }
    const m = data as any
    return {
      success: true,
      data: {
        mod_uuid: m.mod_uuid,
        mod_nomb_vac: m.mod_nomb_vac ?? '',
        mod_desc_vac: m.mod_desc_vac ?? '',
        mod_est_int: m.mod_est_int ?? 1,
        mod_cre_tmp: m.mod_cre_tmp ?? '',
        apartados: [],
      },
    }
  } catch (error) {
    return { success: false, error: 'Error al crear módulo' }
  }
}

export async function actualizarModulo(
  modUuid: string,
  datos: { nombre?: string; descripcion?: string; estado?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const updates: Record<string, any> = { mod_upd_tmp: new Date().toISOString() }
    if (datos.nombre !== undefined) updates.mod_nomb_vac = datos.nombre
    if (datos.descripcion !== undefined) updates.mod_desc_vac = datos.descripcion
    if (datos.estado !== undefined) updates.mod_est_int = datos.estado

    const { error } = await supabase
      .from('modulo').update(updates).eq('mod_uuid', modUuid)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al actualizar módulo' }
  }
}

export async function eliminarModulo(
  modUuid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { error } = await supabase
      .from('modulo').delete().eq('mod_uuid', modUuid)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar módulo' }
  }
}

// --- CRUD Apartados ------------------------------------------------------------

export async function crearApartado(
  modUuid: string,
  datos: { nombre: string; descripcion: string; estado: number; orden?: number }
): Promise<{ success: boolean; data?: ApartadoAdminDto; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data: modulo, error: mErr } = await supabase
      .from('modulo').select('mod_id_int').eq('mod_uuid', modUuid).single()
    if (mErr || !modulo) return { success: false, error: 'Módulo no encontrado' }

    const { data, error } = await supabase
      .from('apartado')
      .insert({
        mod_id_int: modulo.mod_id_int,
        apar_nomb_vac: datos.nombre,
        apar_desc_vac: datos.descripcion,
        apar_est_int: datos.estado,
        apar_ordn_int: datos.orden ?? 0,
      })
      .select('apar_uuid, apar_nomb_vac, apar_desc_vac, apar_est_int, apar_ordn_int')
      .single()

    if (error) return { success: false, error: error.message }
    const a = data as any
    return {
      success: true,
      data: {
        apar_uuid: a.apar_uuid,
        apar_nomb_vac: a.apar_nomb_vac ?? '',
        apar_desc_vac: a.apar_desc_vac ?? '',
        apar_est_int: a.apar_est_int ?? 1,
        apar_ordn_int: a.apar_ordn_int ?? 0,
        items: [],
      },
    }
  } catch (error) {
    return { success: false, error: 'Error al crear apartado' }
  }
}

export async function actualizarApartado(
  aparUuid: string,
  datos: { nombre?: string; descripcion?: string; estado?: number; orden?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const updates: Record<string, any> = { apar_upd_tmp: new Date().toISOString() }
    if (datos.nombre !== undefined) updates.apar_nomb_vac = datos.nombre
    if (datos.descripcion !== undefined) updates.apar_desc_vac = datos.descripcion
    if (datos.estado !== undefined) updates.apar_est_int = datos.estado
    if (datos.orden !== undefined) updates.apar_ordn_int = datos.orden

    const { error } = await supabase
      .from('apartado').update(updates).eq('apar_uuid', aparUuid)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al actualizar apartado' }
  }
}

export async function eliminarApartado(
  aparUuid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { error } = await supabase
      .from('apartado').delete().eq('apar_uuid', aparUuid)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar apartado' }
  }
}

// --- CRUD Items de Apartado ----------------------------------------------------

export async function crearItem(
  aparUuid: string,
  datos: { tipo: string; titulo: string; url: string | null; estado: number; orden: number }
): Promise<{ success: boolean; data?: ItemApartadoDto; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data: ap, error: aErr } = await supabase
      .from('apartado').select('apar_id_int').eq('apar_uuid', aparUuid).single()
    if (aErr || !ap) return { success: false, error: 'Apartado no encontrado' }

    const { data, error } = await supabase
      .from('item_apartado')
      .insert({
        apar_id_int: ap.apar_id_int,
        item_apar_tipo_vac: datos.tipo,
        item_apar_titulo_vac: datos.titulo,
        item_apar_url_vac: datos.url || null,
        item_apar_est_int: datos.estado,
        item_apar_ordn_inte: datos.orden,
      })
      .select('item_apar_uuid, item_apar_tipo_vac, item_apar_titulo_vac, item_apar_url_vac, item_apar_est_int, item_apar_ordn_inte')
      .single()

    if (error) return { success: false, error: error.message }
    const it = data as any
    return {
      success: true,
      data: {
        item_uuid: it.item_apar_uuid,
        item_tipo_vac: it.item_apar_tipo_vac ?? 'TEXTO',
        item_titulo_vac: it.item_apar_titulo_vac ?? '',
        item_url_vac: it.item_apar_url_vac ?? null,
        item_est_int: it.item_apar_est_int ?? 1,
        item_ordn_inte: it.item_apar_ordn_inte ?? 0,
      },
    }
  } catch (error) {
    return { success: false, error: 'Error al crear item' }
  }
}

export async function actualizarItem(
  itemUuid: string,
  datos: { tipo?: string; titulo?: string; url?: string | null; estado?: number; orden?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const updates: Record<string, any> = { item_apar_upd_tmp: new Date().toISOString() }
    if (datos.tipo !== undefined) updates.item_apar_tipo_vac = datos.tipo
    if (datos.titulo !== undefined) updates.item_apar_titulo_vac = datos.titulo
    if (datos.url !== undefined) updates.item_apar_url_vac = datos.url || null
    if (datos.estado !== undefined) updates.item_apar_est_int = datos.estado
    if (datos.orden !== undefined) updates.item_apar_ordn_inte = datos.orden

    const { error } = await supabase
      .from('item_apartado').update(updates).eq('item_apar_uuid', itemUuid)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al actualizar item' }
  }
}

export async function eliminarItem(
  itemUuid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { error } = await supabase
      .from('item_apartado').delete().eq('item_apar_uuid', itemUuid)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar item' }
  }
}

// --- Desactivación en cascada --------------------------------------------------

export async function desactivarModuloCascada(
  modUuid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Resolver mod_id_int
    const { data: modulo, error: mErr } = await supabase
      .from('modulo')
      .select('mod_id_int')
      .eq('mod_uuid', modUuid)
      .single()

    if (mErr || !modulo) return { success: false, error: 'Módulo no encontrado' }

    const now = new Date().toISOString()

    // 1. Desactivar el módulo
    const { error: e1 } = await supabase
      .from('modulo')
      .update({ mod_est_int: 0, mod_upd_tmp: now })
      .eq('mod_uuid', modUuid)

    if (e1) return { success: false, error: e1.message }

    // 2. Obtener apartados del módulo
    const { data: apartados } = await supabase
      .from('apartado')
      .select('apar_id_int')
      .eq('mod_id_int', modulo.mod_id_int)

    if (apartados && apartados.length > 0) {
      const aparIds = apartados.map((a: any) => a.apar_id_int)

      // 3. Desactivar todos los apartados
      const { error: e2 } = await supabase
        .from('apartado')
        .update({ apar_est_int: 0, apar_upd_tmp: now })
        .eq('mod_id_int', modulo.mod_id_int)

      if (e2) return { success: false, error: e2.message }

      // 4. Desactivar todos los items de esos apartados
      const { error: e3 } = await supabase
        .from('item_apartado')
        .update({ item_apar_est_int: 0, item_apar_upd_tmp: now })
        .in('apar_id_int', aparIds)

      if (e3) return { success: false, error: e3.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al desactivar módulo en cascada' }
  }
}

export async function desactivarApartadoCascada(
  aparUuid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Resolver apar_id_int
    const { data: apartado, error: aErr } = await supabase
      .from('apartado')
      .select('apar_id_int')
      .eq('apar_uuid', aparUuid)
      .single()

    if (aErr || !apartado) return { success: false, error: 'Apartado no encontrado' }

    const now = new Date().toISOString()

    // 1. Desactivar el apartado
    const { error: e1 } = await supabase
      .from('apartado')
      .update({ apar_est_int: 0, apar_upd_tmp: now })
      .eq('apar_uuid', aparUuid)

    if (e1) return { success: false, error: e1.message }

    // 2. Desactivar todos los items del apartado
    const { error: e2 } = await supabase
      .from('item_apartado')
      .update({ item_apar_est_int: 0, item_apar_upd_tmp: now })
      .eq('apar_id_int', apartado.apar_id_int)

    if (e2) return { success: false, error: e2.message }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al desactivar apartado en cascada' }
  }
}

// --- Certificados Admin --------------------------------------------------------

/**
 * Lista todos los cursos con estadísticas de certificados emitidos.
 */
export async function getCursosConCertificadosAdmin(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{
  success: boolean
  data?: CursoCertificadoDto[]
  meta?: { total: number; page: number; limit: number; totalPages: number }
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Cursos con sus inscritos y certificados
    let query = supabase
      .from('curso')
      .select(`
        cur_id_int,
        cur_uuid,
        cur_nomb_vac,
        cur_fec_inic_tmp,
        cur_fec_fin_tmp,
        estudiante_curso ( est_cur_id_int ),
        certificado ( cert_id_int )
      `, { count: 'exact' })
      .eq('cur_est_int', 1)

    if (search) {
      const term = `%${search}%`
      query = query.ilike('cur_nomb_vac', term)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('cur_fec_inic_tmp', { ascending: false })
      .range(from, to)

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    const result: CursoCertificadoDto[] = (data ?? []).map((c: any) => ({
      cur_id_int:       c.cur_id_int,
      cur_uuid:         c.cur_uuid,
      cur_nomb_vac:     c.cur_nomb_vac ?? '—',
      cur_fec_inic_tmp: c.cur_fec_inic_tmp ?? null,
      cur_fec_fin_tmp:  c.cur_fec_fin_tmp  ?? null,
      total_inscritos:  (c.estudiante_curso ?? []).length,
      certs_emitidos:   (c.certificado ?? []).length,
    }))

    return { 
      success: true, 
      data: result,
      meta: { total, page, limit, totalPages }
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar cursos'
    return { success: false, error: msg }
  }
}

/**
 * Lista los alumnos inscritos en un curso junto con su certificado (si existe).
 */
export async function getEstudiantesParaCertificado(curIdInt: number): Promise<{
  success: boolean
  data?: EstudianteCertificadoDto[]
  cursoNombre?: string
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Nombre del curso
    const { data: cursoData } = await supabase
      .from('curso')
      .select('cur_nomb_vac')
      .eq('cur_id_int', curIdInt)
      .single()

    // Alumnos inscritos
    const { data: inscritos, error: inscErr } = await supabase
      .from('estudiante_curso')
      .select(`
        est_id_int,
        estudiante!est_id_int (
          estu_id_int,
          estu_uuid,
          estu_nomb_vac,
          estu_apell_pat_vac,
          estu_apell_mat_vac
        )
      `)
      .eq('cur_id_int', curIdInt)
      .eq('est_cur_estado_bol', true)

    if (inscErr) throw new AppError(inscErr.message, 'SERVER_ERROR', 500)

    // Certificados existentes para este curso
    const { data: certs } = await supabase
      .from('certificado')
      .select('cert_id_int, cert_uuid, cert_cod_vac, cert_url_vac, cert_fec_emi_tmp, estu_id_int')
      .eq('cur_id_int', curIdInt)

    // Indexar certificados por estu_id_int para O(1) lookup
    const certMap = new Map<number, any>()
    ;(certs ?? []).forEach((c: any) => certMap.set(c.estu_id_int, c))

    const result: EstudianteCertificadoDto[] = (inscritos ?? [])
      .map((row: any) => {
        const est = Array.isArray(row.estudiante) ? row.estudiante[0] : row.estudiante
        if (!est) return null
        const cert = certMap.get(est.estu_id_int) ?? null
        return {
          estu_id_int:        est.estu_id_int,
          estu_uuid:          est.estu_uuid,
          estu_nomb_vac:      est.estu_nomb_vac      ?? '',
          estu_apell_pat_vac: est.estu_apell_pat_vac ?? '',
          estu_apell_mat_vac: est.estu_apell_mat_vac ?? null,
          cert_id_int:        cert?.cert_id_int   ?? null,
          cert_uuid:          cert?.cert_uuid      ?? null,
          cert_cod_vac:       cert?.cert_cod_vac   ?? null,
          cert_url_vac:       cert?.cert_url_vac   ?? null,
          cert_fec_emi_tmp:   cert?.cert_fec_emi_tmp ?? null,
        } satisfies EstudianteCertificadoDto
      })
      .filter((x): x is EstudianteCertificadoDto => x !== null)

    return {
      success: true,
      data: result,
      cursoNombre: cursoData?.cur_nomb_vac ?? '—',
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar estudiantes'
    return { success: false, error: msg }
  }
}

/**
 * Crea o actualiza el certificado de un alumno en un curso.
 * Si ya existe (estu_id_int + cur_id_int) hace UPDATE, si no hace INSERT.
 */
export async function upsertCertificado(input: {
  estuIdInt: number
  curIdInt: number
  certCodVac: string
  certUrlVac: string
  certFecEmiTmp: string   // ISO string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('certificado')
      .select('cert_id_int')
      .eq('estu_id_int', input.estuIdInt)
      .eq('cur_id_int', input.curIdInt)
      .maybeSingle()

    if (existing) {
      // UPDATE
      const { error } = await supabase
        .from('certificado')
        .update({
          cert_cod_vac:    input.certCodVac,
          cert_url_vac:    input.certUrlVac,
          cert_fec_emi_tmp: input.certFecEmiTmp,
          cert_update_at:  new Date().toISOString(),
        })
        .eq('cert_id_int', existing.cert_id_int)

      if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)
    } else {
      // INSERT
      const { error } = await supabase
        .from('certificado')
        .insert({
          estu_id_int:     input.estuIdInt,
          cur_id_int:      input.curIdInt,
          cert_cod_vac:    input.certCodVac,
          cert_url_vac:    input.certUrlVac,
          cert_fec_emi_tmp: input.certFecEmiTmp,
          cert_created_at: new Date().toISOString(),
          cert_update_at:  new Date().toISOString(),
        })

      if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)
    }

    return { success: true }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al guardar certificado'
    return { success: false, error: msg }
  }
}

// --- Perfil de usuario (admin/coordinador logueado) ---------------------------

export interface PerfilUsuarioDto {
  usr_uuid: string
  usr_nomb_vac: string
  usr_email_vac: string
  usr_est_int: number
  usr_mod_bol: boolean
  usr_cre_tmp: string | null
  usr_upd_tmp: string | null
  rol_nam_vc: string
  permiso_cod_vac: string[]
  // Sesiones activas del usuario
  sesiones_count: number
}

/**
 * Devuelve el perfil completo del usuario autenticado actualmente.
 */
export async function getPerfilAdmin(): Promise<{
  success: boolean
  data?: PerfilUsuarioDto
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    // Datos frescos de la tabla usuarios
    const { data: u, error: uErr } = await supabase
      .from('usuarios')
      .select(`
        usr_uuid, usr_nomb_vac, usr_email_vac,
        usr_est_int, usr_mod_bol, usr_cre_tmp, usr_upd_tmp
      `)
      .eq('usr_id_int', user.usr_id_int)
      .single()

    if (uErr || !u) throw new AppError('Usuario no encontrado', 'NOT_FOUND', 404)

    // Sesiones activas
    const { count: sesCount } = await supabase
      .from('sesion')
      .select('ses_uuid', { count: 'exact', head: true })
      .eq('usr_id_int', user.usr_id_int)
      .eq('ses_revocada_bol', false)
      .gt('ses_expira_tmp', new Date().toISOString())

    return {
      success: true,
      data: {
        usr_uuid:        u.usr_uuid,
        usr_nomb_vac:    u.usr_nomb_vac    ?? '',
        usr_email_vac:   u.usr_email_vac   ?? '',
        usr_est_int:     u.usr_est_int     ?? 1,
        usr_mod_bol:     u.usr_mod_bol     ?? false,
        usr_cre_tmp:     u.usr_cre_tmp     ?? null,
        usr_upd_tmp:     u.usr_upd_tmp     ?? null,
        rol_nam_vc:      user.rol_nam_vc   ?? '—',
        permiso_cod_vac: user.permiso_cod_vac ?? [],
        sesiones_count:  sesCount ?? 0,
      },
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar perfil'
    return { success: false, error: msg }
  }
}

/**
 * Actualiza el nombre y/o la preferencia de modo oscuro
 * del usuario autenticado actualmente.
 */
export async function actualizarPerfilAdmin(input: {
  usrNombVac?: string
  usrModBol?: boolean
  usrEmailVac?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)



    const dbUpdates: string[] = [`usr_upd_tmp = NOW()`]
    const dbValues: any[] = []
    let counter = 1

    if (input.usrNombVac !== undefined) {
      dbUpdates.push(`usr_nomb_vac = $${counter++}`)
      dbValues.push(input.usrNombVac.trim())
    }
    if (input.usrModBol !== undefined) {
      dbUpdates.push(`usr_mod_bol = $${counter++}`)
      dbValues.push(input.usrModBol)
    }
    if (input.usrEmailVac !== undefined) {
      dbUpdates.push(`usr_email_vac = $${counter++}`)
      dbValues.push(input.usrEmailVac.trim())
    }

    if (dbValues.length === 0) return { success: true }

    // Use unsafe since dynamic SET clauses are required
    await import('@/lib/db').then(({ sql }) => sql.unsafe(`
      UPDATE usuarios
      SET ${dbUpdates.join(', ')}
      WHERE usr_id_int = $${counter}
    `, [...dbValues, user.usr_id_int]))

    return { success: true }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al actualizar perfil'
    return { success: false, error: msg }
  }
}
