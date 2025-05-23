import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/payments/[id]
// Lấy thông tin chi tiết một khoản thanh toán
export async function GET(request, { params }) {
  try {
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
        },
        member: {
          include: {
            hui: {
              select: {
                id: true,
                name: true,
                amount: true,
                startDate: true,
                endDate: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Không tìm thấy khoản thanh toán' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Lỗi lấy thông tin thanh toán:', error);
    return NextResponse.json(
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
        },
        member: {
          include: {
            hui: {
              select: {
                id: true,
                name: true,
                amount: true
              }
            }
          }
        }
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