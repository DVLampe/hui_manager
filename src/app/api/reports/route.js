//npm install chart.js react-chartjs-2 jspdf jspdf-autotable
//Tạo API endpoint cho báo cáo

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/reports - Lấy dữ liệu báo cáo
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') // 'monthly', 'yearly', 'custom'

    // Lấy dữ liệu thanh toán
    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        huiGroup: true,
        member: true
      }
    })

    // Lấy dữ liệu hụi
    const huis = await prisma.huiGroup.findMany({
      where: {
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        members: true,
        payments: true
      }
    })

    // Tính toán thống kê
    const stats = {
      totalHuis: huis.length,
      totalMembers: huis.reduce((acc, hui) => acc + hui.members.length, 0),
      totalPayments: payments.length,
      totalAmount: payments.reduce((acc, payment) => acc + payment.amount, 0),
      monthlyStats: calculateMonthlyStats(payments),
      huiStats: calculateHuiStats(huis),
      memberStats: calculateMemberStats(payments)
    }

    return Response.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy dữ liệu báo cáo' },
      { status: 500 }
    )
  }
}

// Hàm tính toán thống kê theo tháng
function calculateMonthlyStats(payments) {
  const monthlyStats = {}
  
  payments.forEach(payment => {
    const month = new Date(payment.date).toLocaleString('vi-VN', { month: 'long', year: 'numeric' })
    if (!monthlyStats[month]) {
      monthlyStats[month] = {
        count: 0,
        amount: 0
      }
    }
    monthlyStats[month].count++
    monthlyStats[month].amount += payment.amount
  })

  return monthlyStats
}

// Hàm tính toán thống kê theo hụi
function calculateHuiStats(huis) {
  return huis.map(hui => ({
    name: hui.name,
    totalMembers: hui.members.length,
    totalPayments: hui.payments.length,
    totalAmount: hui.payments.reduce((acc, payment) => acc + payment.amount, 0)
  }))
}

// Hàm tính toán thống kê theo thành viên
function calculateMemberStats(payments) {
  const memberStats = {}
  
  payments.forEach(payment => {
    if (!memberStats[payment.memberId]) {
      memberStats[payment.memberId] = {
        name: payment.member.name,
        count: 0,
        amount: 0
      }
    }
    memberStats[payment.memberId].count++
    memberStats[payment.memberId].amount += payment.amount
  })

  return Object.values(memberStats)
}