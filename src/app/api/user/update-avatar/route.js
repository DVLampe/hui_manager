import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { NextResponse as OriginalNextResponse } from 'next/server';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return new NextResponse(JSON.stringify({ error: 'Image URL is required' }), { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return new NextResponse(JSON.stringify({ message: 'Avatar updated successfully' }), { status: 200 });

  } catch (error) {
    console.error('Error updating avatar:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
