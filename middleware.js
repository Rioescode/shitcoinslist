import { NextResponse } from 'next/server';

export function middleware(request) {
    // Get the hostname
    const hostname = request.headers.get('host');
    const url = request.nextUrl.clone();

    // If it's the root domain and not already on the home page
    if (hostname === 'shitcoinslist.com' && url.pathname === '/') {
        url.pathname = '/';
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api|_next|static|[\\w-]+\\.\\w+).*)',
    ],
}; 