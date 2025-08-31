import { NextResponse as OriginalNextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route.js';
import prisma from '@/lib/prisma';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

// GET: Fetch a user's friends and friend requests
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId },
        ],
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        addressee: { select: { id: true, name: true, email: true } },
      },
    });

    const friends = friendships
      .filter(f => f.status === 'ACCEPTED')
      .map(f => (f.requesterId === userId ? f.addressee : f.requester));

    const pendingRequests = friendships.filter(f => f.status === 'PENDING' && f.addresseeId === userId);
    const sentRequests = friendships.filter(f => f.status === 'PENDING' && f.requesterId === userId);

    return NextResponse.json({ friends, pendingRequests, sentRequests });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Send a friend request
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const requesterId = session.user.id;

  try {
    const { addresseeId } = await request.json();

    if (requesterId === addresseeId) {
      return NextResponse.json({ error: "You cannot send a friend request to yourself." }, { status: 400 });
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
        if (existingFriendship.status === 'PENDING') {
            if (existingFriendship.requesterId === addresseeId) {
                // The other user has already sent a request to the current user.
                // We can auto-accept it, or just inform the user.
                // For now, let's inform them.
                return NextResponse.json({ error: 'This user has already sent you a friend request. Please check your received requests.' }, { status: 409 });
            } else {
                // The current user has already sent a request to the other user.
                return NextResponse.json({ error: 'You have already sent a friend request to this user.' }, { status: 409 });
            }
        } else if (existingFriendship.status === 'ACCEPTED') {
            return NextResponse.json({ error: 'You are already friends with this user.' }, { status: 409 });
        }
    }

    const newFriendRequest = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
      },
    });

    return NextResponse.json(newFriendRequest, { status: 201 });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
