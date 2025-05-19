import { NextResponse as OriginalNextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/members/[id]
export async function GET(request, { params }) {
  const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
  try {
    const member = await prisma.huiMember.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        group: true
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/members/[id]
export async function PUT(request, { params }) {
  const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
  try {
    const body = await request.json()
    const member = await prisma.huiMember.update({
      where: { id: params.id },
      data: body,
      include: {
        user: true,
        group: true
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/members/[id]
export async function DELETE(request, { params }) {
  const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
  try {
    await prisma.huiMember.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Member deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
