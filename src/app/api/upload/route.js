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
  try {
    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: "File name, type, and size are required." }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File size cannot exceed 10MB." }, { status: 400 });
    }

    const randomFileName = generateFileName();
    const key = `chats/${randomFileName}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expires in 60 seconds

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, fileUrl });

  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return NextResponse.json({ error: "Failed to create presigned URL." }, { status: 500 });
  }
}
