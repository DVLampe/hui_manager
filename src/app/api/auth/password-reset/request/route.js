import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent email enumeration attacks, we don't reveal if the user was found or not.
    // We'll send a success response in either case. The email is only sent if the user exists.
    if (user) {
      // Generate a secure token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set an expiry date (e.g., 1 hour from now)
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Update user record with the hashed token and expiry date
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordTokenExpiry: tokenExpiry,
        },
      });

      // Send the password reset email with the *unhashed* token
      await sendPasswordResetEmail(user.email, resetToken);
    }

    return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);
    // Return a generic error to avoid leaking information
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
