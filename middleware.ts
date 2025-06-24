import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes (these are the ONLY routes that don't require authentication)
const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the session cookie
    const sessionCookie = request.cookies.get('session');
    const isAuthenticated = !!sessionCookie?.value;

    // Check if the current route is explicitly public
    const isPublicRoute = publicRoutes.some(route =>
        pathname.startsWith(route)
    );

    // If it's a public route and user is authenticated, redirect to home
    if (isPublicRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If it's NOT a public route and user is NOT authenticated, redirect to login
    if (!isPublicRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Allow the request to proceed
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};