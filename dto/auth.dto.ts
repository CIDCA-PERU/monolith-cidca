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
  user?: UserSessionDto;
  token?: string;
}

export interface UserSessionDto {
  usr_id_int: number;
  usr_uuid: string;
  usr_email_vac: string;
  usr_nomb_vac: string;
  rol_id: number;
  rol_nam_vc: string;
  permiso_cod_vac: string[]; // Array de códigos de permisos
}

export interface PermissionCheckDto {
  hasPermission: boolean;
  message: string;
}

export interface OwnershipCheckDto {
  isOwner: boolean;
  message: string;
}
