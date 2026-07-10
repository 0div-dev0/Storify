import {withAuth} from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    const protectedPaths = ['/home', '/journal', '/explore', '/settings']
    const isProtected = protectedPaths.some(p => path.startsWith(p))

    if (isProtected && !token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }

    if (path === '/login' && token) {
      return NextResponse.redirect(new URL('/home', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        const protectedPaths = ['/home', '/journal', '/explore', '/settings']
        const isProtected = protectedPaths.some(p => path.startsWith(p))
        
        if (isProtected) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/home/:path*', '/journal/:path*', '/explore/:path*', '/settings/:path*', '/login'],
}