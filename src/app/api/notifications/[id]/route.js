import { NextResponse as OriginalNextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

// PUT /api/notifications/[id] - Mark a notification as read
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // First, verify the notification belongs to the current user
    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found or access denied' }, { status: 404 });
    }

    // If it exists and belongs to the user, update it
    const updatedNotification = await prisma.notification.update({
      where: {
        id: id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error(`Error updating notification ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
