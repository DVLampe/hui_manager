import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export async function POST(request) {
  const { S3_BUCKET_NAME } = process.env;

  if (!S3_BUCKET_NAME) {
    const errorResponse = JSON.stringify({ error: "S3_BUCKET_NAME is not configured in .env.local" });
    return new NextResponse(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType || !fileSize) {
      const errorResponse = JSON.stringify({ error: "File name, type, and size are required." });
      return new NextResponse(errorResponse, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      const errorResponse = JSON.stringify({ error: "File size cannot exceed 10MB." });
      return new NextResponse(errorResponse, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const randomFileName = generateFileName();
    const key = `chats/${randomFileName}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expires in 60 seconds

    const fileUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

    const successResponse = JSON.stringify({ uploadUrl, fileUrl });
    return new NextResponse(successResponse, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error creating presigned URL:", error);
    const errorResponse = JSON.stringify({ error: "Failed to create presigned URL.", details: error.message });
    return new NextResponse(errorResponse, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
