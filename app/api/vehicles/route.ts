import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        const result = await pgPool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('GET /api/vehicles error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            id,
            year,
            make,
            model,
            engine,
            transmission,
            vin,
            license_plate,
            mileage,
            customer_id,
        } = body;

        await pgPool.query(
            `INSERT INTO vehicles (id, year, make, model, engine, transmission, vin, license_plate, mileage, customer_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
            [id, year, make, model, engine, transmission, vin, license_plate, mileage, customer_id]
        );

        return new NextResponse('Vehicle created', { status: 201 });
    } catch (error) {
        console.error('POST /api/vehicles error:', error);
        return new NextResponse('Failed to create vehicle', { status: 500 });
    }
}
