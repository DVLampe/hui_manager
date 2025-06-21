// src/app/api/contributions/route.js
import { NextResponse as OriginalNextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
const NextResponse = OriginalNextResponse.default ? OriginalNextResponse.default : OriginalNextResponse;

// GET /api/contributions - Fetch list of member contributions
export async function GET(request) {
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const memberId = searchParams.get('memberId');
    const huiGroupId = searchParams.get('huiGroupId'); // To list all contributions in a group
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const where = {};
    if (paymentId) {
      where.paymentId = paymentId;
    }
    if (memberId) {
      where.memberId = memberId;
    }
    if (huiGroupId && !paymentId) { // If filtering by group, join through payment
      where.payment = {
        huiGroupId: huiGroupId,
      };
    }

    if (!paymentId && !huiGroupId && !memberId) {
        return NextResponse.json({ error: 'A filter (paymentId, huiGroupId, or memberId) is required to fetch contributions.' }, { status: 400 });
    }


    const [contributions, total] = await prisma.$transaction([
      prisma.memberPeriodContribution.findMany({
        where,
        include: {
          member: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          payment: {
            include: {
              huiGroup: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.memberPeriodContribution.count({ where }),
    ]);

    return NextResponse.json({
      contributions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST /api/contributions - Create new member contribution(s)
export async function POST(request) {
  try {
    const tokenCookie = cookies().get('token');
    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
    }
    // const { payload: userData } = await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));
    // TODO: Add role-based access for who can create contributions (e.g., group manager or admin)
    await jwtVerify(tokenCookie.value, new TextEncoder().encode(JWT_SECRET));

    const body = await request.json();

    // Support creating a single contribution or an array of contributions
    const contributionsData = Array.isArray(body) ? body : [body];

    if (contributionsData.length === 0) {
      return NextResponse.json({ error: 'No contribution data provided' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Basic validation for all entries before attempting transaction
    for (const data of contributionsData) {
        if (!data.paymentId || !data.memberId || data.amountContributed === undefined) {
            errors.push({ contribution: data, error: 'Missing required fields: paymentId, memberId, and amountContributed are required.' });
        }
    }

    if (errors.length > 0) {
        return NextResponse.json({ message: "Validation errors occurred.", errors }, { status: 400 });
    }

    // Use transaction for creating multiple contributions
    try {
        await prisma.$transaction(async (tx) => {
            for (const data of contributionsData) {
                const { paymentId, memberId, amountContributed, status, notes, contributionDate } = data;

                // Check if payment period and member exist
                const paymentPeriod = await tx.payment.findUnique({ where: { id: paymentId } });
                if (!paymentPeriod) {
                    throw new Error(`Payment period with ID ${paymentId} not found for one of the contributions.`);
                }
                const huiMember = await tx.huiMember.findUnique({ where: { id: memberId } });
                if (!huiMember) {
                    throw new Error(`Hui member with ID ${memberId} not found for one of the contributions.`);
                }
                // Ensure member belongs to the group of the payment period
                if (huiMember.groupId !== paymentPeriod.huiGroupId) {
                    throw new Error(`Member ${memberId} does not belong to the group ${paymentPeriod.huiGroupId} of payment period ${paymentId}.`);
                }

                const newContribution = await tx.memberPeriodContribution.create({
                    data: {
                        paymentId,
                        memberId,
                        amountContributed: new Prisma.Decimal(amountContributed),
                        status: status || 'CHUA_DONG',
                        notes: notes || null,
                        contributionDate: contributionDate ? new Date(contributionDate) : null,
                    },
                    include: {
                        member: { include: { user: { select: { id: true, name: true } } } },
                        payment: { include: { huiGroup: { select: { id: true, name: true } } } },
                    },
                });
                results.push(newContribution);
            }
        });
    } catch (transactionError) {
        // Handle errors that occur inside the transaction, possibly unique constraint violations or manual throws
        console.error('Transaction error creating contributions:', transactionError);
        if (transactionError instanceof Prisma.PrismaClientKnownRequestError && transactionError.code === 'P2002') {
            return NextResponse.json({ error: 'Failed to create one or more contributions due to a duplicate entry (member already has a contribution for this period).' , details: transactionError.meta }, { status: 409 });
        }
        return NextResponse.json({ error: transactionError.message || 'Failed to create contributions during transaction.' }, { status: 400 });
    }
    
    // If only one contribution was processed, return it directly, else return array
    return NextResponse.json(results.length === 1 ? results[0] : results, { status: 201 });

  } catch (error) {
    console.error('Error creating contributions:', error);
    if (error.name === 'JOSEError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
