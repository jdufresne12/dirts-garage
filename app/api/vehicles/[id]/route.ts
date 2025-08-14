import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const result = await pgPool.query('SELECT * FROM vehicles WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return new NextResponse('Vehicle not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching vehicle ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        // Define the valid database fields that can be updated for vehicles
        const validFields = [
            'year',
            'make',
            'model',
            'engine',
            'transmission',
            'vin',
            'license_plate',
            'mileage',
            'color',
            'customer_id'
        ];

        // Extract only the valid fields from the request body
        const updates: Record<string, string | number | boolean | null> = {};
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                updates[field] = body[field];
            }
        });

        // Check if there are any valid fields to update
        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return new NextResponse('No valid fields to update', { status: 400 });
        }

        // Build the SET clause dynamically
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const values = keys.map(key => updates[key]);

        // Execute the update query
        const result = await pgPool.query(
            `UPDATE vehicles SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Vehicle not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/vehicles/${id} error:`, error);
        return new NextResponse('Failed to update vehicle', { status: 500 });
    }
}