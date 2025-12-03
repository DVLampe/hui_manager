import { NextResponse as OriginalNextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route.js';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger.server';

// Apply the workaround pattern
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function GET(request) {
  logger.info("Dashboard data request received");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const groupBy = searchParams.get('groupBy') || 'month';

  try {
    const allUserHuiGroups = await prisma.huiGroup.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId: userId } } }
        ]
      },
      include: {
        members: {
          include: {
            user: true,
          }
        },
        payments: {
          include: {
            potTakerMember: true,
            memberContributions: {
              where: {
                member: {
                  userId: userId,
                },
              },
            },
          },
        },
      },
    });

    const calculateTheoreticalEndDate = (startDate, frequency, periods) => {
      const date = new Date(startDate);
      const periodCount = periods > 0 ? periods - 1 : 0;
      if (frequency === 'DAILY') {
        date.setDate(date.getDate() + periodCount);
      } else if (frequency === 'WEEKLY') {
        date.setDate(date.getDate() + periodCount * 7);
      } else { // MONTHLY
        date.setMonth(date.getMonth() + periodCount);
      }
      return date;
    };

    const processHui = (hui, currentUserId) => {
      let huiPaid = 0;
      let huiReceived = 0;
      let totalThao = 0;

      const completedPayments = hui.payments
        .filter(p => p.transactionStatus === 'DA_THANH_TOAN' || p.transactionStatus === 'HUY')
        .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      
      const actualEndDate = completedPayments.length === hui.numberOfPeriods ? new Date(completedPayments[0].dueDate) : null;

      hui.payments.forEach(payment => {
        // Calculate profit/loss for the current user
        payment.memberContributions.forEach(contribution => {
          huiPaid += Number(contribution.amountContributed);
        });
        if (payment.potTakerMember?.userId === currentUserId && payment.amountCollected) {
          huiReceived += Number(payment.amountCollected);
        }
        // Calculate total Thao for the owner
        if (payment.thao) {
          totalThao += Number(payment.thao);
        }
      });

      return {
        id: hui.id,
        name: hui.name,
        ky: hui.numberOfPeriods,
        amount: Number(hui.amount),
        status: hui.status.toLowerCase(),
        profit: huiReceived - huiPaid,
        totalThao: totalThao,
        frequency: hui.frequency,
        startDate: hui.startDate,
        endDate: actualEndDate || calculateTheoreticalEndDate(hui.startDate, hui.frequency, hui.numberOfPeriods),
      };
    };

    const ownedHuiList = allUserHuiGroups
      .filter(hui => hui.ownerId === userId)
      .map(hui => processHui(hui, userId));

    const participatingHuiList = allUserHuiGroups
      .filter(hui => hui.members.some(m => m.userId === userId))
      .map(hui => processHui(hui, userId));

    const userHuiGroups = allUserHuiGroups.filter(hui => hui.members.some(m => m.userId === userId));

    // Calculate nearest payment
    // Check user settings first
    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
    const notifyPaymentDue = currentUser?.notificationPreferences?.notifyPaymentDue !== false; // Default true

    let nearestPayment = null;

    if (notifyPaymentDue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let minDiff = Infinity;

      userHuiGroups.forEach(hui => {
        hui.payments.forEach(payment => {
          // Skip if user has already contributed
          if (payment.memberContributions.length > 0) return;
          // Skip if payment is settled or cancelled
          if (payment.transactionStatus === 'DA_THANH_TOAN' || payment.transactionStatus === 'HUY') return;
          // Skip if current user is the pot taker (they receive, don't pay contribution)
          if (payment.potTakerMember?.userId === userId) return;

          const dueDate = new Date(payment.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const diffTime = dueDate.getTime() - today.getTime();

          // Only look for future or today's payments
          if (diffTime >= 0) {
            if (diffTime < minDiff) {
              minDiff = diffTime;
              nearestPayment = {
                huiName: hui.name,
                amount: payment.thamKeu ? Number(hui.amount) - Number(payment.thamKeu) : Number(hui.amount),
                dueDate: payment.dueDate,
                daysLeft: Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              };
            }
          }
        });
      });
    }

    let totalHui = userHuiGroups.length;
    let participatingHui = userHuiGroups.filter(h => h.status === 'ACTIVE').length;
    let totalPaid = 0;
    let totalReceived = 0;
    let totalThao = 0;

    allUserHuiGroups.forEach(hui => {
      const isOwner = hui.ownerId === userId;

      hui.payments.forEach(payment => {
        // Calculate total paid by the user in this hui
        payment.memberContributions.forEach(contribution => {
          totalPaid += Number(contribution.amountContributed);
        });

        // If the user is the pot taker in this payment
        if (payment.potTakerMember?.userId === userId && payment.amountCollected) {
          totalReceived += Number(payment.amountCollected);
        }

        // If the user is the owner of the hui, accumulate thao
        if (isOwner && payment.thao) {
          totalThao += Number(payment.thao);
        }
      });
    });

    const profitLoss = totalReceived - totalPaid;

    // Stats aggregation
    const aggregatedData = {};

    allUserHuiGroups.forEach(hui => {
      const isOwner = hui.ownerId === userId;
      hui.payments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        let key;

        if (groupBy === 'day') {
          key = paymentDate.toISOString().split('T')[0];
        } else if (groupBy === 'month') {
          key = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        } else { // year
          key = paymentDate.getFullYear().toString();
        }

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            paid: 0,
            received: 0,
            thao: 0,
            huiIds: new Set(),
          };
        }

        aggregatedData[key].huiIds.add(hui.id);

        payment.memberContributions.forEach(contribution => {
          aggregatedData[key].paid += Number(contribution.amountContributed);
        });

        if (payment.potTakerMember?.userId === userId && payment.amountCollected) {
          aggregatedData[key].received += Number(payment.amountCollected);
        }

        if (isOwner && payment.thao) {
          aggregatedData[key].thao += Number(payment.thao);
        }
      });
    });

    const sortedKeys = Object.keys(aggregatedData).sort();
    const labels = sortedKeys;
    const paidData = sortedKeys.map(key => aggregatedData[key].paid);
    const receivedData = sortedKeys.map(key => aggregatedData[key].received);
    const thaoData = sortedKeys.map(key => aggregatedData[key].thao);
    const huiCountData = sortedKeys.map(key => aggregatedData[key].huiIds.size);

    const monthlyStats = {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Tiền đã trả',
          data: paidData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Tiền đã nhận',
          data: receivedData,
          backgroundColor: 'rgba(153, 102, 255, 0.6)', // Purple
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Tiền thảo',
          data: thaoData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Số hụi',
          data: huiCountData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)', // Green
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          yAxisID: 'y1',
          tension: 0.1
        },
      ],
    };


    const stats = {
      totalHui,
      participatingHui,
      totalPaid,
      totalReceived,
      totalThao,
      profitLoss,
      monthlyStats,
      ownedHuiList,
      participatingHuiList,
      nearestPayment,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error({ message: "Error fetching dashboard stats", error: error.message, stack: error.stack });
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
