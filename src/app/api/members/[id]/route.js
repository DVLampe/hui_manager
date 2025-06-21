import { NextResponse as OriginalNextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/members/[id]
export async function GET(request, { params }) {
  const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
  try {
    const member = await prisma.huiMember.findUnique({
      where: { id: params.id },
      select: { // Explicit select
        id: true,
        userId: true,
        groupId: true,
        joinedAt: true,
        leftAt: true,
        position: true,
        totalPaid: true,
        totalDue: true,
        lastPaymentDate: true,
        nextPaymentDate: true,
        notes: true,
        user: true, // Assuming default select for user is fine or define it explicitly
        group: true // Assuming default select for group is fine or define it explicitly
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/members/[id]
export async function PUT(request, { params }) {
  const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
  try {
    const body = await request.json()
    // Remove fields that should not be directly updated or don't exist
    const { user, group, ...updateData } = body;

    const member = await prisma.huiMember.update({
      where: { id: params.id },
      data: updateData, // Use filtered updateData
      select: { // Explicit select
        id: true,
        userId: true,
        groupId: true,
        joinedAt: true,
        leftAt: true,
        position: true,
        totalPaid: true,
        totalDue: true,
        lastPaymentDate: true,
        nextPaymentDate: true,
        notes: true,
        user: true,
        group: true
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/members/[id]
export async function DELETE(request, { params }) {
  const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
  try {
    await prisma.huiMember.delete({
      where: { id: params.id },
      select: { id: true } // Added explicit select to potentially avoid the error
    })

    return NextResponse.json(
      { message: 'Member deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting member:', error)
    // Check if the error is the specific Prisma error we are trying to fix
    if (error.code === 'P2022' && error.meta && error.meta.column === 'HuiMember.status') {
      console.error('P2022 error for HuiMember.status during delete. This indicates an unexpected Prisma behavior.');
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, code: error.code },
      { status: 500 }
    )
  }
}
