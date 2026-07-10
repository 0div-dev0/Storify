import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const protectedPaths = ['/home', '/journal', '/explore', '/settings']

function isProtected(pathname) {
  return protectedPaths.some(p => pathname.startsWith(p))
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (isProtected(path) && !token) {
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
        if (isProtected(path)) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/home/:path*',
    '/journal/:path*',
    '/explore/:path*',
    '/settings/:path*',
    '/login',
  ],
}