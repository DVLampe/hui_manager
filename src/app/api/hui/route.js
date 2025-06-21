import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET /api/hui
// Lấy danh sách các hụi
export async function GET(request) {
  try {
    const huis = await prisma.huiGroup.findMany({
      include: {
        manager: { 
          select: { id: true, name: true, email: true },
        },
        _count: { 
          select: { members: true, payments: true }, // Added count of payments (periods)
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return NextResponse.json(huis);
  } catch (error) {
    console.error('Error fetching hui groups:', error);
    return NextResponse.json({ message: 'Error fetching hui groups', error: error.message }, { status: 500 });
  }
}

// POST /api/hui
// Tạo một hụi mới, possibly with initial members and payment periods
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      amount,
      startDate,
      managerId, // TODO: Should be derived from authenticated user
      cycle,
      totalMembers,
      description,
      endDate,
      rules,
      members: initialMembers, // Optional array of initial members { userId: string, position?: number, notes?: string }
      payments: initialPayments // Optional array of initial payment periods { period: number, dueDate: string, potTakerMemberId?: string, ... }
    } = body;

    if (!name || !amount || !startDate || !managerId || cycle === undefined || totalMembers === undefined) {
      return NextResponse.json({ message: 'Missing required fields for HuiGroup' }, { status: 400 });
    }

    let parsedAmount;
    try {
      parsedAmount = new Prisma.Decimal(amount);
      if (parsedAmount.isNaN() || parsedAmount.isNegative()) {
        throw new Error('Invalid amount value');
      }
    } catch (e) {
      return NextResponse.json({ message: 'Invalid amount format. Must be a positive number.' }, { status: 400 });
    }

    let parsedStartDate;
    try {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new Error('Invalid start date');
      }
    } catch (e) {
      return NextResponse.json({ message: 'Invalid startDate format.' }, { status: 400 });
    }

    let parsedEndDate = null;
    if (endDate) {
      try {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new Error('Invalid end date');
        }
        if (parsedEndDate < parsedStartDate) {
          return NextResponse.json({ message: 'End date cannot be before start date.' }, { status: 400 });
        }
      } catch (e) {
        return NextResponse.json({ message: 'Invalid endDate format.' }, { status: 400 });
      }
    }

    const parsedCycle = parseInt(cycle, 10);
    const parsedTotalMembers = parseInt(totalMembers, 10);

    if (isNaN(parsedCycle) || parsedCycle <= 0) {
      return NextResponse.json({ message: 'Cycle must be a positive integer.' }, { status: 400 });
    }
    if (isNaN(parsedTotalMembers) || parsedTotalMembers <= 0) {
      return NextResponse.json({ message: 'Total members must be a positive integer.' }, { status: 400 });
    }

    const nextPaymentDate = parsedStartDate; // Simplified calculation

    const newHuiGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.huiGroup.create({
        data: {
          name,
          description,
          amount: parsedAmount,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          managerId,
          cycle: parsedCycle,
          totalMembers: parsedTotalMembers,
          nextPaymentDate,
          rules: rules || Prisma.JsonNull,
        },
      });

      if (initialMembers && Array.isArray(initialMembers)) {
        const memberCreations = initialMembers.map(m => ({
          groupId: group.id,
          userId: m.userId,
          position: m.position,
          notes: m.notes,
          // other HuiMember fields with defaults or to be set later
        }));
        await tx.huiMember.createMany({
          data: memberCreations,
          skipDuplicates: true, // based on @@unique([userId, groupId])
        });
      }

      if (initialPayments && Array.isArray(initialPayments)) {
        // Fetch created members if potTakerMemberId might refer to a symbolic ID or requires mapping
        // For now, assumes potTakerMemberId is the actual HuiMember.id if provided.
        const paymentCreations = initialPayments.map(p => ({
          huiGroupId: group.id,
          period: parseInt(p.period, 10),
          cycle: p.cycle !== undefined ? parseInt(p.cycle, 10) : parseInt(p.period, 10),
          dueDate: p.dueDate ? new Date(p.dueDate) : new Date(), // Ensure correct date parsing
          amount: p.amount ? new Prisma.Decimal(p.amount) : parsedAmount,
          potTakerMemberId: p.potTakerMemberId || null,
          userId: p.userId || managerId, // User managing this period, defaults to group manager
          amountCollected: p.amountCollected ? new Prisma.Decimal(p.amountCollected) : null,
          thamKeu: p.thamKeu ? new Prisma.Decimal(p.thamKeu) : null,
          thao: p.thao ? new Prisma.Decimal(p.thao) : null,
          transactionStatus: p.status || 'CHO_THANH_TOAN',
          type: p.type || 'PERIOD_SETTLEMENT',
        }));
        await tx.payment.createMany({
          data: paymentCreations,
        });
      }

      return tx.huiGroup.findUnique({
        where: { id: group.id },
        include: {
          manager: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true } } } },
          payments: { include: { potTakerMember: { include: { user: { select: { id: true, name: true } } } } } },
          _count: { select: { members: true, payments: true } },
        },
      });
    });

    return NextResponse.json(newHuiGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating hui group:', error);
    if (error.code === 'P2002') { 
      return NextResponse.json({ message: `Hui group creation failed due to unique constraint: \${error.meta?.target}` }, { status: 409 });
    }
    if (error.code === 'P2003') { 
      return NextResponse.json({ message: `Foreign key constraint failed: \${error.meta?.field_name}` }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
