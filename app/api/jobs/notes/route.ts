import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            job_id,
            note,
            timestamp,
        } = body;

        // Handle timestamp - if not provided, use current timestamp
        const processedTimestamp = timestamp === '' || timestamp === null || timestamp === undefined
            ? new Date().toISOString()
            : timestamp;

        await pgPool.query(
            `INSERT INTO notes (id, job_id, note, timestamp, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [id, job_id, note, processedTimestamp]
        );

        return new NextResponse('Note created', { status: 201 });
    } catch (error) {
        console.error('POST /api/notes error:', error);
        return new NextResponse('Failed to create note', { status: 500 });
    }
}