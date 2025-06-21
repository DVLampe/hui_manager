// src/app/api/members/route.js
import prisma from '@/lib/prisma'
import { NextResponse as OriginalNextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET;
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET /api/members - Lấy danh sách thành viên
export async function GET(request) {
  try {
    const tokenCookie = cookies().get('token')
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const { searchParams } = new URL(request.url)
    const huiId = searchParams.get('huiId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const where = {}
    if (huiId) {
      where.groupId = huiId;
    }
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [members, total] = await prisma.$transaction([
      prisma.huiMember.findMany({
        where,
        select: {
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          group: {
            select: {
              id: true,
              name: true,
              amount: true,
              status: true
            }
          }
          // Removed: payments select block as it was based on the old schema
        },
        orderBy: {
          joinedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.huiMember.count({ where })
    ]);

    return NextResponse.json({
      members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    if (error.name === 'JOSEError') {
        return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/members - Tạo thành viên mới
export async function POST(request) {
  try {
    const tokenCookie = cookies().get('token')
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const body = await request.json()

    if (!body.userId || !body.groupId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and groupId are required.' },
        { status: 400 }
      );
    }

    const existingMember = await prisma.huiMember.findFirst({
      where: {
        userId: body.userId,
        groupId: body.groupId
      },
      select: { id: true }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member already exists in this hui group' },
        { status: 400 }
      );
    }

    const member = await prisma.huiMember.create({
      data: {
        userId: body.userId,
        groupId: body.groupId,
        joinedAt: body.joinedAt ? new Date(body.joinedAt) : new Date(),
        position: body.position,
        totalPaid: body.totalPaid || 0,
        totalDue: body.totalDue || 0,
        notes: body.notes
      },
      select: {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            amount: true,
            status: true
          }
        }
        // Removed: payments select block
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.name === 'JOSEError') {
        return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error.code && error.meta) {
      return NextResponse.json(
        { error: 'Error creating member in database', details: error.message, code: error.code, meta: error.meta },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/members/:id - Cập nhật thông tin thành viên (HuiMember)
// This should ideally be in a [id]/route.js file, but following current structure.
export async function PUT(request, { params }) {
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const memberId = params.id; // Assuming the ID comes from the dynamic route segment
    const body = await request.json();

    if (!memberId) {
      // This check might be redundant if the route is /api/members/[id]
      // but kept for robustness if used differently.
      const urlParts = request.url.split('/');
      const idFromUrl = urlParts[urlParts.length -1]; 
      if (!idFromUrl || urlParts[urlParts.length-2] !== 'members'){
           return NextResponse.json({ error: 'Member ID is required in the URL path' }, { status: 400 });
      }
      // memberId = idFromUrl; // Use this if params.id is not populated as expected
       return NextResponse.json({ error: 'Member ID not found in params. Ensure route is correctly defined as /api/members/[id]' }, { status: 400 });
    }

    const { position, notes, totalPaid, totalDue, lastPaymentDate, nextPaymentDate, leftAt } = body;
    const updateData = {};
    if (position !== undefined) updateData.position = position;
    if (notes !== undefined) updateData.notes = notes;
    if (totalPaid !== undefined) updateData.totalPaid = typeof totalPaid === 'string' ? parseFloat(totalPaid) : totalPaid;
    if (totalDue !== undefined) updateData.totalDue = typeof totalDue === 'string' ? parseFloat(totalDue) : totalDue;
    if (lastPaymentDate) updateData.lastPaymentDate = new Date(lastPaymentDate);
    if (nextPaymentDate) updateData.nextPaymentDate = new Date(nextPaymentDate);
    if (leftAt === null || leftAt) updateData.leftAt = leftAt ? new Date(leftAt) : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields provided to update' }, { status: 400 });
    }

    const member = await prisma.huiMember.update({
      where: { id: memberId },
      data: updateData,
      select: {
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
        user: { select: { id: true, name: true, email: true, phone: true } },
        group: { select: { id: true, name: true, amount: true, status: true } }
        // Removed: payments select block
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    if (error.name === 'JOSEError') {
        return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/members/:id - Xóa thành viên (HuiMember)
// This should ideally be in a [id]/route.js file.
export async function DELETE(request, { params }) {
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const memberId = params.id; // Assuming the ID comes from the dynamic route segment
     if (!memberId) {
      // This check might be redundant if the route is /api/members/[id]
      // but kept for robustness if used differently.
        const urlParts = request.url.split('/');
        const idFromUrl = urlParts[urlParts.length -1]; 
        if (!idFromUrl || urlParts[urlParts.length-2] !== 'members'){
             return NextResponse.json({ error: 'HuiMember ID is required in the URL path' }, { status: 400 });
        }
        // memberId = idFromUrl; // Use this if params.id is not populated as expected
         return NextResponse.json({ error: 'HuiMember ID not found in params. Ensure route is correctly defined as /api/members/[id]' }, { status: 400 });
    }

    const deletedMemberData = await prisma.$transaction(async (tx) => {
      // 1. Clear potTakerMemberId in Payments where this member was the taker
      await tx.payment.updateMany({
        where: { potTakerMemberId: memberId },
        data: { potTakerMemberId: null },
      });

      // 2. Delete MemberPeriodContributions made by this member
      await tx.memberPeriodContribution.deleteMany({
        where: { memberId: memberId },
      });

      // 3. Delete the HuiMember itself
      const member = await tx.huiMember.delete({
        where: { id: memberId },
        select: { // Select deleted member's id for confirmation
          id: true,
          userId: true,
          groupId: true
        }
      });
      return member;
    });

    return NextResponse.json({ message: 'HuiMember deleted successfully', member: deletedMemberData });

  } catch (error) {
    console.error('Error deleting member:', error);
    if (error.name === 'JOSEError') {
        return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'HuiMember not found for deletion' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
