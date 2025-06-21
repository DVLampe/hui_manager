// src/app/api/payments/[id]/route.js
import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET /api/payments/[id] - Fetch details of a single payment period (Kỳ)
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const paymentPeriod = await prisma.payment.findUnique({
      where: { id },
      include: {
        huiGroup: { select: { id: true, name: true, amount: true } }, // Include group amount as reference
        user: { select: { id: true, name: true } }, // User who created/managed this period
        potTakerMember: {
          include: {
            user: { select: { id: true, name: true } }, // User details for the pot taker
          },
        },
        memberContributions: {
          orderBy: { member: { user : {name: 'asc'} } }, // Order by member name for consistent display
          include: {
            member: {
              include: {
                user: { select: { id: true, name: true, email: true } }, // User details for the contributing member
              },
            },
          },
        },
        history: { // Include payment history for this period
          orderBy: { createdAt: 'desc' },
          include: {
            user: {select: {id: true, name: true}}
          }
        },
      },
    });

    if (!paymentPeriod) {
      return NextResponse.json({ error: 'Payment period not found' }, { status: 404 });
    }
    return NextResponse.json(paymentPeriod);
  } catch (error) {
    console.error(`Error fetching payment period by ID ${id}:`, error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// PUT /api/payments/[id] - Update an existing payment period (Kỳ)
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    // Add role-based access control if needed, e.g., only manager of the group can update
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const body = await request.json();
    const {
      // huiGroupId, // Should not be changed ideally, period belongs to a group
      // period, // Period number should not be changed ideally
      dueDate,
      potTakerMemberId,
      amount,
      amountCollected,
      thamKeu,
      thao,
      transactionStatus,
      cycle,
      note,
      type,
      userId, // User managing this record, if changed
    } = body;

    const updateData = {};
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (potTakerMemberId !== undefined) updateData.potTakerMemberId = potTakerMemberId; // Can be null
    if (amount !== undefined) updateData.amount = new Prisma.Decimal(amount);
    if (amountCollected !== undefined) updateData.amountCollected = amountCollected !== null ? new Prisma.Decimal(amountCollected) : null;
    if (thamKeu !== undefined) updateData.thamKeu = thamKeu !== null ? new Prisma.Decimal(thamKeu) : null;
    if (thao !== undefined) updateData.thao = thao !== null ? new Prisma.Decimal(thao) : null;
    if (transactionStatus !== undefined) updateData.transactionStatus = transactionStatus;
    if (cycle !== undefined) updateData.cycle = parseInt(cycle, 10);
    if (note !== undefined) updateData.note = note;
    if (type !== undefined) updateData.type = type;
    if (userId !== undefined) updateData.userId = userId; // If admin changes the record manager

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }
    
    updateData.updatedAt = new Date(); // Explicitly set updatedAt

    const updatedPaymentPeriod = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        huiGroup: { select: { id: true, name: true, amount: true } },
        user: { select: { id: true, name: true } },
        potTakerMember: { include: { user: { select: { id: true, name: true } } } },
        memberContributions: { include: { member: { include: { user: { select: { id: true, name: true } } } } } },
        history: { include: { user: {select: {id: true, name: true}}}},
      },
    });

    return NextResponse.json(updatedPaymentPeriod);
  } catch (error) {
    console.error(`Error updating payment period ${id}:`, error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Payment period not found for update' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// DELETE /api/payments/[id] - Delete a payment period (Kỳ)
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    // Add role-based access control if needed
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated MemberPeriodContributions
      await tx.memberPeriodContribution.deleteMany({
        where: { paymentId: id },
      });

      // 2. Delete associated PaymentHistory
      await tx.paymentHistory.deleteMany({
        where: { paymentId: id },
      });

      // 3. Delete the Payment period itself
      await tx.payment.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: 'Payment period and associated contributions/history deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting payment period ${id}:`, error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Payment period not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
