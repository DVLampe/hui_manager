import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { publicId } = params;

  try {
    const hui = await prisma.huiGroup.findUnique({
      where: { publicId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        payments: {
          include: {
            potTakerMember: true,
            memberContributions: true,
          },
          orderBy: {
            period: 'asc',
          },
        },
        chatRoom: {
          include: {
            messages: {
              include: {
                user: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!hui) {
      return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }

    // We don't want to expose all user details
    const cleanedHui = {
      ...hui,
      members: hui.members.map(m => ({
        id: m.id,
        position: m.position,
        guestName: m.guestName,
        user: m.user ? { name: m.user.name, image: m.user.image } : null,
      })),
      chatRoom: hui.chatRoom ? {
        ...hui.chatRoom,
        messages: hui.chatRoom.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            guestName: msg.guestName,
            user: msg.user ? { name: msg.user.name } : null
        }))
      } : null
    };


    return NextResponse.json(cleanedHui);
  } catch (error) {
    console.error('Error fetching public hui data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
