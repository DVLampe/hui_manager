import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Correctly apply the workaround
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

// GET /api/hui
// Lấy danh sách các hụi mà user là manager hoặc member
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const huis = await prisma.huiGroup.findMany({
      where: {
        OR: [
          { ownerId: userId }, // User is the manager
          {
            members: {
              some: {
                userId: userId, // User is one of the members
              },
            },
          },
        ],
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, payments: true },
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
// Tạo một hụi mới, with the current user as manager
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const ownerId = session.user.id; // Manager is the authenticated user

  try {
    const body = await request.json();
    const {
      name,
      amount,
      startDate,
      frequency,
      numberOfPeriods,
      description,
      endDate,
      members: initialMembers,
      payments: initialPayments
    } = body;

    if (!name || !amount || !startDate || !frequency || !numberOfPeriods) {
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

    const parsedNumberOfPeriods = parseInt(numberOfPeriods, 10);

    if (isNaN(parsedNumberOfPeriods) || parsedNumberOfPeriods <= 0) {
      return NextResponse.json({ message: 'Number of periods must be a positive integer.' }, { status: 400 });
    }

    const nextPaymentDate = parsedStartDate; // Simplified calculation

    const newHuiGroup = await prisma.$transaction(async (tx) => {
      // Ensure the owner exists before creating the group
      const owner = await tx.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        // This case should ideally not be reached if session is managed correctly
        throw new Error('Owner not found. Please log in again.');
      }
      
      const group = await tx.huiGroup.create({
        data: {
          name,
          description,
          amount: parsedAmount,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          ownerId, // Set from session
          frequency,
          numberOfPeriods: parsedNumberOfPeriods,
          totalMembers: parsedNumberOfPeriods, // Total members is the same as number of periods
          nextPaymentDate,
        },
      });

      // Automatically grant the creator MANAGE permission
      await tx.huiPermission.create({
        data: {
          userId: ownerId,
          groupId: group.id,
          permission: 'MANAGE',
        },
      });

      if (initialMembers && Array.isArray(initialMembers)) {
        const memberCreations = initialMembers.map(m => {
          const memberData = {
            groupId: group.id,
            position: m.position,
            notes: m.notes,
            totalPaid: 0,
            totalDue: 0,
          };
          if (m.userId) {
            memberData.userId = m.userId;
          } else if (m.guestName) {
            memberData.guestName = m.guestName;
          }
          return memberData;
        });
        await tx.huiMember.createMany({
          data: memberCreations,
          skipDuplicates: true,
        });
      }

      // Automatically generate payment schedule if not provided
      if (!initialPayments || initialPayments.length === 0) {
        const payments = [];
        const calculateDueDate = (startDate, periodIndex, frequency) => {
          const d = new Date(startDate);
          switch (frequency) {
            case 'DAILY':
              d.setDate(d.getDate() + periodIndex);
              break;
            case 'WEEKLY':
              d.setDate(d.getDate() + periodIndex * 7);
              break;
            case 'MONTHLY':
            default:
              d.setMonth(d.getMonth() + periodIndex);
              break;
          }
          return d;
        };

        for (let i = 0; i < parsedNumberOfPeriods; i++) {
          const dueDate = calculateDueDate(parsedStartDate, i, frequency);
          payments.push({
            huiGroupId: group.id,
            period: i + 1,
            dueDate: dueDate,
            amount: parsedAmount,
            userId: ownerId,
            transactionStatus: i === 0 ? 'CHO_THANH_TOAN' : 'CHUA_DEN_KY',
            type: 'PERIOD_SETTLEMENT',
          });
        }
        await tx.payment.createMany({
          data: payments,
        });
      } else if (initialPayments && Array.isArray(initialPayments)) {
        const paymentCreations = initialPayments.map(p => ({
          huiGroupId: group.id,
          period: parseInt(p.period, 10),
          dueDate: p.dueDate ? new Date(p.dueDate) : new Date(),
          amount: p.amount ? new Prisma.Decimal(p.amount) : parsedAmount,
          potTakerMemberId: p.potTakerMemberId || null,
          userId: p.userId || ownerId,
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
          permissions: { include: { user: true } },
          _count: { select: { members: true, payments: true } },
        },
      });
    });

    return NextResponse.json(newHuiGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating hui group:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: `Hui group creation failed due to unique constraint: ${error.meta?.target}` }, { status: 409 });
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ message: `Foreign key constraint failed: ${error.meta?.field_name}` }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
