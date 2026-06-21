import { NextResponse } from 'next/server'
import { HARVII_DOMAIN, DEV_SLUG } from '@/lib/env'

export function middleware(request) {
    const { pathname } = request.nextUrl
    const host = request.headers.get('host') || ''

    // Skip internal Next.js routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon')
    ) {
        return NextResponse.next()
    }

    // Extract slug from subdomain: {slug}.harvii.shop
    // In dev, fall back to DEV_SLUG
    let slug = DEV_SLUG

    if (host.endsWith(`.${HARVII_DOMAIN}`)) {
        slug = host.replace(`.${HARVII_DOMAIN}`, '').split('.')[0]
    }

    const response = NextResponse.next()
    response.headers.set('x-slug', slug)
    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
