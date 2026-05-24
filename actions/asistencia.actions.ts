'use server'

import { assertAuthenticated, assertDashboard } from '@/lib/auth-guards'
import { AsistenciaService } from '@/service/asistencia.service'
import { SesionClaseDto, RegistrarAsistenciaResponseDto } from '@/dto/asistencia.dto'
import { AppError } from '@/lib/errors'
import { ESTADO_ASISTENCIA } from '@/lib/asistencia.constants'

/**
 * Obtiene las sesiones de clase de un curso.
 * Solo ADMIN, DOCENTE, COORDINADOR (gestión de asistencia es del staff).
 */
export async function getSesionesByCurso(cursoId: string): Promise<{
  success: boolean
  data?: SesionClaseDto[]
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const sesiones = await AsistenciaService.getSesionesByCurso(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: sesiones }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Registra la asistencia de un estudiante a una sesión.
 * Solo ADMIN, DOCENTE, COORDINADOR pueden registrar asistencia.
 */
export async function registrarAsistencia(
  sesionId: string
): Promise<RegistrarAsistenciaResponseDto> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const resultado = await AsistenciaService.registrarAsistencia(
      sesionId,
      user.usr_id_int.toString()
    )
    return resultado
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return { success: false, mensaje: message, razon_rechazo: message }
  }
}

/**
 * Obtiene el reporte de asistencia de una sesión.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getReporteAsistencia(sesionId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const reporte = await AsistenciaService.getReporteAsistencia(
      sesionId,
      user.usr_id_int.toString()
    )
    return { success: true, data: reporte }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Actualiza el estado de asistencia de un estudiante.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function updateAsistencia(
  asistenciaId: string,
  estado: number,
  observaciones?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    await AsistenciaService.updateAsistencia(
      asistenciaId,
      estado,
      user.usr_id_int.toString(),
      observaciones
    )
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

/**
 * Obtiene el reporte general de asistencia de un curso.
 * Solo ADMIN, DOCENTE, COORDINADOR.
 */
export async function getReporteGeneralCurso(cursoId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const reporte = await AsistenciaService.getReporteGeneralCurso(
      cursoId,
      user.usr_id_int.toString()
    )
    return { success: true, data: reporte }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error desconocido'
    return { success: false, error: message }
  }
}

// Mapeo de estados: importar desde '@/lib/asistencia.constants' en componentes cliente

/**
 * Actualiza manualmente el estado de asistencia (con historial de auditoría).
 * Distinto de updateAsistencia que usa el service antiguo.
 */
export async function updateAsistenciaManual(
  asistenciaId: number,
  nuevoEstado: number,
  estadoAnterior: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const { AsistenciaRepository } = await import('@/repository/asistencia.repository')
    const valorAnterior = ESTADO_ASISTENCIA[estadoAnterior] ?? String(estadoAnterior)
    const valorNuevo = ESTADO_ASISTENCIA[nuevoEstado] ?? String(nuevoEstado)

    await AsistenciaRepository.updateAsistencia(
      asistenciaId,
      nuevoEstado,
      user.usr_id_int,
      valorAnterior,
      valorNuevo
    )
    return { success: true }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error al actualizar asistencia'
    return { success: false, error: message }
  }
}

/**
 * Crea una nueva sesión de clase manualmente para un curso.
 */
export async function crearSesionClase(
  cursoUuid: string,
  fecha: string,
  horaInicio: string,
  horaFin: string
): Promise<{ success: boolean; ses_id_int?: number; error?: string }> {
  try {
    const user = await assertAuthenticated()
    assertDashboard(user)

    const { supabase } = await import('@/lib/supabase')
    const { AsistenciaRepository } = await import('@/repository/asistencia.repository')

    const { data: cursoData } = await supabase
      .from('curso')
      .select('cur_id_int')
      .eq('cur_uuid', cursoUuid)
      .single()

    if (!cursoData) return { success: false, error: 'Curso no encontrado' }

    const sesId = await AsistenciaRepository.crearSesion(
      cursoData.cur_id_int,
      fecha,
      horaInicio,
      horaFin
    )
    return { success: true, ses_id_int: sesId }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error al crear sesión'
    return { success: false, error: message }
  }
}

