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

    if (!addresseeId || typeof addresseeId !== 'string') {
      return NextResponse.json({ error: "ID người dùng không hợp lệ." }, { status: 400 });
    }

    if (requesterId === addresseeId) {
      return NextResponse.json({ error: "Bạn không thể gửi lời mời kết bạn cho chính mình." }, { status: 400 });
    }

    // Check if the addressee exists
    const addresseeExists = await prisma.user.findUnique({
      where: { id: addresseeId },
      select: { id: true }
    });

    if (!addresseeExists) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    // Try to find existing friendship first to provide better error messages
    const allExistingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: requesterId, addresseeId: addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId }
        ]
      }
    });

    if (allExistingFriendships.length > 0) {
      const existingFriendship = allExistingFriendships[0];
      
      if (existingFriendship.status === 'PENDING') {
        if (existingFriendship.requesterId === addresseeId) {
          return NextResponse.json({ error: 'Người này đã gửi lời mời kết bạn cho bạn. Vui lòng kiểm tra lời mời đã nhận.' }, { status: 409 });
        } else {
          return NextResponse.json({ error: 'Bạn đã gửi lời mời kết bạn cho người này rồi.' }, { status: 409 });
        }
      } else if (existingFriendship.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Bạn và người này đã là bạn bè rồi.' }, { status: 409 });
      } else if (existingFriendship.status === 'BLOCKED') {
        return NextResponse.json({ error: 'Không thể gửi lời mời kết bạn cho người này.' }, { status: 403 });
      }
      
      // If there are DECLINED requests, we can allow sending a new request
      // Delete the old relationship and create new
      if (existingFriendship.status === 'DECLINED') {
        await prisma.friendship.delete({
          where: { id: existingFriendship.id }
        });
      }
    }

    // Use upsert to handle any remaining race conditions
    const result = await prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: requesterId,
          addresseeId: addresseeId
        }
      },
      update: {
        status: 'PENDING',
        updatedAt: new Date()
      },
      create: {
        requesterId: requesterId,
        addresseeId: addresseeId,
        status: 'PENDING'
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        addressee: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error sending friend request:', error);
    
    // Handle business logic errors from the transaction
    if (error.message && (error.message.includes('already sent') || error.message.includes('đã gửi'))) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Lời mời kết bạn đã tồn tại hoặc bạn đã là bạn bè với người này.' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Có lỗi xảy ra trên server.' }, { status: 500 });
  }
}
