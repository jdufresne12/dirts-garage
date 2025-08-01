// api/jobs/parts/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            job_id,
            name,
            description,
            quantity,
            price,
            part_number,
            url,
            status,
        } = body;

        // Handle numeric fields - convert empty strings to null for optional fields
        const processedQuantity = quantity === '' || quantity === null || quantity === undefined ? null : parseFloat(quantity);
        const processedPrice = price === '' || price === null || price === undefined ? null : parseFloat(price);

        // Handle optional string fields
        const processedDescription = description === '' || description === null || description === undefined ? null : description;
        const processedUrl = url === '' || url === null || url === undefined ? null : url;
        const processedPartNumber = part_number === '' || part_number === null || part_number === undefined ? null : part_number;

        await pgPool.query(
            `INSERT INTO parts (id, job_id, name, description, quantity, price, part_number, url, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
            [id, job_id, name, processedDescription, processedQuantity, processedPrice, processedPartNumber, processedUrl, status]
        );

        return new NextResponse('Part created', { status: 201 });
    } catch (error) {
        console.error('POST /api/parts error:', error);
        return new NextResponse('Failed to create part', { status: 500 });
    }
}