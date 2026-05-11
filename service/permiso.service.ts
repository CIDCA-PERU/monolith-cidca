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
  console.log('[v0] validatePermission - Usuario:', usuarioId, 'Permiso:', permisoCodigo);

  const tienePermiso = await usuarioTienePermiso(usuarioId, permisoCodigo);

  if (!tienePermiso) {
    console.log(
      '[v0] validatePermission - DENEGADO para usuario:',
      usuarioId,
      'Permiso:',
      permisoCodigo
    );
    throw new AuthorizationError(
      `No tiene permiso para: ${permisoCodigo}`
    );
  }

  console.log('[v0] validatePermission - APROBADO');
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
  console.log(
    '[v0] validateOwnership - Usuario:',
    usuarioId,
    'Propietario:',
    propietarioId,
    'Recurso:',
    recurso
  );

  if (usuarioId !== propietarioId) {
    console.log('[v0] validateOwnership - NO ES PROPIETARIO');
    throw new AuthorizationError(
      `No es propietario del ${recurso}`
    );
  }

  console.log('[v0] validateOwnership - APROBADO');
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
  console.log(
    '[v0] validatePermissionAndOwnership - Usuario:',
    usuarioId,
    'Permiso:',
    permisoCodigo,
    'Propietario:',
    propietarioId
  );

  // Primero valida permiso
  await validatePermission(usuarioId, permisoCodigo);

  // Luego valida ownership
  await validateOwnership(usuarioId, propietarioId, recurso);

  console.log('[v0] validatePermissionAndOwnership - APROBADO');
}

/**
 * Valida si es ADMIN (acceso total)
 */
export function isAdmin(rolNombre: string): boolean {
  return rolNombre === ROLE_NAMES.ADMIN;
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
 * Valida si es COORDINADOR
 */
export function isCoordinador(rolNombre: string): boolean {
  return rolNombre === ROLE_NAMES.COORDINADOR;
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
      console.error('[v0] PermisoService.hasPermiso - Error:', error);
      return false;
    }
  }
}
