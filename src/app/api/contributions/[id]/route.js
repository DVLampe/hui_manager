// src/app/api/contributions/[id]/route.js
import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET /api/contributions/[id] - Fetch a single member contribution
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const contribution = await prisma.memberPeriodContribution.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        payment: {
          include: {
            huiGroup: { select: { id: true, name: true } },
            potTakerMember: { include: { user: {select: {id: true, name: true}} } }
          },
        },
      },
    });

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }
    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error fetching contribution by ID ${id}:', error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// PUT /api/contributions/[id] - Update a member contribution
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    // TODO: Add role-based access control (e.g., only manager or admin can update)
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const body = await request.json();
    const {
      amountContributed,
      status,
      notes,
      contributionDate,
      // paymentId and memberId should generally not be changed here
    } = body;

    const updateData = {};
    if (amountContributed !== undefined) updateData.amountContributed = new Prisma.Decimal(amountContributed);
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (contributionDate !== undefined) updateData.contributionDate = contributionDate ? new Date(contributionDate) : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }
    updateData.updatedAt = new Date();

    const updatedContribution = await prisma.memberPeriodContribution.update({
      where: { id },
      data: updateData,
      include: {
        member: { include: { user: { select: { id: true, name: true } } } },
        payment: { include: { huiGroup: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(updatedContribution);
  } catch (error) {
    console.error('Error updating contribution ${id}:', error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Contribution not found for update' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// DELETE /api/contributions/[id] - Delete a member contribution
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    // TODO: Add role-based access control
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    await prisma.memberPeriodContribution.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contribution deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting contribution ${id}:`, error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Contribution not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
