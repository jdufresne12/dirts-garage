import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.S3_REGION!,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

export async function GET(_req: Request, context: { params: { id: string } }) {
    const { id } = await context.params;

    try {
        // Get Job data
        const jobsResult = await pgPool.query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (jobsResult.rows.length === 0) {
            return new NextResponse('Job not found', { status: 404 });
        }
        const jobs = jobsResult.rows[0];

        // Get Customer Data
        let customer: Customer | undefined = undefined;
        if (jobs.customer_id) {
            const customerResult = await pgPool.query('SELECT * FROM customers WHERE id = $1', [jobs.customer_id]);
            if (customerResult.rows.length === 0) {
                return new NextResponse('Customer not found', { status: 404 });
            }
            customer = customerResult.rows[0];
        }

        let vehicle: Vehicle | undefined = undefined;
        if (jobs.vehicle_id) {
            const vehicleResult = await pgPool.query('SELECT * FROM vehicles WHERE id = $1', [jobs.vehicle_id]);
            if (vehicleResult.rows.length === 0) {
                return new NextResponse('Vehicle not found', { status: 404 });
            }
            vehicle = vehicleResult.rows[0];
        }

        const completeCustomerData = {
            ...jobs,
            customer: customer,
            vehicle: vehicle,
        };

        return NextResponse.json(completeCustomerData);
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const validFields = [
            'customer_id',
            'vehicle_id',
            'title',
            'description',
            'status',
            'waiting_reason',
            'latest_update',
            'estimated_start_date',
            'estimated_completion',
            'start_date',
            'completion_date',
            'estimated_cost',
            'actual_cost',
            'priority',
            'invoiced',
            'invoice_amount'
        ];

        // Define field mappings from frontend names to database column names
        const fieldMappings: Record<string, string> = {
            'estimated_start': 'estimated_start_date',
            // Add more mappings as needed
            // 'frontend_field_name': 'database_column_name'
        };

        // Define which database fields are date fields that need special handling
        const dateFields = [
            'estimated_start_date',
            'estimated_completion',
            'start_date',
            'completion_date'
        ];

        // Extract and map fields from the request body
        const updates: Record<string, string | number | boolean | null> = {};

        // First, handle direct field matches
        validFields.forEach(field => {
            if (body.hasOwnProperty(field)) {
                let value = body[field];

                // Handle date fields - convert empty strings to null
                if (dateFields.includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }

                // Handle boolean fields
                if (field === 'invoiced') {
                    value = Boolean(value);
                }

                // Handle numeric fields
                if (['estimated_cost', 'actual_cost', 'invoice_amount'].includes(field)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
                    }
                }

                updates[field] = value;
            }
        });

        // Then, handle mapped fields
        Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
            if (body.hasOwnProperty(frontendField)) {
                let value = body[frontendField];

                // Handle date fields - convert empty strings to null
                if (dateFields.includes(dbField)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    }
                }

                // Handle boolean fields
                if (dbField === 'invoiced') {
                    value = Boolean(value);
                }

                // Handle numeric fields
                if (['estimated_cost', 'actual_cost', 'invoice_amount'].includes(dbField)) {
                    if (value === '' || value === null || value === undefined) {
                        value = null;
                    } else {
                        value = parseFloat(value);
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
            `UPDATE jobs SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id]
        );

        if (result.rowCount === 0) {
            return new NextResponse('Job not found', { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`PUT /api/jobs/${id} error:`, error);
        return new NextResponse('Failed to update job', { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;

    const client = await pgPool.connect();
    try {
        await client.query('BEGIN');

        // Check if job exists and get basic info
        const jobCheck = await client.query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (jobCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return new NextResponse('Job not found', { status: 404 });
        }

        // Get counts for logging purposes
        const countsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM invoices WHERE job_id = $1) as invoice_count,
                (SELECT COUNT(*) FROM job_steps WHERE job_id = $1) as job_step_count,
                (SELECT COUNT(*) FROM parts WHERE job_id = $1) as part_count,
                (SELECT COUNT(*) FROM notes WHERE job_id = $1) as note_count,
                (SELECT COUNT(*) FROM media WHERE job_id = $1) as media_count
        `;

        const counts = await client.query(countsQuery, [id]);
        const deletionStats = counts.rows[0];

        // 1. Delete media files from S3 and database
        let deletedMediaCount = 0;
        let s3DeletionErrors = [];

        try {
            // Get all media files for this job from database
            const mediaResult = await client.query(
                'SELECT id, file_key FROM media WHERE job_id = $1',
                [id]
            );

            if (mediaResult.rows.length > 0) {
                const objectsToDelete = mediaResult.rows.map(media => ({ Key: media.file_key }));

                // S3 batch delete supports up to 1000 objects per request
                const batchSize = 1000;
                for (let i = 0; i < objectsToDelete.length; i += batchSize) {
                    const batch = objectsToDelete.slice(i, i + batchSize);

                    try {
                        const deleteParams = {
                            Bucket: 'dirts-garage',
                            Delete: {
                                Objects: batch,
                                Quiet: false // Set to false to get detailed response
                            }
                        };

                        const deleteResult = await s3Client.send(new DeleteObjectsCommand(deleteParams));
                        if (deleteResult.Errors && deleteResult.Errors.length > 0) {
                            console.error('S3 deletion errors:', deleteResult.Errors);
                            s3DeletionErrors.push(...deleteResult.Errors);
                        }

                    } catch (batchError) {
                        console.error(`Failed to delete batch ${i / batchSize + 1}:`, batchError);
                        s3DeletionErrors.push({
                            Key: `batch_${i / batchSize + 1}`,
                            Code: 'BatchDeleteFailed',
                            Message: batchError instanceof Error ? batchError.message : 'Unknown error'
                        });
                    }
                }

                // Delete media records from database
                const mediaDbResult = await client.query(
                    'DELETE FROM media WHERE job_id = $1 RETURNING id',
                    [id]
                );
                deletedMediaCount = mediaDbResult.rowCount || 0;
            }
        } catch (mediaError) {
            console.error('Error during media deletion:', mediaError);
        }

        // 2. Delete invoices (triggers will handle related payments, line_items, and change_logs)
        const invoicesResult = await client.query(
            'DELETE FROM invoices WHERE job_id = $1 RETURNING id',
            [id]
        );

        // 3. Delete job steps
        const jobStepsResult = await client.query(
            'DELETE FROM job_steps WHERE job_id = $1 RETURNING id',
            [id]
        );

        // 4. Delete parts
        const partsResult = await client.query(
            'DELETE FROM parts WHERE job_id = $1 RETURNING id',
            [id]
        );

        // 5. Delete notes
        const notesResult = await client.query(
            'DELETE FROM notes WHERE job_id = $1 RETURNING id',
            [id]
        );

        // 6. Finally delete the job itself
        const jobResult = await client.query(
            'DELETE FROM jobs WHERE id = $1 RETURNING *',
            [id]
        );

        await client.query('COMMIT');

        const deletionSummary = {
            job: jobResult.rows[0],
            deletedCounts: {
                media: deletedMediaCount,
                invoices: invoicesResult.rowCount, // Triggers handle payments, line_items, change_logs
                jobSteps: jobStepsResult.rowCount,
                parts: partsResult.rowCount,
                notes: notesResult.rowCount,
                s3Errors: s3DeletionErrors.length
            },
            originalCounts: {
                media: parseInt(deletionStats.media_count),
                invoices: parseInt(deletionStats.invoice_count),
                jobSteps: parseInt(deletionStats.job_step_count),
                parts: parseInt(deletionStats.part_count),
                notes: parseInt(deletionStats.note_count)
            },
            s3DeletionDetails: s3DeletionErrors.length > 0 ? s3DeletionErrors : undefined
        };

        return NextResponse.json({
            success: true,
            message: 'Job and all associated data deleted successfully',
            ...deletionSummary
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`DELETE /api/jobs/${id} error:`, error);

        // Provide specific error information
        if (error instanceof Error) {
            if (error.message.includes('foreign key constraint')) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Foreign key constraint violation',
                        message: 'Unable to delete job due to database constraints. There may be additional references not handled by this API.',
                        details: error.message
                    }),
                    {
                        status: 409,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }

            return new NextResponse(
                JSON.stringify({
                    error: 'Deletion failed',
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return new NextResponse('Failed to delete job', { status: 500 });
    } finally {
        client.release();
    }
}