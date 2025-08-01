import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        const result = await pgPool.query('SELECT * FROM notes WHERE job_id = $1 ORDER BY timestamp ASC, created_at ASC', [id]);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error(`GET /api/jobs/notes/${id} error:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        // Execute the delete query
        const result = await pgPool.query(
            'DELETE FROM notes WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Note not found', { status: 404 });
        }

        return NextResponse.json({
            message: 'Note deleted successfully',
            deletedNote: result.rows[0]
        });
    } catch (error) {
        console.error(`DELETE /api/notes/${id} error:`, error);
        return new NextResponse('Failed to delete note', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const validFields = [
            'job_id',
            'note',
            'timestamp'
        ];

        // Define field mappings from frontend names to database column names
        const fieldMappings: Record<string, string> = {
            'jobId': 'job_id',
            // Add more mappings as needed
        };

        const dateFields = [
            'timestamp'
        ];

        const updates: Record<string, any> = {};

        // First, handle direct field matches
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                let value = body[field];

                // Handle date fields - convert empty strings to current timestamp for timestamp field
                if (dateFields.includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        if (field === 'timestamp') {
                            value = new Date().toISOString();
                        } else {
                            value = null;
                        }
                    }
                }

                updates[field] = value;
            }
        });

        // Then, handle mapped fields
        Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
            if (body.hasOwnProperty(frontendField)) {
                let value = body[frontendField];

                // Handle date fields
                if (dateFields.includes(dbField)) {
                    if (value === '' || value === null || value === undefined) {
                        if (dbField === 'timestamp') {
                            value = new Date().toISOString();
                        } else {
                            value = null;
                        }
                    }
                }

                updates[dbField] = value; // Use the database field name
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
            `UPDATE notes SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Note not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/notes/${id} error:`, error);
        return new NextResponse('Failed to update note', { status: 500 });
    }
}