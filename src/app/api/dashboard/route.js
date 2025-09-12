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
    const userHuiGroups = await prisma.huiGroup.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: userId,
          },
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

    let totalHui = userHuiGroups.length;
    let participatingHui = userHuiGroups.filter(h => h.status === 'ACTIVE').length;
    let totalPaid = 0;
    let totalReceived = 0;

    userHuiGroups.forEach(hui => {
      hui.payments.forEach(payment => {
        // Calculate total paid
        payment.memberContributions.forEach(contribution => {
          totalPaid += Number(contribution.amountContributed);
        });

        // Calculate total received
        if (payment.potTakerMember?.userId === userId && payment.amountCollected) {
          totalReceived += Number(payment.amountCollected);
        }
      });
    });

    const profitLoss = totalReceived - totalPaid;

    const huiList = userHuiGroups.map(hui => {
        let huiPaid = 0;
        let huiReceived = 0;
        hui.payments.forEach(payment => {
            payment.memberContributions.forEach(contribution => {
                huiPaid += Number(contribution.amountContributed);
            });
            if (payment.potTakerMember?.userId === userId && payment.amountCollected) {
                huiReceived += Number(payment.amountCollected);
            }
        });
        return {
            id: hui.id,
            name: hui.name,
            ky: hui.numberOfPeriods,
            amount: Number(hui.amount),
            status: hui.status.toLowerCase(),
            profit: huiReceived - huiPaid,
            frequency: hui.frequency,
            startDate: hui.startDate,
        };
    });

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
      profitLoss,
      monthlyStats,
      huiList,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
