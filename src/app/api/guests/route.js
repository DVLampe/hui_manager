import { NextResponse as OriginalNextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route.js';
import prisma from '@/lib/prisma';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const guestMembers = await prisma.huiMember.findMany({
      where: {
        group: {
          ownerId: userId,
        },
        guestName: {
          not: null,
        },
      },
      select: {
        guestName: true,
      },
      distinct: ['guestName'],
    });

    const guestNames = guestMembers.map(guest => guest.guestName).filter(Boolean);

    return NextResponse.json(guestNames);
  } catch (error) {
    console.error('Error fetching guest names:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
