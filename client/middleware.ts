import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/admin',
  '/checkout',
  '/profile',
  '/orders',
  '/wishlist',
  '/settings',
]

// Define routes that should NOT be accessible if already logged in
const authRoutes = ['/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value // assuming JWT stored in cookies
  const { pathname } = request.nextUrl

  // If trying to access protected route but no token → redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If already logged in and tries to access login/register → redirect home
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Otherwise continue
  return NextResponse.next()
}

// Apply middleware only to certain routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/settings/:path*',
    '/auth/:path*',
  ],
}
