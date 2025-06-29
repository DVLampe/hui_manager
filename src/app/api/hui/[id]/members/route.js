import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // Corrected path

// The workaround for NextResponse
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET /api/hui/[id]/members
export async function GET(request, { params }) {
  try {
    const members = await prisma.huiMember.findMany({
      where: {
        groupId: params.id
      },
      include: {
        user: true,
        group: true
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/hui/[id]/members
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const member = await prisma.huiMember.create({
      data: {
        ...body,
        groupId: params.id
      },
      include: {
        user: true,
        group: true
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
