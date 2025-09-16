import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Không được phép' }), { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' }), { status: 400 });
    }

    if (newPassword.length < 6) {
        return new Response(JSON.stringify({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy người dùng.' }), { status: 404 });
    }
    
    if (!user.password) {
        return new Response(JSON.stringify({ error: 'Người dùng này không có mật khẩu được thiết lập (có thể đăng nhập qua OAuth).' }), { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Mật khẩu hiện tại không chính xác.' }), { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    return new Response(JSON.stringify({ message: 'Đổi mật khẩu thành công.' }), { status: 200 });

  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return new Response(JSON.stringify({ error: 'Đã xảy ra lỗi máy chủ nội bộ.' }), { status: 500 });
  }
}
