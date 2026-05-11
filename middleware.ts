import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/aula') || pathname.startsWith('/dashboard') || pathname.startsWith('/estudiante')) {
    const userId = request.cookies.get('userId')?.value
    if (!userId) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/aula/:path*', '/dashboard/:path*', '/estudiante/:path*'],
}
