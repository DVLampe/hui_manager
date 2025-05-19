import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

// GET /api/payments/[id]
// Lấy thông tin chi tiết một khoản thanh toán
export async function GET(request, { params }) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in GET /api/payments/[id]!');
    return new Response(JSON.stringify({ message: 'Internal server error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
    try {
    // Get JWT token from cookies
    const tokenCookie = cookies().get('huiAuthToken');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponseToUse.json(
        { error: 'Unauthorized: Please login to view payment details' },
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
    const { id } = params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },        member: {
          include: {
            user: true,
            group: {
              select: {
                id: true,
                name: true,
                amount: true,
                startDate: true,
                endDate: true
              }
            }
          }
        },
        group: true
      }
    });    if (!payment) {
      return NextResponseToUse.json(
        { error: 'Không tìm thấy khoản thanh toán' },
        { status: 404 }
      );
    }

    return NextResponseToUse.json(payment);
  } catch (error) {
    console.error('Lỗi lấy thông tin thanh toán:', error);
    return NextResponseToUse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// PATCH /api/payments/[id]
// Cập nhật thông tin thanh toán
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { amount, type, status, note } = body;

    // Kiểm tra xem payment có tồn tại không
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Không tìm thấy khoản thanh toán' },
        { status: 404 }
      );
    }

    // Cập nhật thông tin thanh toán
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount,
        type,
        status,
        note,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },        member: {
          include: {
            user: true,
            group: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        },
        group: true
      }
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Lỗi cập nhật thanh toán:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id]
// Xóa một khoản thanh toán
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Kiểm tra xem payment có tồn tại không
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Không tìm thấy khoản thanh toán' },
        { status: 404 }
      );
    }

    // Xóa thanh toán
    await prisma.payment.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Xóa thanh toán thành công' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lỗi xóa thanh toán:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}