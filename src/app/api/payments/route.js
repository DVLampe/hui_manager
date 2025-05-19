import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/payments
// Lấy lịch sử thanh toán
export async function GET(request) {
  const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
  try {
    const payments = await prisma.payment.findMany({
      where: {
        userId: currentUserId // ID của user đang đăng nhập
      },
      include: {
        hui: {
          select: {
            name: true,
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Lỗi lấy lịch sử thanh toán:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}