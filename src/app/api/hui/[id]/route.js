import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route.js';

// Apply the workaround pattern
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;
const prisma = new PrismaClient();

// Helper function to check if the user has management access to the group
const checkManagementAccess = async (userId, groupId) => {
    const group = await prisma.huiGroup.findUnique({
        where: { id: groupId },
        select: {
            ownerId: true,
            permissions: {
                where: {
                    userId: userId,
                    permission: 'MANAGE',
                },
                select: { userId: true }
            }
        }
    });
    if (!group) return null; // Group not found
    if (group.ownerId === userId || group.permissions.length > 0) {
        return true; // User has management access
    }
    return false; // User does not have management access
};

// Helper function to check if the user can view the group
const checkViewAccess = async (userId, groupId) => {
    const group = await prisma.huiGroup.findUnique({
        where: { id: groupId },
        select: {
            ownerId: true,
            members: {
                where: { userId: userId },
                select: { userId: true }
            },
            permissions: {
                where: { userId: userId },
                select: { userId: true }
            }
        }
    });
    if (!group) return null; // Group not found
    if (group.ownerId === userId || group.members.length > 0 || group.permissions.length > 0) {
        return true; // User has view access
    }
    return false; // User does not have access
};


// GET: Fetch details of a single Hui group
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  const userId = session.user.id;

  try {
    const hasAccess = await checkViewAccess(userId, id);
    if (hasAccess === null) {
      return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hui = await prisma.huiGroup.findUnique({
        where: { id },
      include: {
        manager: true, // This is now the owner
        permissions: { include: { user: true } },
        members: { include: { user: true } },
        payments: {
          orderBy: { period: 'asc' },
          include: {
            user: true,
            potTakerMember: { include: { user: true } },
            memberContributions: { include: { member: { include: { user: true } } } },
            history: true,
          },
        },
      },
    });

    if (!hui) {
      return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }
    return NextResponse.json(hui);
  } catch (error) {
    console.error('Error fetching hui by ID:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
  }

// PUT: Update a Hui group and its high-level payment periods
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

  const { id } = params;
  const userId = session.user.id;

  try {
    const hasAccess = await checkManagementAccess(userId, id);
    if (hasAccess === null) {
        return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }
    if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden: You do not have permission to update this group' }, { status: 403 });
    }

    const body = await request.json();
    const { payments: periodsToUpdate, ...huiDataToUpdate } = body;

    // Prevent changing the owner
    delete huiDataToUpdate.ownerId;

    if (!huiDataToUpdate.name || !huiDataToUpdate.amount) {
      return NextResponse.json({ error: 'Missing required fields for HuiGroup' }, { status: 400 });
    }

    const updatedHui = await prisma.$transaction(async (tx) => {
        const group = await tx.huiGroup.update({
            where: { id },
            data: {
              name: huiDataToUpdate.name,
              description: huiDataToUpdate.description,
              amount: huiDataToUpdate.amount,
              startDate: huiDataToUpdate.startDate ? new Date(huiDataToUpdate.startDate) : undefined,
              endDate: huiDataToUpdate.endDate ? new Date(huiDataToUpdate.endDate) : undefined,
              status: huiDataToUpdate.status,
              cycle: huiDataToUpdate.cycle,
              totalMembers: huiDataToUpdate.totalMembers,
              currentCycle: huiDataToUpdate.currentCycle,
              nextPaymentDate: huiDataToUpdate.nextPaymentDate ? new Date(huiDataToUpdate.nextPaymentDate) : undefined,
              rules: huiDataToUpdate.rules,
            },
          });

          if (periodsToUpdate && Array.isArray(periodsToUpdate)) {
            const existingPeriods = await tx.payment.findMany({ where: { huiGroupId: id } });
            for (const period of existingPeriods) {
              await tx.memberPeriodContribution.deleteMany({
                where: { paymentId: period.id },
              });
            }

            await tx.payment.deleteMany({
              where: { huiGroupId: id },
            });

            const periodCreations = periodsToUpdate.map(p => {
              if (!p.userId) {
                p.userId = group.ownerId;
              }
              return {
                huiGroupId: id,
                period: parseInt(p.period, 10),
                cycle: p.cycle !== undefined ? parseInt(p.cycle, 10) : parseInt(p.period, 10),
                dueDate: p.dueDate ? new Date(p.dueDate.split('/').reverse().join('-')) : new Date(),
                amount: parseFloat(String(p.amount !== undefined ? p.amount : huiDataToUpdate.amount).replace(/[^\d.]/g, '')),
                potTakerMemberId: p.potTakerMemberId || p.memberId || null,
                userId: p.userId,
                amountCollected: p.amountCollected ? parseFloat(String(p.amountCollected).replace(/[^\d.]/g, '')) : null,
                thamKeu: p.thamKeu ? parseFloat(String(p.thamKeu).replace(/[^\d.]/g, '')) : null,
                thao: p.thao ? parseFloat(String(p.thao).replace(/[^\d.]/g, '')) : null,
                transactionStatus: p.status || 'CHO_THANH_TOAN',
                type: p.type || 'PERIOD_SETTLEMENT',
              };
            });

            if (periodCreations.length > 0) {
              await tx.payment.createMany({
                data: periodCreations,
                skipDuplicates: true,
              });
            }
          }
          return tx.huiGroup.findUnique({
            where: { id },
            include: {
              manager: true,
              permissions: { include: { user: true } },
              members: { include: { user: true } },
              payments: {
                orderBy: { period: 'asc' },
                include: {
                  user: true,
                  potTakerMember: { include: { user: true } },
                  memberContributions: { include: { member: { include: { user: true } } } },
                  history: true,
                },
              },
            },
          });
    });

    return NextResponse.json(updatedHui);

  } catch (error) {
    console.error(`Error updating hui ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Known Request Error:', { code: error.code, meta: error.meta, message: error.message });
        return NextResponse.json({ error: 'Database error', details: error.message, code: error.code }, { status: 400 });
      }
      console.error('Non-Prisma error during update:', error.message, error.stack);
      return NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
  }
}

// DELETE: Delete a Hui group and all its related data
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const userId = session.user.id;

  try {
    const hasAccess = await checkManagementAccess(userId, id);
    if (hasAccess === null) {
        return NextResponse.json({ error: 'Hui group not found' }, { status: 404 });
    }
    if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this group' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
        await tx.huiPermission.deleteMany({
            where: { groupId: id },
        });

        const paymentsToDelete = await tx.payment.findMany({
            where: { huiGroupId: id },
            select: { id: true },
        });
        const paymentIdsToDelete = paymentsToDelete.map(p => p.id);

        if (paymentIdsToDelete.length > 0) {
          await tx.memberPeriodContribution.deleteMany({
            where: { paymentId: { in: paymentIdsToDelete } },
          });
        }

        await tx.payment.deleteMany({
          where: { huiGroupId: id },
        });

        await tx.huiMember.deleteMany({
          where: { groupId: id },
        });

        await tx.huiGroup.delete({
          where: { id },
        });
    });
    return NextResponse.json({ message: 'Hui deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting hui ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return NextResponse.json({ error: 'Hui group not found or related records missing for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
