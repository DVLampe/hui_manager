import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse as OriginalNextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const key = params.key.join('/');
    const userId = session.user.id;

    // Security Check for Chat Files
    if (key.startsWith('chats/')) {
      const keyParts = key.split('/');
      const filename = keyParts[1];
      const filenameParts = filename.split('_');
      
      if (filenameParts.length < 3) {
        return new NextResponse("Invalid file key format", { status: 400 });
      }

      const huiId = filenameParts[1];

      const member = await prisma.huiMember.findFirst({
        where: {
          groupId: huiId,
          userId: userId,
        },
      });

      if (!member) {
        // Also check if the user is the owner of the group
        const group = await prisma.huiGroup.findFirst({
            where: {
                id: huiId,
                ownerId: userId,
            }
        });
        if (!group) {
            return new NextResponse("Access Denied", { status: 403 });
        }
      }
    } else if (key.startsWith('qrcodes/')) {
        const keyParts = key.split('/');
        const filename = keyParts[1];
        const filenameParts = filename.split('_');

        if (filenameParts.length < 3) {
            return new NextResponse("Invalid file key format for QR code", { status: 400 });
        }
        
        const fileOwnerId = filenameParts[1];

        // Allow users to see their own QR code
        if (userId !== fileOwnerId) {
            // If it's not their own, check if they are a member of any hui owned by this user
            const huiMembership = await prisma.huiMember.findFirst({
                where: {
                    userId: userId,
                    group: {
                        ownerId: fileOwnerId,
                    },
                },
            });

            if (!huiMembership) {
                return new NextResponse("Access Denied to this QR Code", { status: 403 });
            }
        }
    } else if (key.startsWith('avatars/')) {
        // Avatars are considered public, no specific auth needed beyond being logged in.
    } else {
        // If the key doesn't match a protected folder, deny access by default for security.
        return new NextResponse("Access to this resource is not allowed", { status: 403 });
    }
    
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expires in 60 seconds

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error("Error generating signed URL for file access:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
