import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        // Get all customers with their jobs nested inside
        const result = await pgPool.query(`
            SELECT 
                c.*,
                COALESCE(
                    json_agg(
                        CASE 
                            WHEN j.id IS NOT NULL THEN 
                                json_build_object(
                                    'id', j.id,
                                    'title', j.title,
                                    'description', j.description,
                                    'status', j.status,
                                    'estimated_cost', j.estimated_cost,
                                    'actual_cost', j.actual_cost,
                                    'priority', j.priority,
                                    'start_date', j.start_date,
                                    'completion_date', j.completion_date,
                                    'estimated_start_date', j.estimated_start_date,
                                    'estimated_completion', j.estimated_completion,
                                    'vehicle_id', j.vehicle_id,
                                    'created_at', j.created_at,
                                    'updated_at', j.updated_at
                                )
                            ELSE NULL 
                        END
                    ) FILTER (WHERE j.id IS NOT NULL), 
                    '[]'::json
                ) as jobs
            FROM customers c
            LEFT JOIN jobs j ON c.id = j.customer_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('GET /api/customers error:', error);
        console.error('Error details:', (error as any).message);
        return NextResponse.json(
            { error: 'Failed to fetch customers', details: (error as any).message },
            { status: 500 }
        );
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
