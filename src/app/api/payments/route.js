import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

// GET /api/payments
// Lấy lịch sử thanh toán
export async function GET(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in GET /api/payments!');
    return new Response(JSON.stringify({ message: 'Internal server error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }  try {
    // Get JWT token from cookies
    const tokenCookie = cookies().get('huiAuthToken');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to view payments' },
        { status: 401 }
      );
    }

    // Verify the token
    let userData;
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      );
      userData = payload;
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }
    
    // Extract user ID from the token payload
    const currentUserId = userData.userId;
    
    const payments = await prisma.payment.findMany({
      where: {
        userId: currentUserId // ID của user đang đăng nhập
      },
      include: {
        group: {
          select: {
            name: true,
            amount: true
          }
        },
        member: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }    });

    return NextResponseToUse.json(payments);
  } catch (error) {
    console.error('Lỗi lấy lịch sử thanh toán:', error);
    return NextResponseToUse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// POST /api/payments
// Tạo khoản thanh toán mới
export async function POST(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in POST /api/payments!');
    return new Response(JSON.stringify({ message: 'Internal server error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }  try {
    // Get JWT token from cookies
    const tokenCookie = cookies().get('huiAuthToken');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to create payments' },
        { status: 401 }
      );
    }

    // Verify the token
    let userData;
    try {
      const { payload } = await jwtVerify(
        tokenCookie.value,
        new TextEncoder().encode(JWT_SECRET)
      );
      userData = payload;
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return NextResponseToUse.json(
        { error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }
    
    const userId = userData.userId;
    const body = await request.json();
    
    const { groupId, memberId, amount, type, status, dueDate, cycle = 1, note } = body;

    if (!groupId || !memberId || !amount || !type || !status || !dueDate) {
      return NextResponseToUse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the new payment
    const payment = await prisma.payment.create({
      data: {
        userId,
        groupId,
        memberId,
        amount,
        type,
        status,
        dueDate: new Date(dueDate),
        cycle,
        note,
        createdAt: new Date(),
        updatedAt: new Date(),
        paidAt: status === 'COMPLETED' ? new Date() : null
      },
      include: {
        group: {
          select: {
            name: true,
            amount: true
          }
        },
        member: {
          include: {
            user: true,
            group: true
          }
        }      }
    });

    return NextResponseToUse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Lỗi tạo thanh toán:', error);
    return NextResponseToUse.json(
      { error: 'Lỗi server', details: error.message },
      { status: 500 }
    );
  }
}