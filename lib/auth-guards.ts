/**
 * Auth Guards — Validaciones de autenticación y roles
 *
 * Uso:
 *   const user = await assertAuthenticated()
 *   assertEstudiante(user)          // solo para /aula
 *   assertDashboard(user)           // solo para /dashboard (no estudiantes)
 *   assertAdmin(user)               // solo ADMIN
 *   assertAdminOrCoordinador(user)  // ADMIN o COORDINADOR
 */

import 'server-only'

import { getCurrentUser } from '@/actions/auth.actions'
import { AuthorizationError } from '@/lib/errors'
import { ROLE_NAMES, type RoleName } from '@/types/permissions'
import type { UserSessionDto } from '@/dto/auth.dto'

// ─── Roles por zona ───────────────────────────────────────────────────────────

/** Roles que tienen acceso al dashboard (NO estudiantes) */
export const DASHBOARD_ROLES: RoleName[] = [
  ROLE_NAMES.SISTEMAS,
  ROLE_NAMES.DOCENTE,
  ROLE_NAMES.ADMINISTRADOR,
]

/** Roles que solo acceden al aula virtual */
export const AULA_ROLES: RoleName[] = [ROLE_NAMES.ESTUDIANTE]

// ─── Helper interno ───────────────────────────────────────────────────────────

function checkRole(user: UserSessionDto, allowed: RoleName[], context: string): void {
  const rolActual = user.rol_nam_vc as RoleName
  if (!allowed.includes(rolActual)) {
    throw new AuthorizationError(
      `Acceso denegado a "${context}". Tu rol (${rolActual || 'sin rol'}) no tiene permiso.`
    )
  }
}

// ─── Guards exportados ────────────────────────────────────────────────────────

/**
 * Verifica que hay una sesión activa.
 * @returns UserSessionDto — el usuario autenticado
 * @throws AuthorizationError si no hay sesión
 */
export async function assertAuthenticated(): Promise<UserSessionDto> {
  const user = await getCurrentUser()
  if (!user) {
    throw new AuthorizationError('Debes iniciar sesión para continuar')
  }
  return user
}

/**
 * El usuario debe ser ESTUDIANTE.
 * Uso exclusivo en server actions del área /aula.
 */
export function assertEstudiante(user: UserSessionDto): void {
  checkRole(user, AULA_ROLES, 'Aula Virtual')
}

/**
 * El usuario debe ser ADMIN, DOCENTE o COORDINADOR.
 * Uso en server actions del área /dashboard.
 */
export function assertDashboard(user: UserSessionDto): void {
  checkRole(user, DASHBOARD_ROLES, 'Dashboard')
}

/**
 * El usuario debe ser SISTEMAS.
 */
export function assertAdmin(user: UserSessionDto): void {
  checkRole(user, [ROLE_NAMES.SISTEMAS], 'Administración del sistema')
}

/**
 * El usuario debe ser SISTEMAS o ADMINISTRADOR.
 * Uso en acciones financieras (aceptar pagos, matrículas, etc.)
 */
export function assertAdminOrCoordinador(user: UserSessionDto): void {
  checkRole(user, [ROLE_NAMES.SISTEMAS, ROLE_NAMES.ADMINISTRADOR], 'Gestión de pagos')
}

/**
 * El usuario debe ser DOCENTE (o SISTEMAS).
 * Uso en acciones de gestión de cursos/módulos/exámenes.
 */
export function assertDocenteOrAdmin(user: UserSessionDto): void {
  checkRole(user, [ROLE_NAMES.SISTEMAS, ROLE_NAMES.DOCENTE], 'Gestión académica')
}
