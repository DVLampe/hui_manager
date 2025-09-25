import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password should be at least 6 characters long' }, { status: 400 });
    }

    // Hash the token received from the client to match the one in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user with this token
    const user = await prisma.user.findUnique({
      where: {
        resetPasswordToken: hashedToken,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token không hợp lệ.' }, { status: 400 });
    }

    // Check if the token has expired
    if (new Date() > new Date(user.resetPasswordTokenExpiry)) {
      return NextResponse.json({ error: 'Token đã hết hạn.' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
