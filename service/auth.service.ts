/**
 * Service: Lógica de autenticación
 * Validaciones + orquestación de repositories
 */

import 'server-only';

import bcrypt from 'bcrypt';
import {
  getUsuarioByEmail,
  getUsuarioById,
  createUsuario,
  getUsuarioWithPermissions,
  getUsuarioPermissions,
} from '@/repository/usuario.repository';
import { getPermisosByRolId } from '@/repository/permiso.repository';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/validators';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
} from '@/lib/errors';
import { UserSessionDto } from '@/dto/auth.dto';

const BCRYPT_ROUNDS = 10;
const ADMIN_ROLE_ID = 1; // Ajusta según tu BD

/**
 * Servicio de login
 */
export async function loginService(
  email: string,
  password: string
): Promise<UserSessionDto> {
  validateEmail(email);

  const usuario = await getUsuarioByEmail(email);
  if (!usuario) {
    throw new AuthenticationError('Email o contraseña incorrectos');
  }

  const esValida = await bcrypt.compare(password, usuario.usr_pass_vac);
  if (!esValida) {
    throw new AuthenticationError('Email o contraseña incorrectos');
  }

  if (usuario.usr_est_int !== 1) {
    throw new AuthenticationError('Usuario inactivo');
  }

  // Obtener permisos
  const permisos = await getUsuarioPermissions(usuario.usr_id_int);

  return {
    usr_id_int: usuario.usr_id_int,
    usr_uuid: usuario.usr_uuid,
    usr_email_vac: usuario.usr_email_vac,
    usr_nomb_vac: usuario.usr_nomb_vac,
    rol_id: usuario.rol_id,
    rol_nam_vc: '', // Se completa en el action
    permiso_cod_vac: permisos,
  };
}

/**
 * Servicio de registro (solo para ADMIN)
 */
export async function registerService(
  email: string,
  password: string,
  passwordConfirm: string,
  rolId: number = 4 // 4 = ESTUDIANTE
): Promise<UserSessionDto> {

  // Validar email
  validateEmail(email);

  // Validar contraseña
  validatePassword(password);
  validatePasswordMatch(password, passwordConfirm);

  // Verificar que no exista
  const existe = await getUsuarioByEmail(email);
  if (existe) {
    throw new ValidationError('El email ya está registrado');
  }

  // Hash de contraseña
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Crear usuario
  const nuevoUsuario = await createUsuario(email, passwordHash, rolId);

  // Obtener permisos
  const permisos = await getPermisosByRolId(rolId);

  return {
    usr_id_int: nuevoUsuario.usr_id_int,
    usr_uuid: nuevoUsuario.usr_uuid,
    usr_email_vac: nuevoUsuario.usr_email_vac,
    usr_nomb_vac: nuevoUsuario.usr_nomb_vac,
    rol_id: nuevoUsuario.rol_id,
    rol_nam_vc: '', // Se completa en el action
    permiso_cod_vac: permisos,
  };
}

/**
 * Obtiene los datos completos de un usuario (con permisos)
 */
export async function getUsuarioCompleteService(
  usuarioId: number
): Promise<UserSessionDto | null> {

  const usuarioConPermisos = await getUsuarioWithPermissions(usuarioId);
  if (!usuarioConPermisos) {
    return null;
  }

  const permisos = await getUsuarioPermissions(usuarioId);

  return {
    usr_id_int: usuarioConPermisos.usr_id_int,
    usr_uuid: usuarioConPermisos.usr_uuid,
    usr_email_vac: usuarioConPermisos.usr_email_vac,
    usr_nomb_vac: usuarioConPermisos.usr_nomb_vac,
    rol_id: usuarioConPermisos.rol_id,
    rol_nam_vc: usuarioConPermisos.role?.rol_nam_vc || '',
    permiso_cod_vac: permisos,
  };
}

/**
 * Valida que el usuario sea ADMIN
 */
export async function assertIsAdmin(usuarioId: number): Promise<void> {
  const usuario = await getUsuarioById(usuarioId);
  if (!usuario || usuario.rol_id !== ADMIN_ROLE_ID) {
    throw new AuthorizationError('Se requieren permisos de administrador');
  }
}

/**
 * Extrae el usuario del header o contexto (implementar según tu setup)
 */
export async function getCurrentUserFromContext(): Promise<number | null> {
  // Esto se implementará después con Next.js middleware
  // Por ahora retorna null
  return null;
}
