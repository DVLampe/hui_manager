import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;
const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const { id } = params;

  try {
    let hui = await prisma.huiGroup.findUnique({
      where: { id },
    });

    if (!hui) {
      return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }

    if (!hui.publicId) {
      hui = await prisma.huiGroup.update({
        where: { id },
        data: { publicId: uuidv4() },
      });
    }

    const shareableLink = `${process.env.NEXT_PUBLIC_BASE_URL}/public/hui/${hui.publicId}`;

    return NextResponse.json({ shareableLink });
  } catch (error) {
    console.error('Error generating shareable link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
