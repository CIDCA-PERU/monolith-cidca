/**
 * Server Actions: Controladores de autenticación
 * Validan permisos + llaman a servicios + retornan DTOs
 */

'use server';

import { cookies } from 'next/headers';
import { loginService, registerService, getUsuarioCompleteService } from '@/service/auth.service';
import { LoginRequestDto, RegisterRequestDto, AuthResponseDto } from '@/dto/auth.dto';
import { handleServiceError } from '@/lib/errors';
import { getUsuarioRol } from '@/repository/usuario.repository';
import { UserSessionDto } from '@/dto/auth.dto';

/**
 * Server Action: Login
 */
export async function loginAction(
  credentials: LoginRequestDto
): Promise<AuthResponseDto> {
  try {
    console.log('[v0] loginAction - Iniciando login');

    // Validar entrada
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        message: 'Email y contraseña son requeridos',
      };
    }

    // Ejecutar servicio
    const userSession = await loginService(credentials.email, credentials.password);

    // Obtener rol
    const rolNombre = await getUsuarioRol(userSession.usr_id_int);
    if (rolNombre) {
      userSession.rol_nam_vc = rolNombre;
    }

    console.log('[v0] loginAction - Login exitoso para:', credentials.email);

    // Guardar ID de usuario en cookies para sesión servidor
    const cookieStore = await cookies();
    cookieStore.set('userId', userSession.usr_id_int.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return {
      success: true,
      message: 'Login exitoso',
      user: userSession,
    };
  } catch (error) {
    console.error('[v0] loginAction - Error:', error);
    const errorResponse = handleServiceError(error);
    return {
      success: false,
      message: errorResponse.message,
    };
  }
}

/**
 * Server Action: Register (nuevo usuario)
 */
export async function registerAction(
  data: RegisterRequestDto
): Promise<AuthResponseDto> {
  try {
    console.log('[v0] registerAction - Registrando nuevo usuario');

    // Validar entrada
    if (!data.email || !data.password || !data.passwordConfirm) {
      return {
        success: false,
        message: 'Todos los campos son requeridos',
      };
    }

    // Por defecto registra como ESTUDIANTE (rol_id = 3)
    const userSession = await registerService(
      data.email,
      data.password,
      data.passwordConfirm,
      3 // ESTUDIANTE
    );

    // Obtener rol
    const rolNombre = await getUsuarioRol(userSession.usr_id_int);
    if (rolNombre) {
      userSession.rol_nam_vc = rolNombre;
    }

    console.log('[v0] registerAction - Usuario registrado:', data.email);

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userSession,
    };
  } catch (error) {
    console.error('[v0] registerAction - Error:', error);
    const errorResponse = handleServiceError(error);
    return {
      success: false,
      message: errorResponse.message,
    };
  }
}

/**
 * Server Action: Get current user (para verificar sesión)
 */
export async function getCurrentUserAction(
  usuarioId: number
): Promise<AuthResponseDto> {
  try {
    console.log('[v0] getCurrentUserAction - Obteniendo usuario:', usuarioId);

    const userSession = await getUsuarioCompleteService(usuarioId);
    if (!userSession) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      };
    }

    return {
      success: true,
      message: 'Usuario obtenido',
      user: userSession,
    };
  } catch (error) {
    console.error('[v0] getCurrentUserAction - Error:', error);
    const errorResponse = handleServiceError(error);
    return {
      success: false,
      message: errorResponse.message,
    };
  }
}

/**
 * Obtiene el usuario actual desde las cookies de sesión
 * Sin argumentos - para usar en layouts y server actions
 */
export async function getCurrentUser(): Promise<UserSessionDto | null> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      console.log('[v0] getCurrentUser - No hay sesión activa');
      return null;
    }

    const usuarioId = parseInt(userIdCookie.value, 10);
    if (isNaN(usuarioId)) {
      console.log('[v0] getCurrentUser - ID de usuario inválido');
      return null;
    }

    const userSession = await getUsuarioCompleteService(usuarioId);
    return userSession;
  } catch (error) {
    console.error('[v0] getCurrentUser - Error:', error);
    return null;
  }
}

/**
 * Server Action: Logout
 */
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('userId');
    console.log('[v0] logoutUser - Usuario desconectado');
    return {
      success: true,
      message: 'Sesión cerrada',
    };
  } catch (error) {
    console.error('[v0] logoutUser - Error:', error);
    return {
      success: false,
      message: 'Error al cerrar sesión',
    };
  }
}

// Compat: algunos imports usan logoutAction
export const logoutAction = logoutUser;
