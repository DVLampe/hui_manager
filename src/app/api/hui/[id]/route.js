import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Apply the workaround pattern
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;
const prisma = new PrismaClient();

// Helper function to check if the user has access to the group
const checkGroupAccess = async (userId, groupId) => {
    const group = await prisma.huiGroup.findUnique({
        where: { id: groupId },
        select: {
            managerId: true,
            members: {
                where: { userId: userId },
                select: { userId: true }
            }
        }
    });
    if (!group) return null; // Group not found
    if (group.managerId === userId || group.members.length > 0) {
        return true; // User has access
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
    const hasAccess = await checkGroupAccess(userId, id);
    if (hasAccess === null) {
      return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hui = await prisma.huiGroup.findUnique({
        where: { id },
      include: {
        manager: true,
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
    const group = await prisma.huiGroup.findUnique({ where: { id } });
    if (!group) {
        return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }
    if (group.managerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: Only the manager can update the group' }, { status: 403 });
    }

    const body = await request.json();
    const { payments: periodsToUpdate, ...huiDataToUpdate } = body;

    // Remove managerId from update payload to prevent changing the manager
    delete huiDataToUpdate.managerId;

    if (!huiDataToUpdate.name || !huiDataToUpdate.amount) {
      return NextResponse.json({ error: 'Missing required fields for HuiGroup' }, { status: 400 });
    }

    const updatedHui = await prisma.$transaction(async (tx) => {
        await tx.huiGroup.update({
            where: { id },
            data: {
              name: huiDataToUpdate.name,
              description: huiDataToUpdate.description,
              amount: huiDataToUpdate.amount,
              startDate: huiDataToUpdate.startDate ? new Date(huiDataToUpdate.startDate) : undefined,
              endDate: huiDataToUpdate.endDate ? new Date(huiDataToUpdate.endDate) : undefined,
              status: huiDataToUpdate.status,
              // managerId is not updated
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
                p.userId = group.managerId;
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
    const group = await prisma.huiGroup.findUnique({
      where: { id },
      select: { managerId: true },
    });

    if (!group) {
        return NextResponse.json({ error: 'Hui group not found' }, { status: 404 });
    }

    if (group.managerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: Only the manager can delete the group' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
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