/**
 * Obtiene las sesiones con su reporte de asistencia para vista del dashboard.
 * Llama directamente al repositorio corregido.
 */
export async function getSesionesConAsistencia(cursoId: string): Promise<{
  success: boolean
  data?: Array<{
    sesion: import('@/dto/asistencia.dto').SesionClaseDto
    reporte: import('@/dto/asistencia.dto').ReporteAsistenciaDto
  }>
  error?: string
}> {
  try {
    await assertAuthenticated()
    const { AsistenciaRepository } = await import('@/repository/asistencia.repository')
    const sesiones = await AsistenciaRepository.getSesionesByCurso(cursoId)

    const data = await Promise.all(
      sesiones.map(async (sesion) => {
        const reporte = await AsistenciaRepository.getReporteAsistencia(sesion.ses_id_int)
        return { sesion, reporte }
      })
    )
    return { success: true, data }
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Error al obtener sesiones'
    return { success: false, error: message }
  }
}

/**
 * ── Marcar asistencia desde el Aula Virtual (alumno) ─────────────────────────
 *
 * Usa "lazy creation": si el docente no creó la sesion_clase manualmente,
 * este action la crea automáticamente usando los datos del horario_curso.
 *
 * Flujo:
 *  1. Valida la ventana de tiempo (−15 a +30 min del inicio) usando hora Lima.
 *  2. Busca sesion_clase para hoy en este curso.
 *  3. Si no existe → la crea a partir del horario_curso del día.
 *  4. Verifica que el alumno no haya registrado asistencia ya.
 *  5. Inserta en la tabla asistencia.
 */
