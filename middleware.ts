import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractAndVerifyToken } from '@/lib/session'

/**
 * Middleware de autenticación — Capa 1 (Edge Runtime, sin BD)
 *
 * Verifica criptográficamente la cookie 'session_token' con HMAC-SHA256.
 * Si la firma no es válida → forjada → redirige a /login y limpia la cookie.
 * Si la firma es válida → pasa al servidor donde Capa 2 (BD) valida sesión activa.
 *
 * Rutas protegidas:
 *   /aula/*       → ESTUDIANTE
 *   /dashboard/*  → SISTEMAS / DOCENTE / ADMINISTRADOR
 *   /estudiante/* → ESTUDIANTE
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname.startsWith('/aula') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/estudiante')

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const cookieValue = request.cookies.get('session_token')?.value

  // Sin cookie → redirigir a login
  if (!cookieValue) {
    return redirectToLogin(request)
  }

  // Verificar firma HMAC (sin BD) — detecta cookies forjadas o manipuladas
  const token = await extractAndVerifyToken(cookieValue)

  if (!token) {
    // Cookie inválida o forjada → limpiar y redirigir
    const response = redirectToLogin(request)
    response.cookies.delete('session_token')
    response.cookies.delete('userId') // limpiar cookie legada si existe
    return response
  }

  // Firma válida → continuar al servidor
  // La validación de sesión activa en BD la hace getCurrentUser() en cada action
  return NextResponse.next()
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/aula/:path*', '/dashboard/:path*', '/estudiante/:path*'],
}
