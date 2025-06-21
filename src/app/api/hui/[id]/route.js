import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET: Fetch details of a single Hui group
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const hui = await prisma.huiGroup.findUnique({
      where: { id },
      include: {
        manager: true, // User who manages the group
        members: {     // Members of this HuiGroup
          include: {
            user: true, // User details for each member
          },
        },
        payments: {    // Periods (Kỳ) of this HuiGroup
          orderBy: {
            period: 'asc',
          },
          include: {
            user: true, // User who created/managed this payment record (period)
            potTakerMember: { // The HuiMember who is taking the pot this period
              include: {
                user: true, // User details for the potTakerMember
              },
            },
            memberContributions: { // Individual contributions for this period
              include: {
                member: { // The HuiMember who made the contribution
                  include: {
                    user: true, // User details for the contributing member
                  },
                },
              },
            },
            history: true, // PaymentHistory for this period
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
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a Hui group and its high-level payment periods
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { payments: periodsToUpdate, ...huiDataToUpdate } = body;

    if (!huiDataToUpdate.name || !huiDataToUpdate.amount) {
      return NextResponse.json({ error: 'Missing required fields for HuiGroup' }, { status: 400 });
    }

    const updatedHui = await prisma.$transaction(async (tx) => {
      // 1. Update HuiGroup details
      await tx.huiGroup.update({
        where: { id },
        data: {
          name: huiDataToUpdate.name,
          description: huiDataToUpdate.description,
          amount: huiDataToUpdate.amount, // Base amount per member
          startDate: huiDataToUpdate.startDate ? new Date(huiDataToUpdate.startDate) : undefined,
          endDate: huiDataToUpdate.endDate ? new Date(huiDataToUpdate.endDate) : undefined,
          status: huiDataToUpdate.status,
          managerId: huiDataToUpdate.managerId,
          cycle: huiDataToUpdate.cycle,
          totalMembers: huiDataToUpdate.totalMembers,
          currentCycle: huiDataToUpdate.currentCycle,
          nextPaymentDate: huiDataToUpdate.nextPaymentDate ? new Date(huiDataToUpdate.nextPaymentDate) : undefined,
          rules: huiDataToUpdate.rules,
        },
      });

      // 2. Handle Payment (Periods)
      if (periodsToUpdate && Array.isArray(periodsToUpdate)) {
        // For simplicity in this example, we'll delete existing periods and recreate them.
        // A more sophisticated approach might update existing ones or handle changes more granularly.

        // First, remove MemberPeriodContributions for existing Payment periods of this group
        const existingPeriods = await tx.payment.findMany({ where: { huiGroupId: id } });
        for (const period of existingPeriods) {
          await tx.memberPeriodContribution.deleteMany({
            where: { paymentId: period.id },
          });
        }
        
        // Then delete existing Payment periods
        await tx.payment.deleteMany({
          where: { huiGroupId: id },
        });

        // Create new Payment periods
        const periodCreations = periodsToUpdate.map(p => {
          if (!p.userId) {
            console.warn(`Payment period ${p.period} missing userId, defaulting to managerId: ${huiDataToUpdate.managerId}`);
            p.userId = huiDataToUpdate.managerId;
          }
          if (!p.userId) {
            throw new Error(`Critical: userId is null for payment period ${p.period} and managerId is also not available.`);
          }
          return {
            huiGroupId: id,
            period: parseInt(p.period, 10),
            // cycle: parseInt(p.period, 10), // 'cycle' in Payment might be different from 'period'
            cycle: p.cycle !== undefined ? parseInt(p.cycle, 10) : parseInt(p.period, 10),
            dueDate: p.dueDate ? new Date(p.dueDate.split('/').reverse().join('-')) : new Date(), // Consider a more robust date parsing
            amount: parseFloat(String(p.amount !== undefined ? p.amount : huiDataToUpdate.amount).replace(/[^\d.]/g, '')), // Default to group amount if period amount not specified
            potTakerMemberId: p.potTakerMemberId || p.memberId || null, // p.memberId is for backward compatibility if old payload is sent
            userId: p.userId, // User managing this period record
            amountCollected: p.amountCollected ? parseFloat(String(p.amountCollected).replace(/[^\d.]/g, '')) : null,
            thamKeu: p.thamKeu ? parseFloat(String(p.thamKeu).replace(/[^\d.]/g, '')) : null,
            thao: p.thao ? parseFloat(String(p.thao).replace(/[^\d.]/g, '')) : null,
            transactionStatus: p.status || 'CHO_THANH_TOAN', // Default status
            type: p.type || 'PERIOD_SETTLEMENT', // Default type
            // Note: MemberPeriodContributions are NOT created here. This PUT only handles the Payment period itself.
          };
        });

        if (periodCreations.length > 0) {
          await tx.payment.createMany({
            data: periodCreations,
            skipDuplicates: true, // If period numbers could clash, though huiGroupId+period is now unique
          });
        }
      }
      // Fetch the fully updated HuiGroup with all new relations
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
  const { id } = params;
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Find all Payment periods for the group
      const paymentsToDelete = await tx.payment.findMany({
        where: { huiGroupId: id },
        select: { id: true }, // Select only IDs
      });
      const paymentIdsToDelete = paymentsToDelete.map(p => p.id);

      // 2. Delete MemberPeriodContributions associated with these payments
      if (paymentIdsToDelete.length > 0) {
        await tx.memberPeriodContribution.deleteMany({
          where: { paymentId: { in: paymentIdsToDelete } },
        });
      }

      // 3. Delete Payment records (periods)
      await tx.payment.deleteMany({
        where: { huiGroupId: id },
      });

      // 4. Delete HuiMember records
      await tx.huiMember.deleteMany({
        where: { groupId: id },
      });

      // 5. Delete the HuiGroup itself
      await tx.huiGroup.delete({
        where: { id },
      });
    });
    return NextResponse.json({ message: 'Hui deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting hui ${id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // P2025: "An operation failed because it depends on one or more records that were required but not found."
      // This can happen if the HuiGroup itself was already deleted or some relation was unexpectedly missing.
      return NextResponse.json({ error: 'Hui group not found or related records missing for deletion.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
