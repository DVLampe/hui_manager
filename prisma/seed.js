import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Bắt đầu xóa dữ liệu cũ...')
    await prisma.paymentHistory.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.huiMember.deleteMany()
    await prisma.huiGroup.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.systemSettings.deleteMany()
    await prisma.user.deleteMany()
    console.log('Đã xóa dữ liệu cũ')

    console.log('Tạo admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        phone: '1234567890'
      }
    })
    console.log('Đã tạo admin user:', admin.id)

    console.log('Tạo manager user...')
    const managerPassword = await bcrypt.hash('manager123', 10)
    const manager = await prisma.user.create({
      data: {
        email: 'manager@example.com',
        password: managerPassword,
        name: 'Manager User',
        role: 'MANAGER',
        phone: '0987654321'
      }
    })
    console.log('Đã tạo manager user:', manager.id)

    console.log('Tạo các user thường...')
    const userPassword = await bcrypt.hash('user123', 10)
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'user1@example.com',
          password: userPassword,
          name: 'User One',
          role: 'USER',
          phone: '1111111111'
        }
      }),
      prisma.user.create({
        data: {
          email: 'user2@example.com',
          password: userPassword,
          name: 'User Two',
          role: 'USER',
          phone: '2222222222'
        }
      }),
      prisma.user.create({
        data: {
          email: 'user3@example.com',
          password: userPassword,
          name: 'User Three',
          role: 'USER',
          phone: '3333333333'
        }
      })
    ])
    console.log('Đã tạo các user thường:', users.map(u => u.id))

    console.log('Tạo hụi groups...')
    const huiGroups = await Promise.all([
      prisma.huiGroup.create({
        data: {
          name: 'Hụi Tháng 1',
          description: 'Hụi nhóm tháng 1 năm 2024',
          amount: 1000000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'ACTIVE',
          managerId: manager.id,
          cycle: 1,
          totalMembers: 3,
          currentCycle: 1,
          nextPaymentDate: new Date('2024-02-01'),
          rules: {
            paymentDay: 1,
            lateFee: 50000,
            maxLateDays: 7
          }
        }
      }),
      prisma.huiGroup.create({
        data: {
          name: 'Hụi Tháng 2',
          description: 'Hụi nhóm tháng 2 năm 2024',
          amount: 2000000,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-12-31'),
          status: 'ACTIVE',
          managerId: manager.id,
          cycle: 1,
          totalMembers: 3,
          currentCycle: 1,
          nextPaymentDate: new Date('2024-03-01'),
          rules: {
            paymentDay: 1,
            lateFee: 100000,
            maxLateDays: 7
          }
        }
      })
    ])
    console.log('Đã tạo hụi groups:', huiGroups.map(g => g.id))

    console.log('Thêm members vào hụi groups...')
    for (const group of huiGroups) {
      for (const user of users) {
        await prisma.huiMember.create({
          data: {
            userId: user.id,
            groupId: group.id,
            status: 'ACTIVE',
            position: Math.floor(Math.random() * 3) + 1,
            totalPaid: 0,
            totalDue: group.amount,
            nextPaymentDate: group.nextPaymentDate
          }
        })
      }
    }
    console.log('Đã thêm members')

    console.log('Tạo payments...')
    for (const group of huiGroups) {
      const members = await prisma.huiMember.findMany({
        where: { groupId: group.id }
      })
      
      for (const member of members) {
        await prisma.payment.create({
          data: {
            amount: group.amount,
            type: 'CONTRIBUTION',
            status: 'PENDING',
            userId: member.userId,
            memberId: member.id,
            groupId: group.id,
            dueDate: group.nextPaymentDate,
            cycle: 1
          }
        })
      }
    }
    console.log('Đã tạo payments')

    console.log('Tạo system settings...')
    await prisma.systemSettings.create({
      data: {
        key: 'system_config',
        value: {
          maxHuiGroups: 10,
          maxMembersPerGroup: 20,
          defaultLateFee: 50000,
          defaultMaxLateDays: 7
        },
        updatedBy: admin.id
      }
    })
    console.log('Đã tạo system settings')

    console.log('Tạo welcome notification...')
    await prisma.notification.create({
      data: {
        title: 'Chào mừng',
        message: 'Chào mừng bạn đến với hệ thống quản lý hụi',
        type: 'SYSTEM',
        userId: admin.id
      }
    })
    console.log('Đã tạo notification')

    console.log('Tạo audit log...')
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'INITIALIZE_SYSTEM',
        entity: 'SYSTEM',
        entityId: 'INIT',
        details: {
          timestamp: new Date(),
          version: '1.0.0'
        }
      }
    })
    console.log('Đã tạo audit log')

    console.log('Seed hoàn tất!')
  } catch (error) {
    console.error('Lỗi trong quá trình seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
