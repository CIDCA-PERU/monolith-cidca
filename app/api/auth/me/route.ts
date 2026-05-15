import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/auth.actions'

/**
 * GET /api/auth/me
 * Endpoint de diagnóstico: devuelve el usuario autenticado y su rol.
 * Útil para verificar sesiones en Postman.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: 'No hay sesión activa. Envía la cookie session_token.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        uuid: user.usr_uuid,        // identificador público (no el entero)
        email: user.usr_email_vac,
        nombre: user.usr_nomb_vac,
        rol: user.rol_nam_vc,
        permisos: user.permiso_cod_vac,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    )
  }
}
