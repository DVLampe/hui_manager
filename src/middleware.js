import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Using jose for JWT verification in middleware

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload; // Contains { userId, email, name, role, iat, exp }
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('huiAuthToken');
  const token = tokenCookie?.value;

  const publicPaths = ['/auth/signin', '/auth/singup', '/api/auth/login', '/api/auth/register'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === '/'; // Allow homepage for now

  if (isPublicPath && !token) {
    return NextResponse.next();
  }

  const userData = await verifyToken(token);

  if (!userData) {
    // If token is invalid or not present for a protected route, redirect to login
    if (!isPublicPath) {
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: pass redirect info
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next(); // Allow access to public paths even if token is invalid/expired (e.g. to re-login)
  }

  // If user is authenticated and tries to access auth pages (signin/signup), redirect to home
  if (userData && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/singup'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Role-based access control (example)
  if (pathname.startsWith('/admin') && userData.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url)); // Redirect to the new unauthorized page
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); // Or return a JSON response
  }

  // Add user data to request headers if needed by API routes or server components (optional)
  // const requestHeaders = new Headers(request.headers);
  // requestHeaders.set('x-user-id', userData.userId);
  // requestHeaders.set('x-user-email', userData.email);
  // requestHeaders.set('x-user-role', userData.role);
  // return NextResponse.next({ request: { headers: requestHeaders } });

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
