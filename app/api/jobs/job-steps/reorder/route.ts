// Create a new API endpoint: /api/job-steps/reorder/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { job_id } = body;

        if (!job_id) {
            return new NextResponse('job_id is required', { status: 400 });
        }

        // Start a transaction to ensure data consistency
        const client = await pgPool.connect();

        try {
            await client.query('BEGIN');

            // Get all remaining job steps for this job, ordered by current order
            const result = await client.query(
                'SELECT id FROM job_steps WHERE job_id = $1 ORDER BY "order" ASC, created_at ASC',
                [job_id]
            );

            // Update each step with a new sequential order starting from 0
            for (let i = 0; i < result.rows.length; i++) {
                await client.query(
                    'UPDATE job_steps SET "order" = $1, updated_at = NOW() WHERE id = $2',
                    [i, result.rows[i].id]
                );
            }

            await client.query('COMMIT');

            // Return the updated job steps
            const updatedSteps = await client.query(
                'SELECT * FROM job_steps WHERE job_id = $1 ORDER BY "order" ASC',
                [job_id]
            );

            return NextResponse.json({
                message: 'Job steps reordered successfully',
                jobSteps: updatedSteps.rows
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('PUT /api/job-steps/reorder error:', error);
        return new NextResponse('Failed to reorder job steps', { status: 500 });
    }
}