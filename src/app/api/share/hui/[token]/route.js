import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request, { params }) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const huiId = payload.huiId;

    if (!huiId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    }

    const hui = await prisma.hui.findUnique({
      where: { id: huiId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        payments: {
          orderBy: {
            period: 'asc',
          },
        },
        owner: true,
        manager: true,
        permissions: true,
      },
    });

    if (!hui) {
      return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }

    return NextResponse.json(hui);
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json({ error: 'Sharing link has expired' }, { status: 410 });
    }
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
