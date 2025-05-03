import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the auth cookie
  const authCookie = request.cookies.get('bookbrust_auth')?.value
  const path = request.nextUrl.pathname

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/books']
  
  // Define auth routes
  const authRoutes = ['/login', '/signup']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`))

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => path === route)

  // If trying to access a protected route without auth, redirect to login
  if (isProtectedRoute && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If already logged in and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
} 