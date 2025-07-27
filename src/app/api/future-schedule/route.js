import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route.js';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

// Helper function to calculate the next due date
function calculateNextDueDate(startDate, periodNumber, frequency) {
  const date = new Date(startDate);
  // Period 1 is the start date itself, so for period `n`, we add `n-1` intervals.
  const intervalsToAdd = periodNumber - 1;

  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + intervalsToAdd);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + intervalsToAdd * 7);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + intervalsToAdd);
      break;
    default:
      // Default to monthly if frequency is unknown or not supported
      date.setMonth(date.getMonth() + intervalsToAdd);
      break;
  }
  return date;
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // 1. Fetch all active Hui memberships for the current user, including the group details.
    const huiMemberships = await prisma.huiMember.findMany({
      where: {
        userId: userId,
        group: {
          status: 'ACTIVE'
        }
      },
      include: {
        group: true,
      },
    });

    const futureSchedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    // 2. For each membership, determine the future payments.
    for (const membership of huiMemberships) {
      const hui = membership.group;
      if (!hui || !hui.startDate || !hui.totalMembers || !hui.cycle) {
        continue; // Skip if essential hui data is missing
      }

      // Find all payments for the group that are not yet fully completed.
      const upcomingPayments = await prisma.payment.findMany({
        where: {
          huiGroupId: hui.id,
          NOT: {
            transactionStatus: 'DA_THANH_TOAN'
          }
        },
        orderBy: {
          period: 'asc'
        }
      });

      // Format them for the response.
      for (const payment of upcomingPayments) {
        // We still need to calculate the due date reliably.
        const paymentFrequency = hui.cycle?.toString().includes('tháng') ? 'MONTHLY' : (hui.cycle?.toString().includes('tuần') ? 'WEEKLY' : 'DAILY');
        const dueDate = calculateNextDueDate(new Date(hui.startDate), payment.period, paymentFrequency);

        if (dueDate >= today) {
          futureSchedules.push({
            huiId: hui.id,
            huiName: hui.name,
            paymentDate: dueDate.toISOString(),
            amount: hui.amount,
            periodNumber: payment.period,
            totalPeriods: hui.totalMembers,
            huiMemberId: membership.id,
          });
        }
      }
    }

    // Sort all combined schedules by date
    futureSchedules.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

    return NextResponse.json(futureSchedules);

  } catch (error) {
    console.error('Error fetching future schedules:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
