// src/app/api/user/update/route.js
import { NextResponse as OriginalNextResponse } from 'next/server';
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     summary: Updates the currently logged-in user's profile.
 *     description: Updates the name, phone, dateOfBirth, and about fields for the user identified by the session token.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *               about:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       400:
 *         description: Invalid data provided.
 *       401:
 *         description: Unauthorized, user must be logged in.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
        name, phone, dateOfBirth, about,
        bankName, bankAccountNumber, bankAccountName, qrCodeUrl 
    } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        about: about || null,
        bankName: bankName || null,
        bankAccountNumber: bankAccountNumber || null,
        bankAccountName: bankAccountName || null,
        qrCodeUrl: qrCodeUrl || null,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
