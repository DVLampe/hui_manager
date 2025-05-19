
//Tạo API endpoint cho cập nhật và xóa người dùng

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'

// PUT /api/users/[id] - Cập nhật người dùng
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    
    // Kiểm tra quyền ADMIN
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate dữ liệu
    if (!body.name || !body.role) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    const updateData = {
      name: body.name,
      role: body.role
    }

    // Nếu có mật khẩu mới
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật người dùng' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Xóa người dùng
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    // Kiểm tra quyền ADMIN
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }

    // Không cho phép xóa chính mình
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Không thể xóa tài khoản của chính mình' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Xóa người dùng thành công' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi xóa người dùng' },
      { status: 500 }
    )
  }
}