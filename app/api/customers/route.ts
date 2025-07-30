import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT * FROM customers ORDER BY created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('GET /api/customers error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            first_name,
            last_name,
            phone,
            email,
            address,
            city,
            state,
            zipcode,
            notes,
            status
        } = body;

        await pgPool.query(
            `INSERT INTO customers (id, first_name, last_name, phone, email, address, city, state, zipcode, notes, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
            [id, first_name, last_name, phone, email, address, city, state, zipcode, notes, status]
        );

        return new NextResponse('Customer created', { status: 201 });
    } catch (error) {
        console.error('POST /api/customers error:', error);
        return new NextResponse('Failed to create customer', { status: 500 });
    }
}
