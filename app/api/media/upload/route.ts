import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { pgPool } from '@/app/lib/db';
import helpers from '@/app/utils/helpers';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.S3_REGION!,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: NextRequest) {
    let client;

    try {
        const formData = await request.formData();
        const job_id = formData.get('job_id') as string;
        const file = formData.get('file') as File;

        if (!file || !job_id) {
            return NextResponse.json(
                { error: 'File and job_id are required' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'File type not allowed. Only images and videos are permitted.' },
                { status: 400 }
            );
        }

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size too large. Maximum size is 50MB.' },
                { status: 400 }
            );
        }

        // Generate unique file key
        const fileExtension = file.name.split('.').pop() || '';
        const fileName = `${helpers.generateUniqueID()}.${fileExtension}`;
        const fileKey = `jobs/media/${job_id}/${fileName}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3
        const uploadParams = {
            Bucket: 'dirts-garage',
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Save to database
        client = await pgPool.connect();
        const mediaId = helpers.generateUniqueID();

        await client.query(
            'INSERT INTO media (id, job_id, file_key, content_type, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [mediaId, job_id, fileKey, file.type]
        );

        // Return success response
        return NextResponse.json({
            success: true,
            media: {
                id: mediaId,
                fileKey,
                contentType: file.type,
                fileName: file.name,
                size: file.size,
            }
        });

    } catch (error) {
        console.error('Upload error:', error);

        // Return appropriate error message
        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Upload failed: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Upload failed due to an unexpected error' },
            { status: 500 }
        );
    } finally {
        // Always release the database client
        if (client) {
            client.release();
        }
    }
}