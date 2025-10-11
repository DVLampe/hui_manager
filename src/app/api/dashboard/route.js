import { NextResponse as OriginalNextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route.js';
import prisma from '@/lib/prisma';

// Apply the workaround pattern
const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function GET(request) {
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

    userHuiGroups.forEach(hui => {
      hui.payments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        let key;

        if (groupBy === 'day') {
          key = paymentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (groupBy === 'month') {
          key = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        } else { // year
          key = paymentDate.getFullYear().toString();
        }

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            huiIds: new Set(),
            profitLoss: 0,
          };
        }

        aggregatedData[key].huiIds.add(hui.id);

        let paidInPayment = 0;
        payment.memberContributions.forEach(contribution => {
          paidInPayment += Number(contribution.amountContributed);
        });

        let receivedInPayment = 0;
        if (payment.potTakerMember?.userId === userId && payment.amountCollected) {
          receivedInPayment += Number(payment.amountCollected);
        }

        aggregatedData[key].profitLoss += (receivedInPayment - paidInPayment);
      });
    });

    const sortedKeys = Object.keys(aggregatedData).sort();
    const labels = sortedKeys;
    const huiData = sortedKeys.map(key => aggregatedData[key].huiIds.size);
    const profitLossData = sortedKeys.map(key => aggregatedData[key].profitLoss);

    const monthlyStats = {
      labels: labels,
      datasets: [
        {
          label: 'Số hụi',
          data: huiData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Lợi nhuận/Thua lỗ',
          data: profitLossData,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
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
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