export async function registrarAsistenciaAula(input: {
  /** ID entero del curso (cur_id_int) */
  curIdInt: number
  /** ID del horario_curso que aplica hoy */
  horCurIdInt: number
  /** Hora de inicio del horario "HH:MM" */
  horaInicio: string
  /** Hora de fin del horario "HH:MM" */
  horaFin: string
  /** Fecha Lima "YYYY-MM-DD" */
  fecha: string
}): Promise<{ success: boolean; mensaje: string; razon_rechazo?: string }> {
  try {
    const user = await assertAuthenticated()
    const { supabase } = await import('@/lib/supabase')

    // ── 1. Validar ventana de tiempo en el servidor ───────────────────────────
    // Ambas fechas se expresan en UTC internamente:
    //   - inicioLima: new Date("YYYY-MM-DDTHH:MM:00-05:00") → el motor la convierte a UTC
    //   - ahora: new Date() → siempre UTC
    // → La diferencia .getTime() es correcta sin ningún offset manual
    const ahora = new Date()
    const inicioLima = new Date(`${input.fecha}T${input.horaInicio}:00-05:00`)
    const minutosDesdeInicio = Math.floor(
      (ahora.getTime() - inicioLima.getTime()) / 60000
    )

    if (minutosDesdeInicio < -15) {
      return {
        success: false,
        mensaje: 'Fuera de ventana',
        razon_rechazo: `La clase aún no comienza. Faltan ${Math.abs(minutosDesdeInicio) - 15} minutos.`,
      }
    }
    if (minutosDesdeInicio > 30) {
      return {
        success: false,
        mensaje: 'Fuera de ventana',
        razon_rechazo: 'El tiempo para marcar asistencia ya expiró (máx. 30 min después del inicio).',
      }
    }

    // Estado: PRESENTE(1) si llegó antes de 15 min de iniciada, TARDÍO(2) si después
    const estadoAsistencia = minutosDesdeInicio > 15 ? 2 : 1

    // ── 2. Buscar sesión_clase de hoy (Paso A) ───────────────────────────────
    const { data: sesionExistente } = await supabase
      .from('sesion_clase')
      .select('ses_id_int')
      .eq('cur_id_int', input.curIdInt)
      .eq('ses_fecha_dat', input.fecha)
      .order('ses_hora_inic_tmp', { ascending: true })
      .limit(1)
      .maybeSingle()

    let sesIdInt: number

    if (sesionExistente) {
      // ── 3a. Ya existe → usar su ID (Paso C) ─────────────────────────────
      sesIdInt = sesionExistente.ses_id_int
    } else {
      // ── 3b. No existe → crearla al vuelo (Paso B) ───────────────────────
      const { data: nuevaSesion, error: createErr } = await supabase
        .from('sesion_clase')
        .insert({
          cur_id_int:       input.curIdInt,
          hor_cur_id_int:   input.horCurIdInt,
          ses_fecha_dat:    input.fecha,
          ses_hora_inic_tmp: input.horaInicio,
          ses_hora_fin_tmp:  input.horaFin,
          ses_estado_vac:   'ACTIVA',
        })
        .select('ses_id_int')
        .single()

      if (createErr || !nuevaSesion) {
        console.error('[registrarAsistenciaAula] Error creando sesion_clase:', createErr)
        return {
          success: false,
          mensaje: 'Error interno',
          razon_rechazo: 'No se pudo crear la sesión. Inténtalo de nuevo.',
        }
      }
      sesIdInt = nuevaSesion.ses_id_int
    }

    // ── 4. Verificar que no haya registrado ya asistencia ───────────────────
    const { data: asistenciaExistente } = await supabase
      .from('asistencia')
      .select('asist_id_int')
      .eq('ses_id_int', sesIdInt)
      .eq('usr_id_int', user.usr_id_int)
      .maybeSingle()

    if (asistenciaExistente) {
      return {
        success: false,
        mensaje: 'Ya registraste tu asistencia para esta sesión.',
        razon_rechazo: 'Ya registraste tu asistencia para esta sesión.',
      }
    }

    // ── 5. Insertar asistencia (Paso D) ──────────────────────────────────────
    const { error: insertErr } = await supabase
      .from('asistencia')
      .insert({
        ses_id_int:    sesIdInt,
        usr_id_int:    user.usr_id_int,
        asist_est_int: estadoAsistencia,
        asist_cre_tmp: new Date().toISOString(),
        asist_upd_tmp: new Date().toISOString(),
      })

    if (insertErr) {
      console.error('[registrarAsistenciaAula] Error insertando asistencia:', insertErr)
      return {
        success: false,
        mensaje: 'Error al registrar asistencia',
        razon_rechazo: insertErr.message,
      }
    }

    const etiqueta = estadoAsistencia === 1 ? 'Presente' : 'Tardanza'
    return {
      success: true,
      mensaje: `Asistencia registrada como ${etiqueta}.`,
    }
  } catch (error: any) {
    const msg = error?.message ?? 'Error inesperado'
    console.error('[registrarAsistenciaAula]', msg)
    return { success: false, mensaje: msg, razon_rechazo: msg }
  }
}

/**
 * ── Generar ausentes al cierre de ventana ─────────────────────────────────────
 *
 * Se llama automáticamente desde el cliente cuando la ventana de asistencia
 * (+30 min desde inicio) se cierra.
 *
 * Flujo:
 *  1. Valida que la ventana ya cerró (minutosDesdeInicio > 30) en el servidor.
 *  2. Busca o crea la sesion_clase para el día de hoy.
 *  3. Obtiene todos los alumnos activos inscritos al curso.
 *  4. Para cada alumno SIN registro de asistencia → inserta asist_est_int = 0 (Ausente).
 *
 * Es idempotente: si se llama varias veces, no duplica registros.
 */
