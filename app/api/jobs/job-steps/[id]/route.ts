import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const result = await pgPool.query('SELECT * FROM job_steps WHERE job_id = $1 ORDER BY "order" ASC', [id]);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error(`GET /api/jobs/job-steps/${id} error:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        // Execute the delete query
        const result = await pgPool.query(
            'DELETE FROM job_steps WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Job step not found', { status: 404 });
        }

        return NextResponse.json({
            message: 'Job step deleted successfully',
            deletedStep: result.rows[0]
        });
    } catch (error) {
        console.error(`DELETE /api/job-steps/${id} error:`, error);
        return new NextResponse('Failed to delete job step', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const validFields = [
            'title',
            'description',
            'start_date',
            'completed_date',
            'estimated_start_date',
            'order',
            'status',
            'estimated_hours',
            'actual_hours',
            'technician',
            'job_id'
        ];

        // Define field mappings from frontend names to database column names
        const fieldMappings: Record<string, string> = {
            'estimatedStartDate': 'estimated_start_date',
            'completedDate': 'completed_date',
            'estimatedHours': 'estimated_hours',
            'actualHours': 'actual_hours',
        };

        const dateFields = [
            'start_date',
            'completed_date',
            'estimated_start_date'
        ];

        const updates: Record<string, any> = {};
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                let value = body[field];

                if (dateFields.includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }

                if (['estimated_hours', 'actual_hours', 'order'].includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
                    }
                }

                updates[field] = value;
            }
        });

        // Handle mapped fields
        Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
            if (body.hasOwnProperty(frontendField)) {
                let value = body[frontendField];

                if (dateFields.includes(dbField)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }
                if (['estimated_hours', 'actual_hours', 'order'].includes(dbField)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
                    }
                }

                updates[dbField] = value;
            }
        });

        // Check if there are any valid fields to update
        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return new NextResponse('No valid fields to update', { status: 400 });
        }

        // Build the SET clause dynamically - handle "order" as reserved keyword
        const setClause = keys.map((key, i) => {
            const columnName = key === 'order' ? '"order"' : key;
            return `${columnName} = $${i + 1}`;
        }).join(', ');
        const values = keys.map(key => updates[key]);

        // Execute the update query
        const result = await pgPool.query(
            `UPDATE job_steps SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Job step not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/job-steps/${id} error:`, error);
        return new NextResponse('Failed to update job step', { status: 500 });
    }
}