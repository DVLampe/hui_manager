import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Revert to the original NextResponse handling pattern
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// API to get the list of friends for the current user or search for users
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    
    // Check if this is a search request
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search');

    if (searchQuery) {
      // Search for users by email or phone
      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              id: {
                not: userId // Exclude current user
              }
            },
            {
              OR: [
                {
                  email: {
                    contains: searchQuery,
                    mode: 'insensitive'
                  }
                },
                {
                  phone: {
                    contains: searchQuery
                  }
                }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        },
        take: 10 // Limit results
      });

      return NextResponse.json(users);
    }

    // Default behavior: get friends list
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId },
        ],
        status: 'ACCEPTED',
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        addressee: { select: { id: true, name: true, email: true } },
      },
    });

    const friends = friendships.map(f => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        id: friend.id,
        name: friend.name,
        email: friend.email,
      };
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// API cập nhật thông tin user
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Lỗi cập nhật user:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
