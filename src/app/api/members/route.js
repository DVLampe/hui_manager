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
      where.huiGroups = {
        some: {
          huiId: huiId
        }
      }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Thực hiện query
    const [members, total] = await Promise.all([
      prisma.member.findMany({
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
          huiGroups: {
            include: {
              hui: {
                select: {
                  id: true,
                  name: true,
                  amount: true,
                  status: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              type: true,
              status: true,
              dueDate: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.member.count({ where })
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
    const tokenCookie = cookies().get('token') // Changed from huiAuthToken
    
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to add members' },
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

    const body = await request.json()
    
    // Validate dữ liệu
    if (!body.userId || !body.huiId) {
      return NextResponseToUse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Kiểm tra xem thành viên đã tồn tại trong hụi chưa
    const existingMember = await prisma.member.findFirst({
      where: {
        userId: body.userId,
        huiGroups: {
          some: {
            huiId: body.huiId
          }
        }
      }
    })

    if (existingMember) {
      return NextResponseToUse.json(
        { error: 'Member already exists in this hui group' },
        { status: 400 }
      )
    }

    // Tạo thành viên mới
    const member = await prisma.member.create({
      data: {
        userId: body.userId,
        huiGroups: {
          create: {
            huiId: body.huiId,
            status: body.status || 'ACTIVE',
            joinedAt: new Date()
          }
        }
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
        huiGroups: {
          include: {
            hui: {
              select: {
                id: true,
                name: true,
                amount: true,
                status: true
              }
            }
          }
        }
      }
    })
    
    return NextResponseToUse.json(member)
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponseToUse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PUT /api/members - Cập nhật thông tin thành viên
export async function PUT(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in PUT /api/members!');
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // IMPORTANT: This route seems to use getServerSession() which might be from NextAuth.js
    // If you are using custom JWT token in cookies, you need to change this to verify your custom token.
    // For now, I am assuming it should use the same cookie token logic as GET/POST.
    // If it truly uses NextAuth, this part needs separate handling.
    const tokenCookie = cookies().get('token') // Changed from huiAuthToken, assuming custom token auth
    
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to update members' }, // Added specific message
        { status: 401 }
      )
    }
    
    let userData; // userData from token for authorization if needed
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      )
      userData = payload
      // TODO: Add role/permission checks here if necessary, using userData.role etc.
    } catch (error) {
      console.error('JWT Verification Error:', error.message)
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate dữ liệu
    if (!body.id) {
      return NextResponseToUse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Cập nhật thông tin thành viên
    const member = await prisma.member.update({
      where: {
        id: body.id
      },
      data: {
        // Assuming you might want to update fields on the Member model itself
        // or specific fields within the related HuiMemberInHuiGroup
        // This example updates the status of a specific HuiMemberInHuiGroup entry
        // You'll need to adjust this based on what `body.huiGroupId` and `body.status` represent
        ...(body.huiGroupId && body.status && {
          huiGroups: {
            updateMany: { // Or `update` if you have a unique identifier for the HuiMemberInHuiGroup record
              where: {
                huiId: body.huiId, // Assuming you want to target by huiId if huiGroupId is not the direct ID of the relation table row
                // memberId: body.id // This is implicit in the outer where clause for prisma.member.update
              },
              data: {
                status: body.status,
                // Add other fields to update on HuiMemberInHuiGroup if needed
              },
            },
          },
        }),
        // Add other direct Member model fields here if necessary
        // e.g., if Member has a 'role' or 'notes' field:
        // role: body.role,
        // notes: body.notes,
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
        huiGroups: {
          include: {
            hui: {
              select: {
                id: true,
                name: true,
                amount: true,
                status: true
              }
            }
          }
        }
      }
    })
    
    return NextResponseToUse.json(member)
  } catch (error) {
    console.error('Error updating member:', error)
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponseToUse.json({ error: 'Member or associated record not found' }, { status: 404 });
    }
    return NextResponseToUse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/members - Xóa thành viên (hoặc mối quan hệ thành viên-hụi)
export async function DELETE(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in DELETE /api/members!');
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // IMPORTANT: This route seems to use getServerSession() which might be from NextAuth.js
    // If you are using custom JWT token in cookies, you need to change this to verify your custom token.
    // For now, I am assuming it should use the same cookie token logic as GET/POST.
    // If it truly uses NextAuth, this part needs separate handling.
    const tokenCookie = cookies().get('token') // Changed from huiAuthToken, assuming custom token auth

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to delete members' }, // Added specific message
        { status: 401 }
      )
    }
    
    let userData; // userData from token for authorization if needed
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      )
      userData = payload
      // TODO: Add role/permission checks here if necessary, using userData.role etc.
    } catch (error) {
      console.error('JWT Verification Error:', error.message)
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id') // ID của Member
    const huiId = searchParams.get('huiId') // ID của Hui (nếu muốn xóa khỏi 1 hụi cụ thể)

    if (!memberId) {
      return NextResponseToUse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Kịch bản 1: Xóa thành viên khỏi một hụi cụ thể (xóa record trong HuiMemberInHuiGroup)
    if (huiId) {
        const result = await prisma.huiMemberInHuiGroup.deleteMany({
            where: {
                memberId: memberId,
                huiId: huiId,
            },
        });

        if (result.count === 0) {
            return NextResponseToUse.json(
                { error: 'Member not found in the specified hui or already removed' },
                { status: 404 }
            );
        }
        return NextResponseToUse.json({ message: 'Member removed from hui successfully' });
    } else {
        // Kịch bản 2: Xóa hoàn toàn Member (và các mối quan hệ liên quan do cascading delete если có)
        // Cẩn thận: Điều này sẽ xóa Member và có thể cả các HuiMemberInHuiGroup liên quan
        // nếu schema Prisma được cấu hình với onDelete: Cascade.
        // Nếu không, bạn cần xóa các record liên quan trong HuiMemberInHuiGroup trước.

        // Bước 1: Xóa các liên kết trong HuiMemberInHuiGroup
        await prisma.huiMemberInHuiGroup.deleteMany({
            where: { memberId: memberId }
        });

        // Bước 2: Xóa Member
        const member = await prisma.member.delete({
            where: {
                id: memberId
            }
        });
        return NextResponseToUse.json({ message: 'Member deleted successfully', member });
    }

  } catch (error) {
    console.error('Error deleting member:', error)
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponseToUse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponseToUse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
