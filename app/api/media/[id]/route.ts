import { NextRequest, NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let client;

    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Get media from database
        client = await pgPool.connect();
        const result = await client.query(
            'SELECT id, file_key, content_type, created_at FROM media WHERE job_id = $1 ORDER BY created_at DESC',
            [id]
        );

        // Transform results to extract filenames
        const mediaWithUrls = result.rows.map((media) => ({
            id: media.id,
            fileKey: media.file_key,
            contentType: media.content_type,
            createdAt: media.created_at,
            fileName: media.file_key.split('/').pop() || 'unknown',
        }));

        return NextResponse.json({
            success: true,
            media: mediaWithUrls
        });

    } catch (error) {
        console.error('Get media error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Failed to get media: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to get media due to an unexpected error' },
            { status: 500 }
        );
    } finally {
        // Always release the database client
        if (client) {
            client.release();
        }
    }
}