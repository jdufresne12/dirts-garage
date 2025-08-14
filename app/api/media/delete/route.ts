import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { pgPool } from '@/app/lib/db';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.S3_REGION!,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

export async function DELETE(request: NextRequest) {
    let client;

    try {
        const { mediaId } = await request.json();

        if (!mediaId) {
            return NextResponse.json(
                { error: 'Media ID is required' },
                { status: 400 }
            );
        }

        // Get file key from database
        client = await pgPool.connect();
        const result = await client.query(
            'SELECT file_key FROM media WHERE id = $1',
            [mediaId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Media not found' },
                { status: 404 }
            );
        }

        const fileKey = result.rows[0].file_key;

        // Delete from S3
        const deleteParams = {
            Bucket: 'dirts-garage',
            Key: fileKey,
        };

        try {
            await s3Client.send(new DeleteObjectCommand(deleteParams));
        } catch (s3Error) {
            console.error('S3 delete error:', s3Error);
            throw s3Error;
        }

        // Delete from database
        await client.query('DELETE FROM media WHERE id = $1', [mediaId]);

        return NextResponse.json({
            success: true,
            message: 'Media deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Delete failed: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Delete failed due to an unexpected error' },
            { status: 500 }
        );
    } finally {
        // Always release the database client
        if (client) {
            client.release();
        }
    }
}