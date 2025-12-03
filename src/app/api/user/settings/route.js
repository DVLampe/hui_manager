import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPreferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.notificationPreferences || {});
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notifyPaymentDue, notifyGeneral } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationPreferences: {
            notifyPaymentDue: notifyPaymentDue !== undefined ? notifyPaymentDue : true,
            notifyGeneral: notifyGeneral !== undefined ? notifyGeneral : true,
        }
      },
      select: { notificationPreferences: true }
    });

    return NextResponse.json(updatedUser.notificationPreferences);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
