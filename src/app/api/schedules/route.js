// GET /api/schedules
// Lấy lịch thanh toán
export async function GET(request) {
  try {
    const { startDate, endDate } = request.query;
    
    const schedules = await prisma.payment.findMany({
      where: {
        userId: currentUserId,
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
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
        dueDate: 'asc'
      }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Lỗi lấy lịch thanh toán:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}