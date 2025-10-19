import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});

const generateFileName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');

async function uploadImageToS3(file, folder, userId) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomName = generateFileName();
    const fileName = `${date}_${userId}_${randomName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${folder}/${fileName}`,
        Body: buffer,
        ContentType: file.type,
    });

    await s3Client.send(command);
    
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${folder}/${fileName}`;

    return url;
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Không được phép' }), { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'images'; // Default to 'images' folder

        if (!file) {
            return new Response(JSON.stringify({ error: 'Không có tệp nào được tải lên.' }), { status: 400 });
        }

        const imageUrl = await uploadImageToS3(file, folder, session.user.id);

        return new Response(JSON.stringify({ imageUrl }), { status: 200 });

    } catch (error) {
        console.error('Lỗi tải lên ảnh:', error);
        return new Response(JSON.stringify({ error: 'Đã xảy ra lỗi máy chủ nội bộ.' }), { status: 500 });
    }
}
