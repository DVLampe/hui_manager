import { NextResponse as OriginalNextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse(JSON.stringify({ error: 'Missing name, email, or password' }), { status: 400 });
    }

    if (password.length < 6) {
        return new NextResponse(JSON.stringify({ error: 'Password should be at least 6 characters long' }), { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(JSON.stringify({ error: 'User with this email already exists' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const premiumForeverPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: 'Premium Forever' },
    });

    if (!premiumForeverPlan) {
      return new NextResponse(JSON.stringify({ error: 'Premium Forever plan not found' }), { status: 500 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscription: {
          create: {
            planId: premiumForeverPlan.id,
            startDate: new Date(),
            endDate: null,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ message: 'User registered successfully', userId: user.id }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
