'use server';

import { cookies, headers } from 'next/headers';
import { loginService, registerService, getUsuarioCompleteService } from '@/service/auth.service';
import { LoginRequestDto, RegisterRequestDto, AuthResponseDto, PublicUserDto } from '@/dto/auth.dto';
import { handleServiceError } from '@/lib/errors';
import { getUsuarioRol } from '@/repository/usuario.repository';
import { UserSessionDto } from '@/dto/auth.dto';
import {
  generateSessionToken,
  signTokenForCookie,
  extractAndVerifyToken,
  hashTokenForDB,
} from '@/lib/session';
import {
  createSesion,
  findActiveSesionByHash,
  updateSesionLastActivity,
  revokeSesionByHash,
} from '@/repository/sesion.repository';

// ─── Helpers internos ─────────────────────────────────────────────────────────

/** Obtiene IP y User-Agent del request actual */
async function getRequestMetadata(): Promise<{ ip: string; userAgent: string }> {
  try {
    const headersList = await headers();
    const rawIp =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      'desconocida';
    // Normalizar IPv4-mapped IPv6: "::ffff:127.0.0.1" → "127.0.0.1"
    const ip = rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;
    const userAgent = headersList.get('user-agent') || 'desconocido';
    return { ip, userAgent };
  } catch {
    return { ip: 'desconocida', userAgent: 'desconocido' };
  }
}

/** Duración de la sesión: 7 días en ms */
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Crea sesión en BD y establece la cookie firmada */
async function createAndSetSession(userId: number): Promise<void> {
  const { ip, userAgent } = await getRequestMetadata();

  // 1. Generar token aleatorio de 256 bits
  const rawToken = generateSessionToken();

  // 2. Firmar para la cookie
  const signedCookieValue = await signTokenForCookie(rawToken);

  // 3. Hashear para BD
  const tokenHash = await hashTokenForDB(rawToken);

  // 4. Crear sesión en BD con metadatos de auditoría
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const sesion = await createSesion({ tokenHash, userId, ip, userAgent, expiresAt });

  if (!sesion) {
    throw new Error('createSesion falló');
  }

  // 5. Establecer cookie httpOnly firmada
  const cookieStore = await cookies();
  cookieStore.set('session_token', signedCookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000, // en segundos
  });
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Login: autentica credenciales y crea sesión en BD
 */
export async function loginAction(
  credentials: LoginRequestDto
): Promise<AuthResponseDto> {
  try {
    if (!credentials.email || !credentials.password) {
      return { success: false, message: 'Email y contraseña son requeridos' };
    }

    const userSession = await loginService(credentials.email, credentials.password);

    const rolNombre = await getUsuarioRol(userSession.usr_id_int);
    if (rolNombre) userSession.rol_nam_vc = rolNombre;

    // Crear sesión en BD + cookie firmada
    await createAndSetSession(userSession.usr_id_int);

    // Mapear a PublicUserDto — nunca enviar usr_id_int al cliente
    const publicUser: PublicUserDto = {
      uuid: userSession.usr_uuid,
      email: userSession.usr_email_vac,
      nombre: userSession.usr_nomb_vac,
      rol: userSession.rol_nam_vc,
      permisos: userSession.permiso_cod_vac,
      modoOscuro: userSession.usr_mod_bol ?? false,
    };

    return { success: true, message: 'Login exitoso', user: publicUser };
  } catch (error) {
    const errorResponse = handleServiceError(error);
    return { success: false, message: errorResponse.message };
  }
}

/**
 * Register básico (usado por admin — el registro de estudiantes usa registro.actions.ts)
 */
export async function registerAction(
  data: RegisterRequestDto
): Promise<AuthResponseDto> {
  try {
    if (!data.email || !data.password || !data.passwordConfirm) {
      return { success: false, message: 'Todos los campos son requeridos' };
    }

    const userSession = await registerService(
      data.email,
      data.password,
      data.passwordConfirm,
      3 // ESTUDIANTE
    );

    const rolNombre = await getUsuarioRol(userSession.usr_id_int);
    if (rolNombre) userSession.rol_nam_vc = rolNombre;

    const publicUser: PublicUserDto = {
      uuid: userSession.usr_uuid,
      email: userSession.usr_email_vac,
      nombre: userSession.usr_nomb_vac,
      rol: userSession.rol_nam_vc,
      permisos: userSession.permiso_cod_vac,
      modoOscuro: userSession.usr_mod_bol ?? false,
    };

    return { success: true, message: 'Usuario registrado exitosamente', user: publicUser };
  } catch (error) {
    const errorResponse = handleServiceError(error);
    return { success: false, message: errorResponse.message };
  }
}

/**
 * Obtiene datos del usuario por ID
 */
export async function getCurrentUserAction(
  usuarioId: number
): Promise<AuthResponseDto> {
  try {
    const userSession = await getUsuarioCompleteService(usuarioId);
    if (!userSession) {
      return { success: false, message: 'Usuario no encontrado' };
    }
    const publicUser: PublicUserDto = {
      uuid: userSession.usr_uuid,
      email: userSession.usr_email_vac,
      nombre: userSession.usr_nomb_vac,
      rol: userSession.rol_nam_vc,
      permisos: userSession.permiso_cod_vac,
      modoOscuro: userSession.usr_mod_bol ?? false,
    };
    return { success: true, message: 'Usuario obtenido', user: publicUser };
  } catch (error) {
    const errorResponse = handleServiceError(error);
    return { success: false, message: errorResponse.message };
  }
}

/**
 * Obtiene el usuario autenticado actual.
 * Proceso:
 *  1. Lee la cookie session_token
 *  2. Verifica firma HMAC
 *  3. Busca la sesión en BD
 *  4. Actualiza última actividad
 *  5. Retorna los datos frescos del usuario desde BD
 */
export async function getCurrentUser(): Promise<UserSessionDto | null> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get('session_token')?.value;
    if (!cookieValue) return null;

    // Capa 1: verificar HMAC (sin BD)
    const rawToken = await extractAndVerifyToken(cookieValue);
    if (!rawToken) return null;

    // Capa 2: buscar sesión en BD por hash
    const tokenHash = await hashTokenForDB(rawToken);
    const sesion = await findActiveSesionByHash(tokenHash);

    if (!sesion) {
      // Sesión revocada, expirada o inválida → limpiar cookie
      cookieStore.delete('session_token');
      return null;
    }

    // Actualizar última actividad (en background — no bloqueante)
    updateSesionLastActivity(sesion.ses_uuid).catch(() => {});

    // Obtener datos frescos del usuario
    const userSession = await getUsuarioCompleteService(sesion.usr_id_int);
    return userSession;
  } catch {
    return null;
  }
}

/**
 * Logout: revoca la sesión en BD y elimina la cookie
 */
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get('session_token')?.value;

    if (cookieValue) {
      // Revocar en BD si la cookie es válida
      const rawToken = await extractAndVerifyToken(cookieValue);
      if (rawToken) {
        const tokenHash = await hashTokenForDB(rawToken);
        await revokeSesionByHash(tokenHash);
      }
    }

    cookieStore.delete('session_token');
    cookieStore.delete('userId'); // limpiar cookie legada si existe
    return { success: true, message: 'Sesión cerrada' };
  } catch {
    return { success: false, message: 'Error al cerrar sesión' };
  }
}

// Compat: algunos imports usan logoutAction
export const logoutAction = logoutUser;
