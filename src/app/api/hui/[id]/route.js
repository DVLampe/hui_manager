import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// Lấy thông tin chi tiết một hụi
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const hui = await prisma.huiGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        payments: {
          include: {
            member: {
              include: { user: true },
            },
            user: true,
            history: true,
            group: true,
          },
        },
        manager: true,
      },
    });

    if (!hui) {
      return NextResponse.json({ error: 'Hui not found' }, { status: 404 });
    }

    return NextResponse.json(hui);
  } catch (error) {
    console.error('Error fetching hui by ID:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Cập nhật thông tin một hụi
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    // Add validation and update logic here
    const updatedHui = await prisma.huiGroup.update({
      where: { id },
      data: body, // Be careful with directly passing body, ensure validation
    });
    return NextResponse.json(updatedHui);
  } catch (error) {
    console.error(`Error updating hui ${id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Xóa một hụi
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    // Add logic to handle related entities if necessary (e.g., members, payments)
    await prisma.huiGroup.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Hui deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting hui ${id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}