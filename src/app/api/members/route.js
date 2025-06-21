// src/app/api/members/route.js
import prisma from '@/lib/prisma'
import { NextResponse as OriginalNextResponse } from 'next/server' // Renamed
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
 
const JWT_SECRET = process.env.JWT_SECRET;


// GET /api/members - Lấy danh sách thành viên
export async function GET(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in GET /api/members!');
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  try {
    // Verify authentication
    const tokenCookie = cookies().get('token') // Changed from huiAuthToken
    
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to view members' },
        { status: 401 }
      )
    }
    
    // Verify JWT token
    let userData;
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      )
      userData = payload
    } catch (error) {
      console.error('JWT Verification Error:', error.message)
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      )
    }
    
    // Lấy query parameters
    const { searchParams } = new URL(request.url)
    const huiId = searchParams.get('huiId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    // Xây dựng query conditions
    const where = {}
    if (huiId) {
      // Assuming 'groupId' is the field on HuiMember linking to HuiGroup
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

    // Thực hiện query
    const [members, total] = await Promise.all([
      prisma.huiMember.findMany({ 
        where,
        select: { // Explicitly select fields for HuiMember
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
              status: true // This is HuiGroup.status
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              type: true,
              status: true, // This is Payment.transactionStatus (mapped to status)
              dueDate: true
            }
          }
        },
        orderBy: {
          joinedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.huiMember.count({ where }) 
    ])

    return NextResponseToUse.json({
      members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponseToUse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/members - Tạo thành viên mới
export async function POST(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in POST /api/members!');
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Verify authentication
    const tokenCookie = cookies().get('token')
    
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to add members' },
        { status: 401 }
      )
    }
    
    let userData;
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      )
      userData = payload
    } catch (error) {
      console.error('JWT Verification Error:', error.message)
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    if (!body.userId || !body.groupId) { 
      return NextResponseToUse.json(
        { error: 'Missing required fields: userId and groupId are required.' },
        { status: 400 }
      )
    }

    const existingMember = await prisma.huiMember.findFirst({ 
      where: {
        userId: body.userId,
        groupId: body.groupId 
      },
      select: { // Added explicit select to avoid fetching non-existent 'status'
        id: true
      }
    })

    if (existingMember) {
      return NextResponseToUse.json(
        { error: 'Member already exists in this hui group' },
        { status: 400 }
      )
    }

    const member = await prisma.huiMember.create({ 
      data: {
        userId: body.userId,
        groupId: body.groupId, 
        joinedAt: new Date(),
        position: body.position, 
        totalPaid: body.totalPaid || 0, 
        totalDue: body.totalDue || 0,
        notes: body.notes // Added notes field if provided
      },
      select: { // Explicitly select fields for the created member
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
            status: true // HuiGroup.status
          }
        }
      }
    })
    
    return NextResponseToUse.json(member)
  } catch (error) {
    console.error('Error creating member:', error)
    // Provide more specific error details if it's a Prisma error
    if (error.code && error.meta) {
        return NextResponseToUse.json(
            { error: 'Error creating member in database', details: error.message, code: error.code, meta: error.meta },
            { status: 500 }
        );
    }
    return NextResponseToUse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    )
  }
}

// PUT /api/members/:id - Cập nhật thông tin thành viên (HuiMember)
export async function PUT(request, { params }) { 
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in PUT /api/members!');
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const tokenCookie = cookies().get('token')
    
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to update members' },
        { status: 401 }
      )
    }
    
    let userData;
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      )
      userData = payload
    } catch (error) {
      console.error('JWT Verification Error:', error.message)
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      )
    }

    const memberId = params.id; 
    const body = await request.json()
    
    if (!memberId) {
      return NextResponseToUse.json(
        { error: 'Member ID is required in the URL path' },
        { status: 400 }
      )
    }
    
    const { position, notes, totalPaid, totalDue, lastPaymentDate, nextPaymentDate, leftAt } = body;
    const updateData = {};
    if (position !== undefined) updateData.position = position;
    if (notes !== undefined) updateData.notes = notes;
    if (totalPaid !== undefined) updateData.totalPaid = totalPaid;
    if (totalDue !== undefined) updateData.totalDue = totalDue;
    if (lastPaymentDate) updateData.lastPaymentDate = new Date(lastPaymentDate);
    if (nextPaymentDate) updateData.nextPaymentDate = new Date(nextPaymentDate);
    if (leftAt) updateData.leftAt = new Date(leftAt);


    if (Object.keys(updateData).length === 0) {
        return NextResponseToUse.json(
            { error: 'No fields provided to update' },
            { status: 400 }
        );
    }

    const member = await prisma.huiMember.update({ 
      where: {
        id: memberId
      },
      data: updateData,
      select: { // Explicitly select fields for the updated member
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
            status: true // HuiGroup.status
          }
        }
      }
    })
    
    return NextResponseToUse.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    if (error.code === 'P2025') { 
        return NextResponseToUse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponseToUse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/members/:id - Xóa thành viên (HuiMember)
export async function DELETE(request, { params }) { 
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in DELETE /api/members!');
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const tokenCookie = cookies().get('token')

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to delete members' },
        { status: 401 }
      )
    }
    
    let userData; 
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      )
      userData = payload
    } catch (error) {
      console.error('JWT Verification Error:', error.message)
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      )
    }

    const memberId = params.id; 

    if (!memberId) {
      return NextResponseToUse.json(
        { error: 'HuiMember ID is required in the URL path' },
        { status: 400 }
      )
    }
    
    const member = await prisma.huiMember.delete({ 
        where: {
            id: memberId
        },
        select: { // Select deleted member's id for confirmation (optional)
            id: true,
            userId: true,
            groupId: true
        }
    });
    
    return NextResponseToUse.json({ message: 'HuiMember deleted successfully', member });

  } catch (error) {
    console.error('Error deleting member:', error)
    if (error.code === 'P2025') { 
        return NextResponseToUse.json({ error: 'HuiMember not found' }, { status: 404 });
    }
    return NextResponseToUse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
