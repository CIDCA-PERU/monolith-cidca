'use server'

import { supabase } from '@/lib/supabase'
import { assertAuthenticated, assertAdminOrCoordinador, assertDashboard } from '@/lib/auth-guards'
import { AppError } from '@/lib/errors'

// ─── Tipos internos ────────────────────────────────────────────────────────────

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
  cursos_count: number
}

export interface PagoAdminDto {
  pago_uuid: string
  pago_nro_vac: string | null
  pago_mont_num: number
  pago_estad_vac: 'PENDIENTE' | 'PAGADO' | 'OBSERVADO'
  pago_url_vac: string | null
  pago_obs_vac: string | null
  pago_cre_tmp: string
  pago_upd_tmp: string
  estudiante_nombre: string
  estudiante_apellidos: string
  curso_nombre: string
}

export interface AuditoriaItemDto {
  tipo: 'PAGO' | 'CURSO' | 'MATRICULA'
  descripcion: string
  fecha: string
  responsable: string
  accion: string
}

// ─── Cursos ────────────────────────────────────────────────────────────────────

export async function getCursosAdmin(): Promise<{
  success: boolean
  data?: CursoAdminDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const { data, error } = await supabase
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
      `)
      .order('cur_cre_tmp', { ascending: false })

    if (error) {
      console.error('[getCursosAdmin] Supabase error:', error.message)
      throw new AppError(error.message, 'SERVER_ERROR', 500)
    }

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

    return { success: true, data: result }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar cursos'
    return { success: false, error: msg }
  }
}

// ─── Estudiantes ───────────────────────────────────────────────────────────────

export async function getEstudiantesAdmin(): Promise<{
  success: boolean
  data?: EstudianteAdminDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data, error } = await supabase
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
          usr_est_int
        ),
        estudiante_curso ( est_cur_id_int )
      `)
      .order('estu_cre_tmp', { ascending: false })

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

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
      cursos_count: (e.estudiante_curso ?? []).length,
    }))

    return { success: true, data: result }
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
          usr_uuid, usr_email_vac, usr_nomb_vac, usr_est_int
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
        cursos_count: (e.estudiante_curso ?? []).length,
      },
    }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar estudiante'
    return { success: false, error: msg }
  }
}

// ─── Pagos ─────────────────────────────────────────────────────────────────────

export async function getPagosAdmin(): Promise<{
  success: boolean
  data?: PagoAdminDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const { data, error } = await supabase
      .from('pago')
      .select(`
        pago_uuid,
        pago_nro_vac,
        pago_mont_num,
        pago_estad_vac,
        pago_url_vac,
        pago_obs_vac,
        pago_cre_tmp,
        pago_upd_tmp,
        estudiante (
          estu_nomb_vac,
          estu_apell_pat_vac,
          estu_apell_mat_vac
        ),
        curso ( cur_nomb_vac )
      `)
      .order('pago_cre_tmp', { ascending: false })

    if (error) throw new AppError(error.message, 'SERVER_ERROR', 500)

    const result: PagoAdminDto[] = (data ?? []).map((p: any) => ({
      pago_uuid: p.pago_uuid,
      pago_nro_vac: p.pago_nro_vac ?? null,
      pago_mont_num: p.pago_mont_num ?? 0,
      pago_estad_vac: p.pago_estad_vac ?? 'PENDIENTE',
      pago_url_vac: p.pago_url_vac ?? null,
      pago_obs_vac: p.pago_obs_vac ?? null,
      pago_cre_tmp: p.pago_cre_tmp,
      pago_upd_tmp: p.pago_upd_tmp,
      estudiante_nombre: p.estudiante?.estu_nomb_vac ?? '—',
      estudiante_apellidos:
        [p.estudiante?.estu_apell_pat_vac, p.estudiante?.estu_apell_mat_vac]
          .filter(Boolean)
          .join(' ') || '—',
      curso_nombre: p.curso?.cur_nomb_vac ?? '—',
    }))

    return { success: true, data: result }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al cargar pagos'
    return { success: false, error: msg }
  }
}

export async function actualizarEstadoPago(
  pagoUuid: string,
  nuevoEstado: 'PENDIENTE' | 'PAGADO' | 'OBSERVADO',
  observacion?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    // Obtener pago actual para historial
    const { data: pagoActual, error: fetchErr } = await supabase
      .from('pago')
      .select('pago_id_int, pago_estad_vac')
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

// ─── Auditoría ─────────────────────────────────────────────────────────────────

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

// ─── Asistencia masiva ─────────────────────────────────────────────────────────

export async function registrarAsistenciaMasiva(
  sesionUuid: string,
  asistencias: { usuarioUuid: string; estado: number }[]
): Promise<{ success: boolean; registrados: number; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    // Resolver sesion_clase id
    const { data: sesion, error: sesErr } = await supabase
      .from('sesion_clase')
      .select('ses_id_int')
      .eq('asist_uuid', sesionUuid)
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

// ─── Upload imagen de curso ─────────────────────────────────────────────────────

export async function uploadCursoImagen(formData: FormData): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const file = formData.get('file') as File | null
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

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const timestamp = Date.now()
    const path = `cursos/${timestamp}-${user.usr_uuid}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('course-images')
      .upload(path, file, { cacheControl: '3600', upsert: true })

    if (uploadErr) {
      return { success: false, error: `Error al subir: ${uploadErr.message}` }
    }

    // Obtener URL pública
    const { data } = supabase.storage.from('course-images').getPublicUrl(path)

    return { success: true, url: data.publicUrl }
  } catch (error) {
    const msg = error instanceof AppError ? error.message : 'Error al subir imagen'
    return { success: false, error: msg }
  }
}

// ─── Módulos (admin) ───────────────────────────────────────────────────────────

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
      apartados: (m.apartado ?? []).map((a: any) => ({
        apar_uuid: a.apar_uuid,
        apar_nomb_vac: a.apar_nomb_vac ?? '',
        apar_desc_vac: a.apar_desc_vac ?? '',
        apar_est_int: a.apar_est_int ?? 1,
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

// ─── CRUD Módulos ──────────────────────────────────────────────────────────────

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

// ─── CRUD Apartados ────────────────────────────────────────────────────────────

export async function crearApartado(
  modUuid: string,
  datos: { nombre: string; descripcion: string; estado: number }
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
      })
      .select('apar_uuid, apar_nomb_vac, apar_desc_vac, apar_est_int')
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
        items: [],
      },
    }
  } catch (error) {
    return { success: false, error: 'Error al crear apartado' }
  }
}

export async function actualizarApartado(
  aparUuid: string,
  datos: { nombre?: string; descripcion?: string; estado?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertAdminOrCoordinador(user)

    const updates: Record<string, any> = { apar_upd_tmp: new Date().toISOString() }
    if (datos.nombre !== undefined) updates.apar_nomb_vac = datos.nombre
    if (datos.descripcion !== undefined) updates.apar_desc_vac = datos.descripcion
    if (datos.estado !== undefined) updates.apar_est_int = datos.estado

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

// ─── CRUD Items de Apartado ────────────────────────────────────────────────────

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
