// This file is a backup of the old custom middleware.
// It is renamed to middleware.old.js to disable it.
// Next.js only recognizes files named `middleware.js` or `middleware.ts`.

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Using jose for JWT verification in middleware

const JWT_SECRET = process.env.JWT_SECRET;
// Log the JWT_SECRET at the time the module is loaded (server startup/restart)
console.log('[Middleware] Value of JWT_SECRET on module load:', JWT_SECRET);

async function verifyToken(token) {
  // ... (rest of the code is the same)
}

export async function middleware(request) {
  // ... (rest of the code is the same)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
