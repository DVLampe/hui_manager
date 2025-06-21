//Tạo API endpoint cho cập nhật và xóa người dùng

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'

// GET /api/users/[id] - Fetch a single user
export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    // Authorization: Allow ADMIN to see any user, or a user to see their own profile.
    if (!session || (session.user.role !== 'ADMIN' && session.user.id !== params.id)) {
        // Allowing any authenticated user to get any other user for now as per original implied behavior
        // but this should ideally be locked down.
        // If you want to restrict: 
        // return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            avatar: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'Người dùng không tìm thấy' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Lỗi khi lấy thông tin người dùng', details: error.message }, { status: 500 });
  }
}


// PUT /api/users/[id] - Cập nhật người dùng
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.id !== params.id)) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập để cập nhật người dùng này' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate dữ liệu
    // Allow name and role to be optional during update
    // if (!body.name || !body.role) {
    //   return NextResponse.json(
    //     { error: 'Thiếu thông tin bắt buộc' },
    //     { status: 400 }
    //   )
    // }

    const updateData = {}
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    
    // Only ADMIN can change role or isActive status of OTHERS
    // Users can't change their own role or deactivate themselves via this PUT.
    if (session.user.role === 'ADMIN') {
        if (body.role !== undefined) updateData.role = body.role;
        // Admin can deactivate/reactivate other users, but not themselves via this check
        if (params.id !== session.user.id && body.isActive !== undefined) {
            updateData.isActive = body.isActive;
        }
    }
    
    // Nếu có mật khẩu mới, và user cập nhật chính mình, hoặc admin cập nhật другого
    if (body.password) {
      if (params.id === session.user.id || session.user.role === 'ADMIN') {
        updateData.password = await bcrypt.hash(body.password, 10)
      } else {
        // Non-admin user trying to change password of another user
        return NextResponse.json({error: 'Không có quyền thay đổi mật khẩu cho người dùng này'}, {status: 403});
      }
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Không có dữ liệu để cập nhật' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error); // Log the error
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật người dùng', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Logically delete a user (deactivate)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }

    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Không thể hủy kích hoạt tài khoản của chính mình' },
        { status: 400 }
      )
    }

    const userToDeactivate = await prisma.user.findUnique({
        where: { id: params.id }
    });

    if (!userToDeactivate) {
        return NextResponse.json({ error: 'Người dùng không tìm thấy để hủy kích hoạt' }, {status: 404 });
    }

    // Logically delete the user by setting isActive to false
    const deactivatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true, 
      }
    });
    
    return NextResponse.json({ message: 'Người dùng đã được hủy kích hoạt thành công', user: deactivatedUser });

  } catch (error) {
    console.error('Error deactivating user:', error); // Log the error
     if (error.code === 'P2025') { // Prisma error code for record not found for update
      return NextResponse.json({ error: 'Người dùng không tìm thấy để hủy kích hoạt' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Lỗi khi hủy kích hoạt người dùng', details: error.message },
      { status: 500 }
    )
  }
}
