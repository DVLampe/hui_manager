import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to check access rights
const checkAccess = async (userId, groupId, requireManager = false) => {
    const group = await prisma.huiGroup.findUnique({
        where: { id: groupId },
        select: {
            managerId: true,
            members: {
                where: { userId },
                select: { userId: true }
            }
        }
    });

    if (!group) return 'not_found';
    if (group.managerId === userId) return 'manager';
    if (requireManager) return 'forbidden';
    if (group.members.length > 0) return 'member';

    return 'forbidden';
};

// GET /api/hui/[id]/members - Get members of a group
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id: groupId } = params;
  const userId = session.user.id;

  try {
    const access = await checkAccess(userId, groupId);

    if (access === 'not_found') {
        return NextResponse.json({ message: 'Hui group not found' }, { status: 404 });
    }
    if (access === 'forbidden') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // If user has access, fetch the members
    const members = await prisma.huiMember.findMany({
      where: {
        groupId: groupId
      },
      include: {
        user: {
            select: { id: true, name: true, email: true, image: true }
        },
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/hui/[id]/members - Add a new member to a group
export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = params;
    const currentUserId = session.user.id;
    try {
        const access = await checkAccess(currentUserId, groupId, true); // requireManager = true

        if (access === 'not_found') {
            return NextResponse.json({ message: 'Hui group not found' }, { status: 404 });
        }
        if (access === 'forbidden' || access !== 'manager') {
            return NextResponse.json({ message: 'Forbidden: Only the manager can add members' }, { status: 403 });
        }

        const group = await prisma.huiGroup.findUnique({ where: { id: groupId } });
        if (!group) {
            // This case is already handled by checkAccess, but as a safeguard
            return NextResponse.json({ message: 'Hui group not found' }, { status: 404 });
        }

        const body = await request.json();
        const { userId, position, notes } = body;

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required to add a member' }, { status: 400 });
        }

        // Check if the user to be added exists
        const userToAdd = await prisma.user.findUnique({ where: { id: userId }});
        if (!userToAdd) {
            return NextResponse.json({ message: `User with ID ${userId} not found` }, { status: 404 });
        }
        const newMember = await prisma.huiMember.create({
            data: {
                groupId: groupId,
                userId: userId,
                position: position,
                notes: notes,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                },
            }
        });

        // --- Create Notification ---
        try {
            await prisma.notification.create({
                data: {
                    userId: userId,
                    title: 'Lời mời tham gia nhóm',
                    message: `Bạn đã được mời vào nhóm "${group.name}".`,
                    type: 'HUI_INVITATION',
                    link: `/hui/${groupId}`,
                },
            });
        } catch (notificationError) {
            console.error('Failed to create notification for new member:', notificationError);
            // We don't want to fail the whole request if notification fails, so we just log it.
        }
        // -------------------------

        return NextResponse.json(newMember, { status: 201 });
    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed
             return NextResponse.json({ message: 'This user is already a member of the group' }, { status: 409 });
        }
    console.error('Error creating member:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
