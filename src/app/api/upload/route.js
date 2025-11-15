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
    return new NextResponse(JSON.stringify({ error: "AWS_S3_BUCKET_NAME is not configured." }), { status: 500 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get("file");
    const uploadType = formData.get("uploadType") || 'chat'; // default to chat
    const huiId = formData.get("huiId");

    if (!file) {
      return new NextResponse(JSON.stringify({ error: "File is required." }), { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse(JSON.stringify({ error: "File size cannot exceed 10MB." }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const randomName = generateFileName();
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    let key;

    switch (uploadType) {
      case 'avatar':
        key = `avatars/${userId}_${randomName}`;
        break;
      case 'profileQrCode':
        key = `qrcodes/${userId}_${randomName}`;
        break;
      case 'huiQrCode':
        // huiId is optional here. If not provided, it's for a new hui.
        key = `hui_qrcodes/${huiId || 'new'}_${userId}_${randomName}`;
        break;
      case 'chatFile':
      default:
        if (!huiId) return new NextResponse(JSON.stringify({ error: "huiId is required for chat files." }), { status: 400 });
        key = `chats/${huiId}_${userId}_${randomName}`;
        break;
    }

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    const successResponse = JSON.stringify({ url: fileUrl });
    return new NextResponse(successResponse, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error uploading file:", error);
    const errorResponse = JSON.stringify({ error: "Failed to upload file.", details: error.message });
    return new NextResponse(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
