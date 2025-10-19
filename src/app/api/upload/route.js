import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse as OriginalNextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const NextResponse = OriginalNextResponse.default || OriginalNextResponse;

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export async function POST(request) {
  const { AWS_S3_BUCKET_NAME } = process.env;

  if (!AWS_S3_BUCKET_NAME) {
    const errorResponse = JSON.stringify({ error: "AWS_S3_BUCKET_NAME is not configured in .env.local" });
    return new NextResponse(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { fileName, fileType, fileSize, huiId } = await request.json();

    if (!fileName || !fileType || !fileSize || !huiId) {
      const errorResponse = JSON.stringify({ error: "File name, type, size, and huiId are required." });
      return new NextResponse(errorResponse, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      const errorResponse = JSON.stringify({ error: "File size cannot exceed 10MB." });
      return new NextResponse(errorResponse, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomName = generateFileName();
    const key = `chats/${date}_${huiId}_${session.user.id}_${randomName}`;

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expires in 60 seconds

    const fileUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    const successResponse = JSON.stringify({ uploadUrl, fileUrl });
    return new NextResponse(successResponse, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error creating presigned URL:", error);
    const errorResponse = JSON.stringify({ error: "Failed to create presigned URL.", details: error.message });
    return new NextResponse(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
