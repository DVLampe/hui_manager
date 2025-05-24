import { NextResponse as OriginalNextResponse } from 'next/server'; // Renamed to OriginalNextResponse
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  let NextResponseToUse = OriginalNextResponse; // Variable to hold the correct NextResponse

  // Logic to determine the correct NextResponse to use
  if (OriginalNextResponse) {
    if (typeof OriginalNextResponse.json === 'undefined' &&
        OriginalNextResponse.default &&
        typeof OriginalNextResponse.default.json === 'function') {
      NextResponseToUse = OriginalNextResponse.default;
    }
  }

  // Critical check if NextResponseToUse.json is still not a function
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in /api/auth/me!');
    const criticalErrorResponse = new Response(
      JSON.stringify({ error: 'Lỗi nghiêm trọng: NextResponseToUse.json không phải là một hàm.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return criticalErrorResponse;
  }

  const tokenCookie = cookies().get('token'); // Changed from huiAuthToken

  if (!tokenCookie) {
    return NextResponseToUse.json({ error: 'Not authenticated: No token' }, { status: 401 });
  }

  const token = tokenCookie.value;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    // payload should contain { userId, email, name, role, iat, exp }

    if (!payload.userId) {
      return NextResponseToUse.json({ error: 'Invalid token: Missing userId' }, { status: 401 });
    }

    // Fetch fresh user data from the database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { // Select only the necessary fields, exclude password
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      // This case might happen if the user was deleted after the token was issued
      // Or if userId in token is somehow invalid
      // Clear the invalid cookie
      const response = NextResponseToUse.json({ error: 'User not found' }, { status: 401 });
      response.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' }); // Changed from huiAuthToken
      return response;
    }

    return NextResponseToUse.json({ user });

  } catch (error) {
    console.error('GET /api/auth/me - JWT Verification Error:', error.message);
    // Clear the invalid/expired cookie
    const response = NextResponseToUse.json({ error: 'Not authenticated: Invalid or expired token' }, { status: 401 });
    response.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' }); // Changed from huiAuthToken
    return response;
  }
}
