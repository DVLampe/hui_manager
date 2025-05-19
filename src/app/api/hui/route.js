import { NextResponse as OriginalNextResponse } from 'next/server'; // Renamed
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma for Decimal type

// GET /api/hui
// Lấy danh sách các hụi
export async function GET(request) { // Added request parameter for consistency, though not used in current GET
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in GET /api/hui!');
    return new Response(JSON.stringify({ message: 'Lỗi nghiêm trọng: NextResponseToUse.json không phải là một hàm.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const huis = await prisma.huiGroup.findMany({
      include: {
        manager: { // Include manager details
          select: { id: true, name: true, email: true },
        },
        _count: { // Include count of members
          select: { members: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return NextResponseToUse.json(huis);
  } catch (error) {
    console.error('Error fetching hui groups:', error);
    return NextResponseToUse.json({ message: 'Error fetching hui groups', error: error.message }, { status: 500 });
  }
}

// POST /api/hui
// Tạo một hụi mới
export async function POST(request) {
  let NextResponseToUse = OriginalNextResponse;
  if (OriginalNextResponse && typeof OriginalNextResponse.json === 'undefined' && OriginalNextResponse.default && typeof OriginalNextResponse.default.json === 'function') {
    NextResponseToUse = OriginalNextResponse.default;
  }
  if (typeof NextResponseToUse.json !== 'function') {
    console.error('CRITICAL: NextResponseToUse.json is NOT a function in POST /api/hui!');
    return new Response(JSON.stringify({ message: 'Lỗi nghiêm trọng: NextResponseToUse.json không phải là một hàm.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const { 
      name, 
      amount, 
      startDate, 
      managerId, // TODO: Should be derived from authenticated user
      cycle, 
      totalMembers,
      description,
      endDate,
      rules 
    } = body;

    // Basic Validation
    if (!name || !amount || !startDate || !managerId || cycle === undefined || totalMembers === undefined) {
      return NextResponseToUse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate managerId exists (optional, Prisma will throw error if not found)
    // const managerExists = await prisma.user.findUnique({ where: { id: managerId } });
    // if (!managerExists) {
    //   return NextResponse.json({ message: 'Manager not found' }, { status: 404 });
    // }
    
    let parsedAmount;
    try {
      parsedAmount = new Prisma.Decimal(amount);
      if (parsedAmount.isNaN() || parsedAmount.isNegative()) {
        throw new Error('Invalid amount value');
      }
    } catch (e) {
      return NextResponseToUse.json({ message: 'Invalid amount format. Must be a positive number.' }, { status: 400 });
    }

    let parsedStartDate;
    try {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new Error('Invalid start date');
      }
    } catch (e) {
      return NextResponseToUse.json({ message: 'Invalid startDate format.' }, { status: 400 });
    }
    
    let parsedEndDate = null;
    if (endDate) {
      try {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new Error('Invalid end date');
        }
        if (parsedEndDate < parsedStartDate) {
          return NextResponseToUse.json({ message: 'End date cannot be before start date.' }, { status: 400 });
        }
      } catch (e) {
        return NextResponseToUse.json({ message: 'Invalid endDate format.' }, { status: 400 });
      }
    }

    const parsedCycle = parseInt(cycle, 10);
    const parsedTotalMembers = parseInt(totalMembers, 10);

    if (isNaN(parsedCycle) || parsedCycle <= 0) {
      return NextResponseToUse.json({ message: 'Cycle must be a positive integer.' }, { status: 400 });
    }
    if (isNaN(parsedTotalMembers) || parsedTotalMembers <= 0) {
      return NextResponseToUse.json({ message: 'Total members must be a positive integer.' }, { status: 400 });
    }

    // Calculate nextPaymentDate (simple example: set to startDate)
    // More complex logic might be needed based on cycle
    const nextPaymentDate = parsedStartDate;

    const newHuiGroup = await prisma.huiGroup.create({
      data: {
        name,
        description,
        amount: parsedAmount,
        startDate: parsedStartDate,
        endDate: parsedEndDate, // Can be null
        managerId,
        cycle: parsedCycle,
        totalMembers: parsedTotalMembers,
        nextPaymentDate, // Set calculated next payment date
        rules: rules || Prisma.JsonNull, // Store as JSON or null
        // status and currentCycle have default values in schema
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponseToUse.json(newHuiGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating hui group:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) { // Example: Unique constraint on name
      return NextResponseToUse.json({ message: `Hui group with name '${body.name}' already exists.` }, { status: 409 });
    }
    if (error.code === 'P2003') { // Foreign key constraint failed (e.g. managerId not found)
        if (error.meta?.field_name?.includes('managerId')) {
             return NextResponseToUse.json({ message: 'Manager not found or invalid.' }, { status: 400 });
        }
    }
    return NextResponseToUse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}