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
        };
    });

    // Placeholder for monthly stats
    const monthlyStats = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Số hụi',
            data: [2, 3, 1, 4, 2, 5, 3],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y',
          },
          {
            label: 'Lợi nhuận/Thua lỗ',
            data: [1000, -500, 2000, 1500, -200, 3000, 2500],
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
