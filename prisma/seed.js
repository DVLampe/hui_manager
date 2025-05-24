import { PrismaClient, Role, GroupStatus, MemberStatus, PaymentType, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clear existing data (optional, but good for repeatable seeding)
  await prisma.paymentHistory.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.huiMember.deleteMany({});
  await prisma.huiGroup.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.systemSettings.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleared existing data.');

  // Create Users
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('password123', saltRounds);
  const managerPassword = await bcrypt.hash('password123', saltRounds);
  const user1Password = await bcrypt.hash('password123', saltRounds);
  const user2Password = await bcrypt.hash('password123', saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: managerPassword,
      name: 'Manager User',
      role: Role.MANAGER,
      isActive: true,
    },
  });
  console.log(`Created manager user: ${managerUser.email}`);

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: user1Password,
      name: 'Test User One',
      role: Role.USER,
      isActive: true,
      phone: '1234567890',
    },
  });
  console.log(`Created user: ${user1.email}`);

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: user2Password,
      name: 'Test User Two',
      role: Role.USER,
      isActive: true,
      phone: '0987654321',
    },
  });
  console.log(`Created user: ${user2.email}`);

  // Create a HuiGroup managed by managerUser
  const huiGroup1 = await prisma.huiGroup.create({
    data: {
      name: 'Tiết Kiệm Hàng Tháng Cùng Nhau',
      description: 'Nhóm hụi tiết kiệm hàng tháng với mục tiêu mua sắm lớn.',
      amount: 1000000, // Example: 1,000,000 VND
      startDate: new Date(),
      status: GroupStatus.ACTIVE,
      managerId: managerUser.id,
      cycle: 1, // Monthly cycle
      totalMembers: 0, // Initial value, will be updated by actual member count
      currentCycle: 1,
      nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Next month
      rules: {
        contributionDay: '5th of each month',
        latePaymentPenalty: '5% of contribution',
      },
    },
  });
  console.log(`Created hui group: ${huiGroup1.name} managed by ${managerUser.email}`);

  // Add user1 and user2 as members to huiGroup1
  const member1 = await prisma.huiMember.create({
    data: {
      userId: user1.id,
      groupId: huiGroup1.id,
      status: MemberStatus.ACTIVE,
      joinedAt: new Date(),
      position: 1,
      totalPaid: 0,
      totalDue: 0,
      nextPaymentDate: huiGroup1.nextPaymentDate,
    },
  });
  console.log(`${user1.name} joined ${huiGroup1.name}`);

  const member2 = await prisma.huiMember.create({
    data: {
      userId: user2.id,
      groupId: huiGroup1.id,
      status: MemberStatus.ACTIVE,
      joinedAt: new Date(),
      position: 2,
      totalPaid: 0,
      totalDue: 0,
      nextPaymentDate: huiGroup1.nextPaymentDate,
    },
  });
  console.log(`${user2.name} joined ${huiGroup1.name}`);
  
  // Update totalMembers in HuiGroup based on actual members added
  const membersInGroup = await prisma.huiMember.count({ where: { groupId: huiGroup1.id } });
  await prisma.huiGroup.update({
    where: { id: huiGroup1.id },
    data: { totalMembers: membersInGroup }
  });
  console.log(`Updated totalMembers for ${huiGroup1.name} to ${membersInGroup}`);


  // Create initial payments (optional, as an example)
  if (huiGroup1.nextPaymentDate) { // Ensure nextPaymentDate is not null
    const payment1 = await prisma.payment.create({
      data: {
        amount: huiGroup1.amount,
        type: PaymentType.CONTRIBUTION,
        status: PaymentStatus.PENDING,
        userId: user1.id,
        memberId: member1.id,
        groupId: huiGroup1.id,
        dueDate: huiGroup1.nextPaymentDate,
        cycle: 1,
        note: 'First cycle contribution for User 1',
      },
    });
    console.log(`Created initial payment for ${user1.name} in ${huiGroup1.name}`);

    const payment2 = await prisma.payment.create({
      data: {
        amount: huiGroup1.amount,
        type: PaymentType.CONTRIBUTION,
        status: PaymentStatus.PENDING,
        userId: user2.id,
        memberId: member2.id,
        groupId: huiGroup1.id,
        dueDate: huiGroup1.nextPaymentDate,
        cycle: 1,
        note: 'First cycle contribution for User 2',
      },
    });
    console.log(`Created initial payment for ${user2.name} in ${huiGroup1.name}`);
  } else {
    console.log('Skipped creating initial payments as nextPaymentDate is not set for the group.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
