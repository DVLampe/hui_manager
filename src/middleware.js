import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Using jose for JWT verification in middleware

const JWT_SECRET = process.env.JWT_SECRET;
// Log the JWT_SECRET at the time the module is loaded (server startup/restart)
console.log('[Middleware] Value of JWT_SECRET on module load:', JWT_SECRET);

async function verifyToken(token) {
  if (!JWT_SECRET) {
    console.error('[Middleware] verifyToken: JWT_SECRET is not set or undefined. Cannot verify token.');
    return null;
  }
  if (!token) {
    console.log('[Middleware] verifyToken: No token provided');
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    console.log('[Middleware] verifyToken: Token verified, payload:', payload);
    return payload; // Contains { userId, email, name, role, iat, exp }
  } catch (error) {
    // Log the specific error to understand why verification failed
    console.error('[Middleware] JWT Verification Error during jwtVerify:', error.message, 'Code:', error.code);
    if (error.code === 'ERR_JWS_INVALID' || error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
        console.error('[Middleware] This often means the JWT_SECRET used for signing is different from the one used for verification, or the token is malformed.');
    } else if (error.code === 'ERR_JWT_EXPIRED') {
        console.error('[Middleware] The token has expired.');
    }
    return null;
  }
}

export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const tokenCookie = request.cookies.get('token'); // Changed 'huiAuthToken' to 'token'
  const token = tokenCookie?.value;

  console.log(`
[Middleware] Request to: ${pathname}`);
  console.log('[Middleware] Token from cookie:', token ? `Present (starts with: ${token.substring(0, 20)}...)` : 'Absent');

  const publicPaths = ['/auth/signin', '/auth/singup', '/api/auth/login', '/api/auth/register'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === '/'; 
  console.log('[Middleware] Is public path?:', isPublicPath);

  const userData = await verifyToken(token);
  console.log('[Middleware] User data from token verification attempt:', userData);

  if (!userData) {
    console.log('[Middleware] No user data (or token invalid/expired). Path:', pathname, 'Is public?:', isPublicPath);
    if (!isPublicPath) {
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      console.log(`[Middleware] Not authenticated for protected route. Redirecting to: ${loginUrl.toString()}`);
      return NextResponse.redirect(loginUrl);
    }
    console.log('[Middleware] Allowing access to public path (or no further action needed as user data is absent for public path).');
    return NextResponse.next();
  }

  // User is authenticated (userData exists)
  console.log('[Middleware] User is authenticated. User data:', userData, 'Path:', pathname);
  if (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/singup')) {
    const redirectedFrom = searchParams.get('redirectedFrom');
    console.log('[Middleware] Authenticated user on auth page. redirectedFrom:', redirectedFrom);
    if (redirectedFrom && !publicPaths.some(p => redirectedFrom.startsWith(p)) && redirectedFrom !== '/') {
      console.log(`[Middleware] Redirecting to redirectedFrom: ${redirectedFrom}`);
      return NextResponse.redirect(new URL(redirectedFrom, request.url));
    }
    console.log('[Middleware] Redirecting to default authenticated page: /hui');
    return NextResponse.redirect(new URL('/hui', request.url)); 
  }

  // Optional: Redirect authenticated users from homepage to /hui
  if (pathname === '/' && userData) {
    console.log('[Middleware] Authenticated user on homepage. Redirecting to /hui.');
    return NextResponse.redirect(new URL('/hui', request.url));
  }

  // Role-based access control (example)
  if (pathname.startsWith('/admin') && userData.role !== 'ADMIN') {
    console.log('[Middleware] Admin access denied for user:', userData.email, 'Role:', userData.role, '. Redirecting to /auth/unauthorized');
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
  }

  console.log('[Middleware] Allowing request to proceed for authenticated user.');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files in public folder (e.g. /file.svg)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
