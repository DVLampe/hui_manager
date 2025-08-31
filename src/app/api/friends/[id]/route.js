import { NextResponse as OriginalNextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route.js';
import prisma from '@/lib/prisma';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

// PUT: Update a friend request (accept, decline, or cancel)
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: friendshipId } = params;

  try {
    const { status } = await request.json();

    if (!['ACCEPTED', 'DECLINED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found.' }, { status: 404 });
    }

    // Check permissions
    if (status === 'CANCELLED' && friendship.requesterId !== userId) {
      return NextResponse.json({ error: 'You can only cancel requests you have sent.' }, { status: 403 });
    }
    if (['ACCEPTED', 'DECLINED'].includes(status) && friendship.addresseeId !== userId) {
      return NextResponse.json({ error: 'You can only accept or decline requests sent to you.' }, { status: 403 });
    }

    if (friendship.status !== 'PENDING') {
      return NextResponse.json({ error: 'This friend request has already been responded to.' }, { status: 409 });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
    });

    return NextResponse.json(updatedFriendship);
  } catch (error) {
    console.error('Error updating friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Cancel a sent friend request
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { id: friendshipId } = params;

    try {
        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship || friendship.requesterId !== userId) {
            return NextResponse.json({ error: 'Friend request not found or you do not have permission to delete it.' }, { status: 404 });
        }

        if (friendship.status !== 'PENDING') {
            return NextResponse.json({ error: 'This friend request cannot be cancelled as it has already been responded to.' }, { status: 409 });
        }

        await prisma.friendship.delete({
            where: { id: friendshipId },
        });

        return NextResponse.json({ message: 'Friend request cancelled successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error cancelling friend request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
