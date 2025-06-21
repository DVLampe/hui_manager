// src/app/api/payments/route.js
import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET /api/payments - Fetch a list of payment periods (Kỳ)
export async function GET(request) {
  try {
    const tokenCookie = cookies().get('token'); // Ensure cookie name matches your auth setup
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    // userData can be used for authorization if needed (e.g., only show periods from groups managed by user)
    const { payload: userData } = await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const { searchParams } = new URL(request.url);
    const huiGroupId = searchParams.get('huiGroupId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const where = {};
    if (huiGroupId) {
      where.huiGroupId = huiGroupId;
    }
    // Add more filters if needed, e.g., based on userData.userId for manager

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        include: {
          huiGroup: { select: { id: true, name: true } }, // Basic info about the group
          user: { select: { id: true, name: true } }, // User who created/managed this payment period
          potTakerMember: {
            include: {
              user: { select: { id: true, name: true } }, // User details for the pot taker
            },
          },
          _count: {
            select: { memberContributions: true }, // Count of contributions for this period
          },
        },
        orderBy: [
          { huiGroupId: 'asc' },
          { period: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payment periods:', error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST /api/payments - Create a new payment period (Kỳ)
export async function POST(request) {
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    const { payload: userData } = await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const body = await request.json();
    const {
      huiGroupId,
      period,
      dueDate,
      potTakerMemberId,
      amount, // Base amount for this period, if different from HuiGroup.amount
      amountCollected,
      thamKeu,
      thao,
      transactionStatus,
      cycle,
      note,
      type,
      userId, // ID of user creating/managing this period; defaults to logged-in user
    } = body;

    if (!huiGroupId || period === undefined || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: huiGroupId, period, and dueDate are required.' },
        { status: 400 }
      );
    }
    
    const managingUserId = userId || userData.userId; // Default to logged-in user if not specified

    const newPaymentPeriod = await prisma.payment.create({
      data: {
        huiGroupId,
        period: parseInt(period, 10),
        dueDate: new Date(dueDate),
        userId: managingUserId,
        potTakerMemberId: potTakerMemberId || null,
        amount: amount ? new Prisma.Decimal(amount) : undefined, // Handled by schema default or group amount logic
        amountCollected: amountCollected ? new Prisma.Decimal(amountCollected) : null,
        thamKeu: thamKeu ? new Prisma.Decimal(thamKeu) : null,
        thao: thao ? new Prisma.Decimal(thao) : null,
        transactionStatus: transactionStatus || 'CHUA_DEN_KY',
        cycle: cycle !== undefined ? parseInt(cycle, 10) : parseInt(period, 10), // Default cycle to period number
        note: note || null,
        type: type || 'PERIOD_SETTLEMENT',
      },
      include: {
        huiGroup: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        potTakerMember: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        _count: { select: { memberContributions: true } },
      },
    });

    return NextResponse.json(newPaymentPeriod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment period:', error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation (e.g. huiGroupId + period)
             return NextResponse.json({ error: `A payment period with period number '${body.period}' already exists in this group.`, code: error.code }, { status: 409 });
        }
        if (error.code === 'P2003') { // Foreign key constraint failed
            return NextResponse.json({ error: `Invalid reference: ${error.meta?.field_name}`, code: error.code }, { status: 400 });
        }
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
