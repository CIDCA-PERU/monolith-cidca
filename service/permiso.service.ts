/**
 * Service: Lógica de validación de permisos y ownership
 * Motor de permisos LAK Security
 */

import 'server-only';

import { usuarioTienePermiso } from '@/repository/permiso.repository';
import { AuthorizationError } from '@/lib/errors';
import { PermissionCode, ROLE_NAMES } from '@/types/permissions';

/**
 * Valida si un usuario tiene un permiso específico
 * @throws AuthorizationError si no tiene el permiso
 */
export async function validatePermission(
  usuarioId: number,
  permisoCodigo: PermissionCode
): Promise<void> {
  const tienePermiso = await usuarioTienePermiso(usuarioId, permisoCodigo);

  if (!tienePermiso) {
    throw new AuthorizationError(
      `No tiene permiso para: ${permisoCodigo}`
    );
  }
}

/**
 * Valida que el usuario sea propietario del recurso
 * @throws AuthorizationError si no es propietario
 */
export async function validateOwnership(
  usuarioId: number,
  propietarioId: number,
  recurso: string = 'recurso'
): Promise<void> {

  if (usuarioId !== propietarioId) {
    throw new AuthorizationError(
      `No es propietario del ${recurso}`
    );
  }
}

/**
 * Valida permiso + ownership combinados
 * Usado en operaciones CRUD que solo el dueño puede hacer
 */
export async function validatePermissionAndOwnership(
  usuarioId: number,
  permisoCodigo: PermissionCode,
  propietarioId: number,
  recurso: string = 'recurso'
): Promise<void> {
  // Primero valida permiso
  await validatePermission(usuarioId, permisoCodigo);

  // Luego valida ownership
  await validateOwnership(usuarioId, propietarioId, recurso);
}

/**
 * Valida si es SISTEMAS (acceso total de administrador del sistema)
 */
export function isAdmin(rolNombre: string): boolean {
  return rolNombre === ROLE_NAMES.SISTEMAS;
}

/**
 * Valida si es DOCENTE
 */
export function isDocente(rolNombre: string): boolean {
  return rolNombre === ROLE_NAMES.DOCENTE;
}

/**
 * Valida si es ESTUDIANTE
 */
export function isEstudiante(rolNombre: string): boolean {
  return rolNombre === ROLE_NAMES.ESTUDIANTE;
}

/**
 * Valida si es ADMINISTRADOR
 */
export function isCoordinador(rolNombre: string): boolean {
  return rolNombre === ROLE_NAMES.ADMINISTRADOR;
}

// Compat: wrapper class usado en servicios antiguos
export class PermisoService {
  static async hasPermiso(
    usuarioId: number,
    permisoCodigo: string,
    _recursoId?: string
  ): Promise<boolean> {
    try {
      return await usuarioTienePermiso(usuarioId, permisoCodigo);
    } catch (error) { 
      return false;
    }
  }
}
