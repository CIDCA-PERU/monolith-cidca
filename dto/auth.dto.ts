/**
 * DTOs para autenticación
 * Siguiendo patrón LAK Security: Interfaces limpias sin exposición de datos sensibles
 */

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthResponseDto {
  success: boolean;
  message: string;
  user?: PublicUserDto;    // solo el DTO público al cliente
  token?: string;
}

export interface UserSessionDto {
  usr_id_int: number;      // USO INTERNO SERVIDOR — nunca enviar al cliente
  usr_uuid: string;
  usr_email_vac: string;
  usr_nomb_vac: string;
  rol_id: number;          // USO INTERNO SERVIDOR
  rol_nam_vc: string;
  permiso_cod_vac: string[];
}

/**
 * DTO público — lo único que llega al cliente.
 * Sin IDs enteros (evita enumeración/IDOR).
 */
export interface PublicUserDto {
  uuid: string;            // identificador público
  email: string;
  nombre: string;
  rol: string;
  permisos: string[];
}

export interface PermissionCheckDto {
  hasPermission: boolean;
  message: string;
}

export interface OwnershipCheckDto {
  isOwner: boolean;
  message: string;
}
