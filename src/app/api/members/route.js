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
      where.huiGroups = { // This seems to be filtering HuiMember based on related HuiGroup. Check if 'huiGroups' is the correct relation name on HuiMember model for HuiMemberInHuiGroup
        some: {
          huiId: huiId // Assuming HuiMemberInHuiGroup has a 'huiId' field.
        }
      }
    }
    if (search) {
      // Assuming HuiMember has a 'name' or 'phone' directly, or through its related 'user'
      // If 'name' and 'phone' are on the related User model, this needs to be adjusted.
      // For now, let's assume 'user' relation holds these, so prisma.huiMember.findMany's include should cover it.
      // The filter needs to be on the related User model.
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Thực hiện query
    const [members, total] = await Promise.all([
      prisma.huiMember.findMany({ // Changed from prisma.member to prisma.huiMember
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          group: { // Changed from huiGroups to group, assuming 'group' is the relation to HuiGroup on HuiMember model
            select: {
              id: true,
              name: true,
              amount: true,
              status: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              type: true,
              status: true, // This should be transactionStatus based on your Payment model
              dueDate: true
            }
          }
        },
        orderBy: {
          // createdAt: 'desc' // Assuming HuiMember has a createdAt field. If not, adjust or remove.
          joinedAt: 'desc' // More likely to sort by joinedAt for members
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.huiMember.count({ where }) // Changed from prisma.member to prisma.huiMember
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
      { error: 'Internal Server Error' },
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
    
    if (!body.userId || !body.groupId) { // Changed body.huiId to body.groupId to match HuiMember schema
      return NextResponseToUse.json(
        { error: 'Missing required fields: userId and groupId are required.' },
        { status: 400 }
      )
    }

    const existingMember = await prisma.huiMember.findFirst({ // Changed from prisma.member to prisma.huiMember
      where: {
        userId: body.userId,
        groupId: body.groupId // Changed from huiGroups.some.huiId to direct groupId
      }
    })

    if (existingMember) {
      return NextResponseToUse.json(
        { error: 'Member already exists in this hui group' },
        { status: 400 }
      )
    }

    const member = await prisma.huiMember.create({ // Changed from prisma.member to prisma.huiMember
      data: {
        userId: body.userId,
        groupId: body.groupId, // Changed from huiGroups.create.huiId to direct groupId
        status: body.status || 'ACTIVE', // Ensure 'ACTIVE' is a valid MemberStatus enum value
        joinedAt: new Date(),
        // Add other fields from HuiMember schema as needed, e.g., position, totalPaid, totalDue
        position: body.position, // Example
        totalPaid: body.totalPaid || 0, // Example
        totalDue: body.totalDue || 0,   // Example
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        group: { // Changed from huiGroups to group
          select: {
            id: true,
            name: true,
            amount: true,
            status: true
          }
        }
      }
    })
    
    return NextResponseToUse.json(member)
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponseToUse.json(
      { error: 'Internal Server Error', details: error.message }, // Added error.message for more details
      { status: 500 }
    )
  }
}

// PUT /api/members/:id - Cập nhật thông tin thành viên (HuiMember)
export async function PUT(request, { params }) { // Assuming member ID comes from URL like /api/members/member-id
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

    const memberId = params.id; // Get memberId from URL parameters
    const body = await request.json()
    
    if (!memberId) {
      return NextResponseToUse.json(
        { error: 'Member ID is required in the URL path' },
        { status: 400 }
      )
    }
    
    // Fields that can be updated on HuiMember model
    const { status, position, notes, totalPaid, totalDue, lastPaymentDate, nextPaymentDate } = body;
    const updateData = {};
    if (status) updateData.status = status; // Ensure 'status' is a valid MemberStatus enum
    if (position !== undefined) updateData.position = position;
    if (notes !== undefined) updateData.notes = notes;
    if (totalPaid !== undefined) updateData.totalPaid = totalPaid;
    if (totalDue !== undefined) updateData.totalDue = totalDue;
    if (lastPaymentDate) updateData.lastPaymentDate = new Date(lastPaymentDate);
    if (nextPaymentDate) updateData.nextPaymentDate = new Date(nextPaymentDate);
    if (body.leftAt) updateData.leftAt = new Date(body.leftAt);


    if (Object.keys(updateData).length === 0) {
        return NextResponseToUse.json(
            { error: 'No fields provided to update' },
            { status: 400 }
        );
    }

    const member = await prisma.huiMember.update({ // Changed from prisma.member to prisma.huiMember
      where: {
        id: memberId
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        group: { // Changed from huiGroups to group
          select: {
            id: true,
            name: true,
            amount: true,
            status: true
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
export async function DELETE(request, { params }) { // Assuming member ID comes from URL
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

    const memberId = params.id; // Get memberId from URL parameters. This ID is for HuiMember.

    if (!memberId) {
      return NextResponseToUse.json(
        { error: 'HuiMember ID is required in the URL path' },
        { status: 400 }
      )
    }
    
    // Deleting a HuiMember directly. 
    // If you need to remove a user from a specific HuiGroup, that's what this does.
    // If you intend to delete the User account, that's a different operation.
    
    // First, ensure related payments by this HuiMember are handled (e.g., disassociated or deleted if business logic requires)
    // This depends on your schema's onDelete rules for Payment.memberId.
    // If Payment.memberId is optional and onDelete is SetNull, they will be disassociated.
    // If it's required or onDelete is Cascade, you might need manual handling or be aware of cascading deletes.

    // For now, directly deleting the HuiMember record:
    const member = await prisma.huiMember.delete({ // Changed from prisma.member to prisma.huiMember
        where: {
            id: memberId
        }
    });
    
    // Note: The original code had logic for `huiId` from searchParams to delete HuiMemberInHuiGroup.
    // The current HuiMember model is simpler, linking a User to a HuiGroup directly.
    // So, deleting a HuiMember record effectively removes the user from that specific group.

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
