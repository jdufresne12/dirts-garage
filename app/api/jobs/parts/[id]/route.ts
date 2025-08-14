import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const result = await pgPool.query('SELECT * FROM parts WHERE job_id = $1 ORDER BY created_at ASC', [id]);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error(`GET /api/jobs/parts/${id} error:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        // Execute the delete query
        const result = await pgPool.query(
            'DELETE FROM parts WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Part not found', { status: 404 });
        }

        return NextResponse.json({
            message: 'Part deleted successfully',
            deletedPart: result.rows[0]
        });
    } catch (error) {
        console.error(`DELETE /api/parts/${id} error:`, error);
        return new NextResponse('Failed to delete part', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const validFields = [
            'job_id',
            'name',
            'description',
            'quantity',
            'price',
            'part_number',
            'url',
            'status'
        ];

        const updates: Record<string, string | number | boolean | null> = {};

        // First, handle direct field matches
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                let value = body[field];

                // Handle numeric fields
                if (['quantity', 'price'].includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
                    }
                }

                // Handle optional string fields
                if (['description', 'part_number', 'url'].includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }

                updates[field] = value;
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
            `UPDATE parts SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Part not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/parts/${id} error:`, error);
        return new NextResponse('Failed to update part', { status: 500 });
    }
}