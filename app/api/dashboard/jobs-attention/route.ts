// api/dashboard/jobs-attention/route.ts
import { NextResponse } from 'next/server';
import { pgPool } from '@/app/lib/db';

export async function GET() {
    try {
        const result = await pgPool.query(`
            SELECT 
                j.id,
                j.title,
                j.status,
                j.waiting_reason,
                j.estimated_completion,
                j.completion_date,
                j.invoiced,
                c.first_name,
                c.last_name,
                v.year,
                v.make,
                v.model
            FROM jobs j
            LEFT JOIN customers c ON j.customer_id = c.id
            LEFT JOIN vehicles v ON j.vehicle_id = v.id
            WHERE 
                j.status = 'Waiting' OR 
                (j.status = 'Completed' AND j.invoiced = false) OR
                (j.estimated_completion < NOW() AND j.status != 'Completed')
            ORDER BY 
                CASE 
                    WHEN j.status = 'Waiting' THEN 1
                    WHEN j.status = 'Completed' AND j.invoiced = false THEN 2
                    ELSE 3
                END,
                j.estimated_completion ASC
            LIMIT 10
        `);

        const jobsRequiringAttention = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            status: row.status,
            customer: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : 'Unknown Customer',
            vehicle: row.year && row.make && row.model ? `${row.year} ${row.make} ${row.model}` : 'No Vehicle',
            reason: getAttentionReason(row),
            priority: getAttentionPriority(row),
            estimatedCompletion: row.estimated_completion
        }));

        return NextResponse.json(jobsRequiringAttention);
    } catch (error) {
        console.error('GET /api/dashboard/jobs-attention error:', error);
        return new NextResponse('Failed to fetch jobs requiring attention', { status: 500 });
    }
}

function getAttentionReason(job: any) {
    if (job.status === 'Waiting') {
        return job.waiting_reason || 'Waiting for parts/approval';
    }
    if (job.status === 'Completed' && !job.invoiced) {
        return 'Ready for invoicing';
    }
    if (job.estimated_completion < new Date() && job.status !== 'Completed') {
        return 'Past due date';
    }
    return 'Requires attention';
}

function getAttentionPriority(job: any) {
    if (job.status === 'Waiting') return 'medium';
    if (job.status === 'Completed' && !job.invoiced) return 'high';
    if (job.estimated_completion < new Date()) return 'high';
    return 'low';
}