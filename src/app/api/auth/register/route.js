import { NextResponse as OriginalNextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request) {
  let NextResponseToUse = OriginalNextResponse;

  // Keep the debugging logic for NextResponse, as it correctly identifies the usage
  if (OriginalNextResponse) {
    if (typeof OriginalNextResponse.json === 'undefined' &&
        OriginalNextResponse.default &&
        typeof OriginalNextResponse.default.json === 'function') {
      NextResponseToUse = OriginalNextResponse.default;
    }
  }

  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in /api/auth/register!');
    const criticalErrorResponse = new Response(
      JSON.stringify({ message: 'Lỗi nghiêm trọng: NextResponseToUse.json không phải là một hàm.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return criticalErrorResponse;
  }

  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponseToUse.json({ message: 'Vui lòng cung cấp đầy đủ thông tin: tên, email và mật khẩu.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponseToUse.json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponseToUse.json({ message: 'Email này đã được sử dụng.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Default role can be set here if needed, e.g., role: 'USER'
        // Ensure your prisma schema for User has a role field with a default or is optional
      },
    });

    // Exclude password from the returned user object
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponseToUse.json({
      message: 'Đăng ký thành công!',
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Lỗi trong API /api/auth/register:', error);
    // Check for specific Prisma errors if necessary
    if (error.code === 'P2002') { // Unique constraint failed
        return NextResponseToUse.json({ message: 'Email này đã được sử dụng (lỗi cơ sở dữ liệu).' }, { status: 409 });
    }
    return NextResponseToUse.json({ message: 'Lỗi server không xác định khi đăng ký.', error: error.message }, { status: 500 });
  }
}
