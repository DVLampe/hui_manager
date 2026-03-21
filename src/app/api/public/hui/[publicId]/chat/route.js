import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { pusherServer } from '@/lib/pusher';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const { publicId } = params;
  const { content, guestName } = await request.json();

  if (!content || !guestName) {
    return NextResponse.json({ error: 'Missing content or guestName' }, { status: 400 });
  }

  try {
    const hui = await prisma.huiGroup.findUnique({
      where: { publicId },
      select: { chatRoom: true }
    });

    if (!hui || !hui.chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        content,
        guestName,
        chatRoomId: hui.chatRoom.id,
      },
    });

    await pusherServer.trigger(`chat-${hui.chatRoom.id}`, 'new-message', {
        id: newMessage.id,
        content: newMessage.content,
        createdAt: newMessage.createdAt,
        guestName: newMessage.guestName,
        user: null
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending public chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