export async function generarAusentesParaHorario(input: {
  curIdInt: number
  horCurIdInt: number
  horaInicio: string  // "HH:MM"
  horaFin: string     // "HH:MM"
  fecha: string       // "YYYY-MM-DD" Lima
}): Promise<{ success: boolean; ausentesGenerados: number; error?: string }> {
  try {
    // No requiere rol específico — se llama desde el aula, basta estar autenticado
    await assertAuthenticated()
    const { supabase } = await import('@/lib/supabase')

    // ── 1. Validar que la ventana ya cerró ────────────────────────────────────
    const ahora = new Date()
    const inicioLima = new Date(`${input.fecha}T${input.horaInicio}:00-05:00`)
    const minutosDesdeInicio = Math.floor(
      (ahora.getTime() - inicioLima.getTime()) / 60000
    )

    if (minutosDesdeInicio <= 30) {
      // Ventana aún abierta — no hacer nada todavía
      return { success: true, ausentesGenerados: 0 }
    }

    // ── 2. Buscar o crear sesion_clase ────────────────────────────────────────
    const { data: sesionExistente } = await supabase
      .from('sesion_clase')
      .select('ses_id_int')
      .eq('cur_id_int', input.curIdInt)
      .eq('ses_fecha_dat', input.fecha)
      .order('ses_hora_inic_tmp', { ascending: true })
      .limit(1)
      .maybeSingle()

    let sesIdInt: number

    if (sesionExistente) {
      sesIdInt = sesionExistente.ses_id_int
    } else {
      // Crear sesión al vuelo si nunca se creó (nadie marcó asistencia)
      const { data: nuevaSesion, error: createErr } = await supabase
        .from('sesion_clase')
        .insert({
          cur_id_int:        input.curIdInt,
          hor_cur_id_int:    input.horCurIdInt,
          ses_fecha_dat:     input.fecha,
          ses_hora_inic_tmp: input.horaInicio,
          ses_hora_fin_tmp:  input.horaFin,
          ses_estado_vac:    'CERRADA',
        })
        .select('ses_id_int')
        .single()

      if (createErr || !nuevaSesion) {
        console.error('[generarAusentesParaHorario] Error creando sesion:', createErr)
        return { success: false, ausentesGenerados: 0, error: createErr?.message }
      }
      sesIdInt = nuevaSesion.ses_id_int
    }

    // Marcar la sesión como CERRADA si aún no lo está
    await supabase
      .from('sesion_clase')
      .update({ ses_estado_vac: 'CERRADA' })
      .eq('ses_id_int', sesIdInt)
      .neq('ses_estado_vac', 'CERRADA')

    // ── 3. Obtener alumnos inscritos y activos en el curso ────────────────────
    const { data: inscritos } = await supabase
      .from('estudiante_curso')
      .select('usr_id_int')
      .eq('cur_id_int', input.curIdInt)
      .eq('est_cur_estado_bol', true)

    if (!inscritos || inscritos.length === 0) {
      return { success: true, ausentesGenerados: 0 }
    }

    // ── 4. Determinar quién ya marcó asistencia ───────────────────────────────
    const { data: yaAsistieron } = await supabase
      .from('asistencia')
      .select('usr_id_int')
      .eq('ses_id_int', sesIdInt)

    const usrIdsConAsistencia = new Set(
      (yaAsistieron ?? []).map((a: any) => a.usr_id_int as number)
    )

    // ── 5. Insertar AUSENTE (0) para los que no marcaron ─────────────────────
    const ausentesRows = inscritos
      .filter((e: any) => !usrIdsConAsistencia.has(e.usr_id_int))
      .map((e: any) => ({
        ses_id_int:    sesIdInt,
        usr_id_int:    e.usr_id_int,
        asist_est_int: 0,                         // Ausente
        asist_cre_tmp: new Date().toISOString(),
        asist_upd_tmp: new Date().toISOString(),
      }))

    if (ausentesRows.length === 0) {
      return { success: true, ausentesGenerados: 0 }
    }

    const { error: insertErr } = await supabase
      .from('asistencia')
      .insert(ausentesRows)

    if (insertErr) {
      console.error('[generarAusentesParaHorario] Error insertando ausentes:', insertErr)
      return { success: false, ausentesGenerados: 0, error: insertErr.message }
    }

    console.log(`[generarAusentesParaHorario] ${ausentesRows.length} ausente(s) generados para sesion ${sesIdInt}`)
    return { success: true, ausentesGenerados: ausentesRows.length }
  } catch (error: any) {
    const msg = error?.message ?? 'Error inesperado'
    console.error('[generarAusentesParaHorario]', msg)
    return { success: false, ausentesGenerados: 0, error: msg }
  }
}
