// app/api/customers/[id]/jobs/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = params.id;

        // Get jobs for the customer with vehicle information
        const query = `
            SELECT 
                j.*,
                v.year, v.make, v.model, v.color, v.vin,
                COALESCE(
                    (SELECT COUNT(*) FROM job_steps js WHERE js.job_id = j.id AND js.status = 'completed'),
                    0
                ) as completed_steps,
                COALESCE(
                    (SELECT COUNT(*) FROM job_steps js WHERE js.job_id = j.id),
                    0
                ) as total_steps
            FROM jobs j
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE j.customer_id = $1
            ORDER BY j.created_at DESC
        `;

        const result = await pgPool.query(query, [customerId]);

        // Format the jobs data to match the Job interface
        const jobs = result.rows.map(job => ({
            id: job.id,
            customer_id: job.customer_id,
            vehicle_id: job.vehicle_id,
            title: job.title,
            description: job.description,
            status: job.status,
            waiting_reason: job.waiting_reason,
            latest_update: job.latest_update,
            estimated_start_date: job.estimated_start_date,
            estimated_completion: job.estimated_completion,
            start_date: job.start_date,
            completion_date: job.completion_date,
            estimated_cost: parseFloat(job.estimated_cost) || 0,
            actual_cost: parseFloat(job.actual_cost) || 0,
            priority: job.priority || 'Medium',
            invoice_id: job.invoice_id,
            invoiced: job.invoiced || false,
            invoice_amount: parseFloat(job.invoice_amount) || 0,
            created_at: job.created_at,
            updated_at: job.updated_at,
            // Vehicle info (if available)
            vehicle: job.vehicle_id ? {
                id: job.vehicle_id,
                year: parseInt(job.year),
                make: job.make,
                model: job.model,
                color: job.color,
                vin: job.vin
            } : null,
            // Progress info
            progress: {
                completed_steps: parseInt(job.completed_steps) || 0,
                total_steps: parseInt(job.total_steps) || 0,
                percentage: job.total_steps > 0 ?
                    Math.round((job.completed_steps / job.total_steps) * 100) : 0
            }
        }));

        return NextResponse.json(jobs);

    } catch (error) {
        console.error('Error fetching customer jobs:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error', details: errorMessage }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}