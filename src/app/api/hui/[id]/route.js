import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma

const prisma = new PrismaClient();
// Revert to the original NextResponse handling pattern
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET: Fetch details of a single Hui group
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const hui = await prisma.huiGroup.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } }, 
        payments: {
          include: {
            member: { include: { user: true } },
            user: true,
            history: true,
          },
        },
        manager: true,
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

// PUT: Update a Hui group and its payment schedule
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { payments, ...huiDataToUpdate } = body;

    if (!huiDataToUpdate.name || !huiDataToUpdate.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.huiGroup.update({
        where: { id },
        data: {
            name: huiDataToUpdate.name,
            description: huiDataToUpdate.description,
            amount: huiDataToUpdate.amount,
            startDate: huiDataToUpdate.startDate ? new Date(huiDataToUpdate.startDate) : undefined,
            endDate: huiDataToUpdate.endDate ? new Date(huiDataToUpdate.endDate) : undefined,
            status: huiDataToUpdate.status,
            managerId: huiDataToUpdate.managerId, 
            cycle: huiDataToUpdate.cycle, // This is HuiGroup.cycle (e.g. monthly, bimonthly)
            totalMembers: huiDataToUpdate.totalMembers,
            currentCycle: huiDataToUpdate.currentCycle, // This is HuiGroup.currentCycle (which cycle the group is in)
            nextPaymentDate: huiDataToUpdate.nextPaymentDate ? new Date(huiDataToUpdate.nextPaymentDate) : undefined,
            rules: huiDataToUpdate.rules, 
        },
      });

      if (payments && Array.isArray(payments)) {
        await tx.payment.deleteMany({
          where: { huiGroupId: id },
        });

        const paymentCreations = payments.map(p => {
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
            cycle: parseInt(p.period, 10), // Payment.cycle is the specific payment period number
            dueDate: p.dueDate ? new Date(p.dueDate.split('/').reverse().join('-')) : new Date(), 
            amount: parseFloat(String(p.amount).replace(/[^\d]/g, '')), 
            memberId: p.memberId || null, // HuiMember.id of the pot taker
            userId: p.userId, // User.id of the user associated with this payment (e.g. pot taker or manager)
            potTakerId: p.memberId ? p.userId : null, // User.id of the pot taker
            amountCollected: p.amountCollected, // Changed p.tienHot to p.amountCollected
            transactionStatus: p.status, 
            type: 'CONTRIBUTION', 
          };
        });
        
        if (paymentCreations.length > 0) {
          await tx.payment.createMany({
            data: paymentCreations,
            skipDuplicates: true, 
          });
        }
      }
    });

    const fullyUpdatedHui = await prisma.huiGroup.findUnique({
        where: { id },
        include: {
            members: { include: { user: true } },
            payments: {
                include: {
                    member: { include: { user: true } },
                    user: true,
                    history: true,
                },
            },
            manager: true,
        },
    });

    return NextResponse.json(fullyUpdatedHui);

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

// DELETE: Delete a Hui group
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({
        where: { huiGroupId: id },
      });
      await tx.huiMember.deleteMany({
        where: { huiGroupId: id },
      });
      await tx.huiGroup.delete({
        where: { id },
      });
    });
    return NextResponse.json({ message: 'Hui deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting hui ${id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
