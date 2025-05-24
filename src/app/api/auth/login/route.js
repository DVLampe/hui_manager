import { NextResponse as OriginalNextResponse } from 'next/server'; // Renamed to OriginalNextResponse
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
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
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in /api/auth/login!');
    // Fallback to a manual Response object if NextResponseToUse.json is not available
    const criticalErrorResponse = new Response(
      JSON.stringify({ error: 'Lỗi nghiêm trọng: NextResponseToUse.json không phải là một hàm.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return criticalErrorResponse;
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponseToUse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponseToUse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponseToUse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = NextResponseToUse.json({ user: userWithoutPassword, token });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour in seconds, should match JWT expiry
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return NextResponseToUse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
