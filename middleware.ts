import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authStorage = request.cookies.get('auth-storage')

    if (request.nextUrl.pathname.startsWith('/client') ||
        request.nextUrl.pathname.startsWith('/admin')) {
        if (!authStorage) {
            const signInUrl = new URL('/auth/signin', request.url)
            signInUrl.searchParams.set('from', request.nextUrl.pathname)
            return NextResponse.redirect(signInUrl)
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/client/:path*', '/admin/:path*']
}
