import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;
const JWT_SECRET = process.env.JWT_SECRET;

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
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }

    let verifiedToken;
    try {
      verifiedToken = await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));
    } catch (err) {
      console.error('JWT Verification Error:', err);
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    const userId = verifiedToken.payload.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User ID not found in token' }, { status: 401 });
    }

    // 1. Fetch all active Hui memberships for the current user
    const huiMemberships = await prisma.huiMember.findMany({
      where: {
        userId: userId,
        group: {
          // Only consider active huis
          status: 'ACTIVE'
        }
       },
      include: {
        group: true, // Include the Hui (group) details
      },
    });

    const futureSchedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day for comparisons

    for (const membership of huiMemberships) {
      const hui = membership.group;
      if (!hui || !hui.startDate || !hui.totalMembers || !hui.cycle) {
        // Skip if Hui data is incomplete. Using cycle as a proxy for frequency logic.
        continue;
      }
      
      // 2. Count how many contribution payments have been made by this member for this hui
      const paymentsMadeCount = await prisma.memberPeriodContribution.count({
        where: {
          memberId: membership.id,
          status: 'DA_DONG', // Correct ENUM value for "Paid" in MemberContributionStatus
          payment: {
            huiGroupId: hui.id
          }
        }
      });
      
      const firstUnpaidPeriod = paymentsMadeCount + 1;

      // 3. Calculate future payment dates
      for (let period = firstUnpaidPeriod; period <= hui.totalMembers; period++) {
        // Assuming 'cycle' from the DB is a string like "1 month", "7 days", etc.
        // For this logic, we'll map it to a simplified frequency.
        // A more robust solution would store frequency explicitly (e.g., DAILY, WEEKLY, MONTHLY).
        const paymentFrequency = hui.cycle?.toString().includes('tháng') ? 'MONTHLY' : (hui.cycle?.toString().includes('tuần') ? 'WEEKLY' : 'DAILY');
        
        const dueDate = calculateNextDueDate(new Date(hui.startDate), period, paymentFrequency);
        
        // Only include payments that are due today or in the future
        if (dueDate >= today) {
          futureSchedules.push({
            huiId: hui.id,
            huiName: hui.name,
            paymentDate: dueDate.toISOString(),
            amount: hui.amount, // Amount per period
            periodNumber: period,
            totalPeriods: hui.totalMembers, // Use totalMembers from schema
            huiMemberId: membership.id,
          });
        }
      }
    }

    // Sort schedules by date
    futureSchedules.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

    return NextResponse.json(futureSchedules);

  } catch (error) {
    console.error('Error fetching future schedules:', error);
    if (error.name === 'JOSEError') {
        return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
